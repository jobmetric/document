---
sidebar_position: 1
sidebar_label: StoreLanguageRequest
---

import Link from "@docusaurus/Link";

# StoreLanguageRequest

The `StoreLanguageRequest` is a FormRequest class that validates and normalizes data when creating new language records. It ensures all language data is properly formatted and validated before storage.

## Namespace

```php
JobMetric\Language\Http\Requests\StoreLanguageRequest
```

## Overview

`StoreLanguageRequest` provides:

- **Automatic Validation**: Validates all language fields according to business rules
- **Data Normalization**: Automatically normalizes input data (empty strings to null, default values)
- **Custom Attributes**: Provides translated field names for error messages
- **Authorization**: Controls who can create languages
- **Static Methods**: Can be used outside Laravel's request pipeline

## Available Methods

### Rules

Get validation rules for language creation:

```php
public function rules(): array
```

**Returns:** `array` - Validation rules array

**Example**:

```php
$request = new StoreLanguageRequest();
$rules = $request->rules();
```

### Normalize (Static)

Normalize raw input data outside Laravel's FormRequest pipeline:

```php
public static function normalize(array $data): array
```

**Parameters:**
- `$data` (`array`): Raw input data

**Returns:** `array` - Normalized data

**What it does:**
- Sets `first_day_of_week` to `0` if not provided
- Converts empty `flag` string to `null`

**Example**:

```php
$rawData = [
    'name' => 'Persian',
    'locale' => 'fa',
    'flag' => '', // Empty string
];

$normalized = StoreLanguageRequest::normalize($rawData);
// Result: ['name' => 'Persian', 'locale' => 'fa', 'flag' => null, 'first_day_of_week' => 0]
```

### Prepare For Validation

Automatically called by Laravel to normalize data before validation:

```php
protected function prepareForValidation(): void
```

**Note:** This method automatically calls `normalize()` to prepare data.

### Attributes

Get custom attribute names for validation error messages:

```php
public function attributes(): array
```

**Returns:** `array` - Attribute names mapped to translated labels

**Example**:

```php
$request = new StoreLanguageRequest();
$attributes = $request->attributes();
// Returns: ['name' => 'Name', 'locale' => 'Locale', ...]
```

### Authorize

Determine if the user is authorized to create languages:

```php
public function authorize(): bool
```

**Returns:** `bool` - `true` by default (allows all users)

**Note:** Override this method to add authorization logic.

## Validation Rules

### Complete Rules Array

```php
[
    'name' => 'string',
    'flag' => 'string|nullable',
    'locale' => ['string', new CheckLocaleRule],
    'direction' => 'string|in:ltr,rtl',
    'calendar' => 'string|in:gregorian,jalali,hijri,hebrew,buddhist,coptic,ethiopian,chinese',
    'first_day_of_week' => 'sometimes|integer|between:0,6',
    'status' => 'boolean',
]
```

### Field Details

| Field | Type | Rules | Description |
|-------|------|-------|-------------|
| `name` | `string` | `string` | Language display name |
| `flag` | `string\|null` | `string\|nullable` | Country flag code (ISO 3166-1 alpha-2) |
| `locale` | `string` | `string`, `CheckLocaleRule` | Two-letter locale code (e.g., 'fa', 'en') |
| `direction` | `string` | `string`, `in:ltr,rtl` | Text direction (left-to-right or right-to-left) |
| `calendar` | `string` | `string`, `in:...` | Calendar system type |
| `first_day_of_week` | `int` | `sometimes`, `integer`, `between:0,6` | First day of week (0=Sunday, 6=Saturday) |
| `status` | `bool` | `boolean` | Active/inactive status |

### Validation Details

#### Locale Validation

The `locale` field uses `CheckLocaleRule` which:
- Validates format: exactly two lowercase letters
- Checks uniqueness in languages table
- Ensures compatibility with Laravel's translation system

#### Calendar Validation

