---
sidebar_position: 2
sidebar_label: LanguageExistRule
---

import Link from "@docusaurus/Link";

# LanguageExistRule

The `LanguageExistRule` validates that a given language ID exists and matches the expected locale.

## Namespace

```php
JobMetric\Language\Rules\LanguageExistRule
```

## Overview

This rule ensures that:
- Language ID exists in the languages table
- Language matches the expected locale
- Can optionally allow zero (0) to bypass validation

## Usage

```php
use JobMetric\Language\Rules\LanguageExistRule;

$request->validate([
    'language_id' => ['required', new LanguageExistRule('fa')],
]);

// Disallow zero
$request->validate([
    'language_id' => ['required', new LanguageExistRule('en', false)],
]);
```

## Parameters

- `$locale` (`string`): Two-letter lowercase locale (e.g., 'fa', 'en')
- `$allowZero` (`bool`): Whether to allow 0 to bypass validation (default: true)

## Behavior

- Skips null/empty values (let 'required' handle them)
- Allows 0 if `$allowZero` is true
- Validates that ID exists with the given locale
- Works with both string and integer values

## When to Use LanguageExistRule

### Primary Use Cases

#### 1. Foreign Key Validation in Related Models

**When**: You have models that reference languages via `language_id` foreign key.

**Why**: 
- Ensures the language actually exists
- Validates the language matches expected locale
- Prevents orphaned records
- Maintains referential integrity

**Example**:

```php
// app/Models/Post.php - Post has a language_id
// app/Http/Requests/StorePostRequest.php
use JobMetric\Language\Rules\LanguageExistRule;

public function rules(): array
{
    return [
        'title' => 'required|string',
        'content' => 'required|string',
        'language_id' => ['required', 'integer', new LanguageExistRule('fa')],
    ];
}
```

**Real-World Scenario**: Blog post creation form. User selects language - rule ensures the selected language exists and is Persian (fa).

#### 2. User Language Preference

**When**: Users can set their preferred language in their profile.

**Why**: Ensures the selected language exists in the system.

**Example**:

```php
// app/Http/Requests/UpdateUserProfileRequest.php
use JobMetric\Language\Rules\LanguageExistRule;

public function rules(): array
{
    return [
        'name' => 'required|string',
        'preferred_language_id' => [
            'nullable',
            'integer',
            new LanguageExistRule(app()->getLocale(), false) // Don't allow 0
        ],
    ];
}
```

**Real-World Scenario**: User settings page where user can change their preferred language. Rule validates the selection.

#### 3. Content Localization

**When**: Creating/updating content that must be associated with a specific language.

**Why**: Ensures content is linked to a valid, active language.

**Example**:

```php
// app/Http/Requests/StoreProductRequest.php
use JobMetric\Language\Rules\LanguageExistRule;

public function rules(): array
{
    return [
        'name' => 'required|string',
        'description' => 'required|string',
        'language_id' => [
            'required',
            'integer',
            new LanguageExistRule('en') // Must be English
        ],
    ];
}
```

**Real-World Scenario**: E-commerce product creation. Products must be in English - rule enforces this.

#### 4. Multi-Language Content Management

**When**: Managing translations where each translation must reference a valid language.

**Why**: Prevents creating translations for non-existent languages.

**Example**:

```php
// app/Http/Requests/StoreTranslationRequest.php
use JobMetric\Language\Rules\LanguageExistRule;

public function rules(): array
{
    $locale = $this->input('locale', app()->getLocale());
    
    return [
        'key' => 'required|string',
        'value' => 'required|string',
        'language_id' => [
            'required',
            'integer',
            new LanguageExistRule($locale)
        ],
    ];
}
```

**Real-World Scenario**: Translation management system. Each translation must reference a valid language matching the locale.

#### 5. Optional Language Selection

**When**: Language selection is optional (can be null or 0).

**Why**: The `allowZero` parameter allows 0 to bypass validation for optional fields.

**Example**:

```php
// app/Http/Requests/StoreCategoryRequest.php
use JobMetric\Language\Rules\LanguageExistRule;

public function rules(): array
{
    return [
        'name' => 'required|string',
        'language_id' => [
            'nullable',
            'integer',
            new LanguageExistRule('en', true) // Allow 0 for "no language"
        ],
    ];
}
```

**Real-World Scenario**: Category creation where language is optional. Rule allows 0 (no language) or validates existing language.

### When NOT to Use

- **Direct Model Queries**: Don't use for checking existence in code - use `Language::find()` instead
- **API Responses**: Not needed when returning language data
- **Display Logic**: Don't use for showing language information
- **Locale Validation**: Use `CheckLocaleRule` for locale format validation, not this rule

### Decision Tree

```
Do you need to validate a language_id input?
├─ Yes → Is the language_id required?
│  ├─ Yes → Use LanguageExistRule($locale, false) // Don't allow 0
│  └─ No → Use LanguageExistRule($locale, true) // Allow 0
└─ No → Don't use this rule
```

### Common Mistakes to Avoid

1. **Wrong locale parameter**:
   ```php
   // ❌ Wrong - locale doesn't match expected language
   new LanguageExistRule('en') // When expecting 'fa'
   
   // ✅ Correct - locale matches expected language
   new LanguageExistRule('fa')
   ```

2. **Not allowing zero when needed**:
   ```php
   // ❌ Wrong - will fail if user selects "no language"
   'language_id' => [new LanguageExistRule('en', false)]
   
   // ✅ Correct - allows 0 for optional language
   'language_id' => ['nullable', new LanguageExistRule('en', true)]
   ```

3. **Using for locale validation**:
   ```php
   // ❌ Wrong - this rule validates language_id, not locale
   'locale' => [new LanguageExistRule('en')]
   
   // ✅ Correct - use CheckLocaleRule for locale
   'locale' => [new CheckLocaleRule]
   ```

4. **Missing 'required' or 'nullable'**:
   ```php
   // ❌ Wrong - unclear if field is required
   'language_id' => [new LanguageExistRule('en')]
   
   // ✅ Correct - explicit requirement
   'language_id' => ['required', 'integer', new LanguageExistRule('en')]
   ```

### Comparison with CheckLocaleRule

| Rule | Validates | Use Case |
|------|-----------|----------|
| `CheckLocaleRule` | Locale format and uniqueness | Creating/updating language records |
| `LanguageExistRule` | Language ID existence and locale match | Foreign key validation in related models |

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/rules/check-locale-rule">CheckLocaleRule</Link>
- <Link to="/packages/laravel-language/deep-diving/models/language">Language Model</Link>

