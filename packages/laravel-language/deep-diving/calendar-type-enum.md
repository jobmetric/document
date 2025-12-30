---
sidebar_position: 11
sidebar_label: CalendarTypeEnum
---

import Link from "@docusaurus/Link";

# CalendarTypeEnum

The `CalendarTypeEnum` is a backed enum that defines all supported calendar systems for languages. It provides type-safe calendar constants and is used throughout the language package for calendar-related operations.

## Namespace

```php
JobMetric\Language\Enums\CalendarTypeEnum
```

## Overview

`CalendarTypeEnum` provides:

- **Type Safety**: Backed enum ensures type-safe calendar values
- **Predefined Constants**: All supported calendar systems as enum cases
- **Validation Support**: Easy integration with Laravel validation
- **IDE Support**: Full autocomplete and type hints
- **Documentation**: Clear calendar options in code

## Available Calendar Types

The enum defines 8 calendar systems:

| Case | Value | Type | Description | Common Usage |
|------|-------|------|-------------|--------------|
| `GREGORIAN` | `'gregorian'` | Solar | Standard Western calendar | Most of the world |
| `JALALI` | `'jalali'` | Solar | Persian/Iranian calendar | Iran, Afghanistan |
| `HIJRI` | `'hijri'` | Lunar | Islamic calendar | Muslim countries |
| `HEBREW` | `'hebrew'` | Lunisolar | Hebrew calendar | Israel, Jewish communities |
| `BUDDHIST` | `'buddhist'` | Solar | Buddhist calendar | Thailand, Cambodia |
| `COPTIC` | `'coptic'` | Solar | Coptic calendar | Egypt (Coptic Church) |
| `ETHIOPIAN` | `'ethiopian'` | Solar | Ethiopian calendar | Ethiopia |
| `CHINESE` | `'chinese'` | Lunisolar | Chinese calendar | China, Taiwan |

## Calendar Details

### Gregorian

```php
CalendarTypeEnum::GREGORIAN
// Value: 'gregorian'
```

**Type**: Solar calendar

**Description**: The standard Western calendar system, also known as the Christian calendar. It's the most widely used calendar system in the world.

**Common Usage**:
- Most Western countries
- International business
- Default calendar for many applications

**Example**:
```php
$language = Language::create([
    'name' => 'English',
    'locale' => 'en',
    'calendar' => CalendarTypeEnum::GREGORIAN->value,
]);
```

### Jalali

```php
CalendarTypeEnum::JALALI
// Value: 'jalali'
```

**Type**: Solar calendar

**Description**: The Persian/Iranian calendar, also known as the Solar Hijri calendar. It's the official calendar of Iran and Afghanistan.

**Common Usage**:
- Iran
- Afghanistan
- Persian-speaking communities

**Characteristics**:
- Solar-based (365/366 days per year)
- Year starts at vernal equinox (around March 21)
- 12 months with varying lengths

**Example**:
```php
$language = Language::create([
    'name' => 'Persian',
    'locale' => 'fa',
    'calendar' => CalendarTypeEnum::JALALI->value,
]);
```

### Hijri

```php
CalendarTypeEnum::HIJRI
// Value: 'hijri'
```

**Type**: Lunar calendar

**Description**: The Islamic calendar, also known as the Lunar Hijri calendar. It's used by Muslims worldwide for religious purposes.

**Common Usage**:
- Muslim countries
- Islamic religious observances
- Saudi Arabia (official calendar)

**Characteristics**:
- Lunar-based (354/355 days per year)
- Year is ~11 days shorter than solar year
- 12 months with 29 or 30 days

**Example**:
```php
$language = Language::create([
    'name' => 'Arabic',
    'locale' => 'ar',
    'calendar' => CalendarTypeEnum::HIJRI->value,
]);
```

### Hebrew

```php
CalendarTypeEnum::HEBREW
// Value: 'hebrew'
```

**Type**: Lunisolar calendar

**Description**: The Hebrew calendar, used by Jewish communities worldwide for religious and cultural purposes.

**Common Usage**:
- Israel
- Jewish communities worldwide
- Religious observances

**Characteristics**:
- Lunisolar (combines lunar months with solar years)
- 12 or 13 months per year (leap years)
- Year starts in autumn (Tishrei)

