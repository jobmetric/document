---
sidebar_position: 4
sidebar_label: MultiTranslationTypeObjectRequest
---

# MultiTranslationTypeObjectRequest Trait

The `MultiTranslationTypeObjectRequest` trait builds **validation rules** and **human-friendly attribute labels** for multi-locale translation payloads under the root key `translation`. It is intended for projects that define translatable fields via a **Typeify** schema (`JobMetric\Translation\Typeify\Translation`) and expose available locales through `Language::all()`.

## When to Use MultiTranslationTypeObjectRequest

**Use `MultiTranslationTypeObjectRequest` when you need:**

- **Schema-driven multi-locale validation**: Define translation fields using Typeify schemas for all active locales
- **Automatic locale coverage**: Automatically validates translations for all locales from `Language::all()`
- **Custom field validation**: Each translatable field can have its own validation rules per locale
- **Primary field uniqueness**: Enforces uniqueness for a primary field across all locales
- **Custom field uniqueness**: Mark specific fields as unique per locale with automatic rule generation
- **Complex validation requirements**: Define custom validation strings for each field in the schema
- **Structured multi-locale forms**: Forms that require translations in all active locales with schema-driven validation

**Example scenarios:**
- Complex e-commerce product forms requiring translations for all active languages with custom validation
- CMS content management with structured field definitions and mandatory multi-locale translations
- Multi-language blog post creation with schema-driven validation for all supported languages
- Content forms where all locales must be provided with custom validation rules per field
- Applications using Typeify schemas for multi-locale form generation and validation

> This document focuses solely on request-side validation and labels. No database or tests are discussed here. All examples include **expected output** you can compare against during development.

---

## What It Does

For each locale (from `Language::all()`), the trait produces:

- A container rule for `translation.{locale}` (array)
- A **primary field** rule (e.g., `name` or `title`) consisting of:
    - `string`
    - `TranslationFieldExistRule` (per-locale uniqueness for that field)
- Rules for **additional fields** derived from your Typeify schema:
    - If a field is marked **unique** (via `customField->params['unique'] = true`), it receives both its **custom validation** string and a `TranslationFieldExistRule` instance.
    - Otherwise, it receives its **custom validation** string (defaulting to `string|nullable|sometimes` when not provided).

It can also build user-friendly **attribute labels** for your validator messages, mapping each `translation.{locale}.{field}` key to a readable label defined in the Typeify schema (via `customField->label`).

---

## Quick Start

### 1) Use the trait inside a **FormRequest**

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Collection;
use JobMetric\Translation\Http\Requests\MultiTranslationTypeObjectRequest;
use JobMetric\Translation\Typeify\Translation as TypeTranslation;

class StorePostRequest extends FormRequest
{
    use MultiTranslationTypeObjectRequest;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'slug' => 'required|string',
        ];

        // Build your Typeify translation schema collection.
        // Typically you already have these objects; here we craft them inline for illustration.
        /** @var Collection<int, TypeTranslation> $schema */
        $schema = collect([
            // Primary field will be provided separately via $field_name.
            // Below are *additional* fields.
            new TypeTranslation([
                'customField' => (object) [
                    'params' => ['uniqName' => 'summary', 'unique' => false],
                    'validation' => 'string|nullable|max:500',
                    'label' => 'validation.attributes.summary',
                ]
            ]),
            new TypeTranslation([
                'customField' => (object) [
                    'params' => ['uniqName' => 'slug', 'unique' => true],
                    'validation' => 'string|required|min:3',
                    'label' => 'validation.attributes.slug',
                ]
            ]),
        ]);

        // IMPORTANT: method name is `renderMultiTranslationFiled` (with a trailing "d").
        $this->renderMultiTranslationFiled(
            $rules,
            $schema,                     // Typeify items defining fields
            \App\Models\Post::class,  // owner model FQCN
            'title',                     // primary field per locale (uniqueness enforced)
            null,                        // object_id (null on create)
            null,                        // parent_id (optional scope)
            []                           // parent_where (optional extra constraints)
        );

        return $rules;
    }

    public function attributes(): array
    {
        $attributes = [
            'slug' => 'Slug',
        ];

        // Build attribute labels per-locale using the same Typeify schema:
        $schema = collect([
            new TypeTranslation([
                'customField' => (object) [
                    'params' => ['uniqName' => 'summary'],
                    'validation' => 'string|nullable|max:500',
                    'label' => 'validation.attributes.summary',
                ]
            ]),
            new TypeTranslation([
                'customField' => (object) [
                    'params' => ['uniqName' => 'slug'],
                    'validation' => 'string|required|min:3',
                    'label' => 'validation.attributes.slug',
                ]
            ]),
        ]);

        $this->renderMultiTranslationAttribute($attributes, $schema);

        return $attributes;
    }
}
```

> **Note:** Keep the exact method name `renderMultiTranslationFiled` as implemented in the trait.

---

## Example: Resulting `rules()` Output

Assumptions for this example:
- `Language::all()` yields locales: `en`, `fa`
- The **primary field** is `title` (uniqueness per locale)
- The Typeify schema defines two additional fields:
    - `summary` → not unique, validation: `string|nullable|max:500`
    - `slug` → unique, validation: `string|required|min:3`

**Code (excerpt from `rules()`):**
```php
$rules = [
    'slug' => 'required|string',
];