The `calendar` field accepts values from `CalendarTypeEnum`:
- `gregorian`
- `jalali`
- `hijri`
- `hebrew`
- `buddhist`
- `coptic`
- `ethiopian`
- `chinese`

#### Direction Validation

The `direction` field accepts:
- `ltr`: Left-to-right (for languages like English, French)
- `rtl`: Right-to-left (for languages like Arabic, Persian)

#### First Day of Week

The `first_day_of_week` field accepts integers from 0 to 6:
- `0`: Sunday
- `1`: Monday
- `2`: Tuesday
- `3`: Wednesday
- `4`: Thursday
- `5`: Friday
- `6`: Saturday

## Usage Examples

### Example 1: Basic Controller Usage

```php
// app/Http/Controllers/LanguageController.php
use JobMetric\Language\Http\Requests\StoreLanguageRequest;
use JobMetric\Language\Facades\Language;

public function store(StoreLanguageRequest $request)
{
    $data = $request->validated();
    
    $language = Language::store($data);
    
    return response()->json([
        'message' => 'Language created successfully',
        'language' => $language,
    ], 201);
}
```

### Example 2: With Authorization

```php
// app/Http/Requests/StoreLanguageRequest.php
use Illuminate\Foundation\Http\FormRequest;

class StoreLanguageRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Only admins can create languages
        return auth()->check() && auth()->user()->isAdmin();
    }
    
    // ... rest of the class
}
```

### Example 3: Using Static Normalize Method

```php
// app/Services/LanguageImportService.php
use JobMetric\Language\Http\Requests\StoreLanguageRequest;
use JobMetric\Language\Facades\Language;

class LanguageImportService
{
    public function importFromArray(array $rawData): Language
    {
        // Normalize data before validation
        $normalized = StoreLanguageRequest::normalize($rawData);
        
        // Validate manually
        $validator = Validator::make($normalized, (new StoreLanguageRequest())->rules());
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        
        // Store language
        return Language::store($normalized);
    }
}
```

### Example 4: API Endpoint

```php
// routes/api.php
Route::post('/languages', function (StoreLanguageRequest $request) {
    $language = Language::store($request->validated());
    
    return new LanguageResource($language);
});
```

### Example 5: Form Submission

```php
// app/Http/Controllers/Admin/LanguageController.php
public function store(StoreLanguageRequest $request)
{
    $language = Language::store($request->validated());
    
    return redirect()
        ->route('admin.languages.index')
        ->with('success', 'Language created successfully');
}
```

### Example 6: Bulk Language Creation

```php
// app/Http/Controllers/Admin/LanguageController.php
public function bulkStore(Request $request)
{
    $request->validate([
        'languages' => 'required|array',
        'languages.*' => 'required|array',
    ]);
    
    $created = [];
    
    foreach ($request->input('languages') as $languageData) {
        // Normalize each language data
        $normalized = StoreLanguageRequest::normalize($languageData);
        
        // Validate
        $validator = Validator::make(
            $normalized,
            (new StoreLanguageRequest())->rules()
        );
        
        if ($validator->fails()) {
            continue; // Skip invalid entries
        }
        
        $created[] = Language::store($normalized);
    }
    
    return response()->json([
        'message' => count($created) . ' languages created',
        'languages' => $created,
    ]);
}
```

## Data Normalization

The `normalize()` method automatically handles:

### Empty Flag String

```php
// Input
['flag' => '']

// Output
['flag' => null]
```

### Missing First Day of Week

```php
// Input
['name' => 'Persian', 'locale' => 'fa']

// Output
['name' => 'Persian', 'locale' => 'fa', 'first_day_of_week' => 0]
```

## Custom Attributes

The request provides translated attribute names for better error messages:

```php
// Error message without custom attributes
"The locale field is required."

// Error message with custom attributes
"The Locale field is required." // Uses translation from language::base.fields.locale
```

## Authorization

By default, `authorize()` returns `true`, allowing all users to create languages. Override this method to add authorization:

