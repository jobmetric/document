---
sidebar_position: 2
sidebar_label: SetTimezoneMiddleware
---

import Link from "@docusaurus/Link";

# SetTimezoneMiddleware

The `SetTimezoneMiddleware` automatically sets the application timezone based on user preferences, request parameters, or language settings, enabling accurate date and time handling for global applications.

## Namespace

```php
JobMetric\Language\Http\Middleware\SetTimezoneMiddleware
```

## Overview

This middleware intelligently sets the application timezone, which is then used by helper functions like `client_timezone()`, `tz_format()`, and `tz_carbon()` to ensure all dates and times are displayed in the user's local timezone.

The middleware determines timezone from:
1. `Accept-Timezone` header (if present and valid)
2. Config fallback `config('app.timezone')` (defaults to 'UTC' if invalid)

## Why Use This Middleware?

### Problem Without Middleware

Without this middleware, you would face:

- **Incorrect Date Display**: All dates shown in server timezone, confusing users
- **Manual Timezone Handling**: Need to convert timezones in every controller
- **Inconsistent Experience**: Different parts of app might use different timezones
- **Complex Calculations**: Manual timezone conversions everywhere
- **User Confusion**: Users see times that don't match their local time
- **Scheduling Issues**: Events and appointments shown in wrong timezone

### Solution With Middleware

The `SetTimezoneMiddleware` solves all these problems:

- **Automatic Detection**: Sets timezone automatically based on user context
- **Consistent Experience**: All dates/times use the same timezone throughout request
- **Helper Integration**: Works seamlessly with timezone helper functions
- **Language Integration**: Uses timezone from language settings when available
- **Session Persistence**: Remembers user's timezone preference
- **Zero Configuration**: Works out of the box with sensible defaults

## Usage

### Basic Registration

Register in `app/Http/Kernel.php`:

```php
protected $middlewareGroups = [
    'web' => [
        // ... other middleware
        \JobMetric\Language\Http\Middleware\SetTimezoneMiddleware::class,
    ],
];
```

### API Routes

For API routes, register in the `api` middleware group:

```php
protected $middlewareGroups = [
    'api' => [
        // ... other middleware
        \JobMetric\Language\Http\Middleware\SetTimezoneMiddleware::class,
    ],
];
```

### Specific Routes

Apply to specific routes only:

```php
Route::middleware([
    \JobMetric\Language\Http\Middleware\SetTimezoneMiddleware::class
])->group(function () {
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/appointments', [AppointmentController::class, 'index']);
});
```

## How It Works

### Priority System

The middleware follows this priority order:

1. **Accept-Timezone Header** (Highest Priority)
   - Checks for `Accept-Timezone` header in request
   - Example: `Accept-Timezone: America/New_York`
   - Validates timezone identifier (IANA format)
   - Useful for API clients and browser-based timezone detection

2. **Config Fallback** (Lowest Priority)
   - Uses `config('app.timezone')` as fallback
   - Defaults to 'UTC' if config value is invalid
   - Ensures a valid timezone is always set

### Timezone Resolution

The middleware resolves timezone using this logic:

```php
// Priority 1: Accept-Timezone header
$timezone = $request->header('Accept-Timezone');
if ($this->isValidTimezone($timezone)) {
    // Use header value
} else {
    // Priority 2: Config fallback
    $timezone = config('app.timezone', 'UTC');
    if (!$this->isValidTimezone($timezone)) {
        $timezone = 'UTC'; // Final fallback
    }
}

// Store for request lifetime
config(['app.client_timezone' => $timezone]);
$request->headers->set('Accept-Timezone', $timezone);
```

**Important Notes**:
- The middleware does **NOT** change `config('app.timezone')` or PHP's default timezone
- It stores the client timezone in `config('app.client_timezone')` for the current request only
- Helper functions like `client_timezone()` read from `config('app.client_timezone')`

## Real-World Use Cases

### Use Case 1: Global Event Management System

**Scenario**: An event management platform needs to show event times in each user's local timezone.

**Problem Without Middleware**:
```php
// All events shown in server timezone (UTC)
$event = Event::find(1);
echo $event->starts_at; // "2024-01-15 14:00:00" (UTC)
// User in New York sees: 2:00 PM (but it's actually 9:00 AM their time!)
```

**Solution With Middleware**:
```php
// Middleware automatically sets user's timezone
// User in New York: timezone = 'America/New_York'

// In controller
$event = Event::find(1);

// Helper functions use middleware-set timezone
echo tz_format($event->starts_at); // "2024-01-15 09:00:00" (New York time)
echo tz_carbon($event->starts_at)->format('g:i A'); // "9:00 AM"
```

**Benefits**:
- Users see event times in their local timezone
- No confusion about when events occur
- Better user experience and fewer missed events

