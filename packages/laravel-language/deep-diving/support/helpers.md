---
sidebar_position: 2
sidebar_label: Helper Functions
---

import Link from "@docusaurus/Link";

# Helper Functions

Laravel Language provides three global helper functions for timezone handling. These functions work seamlessly with `SetTimezoneMiddleware` to provide timezone-aware date formatting and conversion.

## Overview

The helper functions:

- **client_timezone()**: Get the current client timezone
- **tz_format()**: Format dates in client's timezone
- **tz_carbon()**: Get Carbon instances in client's timezone

All functions automatically use the timezone set by `SetTimezoneMiddleware` via `config('app.client_timezone')`.

## client_timezone()

Get the effective client timezone resolved by `SetTimezoneMiddleware`.

```php
function client_timezone(): string
```

**Returns:** `string` - Timezone identifier (e.g., 'America/New_York', 'Asia/Tehran')

**Priority:**
1. `config('app.client_timezone')` (set by middleware)
2. `config('app.timezone')` (fallback)
3. `'UTC'` (final fallback)

### Basic Usage

```php
$timezone = client_timezone();
// Returns: 'America/New_York' (if middleware set it)
// Or: 'UTC' (if no middleware)
```

### Example: Display Current Timezone

```php
// In controller
public function settings()
{
    return response()->json([
        'timezone' => client_timezone(),
        'current_time' => now()->setTimezone(client_timezone())->format('Y-m-d H:i:s'),
    ]);
}
```

### Example: Timezone-Aware Queries

```php
// Get events in user's timezone
$timezone = client_timezone();
$startOfDay = Carbon::now($timezone)->startOfDay();
$endOfDay = Carbon::now($timezone)->endOfDay();

$events = Event::whereBetween('starts_at', [$startOfDay, $endOfDay])->get();
```

## tz_format()

Format a date/time value into the client's timezone.

```php
function tz_format(
    Carbon|DateTimeInterface|int|string $value,
    string $format = 'Y-m-d H:i:s',
    ?string $tz = null,
    ?string $fromTz = null
): string
```

**Parameters:**
- `$value` (`Carbon|DateTimeInterface|int|string`): Date/time value to format
- `$format` (`string`): Format string (default: `'Y-m-d H:i:s'`)
- `$tz` (`string|null`): Target timezone (default: `client_timezone()`)
- `$fromTz` (`string|null`): Source timezone (default: `config('app.timezone')`)

**Returns:** `string` - Formatted date string

### Supported Input Types

- **Carbon instances**: `Carbon::now()`
- **DateTimeInterface**: `new DateTime()`
- **Unix timestamps**: `1703520000` (integer)
- **String timestamps**: `'1703520000'` (numeric string)
- **Date strings**: `'2024-12-25 14:30:00'`

### Basic Usage

```php
// Format current time in client timezone
$formatted = tz_format(now());
// Returns: "2024-12-25 09:30:00" (if client is in New York, server is UTC)

// Custom format
$formatted = tz_format(now(), 'Y-m-d H:i:s A');
// Returns: "2024-12-25 09:30:00 AM"
```

### Example 1: Event Display

```php
// app/Http/Controllers/EventController.php
public function show(Event $event)
{
    return response()->json([
        'id' => $event->id,
        'title' => $event->title,
        'starts_at' => tz_format($event->starts_at),
        'starts_at_formatted' => tz_format($event->starts_at, 'l, F j, Y \a\t g:i A'),
        'timezone' => client_timezone(),
    ]);
}
```

**Response**:
```json
{
    "id": 1,
    "title": "Conference",
    "starts_at": "2024-12-25 09:00:00",
    "starts_at_formatted": "Wednesday, December 25, 2024 at 9:00 AM",
    "timezone": "America/New_York"
}
```

### Example 2: Order Timestamps

```php
// app/Http/Controllers/OrderController.php
public function show(Order $order)
{
    return response()->json([
        'order_number' => $order->number,
        'placed_at' => tz_format($order->created_at, 'Y-m-d H:i:s'),
        'estimated_delivery' => tz_format($order->estimated_delivery, 'F j, Y'),
        'timezone' => client_timezone(),
    ]);
}
```

