---
sidebar_position: 9
sidebar_label: LanguageResource
---

import Link from "@docusaurus/Link";

# LanguageResource

The `LanguageResource` transforms `Language` model instances into structured JSON responses for API endpoints. It provides normalized language data with translated labels for calendar types, directions, and weekdays.

## Namespace

```php
JobMetric\Language\Http\Resources\LanguageResource
```

## Overview

The `LanguageResource` is a JSON resource that formats language data for API responses. It automatically:

- **Transforms language fields** into a consistent JSON structure
- **Provides translated labels** for calendar types, directions, and weekdays
- **Includes helper fields** like `is_rtl` for easier frontend logic
- **Formats timestamps** in a consistent format
- **Handles missing translations** with graceful fallbacks

## Resource Structure

The resource transforms the model into the following JSON structure:

```json
{
    "id": 1,
    "name": "Persian",
    "flag": "ir",
    "locale": "fa",
    "direction": "rtl",
    "direction_trans": "Right to Left",
    "is_rtl": true,
    "calendar": "jalali",
    "calendar_trans": "Jalali",
    "first_day_of_week": 6,
    "first_day_of_week_trans": "Saturday",
    "status": true,
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-01-15 10:30:00"
}
```

## Field Details

### Basic Identity Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Language ID |
| `name` | `string` | Language display name |
| `flag` | `string\|null` | Country flag code (ISO 3166-1 alpha-2) |
| `locale` | `string` | IETF/BCP47-like locale code (e.g., 'fa', 'fa-IR', 'en', 'en-GB') |

### Direction Fields

| Field | Type | Description |
|-------|------|-------------|
| `direction` | `string` | Text direction: 'ltr' or 'rtl' |
| `direction_trans` | `string` | Translated direction label |
| `is_rtl` | `bool` | Boolean helper for RTL check |

**Translation Key**: `language::base.direction.{ltr|rtl}`

**Fallback**: If translation is missing, returns uppercase direction (e.g., 'LTR', 'RTL')

### Calendar Fields

| Field | Type | Description |
|-------|------|-------------|
| `calendar` | `string` | Calendar system key (e.g., 'gregorian', 'jalali', 'hijri') |
| `calendar_trans` | `string` | Translated calendar type label |

**Translation Key**: `language::base.calendar_type.{key}`

**Fallback**: If translation is missing, returns capitalized calendar key (e.g., 'Jalali', 'Gregorian')

**Supported Calendar Types**:
- `gregorian`
- `jalali`
- `hijri`
- `hebrew`
- `buddhist`
- `coptic`
- `ethiopian`
- `chinese`

### Weekday Fields

| Field | Type | Description |
|-------|------|-------------|
| `first_day_of_week` | `int` | First day of week (0-6) |
| `first_day_of_week_trans` | `string` | Translated weekday name |

**Translation Key**: `language::base.weekdays.{0..6}`

**Weekday Mapping**:
- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

**Fallback**: If translation is missing, returns English weekday name

### Status and Timestamps

| Field | Type | Description |
|-------|------|-------------|
| `status` | `bool` | Active/inactive status |
| `created_at` | `string\|null` | Creation timestamp (Y-m-d H:i:s format) |
| `updated_at` | `string\|null` | Update timestamp (Y-m-d H:i:s format) |

## Basic Usage

### Single Resource

```php
use JobMetric\Language\Http\Resources\LanguageResource;
use JobMetric\Language\Models\Language;

$language = Language::find(1);
return new LanguageResource($language);

// Or using make()
return LanguageResource::make($language);
```

### Resource Collection

```php
$languages = Language::all();
return LanguageResource::collection($languages);
```

### With Pagination

```php
$languages = Language::paginate(15);
return LanguageResource::collection($languages);
```

## Complete Examples

### Example 1: API Endpoint

```php
// app/Http/Controllers/Api/LanguageController.php
use JobMetric\Language\Http\Resources\LanguageResource;
use JobMetric\Language\Facades\Language;

class LanguageController extends Controller
{
    public function index()
    {
        $languages = Language::all(['status' => true]);
        return LanguageResource::collection($languages);
    }

    public function show($id)
    {
        $language = Language::findOrFail($id);
        return new LanguageResource($language);
    }
}
```

**Response**:

```json
{
    "data": [
        {
            "id": 1,
            "name": "Persian",
            "flag": "ir",
            "locale": "fa",
            "direction": "rtl",
            "direction_trans": "Right to Left",
            "is_rtl": true,
            "calendar": "jalali",
            "calendar_trans": "Jalali",
            "first_day_of_week": 6,
            "first_day_of_week_trans": "Saturday",
            "status": true,
            "created_at": "2024-01-15 10:30:00",
            "updated_at": "2024-01-15 10:30:00"
        }
    ]
}
```