$this->renderMultiTranslationFiled(
    $rules,
    $schema,
    \App\Models\Post::class,
    'title',
    null,
    null,
    []
);

return $rules;
```

**Expected Output (pretty-printed):**
```
Array
(
    [slug] => required|string
    [translation] => array
    [translation.en] => array
    [translation.en.title] => Array
        (
            [0] => string
            [1] => JobMetric\Translation\Rules\TranslationFieldExistRule Object (...)
        )

    [translation.en.summary] => string|nullable|max:500
    [translation.en.slug] => Array
        (
            [0] => string|required|min:3
            [1] => JobMetric\Translation\Rules\TranslationFieldExistRule Object (...)
        )

    [translation.fa] => array
    [translation.fa.title] => Array
        (
            [0] => string
            [1] => JobMetric\Translation\Rules\TranslationFieldExistRule Object (...)
        )

    [translation.fa.summary] => string|nullable|max:500
    [translation.fa.slug] => Array
        (
            [0] => string|required|min:3
            [1] => JobMetric\Translation\Rules\TranslationFieldExistRule Object (...)
        )
)
```

---

## Example: Resulting `attributes()` Output

Using the same schema and locales, `renderMultiTranslationAttribute` maps each field to a label (via `customField->label` if provided), per locale.

**Code (excerpt from `attributes()`):**
```php
$attributes = [
    'slug' => 'Slug',
];

$this->renderMultiTranslationAttribute($attributes, $schema);

return $attributes;
```

**Expected Output (pretty-printed):**
```
Array
(
    [slug] => Slug
    [translation.en.summary] => validation.attributes.summary
    [translation.en.slug] => validation.attributes.slug
    [translation.fa.summary] => validation.attributes.summary
    [translation.fa.slug] => validation.attributes.slug
)
```

> If a `label` is not provided for a field, the trait uses the field's `uniqName` as the fallback label text.

---

## Handling the Primary Field

The primary field (`$field_name`, e.g., `title`) is **always** added with:
- `string`
- `TranslationFieldExistRule` for per-locale uniqueness

You do **not** need to include the primary field in your Typeify schema list; the trait adds it explicitly for every locale.

---

## Adding/Marking Unique Custom Fields

To enforce uniqueness on additional fields, set `customField->params['unique'] = true` in your Typeify item. The trait will attach a `TranslationFieldExistRule` to that field, per locale, alongside the provided validation string.

**Example Typeify entry:**
```php
new TypeTranslation([
    'customField' => (object) [
        'params' => ['uniqName' => 'slug', 'unique' => true],
        'validation' => 'string|required|min:3',
        'label' => 'validation.attributes.slug',
    ]
])
```

**Expected part of rules():**
```
[translation.en.slug] => Array
(
    [0] => string|required|min:3
    [1] => JobMetric\Translation\Rules\TranslationFieldExistRule Object (...)
)
```

---

## End-to-End Flow (Minimal)

1. Build a `Collection<TypeTranslation>` where each item provides:
    - `customField->params['uniqName']` (required)
    - optional `customField->params['unique']` (bool)
    - optional `validation` (string, defaults to `string|nullable|sometimes`)
    - optional `label` (used to build attributes)
2. Call `renderMultiTranslationFiled($rules, $schema, $className, $primaryField, ...)` in `rules()`.
3. Call `renderMultiTranslationAttribute($attributes, $schema)` in `attributes()`.
4. Done: your validator now understands `translation.{locale}.{field}` for each locale, including the primary field with uniqueness and any extra custom fields with per-field validation.

---

## Summary

`MultiTranslationTypeObjectRequest` makes multi-locale validation **schema-driven**:
- Locale-aware rules under `translation.{locale}`
- Per-locale uniqueness for a **primary** field
- Custom per-field validation from Typeify (with optional uniqueness)
- Clean, predictable attribute labels for error messages

Use the examples above as a template in your FormRequest classes to validate complex translation payloads consistently across locales.

## Related Documentation

- [HasTranslation](/packages/laravel-translation/deep-diving/has-translation) - Core trait for multilingual models
- [TranslationFieldExistRule](/packages/laravel-translation/deep-diving/rules/translation-field-exist-rule) - Validation rule for unique translations
- [TranslationArrayRequest](/packages/laravel-translation/deep-diving/requests/translation-array-request) - Simpler array-based validation
- [MultiTranslationArrayRequest](/packages/laravel-translation/deep-diving/requests/multi-translation-array-request) - Multi-locale array validation
- [TranslationTypeObjectRequest](/packages/laravel-translation/deep-diving/requests/translation-type-object-request) - Single or dynamic locale Typeify validation
- [TranslationResource](/packages/laravel-translation/deep-diving/resources/translation-resource) - JSON resource for API responses
- [TranslationCollectionResource](/packages/laravel-translation/deep-diving/resources/translation-collection-resource) - JSON resource for translation collections