### Example 3: Explicit Timezone Conversion

```php
// Convert from UTC to specific timezone
$utcDate = '2024-12-25 12:00:00';
$tehranDate = tz_format($utcDate, 'Y-m-d H:i:s', 'Asia/Tehran', 'UTC');
// Returns: "2024-12-25 15:30:00" (UTC+3:30)

// Convert from one timezone to another
$newYorkDate = tz_format($utcDate, 'Y-m-d H:i:s', 'America/New_York', 'UTC');
// Returns: "2024-12-25 07:00:00" (UTC-5)
```

### Example 4: Unix Timestamp Formatting

```php
// Format Unix timestamp
$timestamp = 1703520000; // 2023-12-25 12:00:00 UTC
$formatted = tz_format($timestamp, 'Y-m-d H:i:s');
// Returns formatted date in client timezone

// String timestamp
$formatted = tz_format('1703520000', 'Y-m-d H:i:s');
// Also works
```

### Example 5: Blade Template Usage

```blade
{{-- Display event time in user's timezone --}}
<div class="event-time">
    <strong>Starts:</strong> {{ tz_format($event->starts_at, 'F j, Y \a\t g:i A') }}
    <small>({{ client_timezone() }})</small>
</div>
```

## tz_carbon()

Convert an input into a Carbon instance adjusted to the client's timezone.

```php
function tz_carbon(
    Carbon|DateTimeInterface|int|string $value,
    ?string $tz = null,
    ?string $fromTz = null
): Carbon
```

**Parameters:**
- `$value` (`Carbon|DateTimeInterface|int|string`): Date/time value
- `$tz` (`string|null`): Target timezone (default: `client_timezone()`)
- `$fromTz` (`string|null`): Source timezone (default: `config('app.timezone')`)

**Returns:** `Carbon` - Carbon instance in target timezone

### Basic Usage

```php
// Get Carbon instance in client timezone
$carbon = tz_carbon(now());
// Returns: Carbon instance in client timezone

// Use Carbon methods
$formatted = tz_carbon(now())->format('Y-m-d H:i:s');
$diff = tz_carbon(now())->diffForHumans();
```

### Example 1: Date Calculations

```php
// Calculate days until event
$eventDate = tz_carbon($event->starts_at);
$daysUntil = now($eventDate->timezone)->diffInDays($eventDate);

return response()->json([
    'event_date' => $eventDate->format('Y-m-d H:i:s'),
    'days_until' => $daysUntil,
    'human_readable' => $eventDate->diffForHumans(),
]);
```

### Example 2: Time Range Queries

```php
// Get today's events in user's timezone
$timezone = client_timezone();
$startOfDay = tz_carbon(now())->startOfDay();
$endOfDay = tz_carbon(now())->endOfDay();

$events = Event::whereBetween('starts_at', [
    $startOfDay->utc(),
    $endOfDay->utc()
])->get();
```

### Example 3: Relative Time Display

```php
// app/Http/Controllers/PostController.php
public function index()
{
    $posts = Post::latest()->get()->map(function ($post) {
        return [
            'id' => $post->id,
            'content' => $post->content,
            'posted_at' => tz_carbon($post->created_at)->diffForHumans(),
            'posted_time' => tz_carbon($post->created_at)->format('g:i A'),
        ];
    });
    
    return response()->json($posts);
}
```

**Response**:
```json
[
    {
        "id": 1,
        "content": "Hello world",
        "posted_at": "2 hours ago",
        "posted_time": "3:45 PM"
    }
]
```

### Example 4: Date Comparisons

```php
// Check if event is today
$eventDate = tz_carbon($event->starts_at);
$isToday = $eventDate->isToday();

// Check if event is in the future
$isFuture = $eventDate->isFuture();

// Get time until event
$timeUntil = $eventDate->diffForHumans();
```

### Example 5: Explicit Timezone Conversion

