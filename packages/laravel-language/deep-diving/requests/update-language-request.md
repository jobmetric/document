---
sidebar_position: 2
sidebar_label: UpdateLanguageRequest
---

import Link from "@docusaurus/Link";

# UpdateLanguageRequest

The `UpdateLanguageRequest` is a FormRequest class that validates and normalizes data when updating existing language records. It provides flexible validation that handles partial updates and ensures data integrity.

## Namespace

```php
JobMetric\Language\Http\Requests\UpdateLanguageRequest
```

## Overview

`UpdateLanguageRequest` provides:

- **Flexible Validation**: All fields are optional (partial updates supported)
- **Context-Aware Rules**: Automatically extracts language ID from route for uniqueness validation
- **Data Normalization**: Automatically normalizes input data
- **Static Methods**: Can be used outside Laravel's request pipeline with explicit context
- **Custom Attributes**: Provides translated field names for error messages

## Key Differences from StoreLanguageRequest

| Feature | StoreLanguageRequest | UpdateLanguageRequest |
|---------|---------------------|----------------------|
| **Fields** | All required | All optional (partial updates) |
| **Locale Uniqueness** | Checks against all languages | Excludes current language from check |
| **Language ID** | Not needed | Extracted from route parameter |
| **Static Methods** | `normalize($data)` | `normalize($data, $ctx)` and `rulesFor($data, $ctx)` |

## Available Methods

### Rules

Get validation rules for language update:

```php
public function rules(): array
```

**Returns:** `array` - Validation rules array

**Behavior:**
- Automatically extracts language ID from route parameter `language`
- Passes language ID to `CheckLocaleRule` to exclude current record from uniqueness check

**Example**:

```php
// Route: PUT /languages/{language}
// $language is the route parameter
$request = new UpdateLanguageRequest();
$rules = $request->rules(); // Automatically uses language ID from route
```

### Rules For (Static)

Build rules with explicit context (used outside Laravel pipeline):

```php
public static function rulesFor(array $data, array $ctx = []): array
```

**Parameters:**
- `$data` (`array`): Input data
- `$ctx` (`array`): Context array containing `language_id`

**Returns:** `array` - Validation rules array

**Example**:

```php
$data = ['name' => 'Updated Name', 'locale' => 'fa'];
$context = ['language_id' => 5];

$rules = UpdateLanguageRequest::rulesFor($data, $context);
// Rules include CheckLocaleRule(5) to exclude language ID 5 from uniqueness check
```

### Normalize (Static)

Normalize raw input data outside Laravel's FormRequest pipeline:

```php
public static function normalize(array $data, array $ctx = []): array
```

**Parameters:**
- `$data` (`array`): Raw input data
- `$ctx` (`array`): Context array (optional, not used in normalization)

**Returns:** `array` - Normalized data

**What it does:**
- Converts empty `flag` string to `null`

**Example**:

```php
$rawData = [
    'name' => 'Updated Persian',
    'flag' => '', // Empty string
];

$normalized = UpdateLanguageRequest::normalize($rawData);
// Result: ['name' => 'Updated Persian', 'flag' => null]
```

### Attributes

Get custom attribute names for validation error messages:

```php
public function attributes(): array
```

**Returns:** `array` - Attribute names mapped to translated labels

## Validation Rules

### Complete Rules Array

```php
[
    'name' => 'string',
    'flag' => 'string|nullable',
    'locale' => ['string', new CheckLocaleRule($languageId)],
    'direction' => 'string|in:ltr,rtl',
    'calendar' => 'string|in:gregorian,jalali,hijri,hebrew,buddhist,coptic,ethiopian,chinese',
    'status' => 'boolean',
]
```

**Note:** All fields are optional, allowing partial updates.

### Field Details

| Field | Type | Rules | Description |
|-------|------|-------|-------------|
| `name` | `string\|null` | `string` | Language display name (optional) |
| `flag` | `string\|null` | `string\|nullable` | Country flag code (optional) |
| `locale` | `string\|null` | `string`, `CheckLocaleRule($id)` | Two-letter locale code (optional, excludes current language) |
| `direction` | `string\|null` | `string`, `in:ltr,rtl` | Text direction (optional) |
| `calendar` | `string\|null` | `string`, `in:...` | Calendar system type (optional) |
| `status` | `bool\|null` | `boolean` | Active/inactive status (optional) |

### Locale Uniqueness Handling

The `locale` field uses `CheckLocaleRule` with the current language ID:

```php
// When updating language ID 5
'locale' => ['string', new CheckLocaleRule(5)]

// This ensures:
// - Locale format is valid
// - Locale is unique (excluding language ID 5)
// - Can update other fields without changing locale
```

## Usage Examples

