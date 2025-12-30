---
sidebar_position: 3
sidebar_label: CheckFutureDateRule
---

import Link from "@docusaurus/Link";

# CheckFutureDateRule

The `CheckFutureDateRule` validates that a date is in the future based on the language's calendar system and client timezone.

## Namespace

```php
JobMetric\Language\Rules\CheckFutureDateRule
```

## Overview

This rule validates future dates considering:
- **Language's calendar system** (Gregorian, Jalali, Hijri, Hebrew, etc.)
- **Client timezone** (set by `SetTimezoneMiddleware`)
- **Multi-calendar support** (automatically converts calendar dates)
- **Persian/Arabic numerals** (supports localized number formats)
- **Unchanged value bypass** (skips validation if date hasn't changed on update)

## Usage

### Basic Usage

```php
use JobMetric\Language\Rules\CheckFutureDateRule;

$request->validate([
    'event_date' => ['required', new CheckFutureDateRule()],
]);
```

### With Unchanged Value Bypass (Update Scenarios)

```php
// When updating, skip validation if date hasn't changed
$event = Event::find($id);

$request->validate([
    'event_date' => [
        'required',
        new CheckFutureDateRule(
            Event::class,        // Model class
            $event->id,          // Model ID
            'event_date',        // Field name
            false                // assumeEndOfDay
        )
    ],
]);
```

### With End of Day Policy

```php
// Treat date-only inputs as end of day (23:59:59)
$request->validate([
    'deadline' => [
        'required',
        new CheckFutureDateRule(null, null, null, true) // assumeEndOfDay = true
    ],
]);
```

## Parameters

- `$modelClass` (`string|null`): Model class for unchanged-value bypass
- `$modelId` (`int|null`): Model ID for unchanged-value bypass
- `$modelField` (`string|null`): Field name for unchanged-value bypass
- `$assumeEndOfDay` (`bool`): If true, date-only inputs treated as 23:59:59 (default: false)

## Supported Input Formats

The rule supports multiple input formats:

### Calendar Formats

- **Gregorian**: `2024-12-25`, `2024/12/25`, `2024.12.25`
- **Jalali**: `1403-09-05` (Persian calendar)
- **Hijri**: `1446-06-15` (Islamic calendar)
- **Other calendars**: Hebrew, Buddhist, Coptic, Ethiopian, Chinese

### Date and Time Formats

- **Date only**: `2024-12-25` (treated as 00:00:00 or 23:59:59 based on `assumeEndOfDay`)
- **Date with time**: `2024-12-25 14:30:00`
- **ISO 8601**: `2024-12-25T14:30:00Z`
- **Unix timestamp**: `1703520000`

### Number Formats

- **English numerals**: `2024-12-25`
- **Persian numerals**: `۱۴۰۳-۰۹-۰۵`
- **Arabic numerals**: `٢٠٢٤-١٢-٢٥`

## When to Use CheckFutureDateRule

### Primary Use Cases

#### 1. Event Scheduling

**When**: Creating events that must occur in the future.

**Why**: Prevents scheduling events in the past, which would be invalid.

**Example**:

```php
// app/Http/Requests/StoreEventRequest.php
use JobMetric\Language\Rules\CheckFutureDateRule;

public function rules(): array
{
    return [
        'title' => 'required|string',
        'event_date' => ['required', new CheckFutureDateRule()],
        'description' => 'nullable|string',
    ];
}
```

**Real-World Scenario**: Event management system. User creates an event - rule ensures the event date is in the future.

#### 2. Appointment Booking

**When**: Booking appointments that must be scheduled ahead of time.

**Why**: Ensures appointments can only be booked for future dates.

**Example**:

```php
// app/Http/Requests/StoreAppointmentRequest.php
use JobMetric\Language\Rules\CheckFutureDateRule;

public function rules(): array
{
    return [
        'doctor_id' => 'required|exists:doctors,id',
        'appointment_date' => ['required', new CheckFutureDateRule()],
        'reason' => 'nullable|string',
    ];
}
```

**Real-World Scenario**: Healthcare appointment system. Patient books appointment - rule ensures it's for a future date.

#### 3. Deadline Management

**When**: Setting deadlines that must be in the future.

**Why**: Prevents setting past deadlines, which would be meaningless.

**Example**:

```php
// app/Http/Requests/StoreTaskRequest.php
use JobMetric\Language\Rules\CheckFutureDateRule;

public function rules(): array
{
    return [
        'title' => 'required|string',
        'deadline' => [
            'required',
            new CheckFutureDateRule(null, null, null, true) // End of day
        ],
    ];
}
```

**Real-World Scenario**: Task management system. User sets deadline - rule ensures it's in the future, treating date-only as end of day.

#### 4. Update Scenarios with Unchanged Value Bypass

**When**: Updating records where the date might not change.

**Why**: Avoids unnecessary validation errors when the date hasn't changed.

**Example**:

```php
// app/Http/Requests/UpdateEventRequest.php
use JobMetric\Language\Rules\CheckFutureDateRule;

public function rules(): array
{
    $event = $this->route('event');
    
    return [
        'title' => 'required|string',
        'event_date' => [
            'required',
            new CheckFutureDateRule(
                Event::class,
                $event->id,
                'event_date',
                false
            )
        ],
    ];
}
```

**Real-World Scenario**: Editing an event. If user doesn't change the date, validation passes. If changed, validates it's still in the future.

#### 5. Multi-Calendar Support

**When**: Users input dates in their local calendar system (Jalali, Hijri, etc.).

**Why**: Automatically converts and validates dates regardless of calendar system.

**Example**:

```php
// Persian user inputs Jalali date
$request->validate([
    'event_date' => ['required', new CheckFutureDateRule()],
]);

// Input: "1403-09-05" (Jalali)
// Rule converts to Gregorian and validates it's in the future
```

**Real-World Scenario**: Persian users input dates in Jalali calendar. Rule automatically handles conversion and validation.

#### 6. Timezone-Aware Validation

**When**: Validating dates considering user's timezone.

**Why**: Ensures dates are validated in the user's local timezone, not server timezone.

**Example**:

```php
// User in New York timezone
// Server in UTC
$request->validate([
    'event_date' => ['required', new CheckFutureDateRule()],
]);

// Input: "2024-12-25 23:00:00" (New York time)
// Rule validates in New York timezone, not UTC
```

**Real-World Scenario**: Global event system. User in Tokyo books event - rule validates in Tokyo timezone.

### When NOT to Use

- **Past Date Validation**: Don't use for validating past dates - this rule only validates future dates
- **Date Format Validation**: Don't use for format validation - use `date` or `date_format` rules
- **Required Validation**: Don't use as a replacement for `required` - combine with `required`
- **Simple Date Checks**: If you don't need calendar/timezone awareness, use simpler validation

### Decision Tree

```
Do you need to validate a future date?
├─ Yes → Does it need calendar system support?
│  ├─ Yes → Use CheckFutureDateRule()
│  └─ No → Use simple 'after:now' rule
└─ No → Don't use this rule
```

### Common Mistakes to Avoid

1. **Not combining with 'required'**:
   ```php
   // ❌ Wrong - allows empty values
   'event_date' => [new CheckFutureDateRule()]
   
   // ✅ Correct - validates presence and future
   'event_date' => ['required', new CheckFutureDateRule()]
   ```

2. **Using for past dates**:
   ```php
   // ❌ Wrong - this rule only validates future dates
   'birth_date' => [new CheckFutureDateRule()]
   
   // ✅ Correct - use 'before:now' for past dates
   'birth_date' => ['required', 'date', 'before:now']
   ```

3. **Not using unchanged-value bypass on updates**:
   ```php
   // ❌ Wrong - will fail if date hasn't changed
   'event_date' => [new CheckFutureDateRule()]
   
   // ✅ Correct - skips validation if unchanged
   'event_date' => [
       new CheckFutureDateRule(Event::class, $event->id, 'event_date')
   ]
   ```

4. **Wrong assumeEndOfDay usage**:
   ```php
   // ❌ Wrong - might not match user expectation
   'deadline' => [new CheckFutureDateRule()] // Treated as 00:00:00
   
   // ✅ Correct - deadline is end of day
   'deadline' => [
       new CheckFutureDateRule(null, null, null, true) // 23:59:59
   ]
   ```

### Best Practices

1. **Always combine with 'required'**:
   ```php
   'date' => ['required', new CheckFutureDateRule()]
   ```

2. **Use unchanged-value bypass for updates**:
   ```php
   new CheckFutureDateRule(Model::class, $id, 'field_name')
   ```

3. **Set assumeEndOfDay for deadlines**:
   ```php
   new CheckFutureDateRule(null, null, null, true)
   ```

4. **Ensure SetTimezoneMiddleware is registered**:
   ```php
   // app/Http/Kernel.php
   protected $middlewareGroups = [
       'web' => [
           \JobMetric\Language\Http\Middleware\SetTimezoneMiddleware::class,
       ],
   ];
   ```

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/models/language">Language Model</Link>
- <Link to="/packages/laravel-language/deep-diving/calendar-type-enum">CalendarTypeEnum</Link>

