---
sidebar_position: 1
sidebar_label: CurrentLanguage
---

import Link from "@docusaurus/Link";

# CurrentLanguage

The `CurrentLanguage` class is a static utility that resolves the current `Language` model based on the active application locale. It provides configurable caching to optimize performance and reduce database queries.

## Namespace

```php
JobMetric\Language\Support\CurrentLanguage
```

## Overview

`CurrentLanguage` provides:

- **Automatic Locale Detection**: Uses `app()->getLocale()` to determine current locale
- **Configurable Caching**: Flexible caching strategy via configuration
- **Performance Optimization**: Reduces database queries through intelligent caching
- **Null Safety**: Returns `null` if language not found (graceful handling)

## Available Methods

### Get

Get the Language model for the current app locale:

```php
public static function get(): ?Language
```

**Returns:** `Language|null` - Language model or null if not found

**Behavior:**
- Reads current locale from `app()->getLocale()`
- Applies caching based on `config('language.cache_time')`
- Returns `null` if language doesn't exist for current locale

## Basic Usage

### Simple Usage

```php
use JobMetric\Language\Support\CurrentLanguage;

$language = CurrentLanguage::get();

if ($language) {
    echo $language->name; // "Persian"
    echo $language->direction; // "rtl"
    echo $language->calendar; // "jalali"
}
```

### With Null Check

```php
$language = CurrentLanguage::get();

if (!$language) {
    // Fallback to default language
    $language = Language::where('locale', config('app.locale'))->first();
}

return $language;
```

## Caching Configuration

Caching behavior is controlled by `config('language.cache_time')`:

### No Caching (0)

```php
// config/language.php
'cache_time' => 0,

// Behavior: Query database every time
$language = CurrentLanguage::get(); // Always queries DB
```

**Use Case**: Development, debugging, or when language data changes frequently.

### Cache Forever (null)

```php
// config/language.php
'cache_time' => null,

// Behavior: Cache forever until manually cleared
$language = CurrentLanguage::get(); // Cached forever
```

**Use Case**: Production environments where language data rarely changes.

### Cache for N Minutes

```php
// config/language.php
'cache_time' => 60, // Cache for 60 minutes

// Behavior: Cache for specified minutes
$language = CurrentLanguage::get(); // Cached for 60 minutes
```

**Use Case**: Balance between performance and data freshness.

## Complete Examples

### Example 1: Language Settings in Controller

```php
// app/Http/Controllers/SettingsController.php
use JobMetric\Language\Support\CurrentLanguage;

class SettingsController extends Controller
{
    public function index()
    {
        $language = CurrentLanguage::get();
        
        return view('settings.index', [
            'language' => $language,
            'direction' => $language?->direction ?? 'ltr',
            'calendar' => $language?->calendar ?? 'gregorian',
        ]);
    }
}
```

### Example 2: API Response with Current Language

```php
// app/Http/Controllers/Api/LanguageController.php
use JobMetric\Language\Support\CurrentLanguage;
use JobMetric\Language\Http\Resources\LanguageResource;

class LanguageController extends Controller
{
    public function current()
    {
        $language = CurrentLanguage::get();
        
        if (!$language) {
            return response()->json([
                'message' => 'No language set for current locale'
            ], 404);
        }
        
        return new LanguageResource($language);
    }
}
```

### Example 3: Calendar-Aware Date Formatting

```php
// app/Services/DateFormatterService.php
use JobMetric\Language\Support\CurrentLanguage;
use JobMetric\MultiCalendar\Factory\CalendarConverterFactory;

class DateFormatterService
{
    public function formatDate($date, $format = 'Y-m-d')
    {
        $language = CurrentLanguage::get();
        
        if (!$language) {
            return Carbon::parse($date)->format($format);
        }
        
        // Use language's calendar for formatting
        $calendar = $language->calendar;
        $converter = CalendarConverterFactory::make($calendar);
        
        // Convert and format based on calendar
        // ... calendar-specific formatting logic
        
        return $formattedDate;
    }
}
```

