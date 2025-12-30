---
sidebar_position: 1
sidebar_label: CheckLocaleRule
---

import Link from "@docusaurus/Link";

# CheckLocaleRule

The `CheckLocaleRule` validates that the provided locale is unique and matches Laravel's folder convention (two-letter lowercase codes).

## Namespace

```php
JobMetric\Language\Rules\CheckLocaleRule
```

## Overview

This rule ensures that:
- Locale is exactly two lowercase letters (e.g., "fa", "en", "de")
- Locale is unique in the languages table
- Can optionally ignore the current record when updating

## Usage

```php
use JobMetric\Language\Rules\CheckLocaleRule;

$request->validate([
    'locale' => ['required', 'string', new CheckLocaleRule],
]);

// When updating, pass the language ID to ignore current record
$request->validate([
    'locale' => ['required', 'string', new CheckLocaleRule($languageId)],
]);
```

## Parameters

- `$languageId` (`int|null`): Optional language ID to ignore when checking uniqueness (for updates)

## Behavior

- Skips empty values (let 'required' handle them)
- Validates format: exactly two lowercase letters
- Checks uniqueness in languages table
- Ignores current record if `$languageId` is provided

## When to Use CheckLocaleRule

### Primary Use Cases

#### 1. Creating New Languages (StoreLanguageRequest)

**When**: You're creating a new language record and need to validate the locale.

**Why**: Ensures the locale is:
- In correct format (two lowercase letters)
- Unique in the database
- Compatible with Laravel's translation system

**Example**:

```php
// app/Http/Requests/StoreLanguageRequest.php
use JobMetric\Language\Rules\CheckLocaleRule;

public function rules(): array
{
    return [
        'locale' => ['required', 'string', new CheckLocaleRule],
        // ... other rules
    ];
}
```

**Real-World Scenario**: Admin panel form for adding a new language. User enters "fa" for Persian - rule validates it's unique and correctly formatted.

#### 2. Updating Existing Languages (UpdateLanguageRequest)

**When**: You're updating a language and the locale might change.

**Why**: 
- Validates new locale format
- Ensures uniqueness (excluding current record)
- Prevents duplicate locales

**Example**:

```php
// app/Http/Requests/UpdateLanguageRequest.php
use JobMetric\Language\Rules\CheckLocaleRule;

public function rules(): array
{
    $languageId = $this->route('language')->id;
    
    return [
        'locale' => ['required', 'string', new CheckLocaleRule($languageId)],
        // ... other rules
    ];
}
```

**Real-World Scenario**: Admin wants to change locale from "fa-IR" to "fa". Rule ensures "fa" doesn't already exist (excluding current record).

#### 3. Custom Language Management Forms

**When**: You have custom forms for language management outside the default requests.

**Why**: Consistent validation across your application.

**Example**:

```php
// Custom language import form
$request->validate([
    'languages' => 'required|array',
    'languages.*.locale' => ['required', 'string', new CheckLocaleRule],
]);
```

**Real-World Scenario**: Bulk language import feature where you validate multiple locales at once.

### When NOT to Use

- **Reading/Displaying**: Don't use for reading locale values - it's a validation rule
- **API Responses**: Not needed when returning locale data
- **Internal Logic**: Don't use for internal locale checks - use model methods instead

### Decision Tree

```
Do you need to validate a locale input?
├─ Yes → Is it for creating a new language?
│  ├─ Yes → Use CheckLocaleRule() (without ID)
│  └─ No → Is it for updating an existing language?
│     ├─ Yes → Use CheckLocaleRule($languageId)
│     └─ No → Use CheckLocaleRule() for other scenarios
└─ No → Don't use this rule
```

### Common Mistakes to Avoid

1. **Forgetting to pass ID on updates**:
   ```php
   // ❌ Wrong - will fail if locale already exists
   new CheckLocaleRule()
   
   // ✅ Correct - ignores current record
   new CheckLocaleRule($languageId)
   ```

2. **Using for non-locale fields**:
   ```php
   // ❌ Wrong - this rule is only for locale
   'name' => [new CheckLocaleRule]
   
   // ✅ Correct
   'locale' => [new CheckLocaleRule]
   ```

3. **Not combining with 'required'**:
   ```php
   // ❌ Wrong - allows empty values
   'locale' => [new CheckLocaleRule]
   
   // ✅ Correct - validates format and uniqueness
   'locale' => ['required', 'string', new CheckLocaleRule]
   ```

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/rules/language-exist-rule">LanguageExistRule</Link>
- <Link to="/packages/laravel-language/deep-diving/models/language">Language Model</Link>