### Example 1: Basic Controller Usage

```php
// app/Http/Controllers/LanguageController.php
use JobMetric\Language\Http\Requests\UpdateLanguageRequest;
use JobMetric\Language\Facades\Language;

public function update(UpdateLanguageRequest $request, Language $language)
{
    $data = $request->validated();
    
    $updated = Language::update($language->id, $data);
    
    return response()->json([
        'message' => 'Language updated successfully',
        'language' => $updated,
    ]);
}
```

### Example 2: Partial Update

```php
// Only update name
$request->validate([
    'name' => 'required|string',
]);

// Only update status
$request->validate([
    'status' => 'required|boolean',
]);

// Update multiple fields
$request->validate([
    'name' => 'required|string',
    'status' => 'required|boolean',
    'direction' => 'required|string|in:ltr,rtl',
]);
```

### Example 3: Using Static Methods Outside Pipeline

```php
// app/Services/LanguageSyncService.php
use JobMetric\Language\Http\Requests\UpdateLanguageRequest;
use JobMetric\Language\Facades\Language;

class LanguageSyncService
{
    public function syncLanguage(int $languageId, array $externalData): Language
    {
        // Normalize data
        $normalized = UpdateLanguageRequest::normalize($externalData);
        
        // Build rules with context
        $rules = UpdateLanguageRequest::rulesFor($normalized, [
            'language_id' => $languageId
        ]);
        
        // Validate manually
        $validator = Validator::make($normalized, $rules);
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        
        // Update language
        return Language::update($languageId, $normalized);
    }
}
```

### Example 4: API Endpoint

```php
// routes/api.php
Route::put('/languages/{language}', function (UpdateLanguageRequest $request, Language $language) {
    $updated = Language::update($language->id, $request->validated());
    
    return new LanguageResource($updated);
});
```

### Example 5: Form Submission

```php
// app/Http/Controllers/Admin/LanguageController.php
public function update(UpdateLanguageRequest $request, Language $language)
{
    $updated = Language::update($language->id, $request->validated());
    
    return redirect()
        ->route('admin.languages.index')
        ->with('success', 'Language updated successfully');
}
```

### Example 6: Bulk Language Update

```php
// app/Http/Controllers/Admin/LanguageController.php
public function bulkUpdate(Request $request)
{
    $request->validate([
        'languages' => 'required|array',
        'languages.*.id' => 'required|exists:languages,id',
        'languages.*.data' => 'required|array',
    ]);
    
    $updated = [];
    
    foreach ($request->input('languages') as $item) {
        $languageId = $item['id'];
        $languageData = $item['data'];
        
        // Normalize data
        $normalized = UpdateLanguageRequest::normalize($languageData);
        
        // Build rules with context
        $rules = UpdateLanguageRequest::rulesFor($normalized, [
            'language_id' => $languageId
        ]);
        
        // Validate
        $validator = Validator::make($normalized, $rules);
        
        if ($validator->fails()) {
            continue; // Skip invalid entries
        }
        
        $updated[] = Language::update($languageId, $normalized);
    }
    
    return response()->json([
        'message' => count($updated) . ' languages updated',
        'languages' => $updated,
    ]);
}
```

### Example 7: Changing Locale

```php
// Update language locale from 'fa-IR' to 'fa'
public function update(UpdateLanguageRequest $request, Language $language)
{
    // Request includes: ['locale' => 'fa']
    // CheckLocaleRule(5) ensures 'fa' doesn't exist (excluding language ID 5)
    
    $updated = Language::update($language->id, $request->validated());
    
    return response()->json($updated);
}
```

### Example 8: With Authorization

```php
// app/Http/Requests/UpdateLanguageRequest.php
use Illuminate\Foundation\Http\FormRequest;

class UpdateLanguageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $language = $this->route('language');
        
        // Only allow updating if user owns the language or is admin
        return auth()->id() === $language->created_by 
            || auth()->user()->isAdmin();
    }
    
    // ... rest of the class
}
```

## Route Parameter Extraction

The request automatically extracts the language ID from the route:

```php
// Route definition
Route::put('/languages/{language}', [LanguageController::class, 'update']);

// In UpdateLanguageRequest
$language_id = $this->route()?->parameter('language')?->id;
// or
$language_id = $this->route('language')->id;
```

**Note:** The route parameter name must be `language` for automatic extraction.

## Data Normalization

The `normalize()` method automatically handles:

### Empty Flag String

```php
// Input
['flag' => '']

// Output
['flag' => null]
```

### Partial Updates

```php
// Input - only updating name
['name' => 'Updated Name']

// Output - same, no other fields affected
['name' => 'Updated Name']
```

## When to Use UpdateLanguageRequest

