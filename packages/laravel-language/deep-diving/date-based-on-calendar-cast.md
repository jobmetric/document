---
sidebar_position: 10
sidebar_label: DateBasedOnCalendarCast
---

import Link from "@docusaurus/Link";

# DateBasedOnCalendarCast

The `DateBasedOnCalendarCast` is an Eloquent cast that automatically converts date/datetime values between storage format (Gregorian) and display format (user's language calendar system). It provides seamless multi-calendar support with automatic conversion, digit transliteration, and timezone handling.

## Namespace

```php
JobMetric\Language\Casts\DateBasedOnCalendarCast
```

## Overview

`DateBasedOnCalendarCast` provides:

- **Automatic Calendar Conversion**: Converts dates between Gregorian (storage) and user's calendar (display)
- **Multi-Calendar Support**: Supports Jalali, Hijri, Hebrew, Buddhist, Coptic, Ethiopian, Chinese calendars
- **Digit Transliteration**: Automatically converts between English, Persian, and Arabic numerals
- **Timezone Awareness**: Handles timezone conversion based on client timezone
- **Flexible Formatting**: Configurable date separators and modes (date/datetime)
- **Graceful Fallbacks**: Falls back to Gregorian if language/calendar not available

## How It Works

### Storage vs Display

- **Storage**: Always Gregorian in `Y-m-d H:i:s` format in app timezone (typically UTC)
- **Display**: Converted to user's calendar system based on current language settings

### Conversion Flow

#### Getting (Reading from Database)

1. Reads Gregorian date from database
2. Converts to client timezone
3. Converts Y-m-d part to user's calendar system
4. Applies digit transliteration (English/Persian/Arabic)
5. Returns formatted string

#### Setting (Writing to Database)

1. Accepts date in user's calendar system (or Gregorian)
2. Transliterates digits to English
3. Converts from user's calendar to Gregorian
4. Normalizes timezone to app timezone
5. Stores as `Y-m-d H:i:s` in database

## Basic Usage

### Simple Date Cast

```php
use JobMetric\Language\Casts\DateBasedOnCalendarCast;

class Event extends Model
{
    protected $casts = [
        'event_date' => DateBasedOnCalendarCast::class,
    ];
}
```

**Example**:

```php
// Database: "2024-12-25 00:00:00" (Gregorian)
// User's language: Persian (Jalali calendar)

$event = Event::find(1);
echo $event->event_date; // "1403-09-05" (Jalali, Persian digits: ۱۴۰۳-۰۹-۰۵)
```

### DateTime Cast

```php
protected $casts = [
    'starts_at' => DateBasedOnCalendarCast::class . ':datetime',
];
```

**Example**:

```php
// Database: "2024-12-25 14:30:00" (Gregorian)
// User's language: Persian (Jalali calendar)

$event = Event::find(1);
echo $event->starts_at; // "1403-09-05 14:30:00" (Jalali with time)
```

## Constructor Parameters

The cast accepts three optional parameters:

```php
new DateBasedOnCalendarCast(
    string $mode = 'date',      // 'date' or 'datetime'
    string $dateSep = '-',      // '-', '/', or '.'
    string $digits = 'auto'     // 'en', 'fa', 'ar', or 'auto'
)
```

### Mode

Controls whether the attribute handles date-only or full datetime:

- **`'date'`**: Date only (e.g., `"1403-09-05"`)
- **`'datetime'`**: Date with time (e.g., `"1403-09-05 14:30:00"`)

### Date Separator

Controls the separator used in formatted output:

- **`'-'`**: `"1403-09-05"` (default)
- **`'/'`**: `"1403/09/05"`
- **`'.'`**: `"1403.09.05"`

**Note**: Input accepts all separators (`-`, `/`, `.`) regardless of this setting.

### Digits

Controls digit transliteration in output:

- **`'auto'`**: Automatically uses digits based on current locale (fa → Persian, ar → Arabic, else → English)
- **`'en'`**: English digits (0-9)
- **`'fa'`**: Persian digits (۰-۹)
- **`'ar'`**: Arabic digits (٠-٩)

## Advanced Usage

### Using castUsing() Method

Laravel's `castUsing()` allows passing parameters via cast string:

```php
protected $casts = [
    'event_date' => DateBasedOnCalendarCast::class . ':date,-,fa',
    // Mode: date
    // Separator: -
    // Digits: fa (Persian)
];
```

### Different Configurations

```php
protected $casts = [
    // Date only, slash separator, Persian digits
    'birth_date' => DateBasedOnCalendarCast::class . ':date,/,fa',
    
    // DateTime, dot separator, auto digits
    'created_at' => DateBasedOnCalendarCast::class . ':datetime,.,auto',
    
    // Date only, dash separator, English digits
    'published_at' => DateBasedOnCalendarCast::class . ':date,-,en',
];
```

## Complete Examples

### Example 1: Event Model with Jalali Dates

```php
// app/Models/Event.php
use JobMetric\Language\Casts\DateBasedOnCalendarCast;

class Event extends Model
{
    protected $casts = [
        'event_date' => DateBasedOnCalendarCast::class . ':date,/,fa',
        'starts_at' => DateBasedOnCalendarCast::class . ':datetime,-,auto',
        'ends_at' => DateBasedOnCalendarCast::class . ':datetime,-,auto',
    ];
}
```

**Usage**:

```php
// Create event
$event = Event::create([
    'title' => 'Conference',
    'event_date' => '1403/09/05', // Jalali date
    'starts_at' => '1403-09-05 09:00:00', // Jalali datetime
    'ends_at' => '1403-09-05 17:00:00', // Jalali datetime
]);

// Database stores as Gregorian:
// event_date: "2024-12-25 00:00:00"
// starts_at: "2024-12-25 09:00:00"
// ends_at: "2024-12-25 17:00:00"

// When reading (Persian user):
$event = Event::find(1);
echo $event->event_date; // "1403/09/05" (Jalali, Persian digits)
echo $event->starts_at; // "1403-09-05 09:00:00" (Jalali, auto digits)
```

### Example 2: Article Model with Publication Date

```php
// app/Models/Article.php
class Article extends Model
{
    protected $casts = [
        'published_at' => DateBasedOnCalendarCast::class . ':date,-,auto',
    ];
}
```

**Usage**:

```php
// Persian user creates article
$article = Article::create([
    'title' => 'New Article',
    'published_at' => '1403-09-05', // Jalali date
]);

// English user views article
// (Language changes, but date remains in database as Gregorian)
$article = Article::find(1);
echo $article->published_at; // "2024-12-25" (Gregorian, English digits)
```

### Example 3: Appointment Model

```php
// app/Models/Appointment.php
class Appointment extends Model
{
    protected $casts = [
        'appointment_date' => DateBasedOnCalendarCast::class . ':date,/,fa',
        'appointment_time' => DateBasedOnCalendarCast::class . ':datetime,-,fa',
    ];
}
```

**Usage**:

```php
// User books appointment in Jalali
$appointment = Appointment::create([
    'doctor_id' => 1,
    'patient_id' => 1,
    'appointment_date' => '1403/09/05', // Jalali
    'appointment_time' => '1403-09-05 14:30:00', // Jalali with time
]);

// Display to user
echo $appointment->appointment_date; // "1403/09/05" (Persian digits: ۱۴۰۳/۰۹/۰۵)
echo $appointment->appointment_time; // "1403-09-05 14:30:00"
```

### Example 4: Task Model with Deadlines

```php
// app/Models/Task.php
class Task extends Model
{
    protected $casts = [
        'due_date' => DateBasedOnCalendarCast::class . ':date,-,auto',
        'completed_at' => DateBasedOnCalendarCast::class . ':datetime,-,auto',
    ];
}
```

**Usage**:

```php
// Create task
$task = Task::create([
    'title' => 'Complete project',
    'due_date' => '1403-09-10', // Jalali
]);

// Complete task
$task->update([
    'completed_at' => now(), // Automatically converts to Gregorian for storage
]);

// Display
echo $task->due_date; // "1403-09-10" (in user's calendar)
echo $task->completed_at; // "1403-09-05 15:45:00" (in user's calendar)
```

### Example 5: Form Input Handling

```php
// app/Http/Controllers/EventController.php
class EventController extends Controller
{
    public function store(Request $request)
    {
        // User submits: "1403/09/05" (Jalali)
        $event = Event::create([
            'title' => $request->input('title'),
            'event_date' => $request->input('event_date'), // Cast handles conversion
        ]);
        
        // Database stores: "2024-12-25 00:00:00" (Gregorian)
        
        return redirect()->back();
    }
    
    public function show(Event $event)
    {
        // Automatically displays in user's calendar
        return view('events.show', [
            'event' => $event, // $event->event_date is in user's calendar
        ]);
    }
}
```

### Example 6: API Response

```php
// app/Http/Controllers/Api/EventController.php
class EventController extends Controller
{
    public function index()
    {
        $events = Event::all();
        
        return response()->json([
            'data' => $events->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'event_date' => $event->event_date, // Already in user's calendar
                    'starts_at' => $event->starts_at, // Already in user's calendar
                ];
            }),
        ]);
    }
}
```

**Response (Persian user)**:
```json
{
    "data": [
        {
            "id": 1,
            "title": "Conference",
            "event_date": "1403/09/05",
            "starts_at": "1403-09-05 09:00:00"
        }
    ]
}
```

**Response (English user)**:
```json
{
    "data": [
        {
            "id": 1,
            "title": "Conference",
            "event_date": "2024-12-25",
            "starts_at": "2024-12-25 09:00:00"
        }
    ]
}
```

## Supported Input Formats

### Calendar Formats

The cast accepts dates in various calendar systems:

- **Gregorian**: `"2024-12-25"`, `"2024/12/25"`, `"2024.12.25"`
- **Jalali**: `"1403-09-05"`, `"1403/09/05"`, `"1403.09.05"`
- **Hijri**: `"1446-06-15"`, `"1446/06/15"`, `"1446.06.15"`
- **Other calendars**: Hebrew, Buddhist, Coptic, Ethiopian, Chinese

### Date Separators

All separators are accepted in input:

- **Dash**: `"1403-09-05"`
- **Slash**: `"1403/09/05"`
- **Dot**: `"1403.09.05"`

### Digit Formats

Input accepts digits in any format:

- **English**: `"1403-09-05"`
- **Persian**: `"۱۴۰۳-۰۹-۰۵"`
- **Arabic**: `"١٤٠٣-٠٩-٠٥"`

### DateTime Formats

For datetime mode:

- **Date + Time**: `"1403-09-05 14:30:00"`
- **Date + Time (space)**: `"1403-09-05 14:30"`
- **ISO Format**: `"2024-12-25T14:30:00Z"` (treated as Gregorian)

### Special Inputs

- **DateTimeInterface**: `Carbon::now()`, `new DateTime()`
- **Unix Timestamp**: `1703520000` (integer or string)
- **Null**: Returns `null` (handles gracefully)

## Calendar Systems

The cast supports all calendar types from `CalendarTypeEnum`:

| Calendar | Example Input | Example Output |
|----------|---------------|----------------|
| **Gregorian** | `"2024-12-25"` | `"2024-12-25"` |
| **Jalali** | `"1403-09-05"` | `"1403-09-05"` |
| **Hijri** | `"1446-06-15"` | `"1446-06-15"` |
| **Hebrew** | `"5785-03-15"` | `"5785-03-15"` |
| **Buddhist** | `"2567-12-25"` | `"2567-12-25"` |
| **Coptic** | `"1741-04-16"` | `"1741-04-16"` |
| **Ethiopian** | `"2017-04-16"` | `"2017-04-16"` |
| **Chinese** | `"4722-11-15"` | `"4722-11-15"` |

## Timezone Handling

The cast automatically handles timezone conversion:

1. **Storage**: Converts to app timezone (typically UTC)
2. **Display**: Converts to client timezone (from `Accept-Timezone` header)

**Example**:

```php
// User in Tehran (UTC+3:30) creates event at 14:30 local time
$event = Event::create([
    'starts_at' => '1403-09-05 14:30:00', // Tehran time
]);

// Database stores: "2024-12-25 11:00:00" (UTC)

// User in New York (UTC-5) views event
// Displays: "1403-09-05 06:30:00" (New York time, converted)
```

## Fallback Behavior

The cast gracefully handles edge cases:

### No Language Set

```php
// If no language is set or language has no calendar
$event->event_date; // Returns Gregorian format
```

### Invalid Calendar

```php
// If calendar converter fails
$event->event_date; // Falls back to Gregorian format
```

### Invalid Input

```php
// If input cannot be parsed
$event->event_date = 'invalid-date'; // May throw exception or return null
```

## When to Use DateBasedOnCalendarCast

### Primary Use Cases

#### 1. Multi-Calendar Applications

**When**: Your application serves users with different calendar preferences.

**Why**: Automatically displays dates in user's preferred calendar.

**Example**:

```php
// Persian users see Jalali dates
// Arabic users see Hijri dates
// English users see Gregorian dates
```

#### 2. Localized Date Display

**When**: You need dates displayed in user's local calendar system.

**Why**: Provides native date format for better user experience.

**Example**:

```php
// Persian user sees: "1403/09/05"
// Instead of: "2024-12-25"
```

#### 3. Form Input Handling

**When**: Users input dates in their local calendar system.

**Why**: Automatically converts to Gregorian for storage.

**Example**:

```php
// User inputs: "1403/09/05" (Jalali)
// Stored as: "2024-12-25" (Gregorian)
```

#### 4. API Responses

**When**: Building APIs that return date data.

**Why**: Automatically formats dates based on user's language.

**Example**:

```php
// API returns dates in user's calendar automatically
return new EventResource($event);
```

### When NOT to Use

- **Simple Gregorian-Only Apps**: If all users use Gregorian calendar
- **Internal Calculations**: For server-side date calculations, use Carbon directly
- **Timestamp Fields**: Use `timestamp` cast for Unix timestamps
- **Date Ranges**: For date range queries, work with Gregorian in database

## Best Practices

### 1. Always Store in Gregorian

```php
// ✅ Good - Cast handles conversion
protected $casts = [
    'event_date' => DateBasedOnCalendarCast::class,
];

// Database always stores Gregorian
// Display automatically converts

// ❌ Bad - Don't manually convert before storage
$event->event_date = convertToGregorian($jalaliDate); // Unnecessary
```

### 2. Use Appropriate Mode

```php
// ✅ Good - Use datetime for time-sensitive data
'starts_at' => DateBasedOnCalendarCast::class . ':datetime',

// ✅ Good - Use date for date-only fields
'birth_date' => DateBasedOnCalendarCast::class . ':date',

// ❌ Bad - Using date mode for datetime data
'starts_at' => DateBasedOnCalendarCast::class . ':date', // Loses time
```

### 3. Configure Digits Based on Locale

```php
// ✅ Good - Auto digits adapts to locale
'event_date' => DateBasedOnCalendarCast::class . ':date,-,auto',

// ✅ Good - Explicit digits for specific needs
'event_date' => DateBasedOnCalendarCast::class . ':date,-,fa', // Always Persian

// ❌ Bad - English digits for Persian users
'event_date' => DateBasedOnCalendarCast::class . ':date,-,en', // Poor UX
```

### 4. Handle Null Values

```php
// ✅ Good - Cast handles null gracefully
$event->event_date = null; // Works fine

// ❌ Bad - Don't set empty strings
$event->event_date = ''; // May cause issues
```

## Common Mistakes to Avoid

1. **Manual conversion before storage**:
   ```php
   // ❌ Wrong - Unnecessary conversion
   $gregorian = convertToGregorian($jalaliDate);
   $event->event_date = $gregorian;
   
   // ✅ Correct - Cast handles it
   $event->event_date = $jalaliDate;
   ```

2. **Using wrong mode**:
   ```php
   // ❌ Wrong - Date mode loses time
   'starts_at' => DateBasedOnCalendarCast::class . ':date',
   
   // ✅ Correct - Datetime mode preserves time
   'starts_at' => DateBasedOnCalendarCast::class . ':datetime',
   ```

3. **Not configuring digits**:
   ```php
   // ❌ Wrong - May show English digits to Persian users
   'event_date' => DateBasedOnCalendarCast::class,
   
   // ✅ Correct - Auto adapts to locale
   'event_date' => DateBasedOnCalendarCast::class . ':date,-,auto',
   ```

4. **Expecting consistent format across users**:
   ```php
   // ❌ Wrong - Format depends on user's language
   $date = $event->event_date; // Different format for different users
   
   // ✅ Correct - Use raw attribute for consistent format
   $date = $event->getRawOriginal('event_date'); // Always Gregorian
   ```

## Performance Considerations

### Converter Caching

The cast caches calendar converters per request to avoid repeated factory calls:

```php
// First call creates converter
$event->event_date; // Creates converter, caches it

// Subsequent calls use cached converter
$event2->event_date; // Uses cached converter
```

### Language Resolution

The cast uses `CurrentLanguage::get()` which is cached based on `config('language.cache_time')`:

```php
// Configure cache for better performance
// config/language.php
'cache_time' => 60, // Cache for 60 minutes
```

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/calendar-type-enum">CalendarTypeEnum</Link>
- <Link to="/packages/laravel-language/deep-diving/models/language">Language Model</Link>
- <Link to="/packages/laravel-language/deep-diving/support/current-language">CurrentLanguage</Link>
- <Link to="/packages/laravel-language/deep-diving/middleware/set-timezone-middleware">SetTimezoneMiddleware</Link>