### Use Case 2: E-Commerce Order Tracking

**Scenario**: An e-commerce platform needs to show order timestamps in customer's timezone.

**Solution**:

```php
// Middleware sets customer's timezone
// Customer in Tokyo: timezone = 'Asia/Tokyo'

// Order confirmation email
$order = Order::find(123);

// Dates automatically in customer's timezone
$data = [
    'order_date' => tz_format($order->created_at), // Tokyo time
    'estimated_delivery' => tz_format($order->estimated_delivery), // Tokyo time
    'current_time' => tz_carbon(now())->format('Y-m-d H:i:s'), // Tokyo time
];

Mail::to($order->customer)->send(new OrderConfirmation($data));
```

**Benefits**:
- Customers see order times in their local timezone
- Delivery estimates make sense to customers
- Reduced support inquiries about "wrong" times

### Use Case 3: Appointment Booking System

**Scenario**: A healthcare appointment system needs to show available slots in patient's timezone.

**Solution**:

```php
// Patient in London: timezone = 'Europe/London'
// Doctor in New York: timezone = 'America/New_York'

// Show available slots in patient's timezone
$slots = AppointmentSlot::where('doctor_id', $doctorId)
    ->where('date', '>=', now())
    ->get()
    ->map(function ($slot) {
        return [
            'id' => $slot->id,
            'date' => tz_format($slot->date), // Patient's timezone
            'time' => tz_carbon($slot->date)->format('g:i A'), // Patient's timezone
            'available' => $slot->isAvailable(),
        ];
    });

return response()->json($slots);
```

**Benefits**:
- Patients see appointment times in their timezone
- No confusion about booking times
- Better booking experience

### Use Case 4: Social Media Platform

**Scenario**: A social media platform needs to show post timestamps in user's timezone.

**Solution**:

```php
// User in Dubai: timezone = 'Asia/Dubai'

// Timeline posts
$posts = Post::latest()->paginate(20);

return view('timeline', [
    'posts' => $posts->map(function ($post) {
        return [
            'id' => $post->id,
            'content' => $post->content,
            'posted_at' => tz_carbon($post->created_at)->diffForHumans(), // "2 hours ago" (Dubai time)
            'posted_time' => tz_format($post->created_at, 'g:i A'), // "3:45 PM" (Dubai time)
        ];
    }),
]);
```

**Benefits**:
- Users see "2 hours ago" relative to their timezone
- Timestamps make sense to users
- Better engagement and user experience

### Use Case 5: Analytics Dashboard

**Scenario**: An analytics dashboard needs to show metrics in user's timezone for accurate reporting.

**Solution**:

```php
// Admin in Sydney: timezone = 'Australia/Sydney'

// Daily analytics
$startOfDay = tz_carbon(now())->startOfDay(); // Sydney midnight
$endOfDay = tz_carbon(now())->endOfDay(); // Sydney 11:59 PM

$metrics = [
    'today_visits' => Visit::whereBetween('created_at', [$startOfDay, $endOfDay])->count(),
    'today_orders' => Order::whereBetween('created_at', [$startOfDay, $endOfDay])->count(),
    'today_revenue' => Order::whereBetween('created_at', [$startOfDay, $endOfDay])->sum('total'),
];

// All metrics are for "today" in admin's timezone
return view('analytics.dashboard', compact('metrics'));
```

**Benefits**:
- Reports show data for "today" in admin's timezone
- Accurate daily/weekly/monthly reports
- No confusion about time ranges

## Integration with Helper Functions

The middleware works seamlessly with timezone helper functions:

### client_timezone()

Get the current client timezone:

```php
// Middleware sets timezone to 'America/New_York'
$timezone = client_timezone(); // 'America/New_York'
```

### tz_format()

Format dates in client timezone:

```php
$date = now(); // Server time: 2024-01-15 14:00:00 (UTC)

// Middleware sets timezone to 'America/New_York'
$formatted = tz_format($date); // "2024-01-15 09:00:00" (New York time)
$formatted = tz_format($date, 'Y-m-d H:i:s'); // Custom format
```

### tz_carbon()

Get Carbon instance in client timezone:

```php
$date = now(); // Server time

// Middleware sets timezone to 'Asia/Tokyo'
$carbon = tz_carbon($date); // Carbon instance in Tokyo timezone

echo $carbon->format('Y-m-d H:i:s'); // Tokyo time
echo $carbon->diffForHumans(); // Relative time in Tokyo timezone
```

## Complete Setup Example

### Step 1: Register Middleware

```php
// app/Http/Kernel.php
protected $middlewareGroups = [
    'web' => [
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \JobMetric\Language\Http\Middleware\SetLanguageMiddleware::class,
        \JobMetric\Language\Http\Middleware\SetTimezoneMiddleware::class,
        // ... other middleware
    ],
];
```