```php
// Convert to specific timezone
$carbon = tz_carbon('2024-12-25 12:00:00', 'Asia/Tehran', 'UTC');
// Returns: Carbon instance in Asia/Tehran timezone

// Use for calculations
$carbon->addDays(7);
$carbon->startOfWeek();
```

## Complete Examples

### Example 1: Event Management System

```php
// app/Http/Controllers/EventController.php
class EventController extends Controller
{
    public function index()
    {
        $timezone = client_timezone();
        $now = tz_carbon(now());
        
        $events = Event::where('starts_at', '>=', $now->utc())
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'starts_at' => tz_format($event->starts_at),
                    'starts_at_carbon' => tz_carbon($event->starts_at),
                    'time_until' => tz_carbon($event->starts_at)->diffForHumans(),
                    'is_today' => tz_carbon($event->starts_at)->isToday(),
                ];
            });
        
        return response()->json([
            'timezone' => $timezone,
            'current_time' => tz_format(now()),
            'events' => $events,
        ]);
    }
}
```

### Example 2: Order Tracking

```php
// app/Http/Controllers/OrderController.php
class OrderController extends Controller
{
    public function track(Order $order)
    {
        return response()->json([
            'order_number' => $order->number,
            'status' => $order->status,
            'timeline' => [
                'placed_at' => [
                    'timestamp' => tz_format($order->created_at),
                    'relative' => tz_carbon($order->created_at)->diffForHumans(),
                ],
                'confirmed_at' => $order->confirmed_at ? [
                    'timestamp' => tz_format($order->confirmed_at),
                    'relative' => tz_carbon($order->confirmed_at)->diffForHumans(),
                ] : null,
                'shipped_at' => $order->shipped_at ? [
                    'timestamp' => tz_format($order->shipped_at),
                    'relative' => tz_carbon($order->shipped_at)->diffForHumans(),
                ] : null,
            ],
            'timezone' => client_timezone(),
        ]);
    }
}
```

### Example 3: Analytics Dashboard

```php
// app/Http/Controllers/AnalyticsController.php
class AnalyticsController extends Controller
{
    public function daily()
    {
        $timezone = client_timezone();
        $startOfDay = tz_carbon(now())->startOfDay();
        $endOfDay = tz_carbon(now())->endOfDay();
        
        $metrics = [
            'date' => tz_format(now(), 'Y-m-d'),
            'timezone' => $timezone,
            'visits' => Visit::whereBetween('created_at', [
                $startOfDay->utc(),
                $endOfDay->utc()
            ])->count(),
            'orders' => Order::whereBetween('created_at', [
                $startOfDay->utc(),
                $endOfDay->utc()
            ])->count(),
            'revenue' => Order::whereBetween('created_at', [
                $startOfDay->utc(),
                $endOfDay->utc()
            ])->sum('total'),
        ];
        
        return response()->json($metrics);
    }
}
```

### Example 4: Notification System

```php
// app/Services/NotificationService.php
class NotificationService
{
    public function sendEventReminder(Event $event, User $user)
    {
        $eventTime = tz_carbon($event->starts_at);
        $timeUntil = $eventTime->diffForHumans();
        
        $user->notify(new EventReminder([
            'event_title' => $event->title,
            'event_time' => tz_format($event->starts_at, 'l, F j, Y \a\t g:i A'),
            'time_until' => $timeUntil,
            'timezone' => client_timezone(),
        ]));
    }
}
```

### Example 5: Blade Components

```blade
{{-- resources/views/components/event-time.blade.php --}}
@props(['event'])

<div class="event-time" data-timezone="{{ client_timezone() }}">
    <div class="date">
        {{ tz_format($event->starts_at, 'F j, Y') }}
    </div>
    <div class="time">
        {{ tz_format($event->starts_at, 'g:i A') }}
    </div>
    <div class="relative">
        {{ tz_carbon($event->starts_at)->diffForHumans() }}
    </div>
</div>
```

## When to Use Helper Functions

### Primary Use Cases

#### 1. API Responses

**When**: Building APIs that return date/time data.

**Why**: Ensures dates are in user's timezone.

**Example**:

```php
return response()->json([
    'event_time' => tz_format($event->starts_at),
    'timezone' => client_timezone(),
]);
```