### Example 4: RTL/LTR Detection

```php
// app/Http/Middleware/ApplyLanguageDirection.php
use JobMetric\Language\Support\CurrentLanguage;

class ApplyLanguageDirection
{
    public function handle($request, Closure $next)
    {
        $language = CurrentLanguage::get();
        
        if ($language && $language->direction === 'rtl') {
            view()->share('direction', 'rtl');
            view()->share('is_rtl', true);
        } else {
            view()->share('direction', 'ltr');
            view()->share('is_rtl', false);
        }
        
        return $next($request);
    }
}
```

### Example 5: Language-Specific Configuration

```php
// app/Services/LocalizationService.php
use JobMetric\Language\Support\CurrentLanguage;

class LocalizationService
{
    public function getFirstDayOfWeek(): int
    {
        $language = CurrentLanguage::get();
        
        return $language?->first_day_of_week ?? 0; // Default: Sunday
    }
    
    public function getCalendarType(): string
    {
        $language = CurrentLanguage::get();
        
        return $language?->calendar ?? 'gregorian';
    }
    
    public function getTimezone(): ?string
    {
        $language = CurrentLanguage::get();
        
        return $language?->timezone;
    }
}
```

### Example 6: Blade Component

```php
// resources/views/components/language-info.blade.php
@php
    $language = \JobMetric\Language\Support\CurrentLanguage::get();
@endphp

@if($language)
    <div class="language-info" dir="{{ $language->direction }}">
        <span class="flag">{{ $language->flag }}</span>
        <span class="name">{{ $language->name }}</span>
        <span class="calendar">{{ trans('language::base.calendar_type.' . $language->calendar) }}</span>
    </div>
@endif
```

### Example 7: Cache Invalidation

```php
// app/Http/Controllers/Admin/LanguageController.php
use JobMetric\Language\Support\CurrentLanguage;
use Illuminate\Support\Facades\Cache;

class LanguageController extends Controller
{
    public function update(Request $request, Language $language)
    {
        $language->update($request->validated());
        
        // Invalidate cache for this language
        Cache::forget('language.current.' . $language->locale);
        
        // If this is the current language, refresh
        if (app()->getLocale() === $language->locale) {
            CurrentLanguage::get(); // Will refresh cache
        }
        
        return redirect()->back();
    }
}
```

### Example 8: Conditional Logic Based on Language

```php
// app/Services/NotificationService.php
use JobMetric\Language\Support\CurrentLanguage;

class NotificationService
{
    public function sendWelcomeEmail(User $user)
    {
        $language = CurrentLanguage::get();
        
        $template = match($language?->locale) {
            'fa' => 'emails.welcome.persian',
            'ar' => 'emails.welcome.arabic',
            default => 'emails.welcome.english',
        };
        
        Mail::to($user)->send(new WelcomeMail($template));
    }
}
```

## Caching Strategy

### Cache Key Format

The cache key follows this pattern:

```php
'language.current.' . $locale
```

**Example**: `language.current.fa`

### Cache Store

Uses Laravel's default cache store (configured in `config/cache.php`).

### Cache Invalidation

To invalidate cache manually:

```php
use Illuminate\Support\Facades\Cache;

// Invalidate specific locale
Cache::forget('language.current.fa');

// Invalidate all language caches
Cache::flush(); // Use with caution!
```

## Performance Considerations

### Without Caching

```php
// config/language.php
'cache_time' => 0,

// Every call queries database
CurrentLanguage::get(); // DB Query
CurrentLanguage::get(); // DB Query (again)
CurrentLanguage::get(); // DB Query (again)
```

**Impact**: High database load, slower response times.

### With Caching

```php
// config/language.php
'cache_time' => 60,

// First call queries database
CurrentLanguage::get(); // DB Query + Cache

// Subsequent calls use cache
CurrentLanguage::get(); // Cache Hit
CurrentLanguage::get(); // Cache Hit
```

**Impact**: Reduced database load, faster response times.

## When to Use CurrentLanguage