### Step 2: Send Timezone in Requests

For web applications, you can send timezone via JavaScript:

```javascript
// Detect user timezone
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Send with every request
fetch('/api/events', {
    headers: {
        'Accept-Timezone': timezone
    }
});
```

Or set it in your frontend framework:

```javascript
// Axios interceptor
axios.interceptors.request.use(config => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    config.headers['Accept-Timezone'] = timezone;
    return config;
});
```

For API clients, include the header:

```php
// API client example
$response = Http::withHeaders([
    'Accept-Timezone' => 'America/New_York'
])->get('https://api.example.com/events');
```

### Step 3: Use in Controllers

```php
// app/Http/Controllers/EventController.php
public function index()
{
    $events = Event::upcoming()
        ->get()
        ->map(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'starts_at' => tz_format($event->starts_at),
                'starts_at_formatted' => tz_carbon($event->starts_at)->format('l, F j, Y \a\t g:i A'),
                'timezone' => client_timezone(),
            ];
        });
    
    return view('events.index', compact('events'));
}
```

### Step 4: Custom Timezone Detection

You can extend the middleware behavior by creating a custom middleware that sets the `Accept-Timezone` header:

```php
// app/Http/Middleware/DetectUserTimezone.php
class DetectUserTimezone
{
    public function handle(Request $request, Closure $next)
    {
        // Check session first
        if ($request->hasSession() && $request->session()->has('timezone')) {
            $timezone = $request->session()->get('timezone');
        }
        // Check user profile
        elseif (auth()->check() && auth()->user()->timezone) {
            $timezone = auth()->user()->timezone;
        }
        // Check language timezone
        elseif ($language = CurrentLanguage::resolve() && $language->timezone) {
            $timezone = $language->timezone;
        }
        
        // Set header for SetTimezoneMiddleware to use
        if (isset($timezone)) {
            $request->headers->set('Accept-Timezone', $timezone);
        }
        
        return $next($request);
    }
}

// Register before SetTimezoneMiddleware
protected $middlewareGroups = [
    'web' => [
        \App\Http\Middleware\DetectUserTimezone::class,
        \JobMetric\Language\Http\Middleware\SetTimezoneMiddleware::class,
    ],
];
```

## When to Use SetTimezoneMiddleware

Use this middleware when you need to:

- **Automatic Timezone Detection**: Automatically detect and set timezone from user context
- **User Timezone**: Support user-specific timezones for personalized experience
- **Date Formatting**: Format dates in user's timezone throughout the application
- **Global Applications**: Support users in different timezones seamlessly
- **Event Management**: Show event times in user's local timezone
- **E-Commerce**: Display order timestamps in customer's timezone
- **Appointment Systems**: Show available slots in user's timezone
- **Social Media**: Display post timestamps relative to user's timezone
- **Analytics**: Show reports in admin's timezone for accurate data
- **Notifications**: Send notifications with times in user's timezone

## When NOT to Use

You might not need this middleware if:

- Your application only serves users in one timezone
- You handle timezone conversion manually in controllers
- You use a different timezone management strategy
- All dates are stored and displayed in UTC only

## Best Practices

### 1. Always Store Dates in UTC

```php
// Store in UTC
$event->starts_at = Carbon::parse($request->input('starts_at'), $userTimezone)->utc();
$event->save();

// Display in user timezone
echo tz_format($event->starts_at); // Automatically converted
```

### 2. Use Helper Functions

```php
// Good: Use helper functions
$formatted = tz_format($date);
$carbon = tz_carbon($date);

// Bad: Manual timezone conversion
$formatted = Carbon::parse($date)->setTimezone($timezone)->format('Y-m-d H:i:s');
```

### 3. Set User Timezone on Registration

```php
// When user registers, detect and set timezone
public function register(Request $request)
{
    $user = User::create([...]);
    
    // Detect timezone from request or use default
    $timezone = $request->input('timezone') ?? config('app.timezone');
    session(['timezone' => $timezone]);
    
    $user->update(['timezone' => $timezone]);
}
```

### 4. Allow Timezone Override

```php
// Provide timezone selector in user settings
<select name="timezone">
    @foreach(timezone_identifiers_list() as $tz)
        <option value="{{ $tz }}" {{ $tz === session('timezone') ? 'selected' : '' }}>
            {{ $tz }}
        </option>
    @endforeach
</select>
```

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/middleware/set-language-middleware">SetLanguageMiddleware</Link>
- <Link to="/packages/laravel-language/deep-diving/support/helpers">Helper Functions</Link>
- <Link to="/packages/laravel-language/deep-diving/models/language">Language Model</Link>
- <Link to="/packages/laravel-language/deep-diving/support/current-language">CurrentLanguage</Link>