**Example**:
```php
$language = Language::create([
    'name' => 'Hebrew',
    'locale' => 'he',
    'calendar' => CalendarTypeEnum::HEBREW->value,
]);
```

### Buddhist

```php
CalendarTypeEnum::BUDDHIST
// Value: 'buddhist'
```

**Type**: Solar calendar

**Description**: The Buddhist calendar, used primarily in Thailand and Cambodia. It's based on the Gregorian calendar but with a different epoch.

**Common Usage**:
- Thailand
- Cambodia
- Buddhist communities

**Characteristics**:
- Solar-based
- Year is 543 years ahead of Gregorian calendar
- Same month structure as Gregorian

**Example**:
```php
$language = Language::create([
    'name' => 'Thai',
    'locale' => 'th',
    'calendar' => CalendarTypeEnum::BUDDHIST->value,
]);
```

### Coptic

```php
CalendarTypeEnum::COPTIC
// Value: 'coptic'
```

**Type**: Solar calendar

**Description**: The Coptic calendar, used by the Coptic Orthodox Church in Egypt. It's based on the ancient Egyptian calendar.

**Common Usage**:
- Egypt (Coptic Church)
- Coptic Orthodox communities

**Characteristics**:
- Solar-based
- 13 months (12 months of 30 days + 1 month of 5/6 days)
- Year starts in September

**Example**:
```php
$language = Language::create([
    'name' => 'Coptic',
    'locale' => 'cop',
    'calendar' => CalendarTypeEnum::COPTIC->value,
]);
```

### Ethiopian

```php
CalendarTypeEnum::ETHIOPIAN
// Value: 'ethiopian'
```

**Type**: Solar calendar

**Description**: The Ethiopian calendar, the official calendar of Ethiopia. It's similar to the Coptic calendar.

**Common Usage**:
- Ethiopia
- Eritrea

**Characteristics**:
- Solar-based
- 13 months (12 months of 30 days + 1 month of 5/6 days)
- Year starts in September
- ~7-8 years behind Gregorian calendar

**Example**:
```php
$language = Language::create([
    'name' => 'Amharic',
    'locale' => 'am',
    'calendar' => CalendarTypeEnum::ETHIOPIAN->value,
]);
```

### Chinese

```php
CalendarTypeEnum::CHINESE
// Value: 'chinese'
```

**Type**: Lunisolar calendar

**Description**: The Chinese calendar, a lunisolar calendar used in China and Taiwan for traditional purposes.

**Common Usage**:
- China
- Taiwan
- Chinese communities worldwide

**Characteristics**:
- Lunisolar (combines lunar months with solar years)
- 12 or 13 months per year (leap years)
- Year starts in late January/early February
- Uses 60-year cycle

**Example**:
```php
$language = Language::create([
    'name' => 'Chinese',
    'locale' => 'zh',
    'calendar' => CalendarTypeEnum::CHINESE->value,
]);
```

## Basic Usage

### Getting Enum Values

```php
use JobMetric\Language\Enums\CalendarTypeEnum;

// Get all values as array
$values = CalendarTypeEnum::values();
// Returns: ['gregorian', 'jalali', 'hijri', 'hebrew', 'buddhist', 'coptic', 'ethiopian', 'chinese']

// Get specific enum case
$gregorian = CalendarTypeEnum::GREGORIAN;
$jalali = CalendarTypeEnum::JALALI;

// Get enum value
$value = CalendarTypeEnum::GREGORIAN->value;
// Returns: 'gregorian'
```

### Type-Safe Comparisons

```php
// Compare with enum case
if ($language->calendar === CalendarTypeEnum::JALALI->value) {
    // Handle Jalali calendar
}

// Or using enum directly (if casted)
if ($language->calendar === CalendarTypeEnum::JALALI) {
    // Handle Jalali calendar
}
```

### Validation

```php
use JobMetric\Language\Enums\CalendarTypeEnum;

// In form request
public function rules(): array
{
    return [
        'calendar' => [
            'required',
            'string',
            'in:' . implode(',', CalendarTypeEnum::values()),
        ],
    ];
}

// Or using Rule::in()
use Illuminate\Validation\Rule;

public function rules(): array
{
    return [
        'calendar' => [
            'required',
            Rule::in(CalendarTypeEnum::values()),
        ],
    ];
}
```