### Primary Use Cases

#### 1. Getting Current Language Settings

**When**: You need language-specific settings (direction, calendar, timezone).

**Why**: Provides easy access to current language model.

**Example**:

```php
$language = CurrentLanguage::get();
$direction = $language->direction;
$calendar = $language->calendar;
```

#### 2. API Responses

**When**: Building APIs that return current language information.

**Why**: Consistent way to get current language.

**Example**:

```php
return new LanguageResource(CurrentLanguage::get());
```

#### 3. View Data

**When**: Passing language data to views.

**Why**: Ensures views have access to current language settings.

**Example**:

```php
view()->share('language', CurrentLanguage::get());
```

#### 4. Conditional Logic

**When**: Implementing language-specific behavior.

**Why**: Easy way to check current language properties.

**Example**:

```php
$language = CurrentLanguage::get();
if ($language && $language->direction === 'rtl') {
    // Apply RTL styles
}
```

#### 5. Calendar Operations

**When**: Working with calendar-specific date operations.

**Why**: Provides calendar type for date conversions.

**Example**:

```php
$language = CurrentLanguage::get();
$calendar = $language?->calendar ?? 'gregorian';
```

### When NOT to Use

- **Specific Language Lookup**: Use `Language::where('locale', $locale)->first()` for specific locales
- **All Languages**: Use `Language::all()` for all languages
- **Language Management**: Use `Language` facade/service for CRUD operations

## Best Practices

### 1. Always Check for Null

```php
// ✅ Good - Null check
$language = CurrentLanguage::get();
if ($language) {
    // Use language
}

// ❌ Bad - No null check
$language = CurrentLanguage::get();
$direction = $language->direction; // May throw error
```

### 2. Use Appropriate Cache Time

```php
// ✅ Good - Production cache
'cache_time' => 60, // Cache for 1 hour

// ❌ Bad - No cache in production
'cache_time' => 0, // Queries every time
```

### 3. Invalidate Cache on Updates

```php
// ✅ Good - Invalidate cache
$language->update($data);
Cache::forget('language.current.' . $language->locale);

// ❌ Bad - Stale cache
$language->update($data);
// Cache not invalidated
```

### 4. Use for Current Locale Only

```php
// ✅ Good - Current locale
$language = CurrentLanguage::get();

// ❌ Bad - Specific locale
$language = CurrentLanguage::get(); // Only works for current locale
// Use Language::where('locale', 'en')->first() instead
```

## Common Mistakes to Avoid

1. **Not checking for null**:
   ```php
   // ❌ Wrong
   $language = CurrentLanguage::get();
   echo $language->name; // Error if null
   
   // ✅ Correct
   $language = CurrentLanguage::get();
   if ($language) {
       echo $language->name;
   }
   ```

2. **Using for non-current locales**:
   ```php
   // ❌ Wrong - Only works for current locale
   app()->setLocale('en');
   $language = CurrentLanguage::get(); // Gets English
   app()->setLocale('fa');
   $language = CurrentLanguage::get(); // Gets Persian
   
   // ✅ Correct - Use direct query for specific locale
   $language = Language::where('locale', 'en')->first();
   ```

3. **Not configuring cache**:
   ```php
   // ❌ Wrong - No cache configuration
   // May cause performance issues
   
   // ✅ Correct - Configure cache
   'cache_time' => 60,
   ```

4. **Not invalidating cache**:
   ```php
   // ❌ Wrong - Cache not invalidated
   $language->update(['name' => 'New Name']);
   
   // ✅ Correct - Invalidate cache
   $language->update(['name' => 'New Name']);
   Cache::forget('language.current.' . $language->locale);
   ```

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/models/language">Language Model</Link>
- <Link to="/packages/laravel-language/deep-diving/support/helpers">Helper Functions</Link>
- <Link to="/packages/laravel-language/deep-diving/middleware/set-language-middleware">SetLanguageMiddleware</Link>
- <Link to="/packages/laravel-language/deep-diving/language-service">Language Service</Link>