### Primary Use Cases

#### 1. Language Update Forms

**When**: Creating admin forms for editing existing languages.

**Why**: Provides flexible validation for partial updates.

**Example**:

```php
public function update(UpdateLanguageRequest $request, Language $language)
{
    $updated = Language::update($language->id, $request->validated());
    return redirect()->back()->with('success', 'Language updated');
}
```

#### 2. API Endpoints

**When**: Building REST APIs for language management.

**Why**: Ensures data integrity while allowing partial updates.

**Example**:

```php
Route::put('/api/languages/{language}', function (UpdateLanguageRequest $request, Language $language) {
    return new LanguageResource(Language::update($language->id, $request->validated()));
});
```

#### 3. Language Sync

**When**: Syncing languages from external sources.

**Why**: Normalizes and validates data with proper context.

**Example**:

```php
$normalized = UpdateLanguageRequest::normalize($externalData);
$rules = UpdateLanguageRequest::rulesFor($normalized, ['language_id' => $id]);
```

#### 4. Bulk Updates

**When**: Updating multiple languages at once.

**Why**: Consistent validation with proper context for each language.

**Example**:

```php
foreach ($languages as $id => $data) {
    $rules = UpdateLanguageRequest::rulesFor($data, ['language_id' => $id]);
    // Validate and update
}
```

### When NOT to Use

- **Creating Languages**: Use `StoreLanguageRequest` instead
- **Reading Languages**: Don't use for reading/displaying language data
- **Deleting Languages**: Use appropriate delete request
- **Internal Logic**: Don't use for internal language operations

## Best Practices

### 1. Always Use in Controllers

```php
// ✅ Good
public function update(UpdateLanguageRequest $request, Language $language)
{
    $updated = Language::update($language->id, $request->validated());
}

// ❌ Bad
public function update(Request $request, Language $language)
{
    $request->validate([...]); // Duplicate validation
    $updated = Language::update($language->id, $request->all());
}
```

### 2. Use Validated Data

```php
// ✅ Good - Only validated data
$updated = Language::update($language->id, $request->validated());

// ❌ Bad - All input data
$updated = Language::update($language->id, $request->all());
```

### 3. Use Static Methods with Context

```php
// ✅ Good - Explicit context
$rules = UpdateLanguageRequest::rulesFor($data, ['language_id' => $id]);

// ❌ Bad - Missing context
$rules = (new UpdateLanguageRequest())->rules(); // May not work outside pipeline
```

### 4. Handle Partial Updates

```php
// ✅ Good - Only update provided fields
$data = $request->validated(); // Only contains provided fields
$updated = Language::update($language->id, $data);

// ❌ Bad - Merge with existing data unnecessarily
$data = array_merge($language->toArray(), $request->validated());
```

## Common Mistakes to Avoid

1. **Not using validated data**:
   ```php
   // ❌ Wrong
   $updated = Language::update($language->id, $request->all());
   
   // ✅ Correct
   $updated = Language::update($language->id, $request->validated());
   ```

2. **Wrong route parameter name**:
   ```php
   // ❌ Wrong - route parameter must be 'language'
   Route::put('/languages/{lang}', ...);
   
   // ✅ Correct
   Route::put('/languages/{language}', ...);
   ```

3. **Not providing context in static methods**:
   ```php
   // ❌ Wrong - missing language_id context
   $rules = UpdateLanguageRequest::rulesFor($data);
   
   // ✅ Correct
   $rules = UpdateLanguageRequest::rulesFor($data, ['language_id' => $id]);
   ```

4. **Duplicating validation rules**:
   ```php
   // ❌ Wrong
   $request->validate(['locale' => 'required|string|unique:languages,locale,' . $id]);
   
   // ✅ Correct - Use the request class
   // Validation is already in UpdateLanguageRequest
   ```

## Comparison with StoreLanguageRequest

| Feature | StoreLanguageRequest | UpdateLanguageRequest |
|---------|---------------------|----------------------|
| **Purpose** | Create new languages | Update existing languages |
| **Fields** | All required | All optional |
| **Locale Check** | Checks all languages | Excludes current language |
| **Language ID** | Not needed | Extracted from route |
| **Static Methods** | `normalize($data)` | `normalize($data, $ctx)`, `rulesFor($data, $ctx)` |
| **Use Case** | New language creation | Language updates |

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/requests/store-language-request">StoreLanguageRequest</Link>
- <Link to="/packages/laravel-language/deep-diving/language-service">Language Service</Link>
- <Link to="/packages/laravel-language/deep-diving/rules/check-locale-rule">CheckLocaleRule</Link>
- <Link to="/packages/laravel-language/deep-diving/models/language">Language Model</Link>