### Example 2: Language Switcher Component

```php
// app/Http/Controllers/LanguageController.php
public function list()
{
    $languages = Language::where('status', true)
        ->orderBy('name')
        ->get();
    
    return LanguageResource::collection($languages);
}
```

**Frontend Usage**:

```javascript
// React/Vue component
fetch('/api/languages')
    .then(res => res.json())
    .then(data => {
        data.data.forEach(lang => {
            if (lang.is_rtl) {
                // Apply RTL styles
            }
            // Display: lang.name, lang.flag, lang.direction_trans
        });
    });
```

### Example 3: Current Language API

```php
// app/Http/Controllers/Api/CurrentLanguageController.php
use JobMetric\Language\Support\CurrentLanguage;
use JobMetric\Language\Http\Resources\LanguageResource;

public function current()
{
    $language = CurrentLanguage::get();
    
    if (!$language) {
        return response()->json(['message' => 'No language set'], 404);
    }
    
    return new LanguageResource($language);
}
```

### Example 4: Language Settings Response

```php
// app/Http/Controllers/SettingsController.php
public function languageSettings()
{
    $language = CurrentLanguage::get();
    
    return response()->json([
        'current_language' => new LanguageResource($language),
        'available_languages' => LanguageResource::collection(
            Language::where('status', true)->get()
        ),
    ]);
}
```

### Example 5: Admin Panel API

```php
// app/Http/Controllers/Admin/LanguageController.php
public function index(Request $request)
{
    $query = Language::query();
    
    // Apply filters
    if ($request->has('status')) {
        $query->where('status', $request->input('status'));
    }
    
    if ($request->has('direction')) {
        $query->where('direction', $request->input('direction'));
    }
    
    $languages = $query->paginate(20);
    
    return LanguageResource::collection($languages);
}
```

## Translation Handling

The resource automatically handles translations with graceful fallbacks:

### Calendar Translation

```php
// Translation file: resources/lang/en/language/base.php
'calendar_type' => [
    'jalali' => 'Jalali',
    'gregorian' => 'Gregorian',
    'hijri' => 'Hijri',
    // ...
],

// If translation exists
"calendar_trans": "Jalali"

// If translation missing
"calendar_trans": "jalali" // Capitalized key
```

### Direction Translation

```php
// Translation file: resources/lang/en/language/base.php
'direction' => [
    'ltr' => 'Left to Right',
    'rtl' => 'Right to Left',
],

// If translation exists
"direction_trans": "Right to Left"

// If translation missing
"direction_trans": "RTL" // Uppercase key
```

### Weekday Translation

```php
// Translation file: resources/lang/en/language/base.php
'weekdays' => [
    '0' => 'Sunday',
    '1' => 'Monday',
    '2' => 'Tuesday',
    // ...
],

// If translation exists
"first_day_of_week_trans": "Saturday"

// If translation missing
"first_day_of_week_trans": "Saturday" // English fallback
```

## Helper Fields

### is_rtl Field

The `is_rtl` boolean field provides a convenient way to check text direction:

```javascript
// Frontend usage
if (language.is_rtl) {
    document.body.setAttribute('dir', 'rtl');
    document.body.setAttribute('lang', language.locale);
} else {
    document.body.setAttribute('dir', 'ltr');
    document.body.setAttribute('lang', language.locale);
}
```

### Translated Fields

All translated fields (`direction_trans`, `calendar_trans`, `first_day_of_week_trans`) provide human-readable labels:

```javascript
// Display in UI
<div>
    <span>Direction: {language.direction_trans}</span>
    <span>Calendar: {language.calendar_trans}</span>
    <span>First Day: {language.first_day_of_week_trans}</span>
</div>
```

## When to Use LanguageResource

### Primary Use Cases

#### 1. API Endpoints

**When**: Building REST APIs that return language data.

**Why**: Provides consistent, structured JSON responses.

**Example**:

```php
Route::get('/api/languages', function () {
    return LanguageResource::collection(Language::all());
});
```

#### 2. Language Switcher

**When**: Building language switcher components.

**Why**: Provides all necessary data (name, flag, locale, direction) in one response.

**Example**:

```php
public function available()
{
    return LanguageResource::collection(
        Language::where('status', true)->get()
    );
}
```

#### 3. Settings/Configuration APIs

**When**: Returning language settings to frontend applications.

**Why**: Includes translated labels and helper fields for easy frontend integration.

**Example**:

```php
public function settings()
{
    return [
        'current' => new LanguageResource(CurrentLanguage::get()),
        'available' => LanguageResource::collection(Language::all()),
    ];
}
```

#### 4. Admin Panels

**When**: Displaying language lists in admin interfaces.

**Why**: Provides formatted data with translated labels for better UX.