#### 2. Display Logic

**When**: Displaying dates in views or components.

**Why**: Shows dates in user's local timezone.

**Example**:

```blade
{{ tz_format($post->created_at, 'F j, Y \a\t g:i A') }}
```

#### 3. Date Calculations

**When**: Performing date calculations relative to user's timezone.

**Why**: Ensures calculations are timezone-aware.

**Example**:

```php
$startOfDay = tz_carbon(now())->startOfDay();
```

#### 4. Relative Time Display

**When**: Showing "2 hours ago" style timestamps.

**Why**: Carbon's `diffForHumans()` works with timezone-aware dates.

**Example**:

```php
tz_carbon($post->created_at)->diffForHumans();
```

### When NOT to Use

- **Database Storage**: Always store dates in UTC, don't use helpers for storage
- **Internal Calculations**: For server-side calculations, use UTC directly
- **Without Middleware**: Helpers require `SetTimezoneMiddleware` to work properly

## Best Practices

### 1. Always Store in UTC

```php
// ✅ Good - Store in UTC
$event->starts_at = Carbon::parse($request->input('starts_at'), $userTimezone)->utc();
$event->save();

// Display in user timezone
$formatted = tz_format($event->starts_at);

// ❌ Bad - Store in user timezone
$event->starts_at = Carbon::parse($request->input('starts_at'), $userTimezone);
$event->save();
```

### 2. Use Helpers for Display Only

```php
// ✅ Good - Use helpers for display
return response()->json([
    'starts_at' => tz_format($event->starts_at),
]);

// ❌ Bad - Use helpers for storage
$event->starts_at = tz_carbon($request->input('starts_at'));
```

### 3. Combine with Middleware

```php
// ✅ Good - Middleware sets timezone, helpers use it
// SetTimezoneMiddleware sets config('app.client_timezone')
$formatted = tz_format($date); // Uses client timezone

// ❌ Bad - Helpers without middleware
// No middleware, helpers fall back to config('app.timezone')
```

### 4. Use Appropriate Format

```php
// ✅ Good - Appropriate format for context
tz_format($date, 'Y-m-d H:i:s'); // API
tz_format($date, 'F j, Y \a\t g:i A'); // Display
tz_format($date, 'c'); // ISO 8601

// ❌ Bad - Wrong format
tz_format($date, 'Y-m-d'); // Missing time for time-sensitive data
```

## Common Mistakes to Avoid

1. **Storing timezone-aware dates**:
   ```php
   // ❌ Wrong
   $event->starts_at = tz_carbon($request->input('starts_at'));
   
   // ✅ Correct
   $event->starts_at = Carbon::parse($request->input('starts_at'), $userTz)->utc();
   // Display: tz_format($event->starts_at)
   ```

2. **Not using middleware**:
   ```php
   // ❌ Wrong - Helpers won't work properly
   // Without SetTimezoneMiddleware
   $formatted = tz_format($date);
   
   // ✅ Correct - Register middleware
   // app/Http/Kernel.php
   protected $middlewareGroups = [
       'web' => [
           \JobMetric\Language\Http\Middleware\SetTimezoneMiddleware::class,
       ],
   ];
   ```

3. **Using for database queries**:
   ```php
   // ❌ Wrong - Use UTC for queries
   $events = Event::where('starts_at', '>=', tz_carbon(now()));
   
   // ✅ Correct - Convert to UTC
   $events = Event::where('starts_at', '>=', tz_carbon(now())->utc());
   ```

4. **Not handling null values**:
   ```php
   // ❌ Wrong - May throw error
   $formatted = tz_format($order->shipped_at);
   
   // ✅ Correct - Check for null
   $formatted = $order->shipped_at ? tz_format($order->shipped_at) : null;
   ```

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/middleware/set-timezone-middleware">SetTimezoneMiddleware</Link>
- <Link to="/packages/laravel-language/deep-diving/support/current-language">CurrentLanguage</Link>
- <Link to="/packages/laravel-language/deep-diving/models/language">Language Model</Link>