## Complete Examples

### Example 1: Language Creation with Calendar

```php
use JobMetric\Language\Enums\CalendarTypeEnum;
use JobMetric\Language\Facades\Language;

// Create Persian language with Jalali calendar
$persian = Language::store([
    'name' => 'Persian',
    'locale' => 'fa',
    'direction' => 'rtl',
    'calendar' => CalendarTypeEnum::JALALI->value,
    'status' => true,
]);

// Create Arabic language with Hijri calendar
$arabic = Language::store([
    'name' => 'Arabic',
    'locale' => 'ar',
    'direction' => 'rtl',
    'calendar' => CalendarTypeEnum::HIJRI->value,
    'status' => true,
]);

// Create English language with Gregorian calendar
$english = Language::store([
    'name' => 'English',
    'locale' => 'en',
    'direction' => 'ltr',
    'calendar' => CalendarTypeEnum::GREGORIAN->value,
    'status' => true,
]);
```

### Example 2: Calendar-Based Conditional Logic

```php
use JobMetric\Language\Enums\CalendarTypeEnum;
use JobMetric\Language\Support\CurrentLanguage;

$language = CurrentLanguage::get();

if ($language && $language->calendar === CalendarTypeEnum::JALALI->value) {
    // Use Jalali date picker
    $datePicker = 'jalali-datepicker';
} elseif ($language && $language->calendar === CalendarTypeEnum::HIJRI->value) {
    // Use Hijri date picker
    $datePicker = 'hijri-datepicker';
} else {
    // Use Gregorian date picker
    $datePicker = 'gregorian-datepicker';
}
```

### Example 3: Calendar Selection in Forms

```php
// app/Http/Controllers/Admin/LanguageController.php
use JobMetric\Language\Enums\CalendarTypeEnum;

public function create()
{
    $calendars = collect(CalendarTypeEnum::cases())
        ->mapWithKeys(function ($case) {
            return [
                $case->value => trans('language::base.calendar_type.' . $case->value),
            ];
        });
    
    return view('admin.languages.create', [
        'calendars' => $calendars,
    ]);
}
```

**Blade Template**:

```blade
<select name="calendar" class="form-control">
    @foreach($calendars as $value => $label)
        <option value="{{ $value }}">{{ $label }}</option>
    @endforeach
</select>
```

### Example 4: Calendar Validation in Request

```php
// app/Http/Requests/StoreLanguageRequest.php
use JobMetric\Language\Enums\CalendarTypeEnum;
use Illuminate\Validation\Rule;

class StoreLanguageRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string',
            'locale' => 'required|string',
            'calendar' => [
                'required',
                'string',
                Rule::in(CalendarTypeEnum::values()),
            ],
            // ... other rules
        ];
    }
    
    public function messages(): array
    {
        return [
            'calendar.in' => 'The selected calendar is invalid. Must be one of: ' . 
                implode(', ', CalendarTypeEnum::values()),
        ];
    }
}
```

### Example 5: Calendar-Based Date Formatting Service

```php
// app/Services/DateFormatterService.php
use JobMetric\Language\Enums\CalendarTypeEnum;
use JobMetric\Language\Support\CurrentLanguage;
use JobMetric\MultiCalendar\Factory\CalendarConverterFactory;

class DateFormatterService
{
    public function formatDate($date, $format = 'Y-m-d'): string
    {
        $language = CurrentLanguage::get();
        
        if (!$language || !$language->calendar) {
            return Carbon::parse($date)->format($format);
        }
        
        $calendar = $language->calendar;
        
        // Handle different calendars
        switch ($calendar) {
            case CalendarTypeEnum::JALALI->value:
                return $this->formatJalali($date, $format);
                
            case CalendarTypeEnum::HIJRI->value:
                return $this->formatHijri($date, $format);
                
            case CalendarTypeEnum::HEBREW->value:
                return $this->formatHebrew($date, $format);
                
            default:
                return Carbon::parse($date)->format($format);
        }
    }
    
    protected function formatJalali($date, $format): string
    {
        $carbon = Carbon::parse($date);
        $converter = CalendarConverterFactory::make('jalali');
        $jalali = $converter->fromGregorian(
            $carbon->year,
            $carbon->month,
            $carbon->day
        );
        
        return sprintf('%04d-%02d-%02d', $jalali[0], $jalali[1], $jalali[2]);
    }
    
    // ... other format methods
}
```