**Example**:

```php
public function index()
{
    $languages = Language::paginate(20);
    return LanguageResource::collection($languages);
}
```

#### 5. Multi-Language Applications

**When**: Building applications that support multiple languages.

**Why**: Provides language metadata needed for proper rendering (direction, calendar, etc.).

**Example**:

```php
public function bootstrap()
{
    return [
        'language' => new LanguageResource(CurrentLanguage::get()),
        'locale' => app()->getLocale(),
        'timezone' => config('app.client_timezone'),
    ];
}
```

### When NOT to Use

- **Database Queries**: Don't use for database operations
- **Internal Logic**: Don't use for internal language processing
- **Form Data**: Don't use for form inputs (use models directly)
- **Bulk Operations**: For bulk operations, use models directly

## Best Practices

### 1. Always Use for API Responses

```php
// ✅ Good - Consistent API format
return new LanguageResource($language);

// ❌ Bad - Inconsistent format
return response()->json($language->toArray());
```

### 2. Use Collections for Multiple Languages

```php
// ✅ Good - Proper collection handling
return LanguageResource::collection($languages);

// ❌ Bad - Manual array mapping
return $languages->map(fn($lang) => $lang->toArray());
```

### 3. Combine with Pagination

```php
// ✅ Good - Paginated response
$languages = Language::paginate(15);
return LanguageResource::collection($languages);

// ❌ Bad - Loading all records
return LanguageResource::collection(Language::all());
```

### 4. Use Helper Fields

```php
// ✅ Good - Use is_rtl helper
if ($resource->is_rtl) {
    // Apply RTL styles
}

// ❌ Bad - Manual check
if ($resource->direction === 'rtl') {
    // Apply RTL styles
}
```

## Common Mistakes to Avoid

1. **Not using resource for APIs**:
   ```php
   // ❌ Wrong
   return response()->json($language);
   
   // ✅ Correct
   return new LanguageResource($language);
   ```

2. **Manual field mapping**:
   ```php
   // ❌ Wrong
   return [
       'id' => $language->id,
       'name' => $language->name,
       // ... manual mapping
   ];
   
   // ✅ Correct
   return new LanguageResource($language);
   ```

3. **Not using translated fields**:
   ```php
   // ❌ Wrong - Raw calendar value
   echo $language->calendar; // "jalali"
   
   // ✅ Correct - Translated label
   echo $resource->calendar_trans; // "Jalali"
   ```

4. **Ignoring helper fields**:
   ```php
   // ❌ Wrong - Manual direction check
   if ($language->direction === 'rtl') { }
   
   // ✅ Correct - Use helper
   if ($resource->is_rtl) { }
   ```

## Response Examples

### Single Language Response

```json
{
    "id": 1,
    "name": "Persian",
    "flag": "ir",
    "locale": "fa",
    "direction": "rtl",
    "direction_trans": "Right to Left",
    "is_rtl": true,
    "calendar": "jalali",
    "calendar_trans": "Jalali",
    "first_day_of_week": 6,
    "first_day_of_week_trans": "Saturday",
    "status": true,
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-01-15 10:30:00"
}
```

### Collection Response

```json
{
    "data": [
        {
            "id": 1,
            "name": "Persian",
            "flag": "ir",
            "locale": "fa",
            "direction": "rtl",
            "direction_trans": "Right to Left",
            "is_rtl": true,
            "calendar": "jalali",
            "calendar_trans": "Jalali",
            "first_day_of_week": 6,
            "first_day_of_week_trans": "Saturday",
            "status": true,
            "created_at": "2024-01-15 10:30:00",
            "updated_at": "2024-01-15 10:30:00"
        },
        {
            "id": 2,
            "name": "English",
            "flag": "us",
            "locale": "en",
            "direction": "ltr",
            "direction_trans": "Left to Right",
            "is_rtl": false,
            "calendar": "gregorian",
            "calendar_trans": "Gregorian",
            "first_day_of_week": 0,
            "first_day_of_week_trans": "Sunday",
            "status": true,
            "created_at": "2024-01-15 10:30:00",
            "updated_at": "2024-01-15 10:30:00"
        }
    ]
}
```

### Paginated Response

```json
{
    "data": [
        {
            "id": 1,
            "name": "Persian",
            // ... language fields
        }
    ],
    "current_page": 1,
    "per_page": 15,
    "total": 10,
    "last_page": 1
}
```

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/models/language">Language Model</Link>
- <Link to="/packages/laravel-language/deep-diving/language-service">Language Service</Link>
- <Link to="/packages/laravel-language/deep-diving/support/current-language">CurrentLanguage</Link>
- <Link to="/packages/laravel-language/deep-diving/calendar-type-enum">CalendarTypeEnum</Link>