```php
public function authorize(): bool
{
    // Example: Only admins can create languages
    return auth()->check() && auth()->user()->hasRole('admin');
    
    // Example: Check permission
    return auth()->user()->can('create', Language::class);
    
    // Example: Rate limiting
    return auth()->user()->languagesCreatedToday() < 10;
}
```

## When to Use StoreLanguageRequest

### Primary Use Cases

#### 1. Language Creation Forms

**When**: Creating admin forms for adding new languages.

**Why**: Provides automatic validation and normalization.

**Example**:

```php
// In controller
public function store(StoreLanguageRequest $request)
{
    $language = Language::store($request->validated());
    return redirect()->back()->with('success', 'Language created');
}
```

#### 2. API Endpoints

**When**: Building REST APIs for language management.

**Why**: Ensures data integrity and provides consistent validation.

**Example**:

```php
Route::post('/api/languages', function (StoreLanguageRequest $request) {
    return new LanguageResource(Language::store($request->validated()));
});
```

#### 3. Language Import

**When**: Importing languages from external sources.

**Why**: Normalizes and validates data before storage.

**Example**:

```php
$normalized = StoreLanguageRequest::normalize($importedData);
$validator = Validator::make($normalized, (new StoreLanguageRequest())->rules());
```

#### 4. Bulk Operations

**When**: Creating multiple languages at once.

**Why**: Consistent validation across all entries.

**Example**:

```php
foreach ($languages as $data) {
    $normalized = StoreLanguageRequest::normalize($data);
    // Validate and store
}
```

### When NOT to Use

- **Reading Languages**: Don't use for reading/displaying language data
- **Updating Languages**: Use `UpdateLanguageRequest` instead
- **Deleting Languages**: Use appropriate delete request
- **Internal Logic**: Don't use for internal language operations

## Best Practices

### 1. Always Use in Controllers

```php
// ✅ Good
public function store(StoreLanguageRequest $request)
{
    $language = Language::store($request->validated());
}

// ❌ Bad
public function store(Request $request)
{
    $request->validate([...]); // Duplicate validation
    $language = Language::store($request->all());
}
```

### 2. Use Validated Data

```php
// ✅ Good - Only validated data
$language = Language::store($request->validated());

// ❌ Bad - All input data
$language = Language::store($request->all());
```

### 3. Override Authorization When Needed

```php
// ✅ Good - Proper authorization
public function authorize(): bool
{
    return auth()->user()->can('create', Language::class);
}

// ❌ Bad - No authorization check
// (Default allows all users)
```

### 4. Use Static Normalize for External Data

```php
// ✅ Good - Normalize before validation
$normalized = StoreLanguageRequest::normalize($externalData);
$validator = Validator::make($normalized, (new StoreLanguageRequest())->rules());

// ❌ Bad - Validate raw data
$validator = Validator::make($externalData, (new StoreLanguageRequest())->rules());
```

## Common Mistakes to Avoid

1. **Not using validated data**:
   ```php
   // ❌ Wrong
   $language = Language::store($request->all());
   
   // ✅ Correct
   $language = Language::store($request->validated());
   ```

2. **Duplicating validation rules**:
   ```php
   // ❌ Wrong
   $request->validate(['locale' => 'required|string|unique:languages']);
   
   // ✅ Correct - Use the request class
   // Validation is already in StoreLanguageRequest
   ```

3. **Not normalizing external data**:
   ```php
   // ❌ Wrong
   Language::store($importedData);
   
   // ✅ Correct
   $normalized = StoreLanguageRequest::normalize($importedData);
   Language::store($normalized);
   ```

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/requests/update-language-request">UpdateLanguageRequest</Link>
- <Link to="/packages/laravel-language/deep-diving/language-service">Language Service</Link>
- <Link to="/packages/laravel-language/deep-diving/rules/check-locale-rule">CheckLocaleRule</Link>
- <Link to="/packages/laravel-language/deep-diving/models/language">Language Model</Link>