### Example 6: Calendar Filtering

```php
// app/Http/Controllers/Admin/LanguageController.php
use JobMetric\Language\Enums\CalendarTypeEnum;

public function index(Request $request)
{
    $query = Language::query();
    
    // Filter by calendar type
    if ($request->has('calendar')) {
        $calendar = $request->input('calendar');
        
        // Validate calendar
        if (in_array($calendar, CalendarTypeEnum::values())) {
            $query->where('calendar', $calendar);
        }
    }
    
    // Filter by calendar type (solar calendars)
    if ($request->has('solar_only')) {
        $solarCalendars = [
            CalendarTypeEnum::GREGORIAN->value,
            CalendarTypeEnum::JALALI->value,
            CalendarTypeEnum::BUDDHIST->value,
            CalendarTypeEnum::COPTIC->value,
            CalendarTypeEnum::ETHIOPIAN->value,
        ];
        
        $query->whereIn('calendar', $solarCalendars);
    }
    
    $languages = $query->get();
    
    return view('admin.languages.index', compact('languages'));
}
```

### Example 7: Calendar Statistics

```php
// app/Http/Controllers/Admin/DashboardController.php
use JobMetric\Language\Enums\CalendarTypeEnum;

public function calendarStats()
{
    $stats = [];
    
    foreach (CalendarTypeEnum::cases() as $case) {
        $stats[$case->value] = Language::where('calendar', $case->value)
            ->where('status', true)
            ->count();
    }
    
    return response()->json([
        'calendars' => $stats,
        'total' => array_sum($stats),
    ]);
}
```

### Example 8: Calendar Migration Helper

```php
// app/Console/Commands/MigrateCalendarData.php
use JobMetric\Language\Enums\CalendarTypeEnum;

class MigrateCalendarData extends Command
{
    public function handle()
    {
        $languages = Language::whereNull('calendar')->get();
        
        foreach ($languages as $language) {
            // Auto-detect calendar based on locale
            $calendar = $this->detectCalendar($language->locale);
            
            $language->update([
                'calendar' => $calendar->value,
            ]);
        }
    }
    
    protected function detectCalendar(string $locale): CalendarTypeEnum
    {
        return match($locale) {
            'fa' => CalendarTypeEnum::JALALI,
            'ar', 'ur' => CalendarTypeEnum::HIJRI,
            'he' => CalendarTypeEnum::HEBREW,
            'th' => CalendarTypeEnum::BUDDHIST,
            'zh', 'zh-CN', 'zh-TW' => CalendarTypeEnum::CHINESE,
            default => CalendarTypeEnum::GREGORIAN,
        };
    }
}
```

## Enum Methods

### values()

Get all enum values as an array:

```php
$values = CalendarTypeEnum::values();
// Returns: ['gregorian', 'jalali', 'hijri', 'hebrew', 'buddhist', 'coptic', 'ethiopian', 'chinese']
```

**Use Case**: Validation rules, dropdown options, filtering.

### cases()

Get all enum cases:

```php
$cases = CalendarTypeEnum::cases();
// Returns: [CalendarTypeEnum::GREGORIAN, CalendarTypeEnum::JALALI, ...]
```

**Use Case**: Iterating over all calendars, generating options.

### from() / tryFrom()

Convert string value to enum case:

```php
// Returns enum case or throws ValueError
$enum = CalendarTypeEnum::from('jalali');
// Returns: CalendarTypeEnum::JALALI

// Returns enum case or null
$enum = CalendarTypeEnum::tryFrom('jalali');
// Returns: CalendarTypeEnum::JALALI

$enum = CalendarTypeEnum::tryFrom('invalid');
// Returns: null
```

## When to Use CalendarTypeEnum

### Primary Use Cases

#### 1. Language Configuration

**When**: Creating or updating language records.

**Why**: Ensures only valid calendar types are used.

**Example**:

```php
$language = Language::create([
    'calendar' => CalendarTypeEnum::JALALI->value,
]);
```

#### 2. Validation

**When**: Validating calendar input in forms or APIs.

**Why**: Type-safe validation with clear error messages.

**Example**:

```php
'calendar' => Rule::in(CalendarTypeEnum::values()),
```

#### 3. Conditional Logic

**When**: Implementing calendar-specific behavior.

**Why**: Type-safe comparisons and clear code.

**Example**:

```php
if ($language->calendar === CalendarTypeEnum::JALALI->value) {
    // Jalali-specific logic
}
```

#### 4. UI Components

**When**: Building calendar selection interfaces.

**Why**: Provides all available options programmatically.

**Example**:

```php
$calendars = CalendarTypeEnum::cases();
```

#### 5. Data Filtering

**When**: Filtering languages by calendar type.

**Why**: Ensures valid calendar values in queries.

**Example**:

```php
$solarLanguages = Language::whereIn('calendar', [
    CalendarTypeEnum::GREGORIAN->value,
    CalendarTypeEnum::JALALI->value,
])->get();
```

### When NOT to Use

- **String Literals**: Don't use string literals like `'jalali'` - use enum instead
- **Hardcoded Values**: Don't hardcode calendar values in code
- **Database Queries**: For direct database queries, you can use string values (but enum is preferred)

## Best Practices

### 1. Always Use Enum for Type Safety

```php
// ✅ Good - Type-safe
$calendar = CalendarTypeEnum::JALALI->value;

// ❌ Bad - String literal
$calendar = 'jalali';
```

### 2. Use in Validation Rules

```php
// ✅ Good - Enum-based validation
'calendar' => Rule::in(CalendarTypeEnum::values()),

// ❌ Bad - Hardcoded values
'calendar' => 'in:gregorian,jalali,hijri,...',
```

### 3. Use for Comparisons

```php
// ✅ Good - Enum comparison
if ($language->calendar === CalendarTypeEnum::JALALI->value) {
    // ...
}

// ❌ Bad - String comparison
if ($language->calendar === 'jalali') {
    // ...
}
```

### 4. Use for Iteration

```php
// ✅ Good - Iterate over enum cases
foreach (CalendarTypeEnum::cases() as $case) {
    echo $case->value;
}

// ❌ Bad - Hardcoded array
$calendars = ['gregorian', 'jalali', 'hijri', ...];
```

## Common Mistakes to Avoid

1. **Using string literals instead of enum**:
   ```php
   // ❌ Wrong
   $calendar = 'jalali';
   
   // ✅ Correct
   $calendar = CalendarTypeEnum::JALALI->value;
   ```

2. **Hardcoding calendar values**:
   ```php
   // ❌ Wrong
   'calendar' => 'in:gregorian,jalali,hijri',
   
   // ✅ Correct
   'calendar' => Rule::in(CalendarTypeEnum::values()),
   ```

3. **Not validating calendar input**:
   ```php
   // ❌ Wrong
   $language->calendar = $request->input('calendar'); // No validation
   
   // ✅ Correct
   $request->validate([
       'calendar' => Rule::in(CalendarTypeEnum::values()),
   ]);
   ```

4. **Case-sensitive comparisons**:
   ```php
   // ❌ Wrong - May fail
   if ($language->calendar === 'JALALI') { } // Wrong case
   
   // ✅ Correct
   if ($language->calendar === CalendarTypeEnum::JALALI->value) { }
   ```

## Calendar Type Categories

### Solar Calendars

Calendars based on solar year (365/366 days):

- `GREGORIAN`
- `JALALI`
- `BUDDHIST`
- `COPTIC`
- `ETHIOPIAN`

### Lunar Calendars

Calendars based on lunar months:

- `HIJRI`

### Lunisolar Calendars

Calendars that combine lunar months with solar years:

- `HEBREW`
- `CHINESE`

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/models/language">Language Model</Link>
- <Link to="/packages/laravel-language/deep-diving/date-based-on-calendar-cast">DateBasedOnCalendarCast</Link>
- <Link to="/packages/laravel-language/deep-diving/language-service">Language Service</Link>
- <Link to="/packages/laravel-language/deep-diving/support/current-language">CurrentLanguage</Link>

