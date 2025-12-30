---
sidebar_position: 3
sidebar_label: TranslationTypeObjectRequest
---

import Link from "@docusaurus/Link";

# TranslationTypeObjectRequest Trait

The `TranslationTypeObjectRequest` trait composes **validation rules** and **human‑friendly attribute labels** for a single `translation` object across **all locales provided in the incoming payload** (or falls back to `app()->getLocale()` if none are provided). It is designed to work with a **Typeify** schema (`JobMetric\Translation\Typeify\Translation`) that describes each translatable field (its unique name, validation string, label, and optional uniqueness).

## When to Use TranslationTypeObjectRequest

**Use `TranslationTypeObjectRequest` when you need:**

- **Schema-driven validation**: Define translation fields using Typeify schemas for structured validation
- **Custom field validation**: Each translatable field can have its own validation rules
- **Flexible locale handling**: Works with single locale (app locale) or multiple locales from payload
- **Primary field uniqueness**: Enforces uniqueness for a primary field using `TranslationFieldExistRule`
- **Custom field uniqueness**: Mark specific fields as unique per locale
- **Complex validation rules**: Define custom validation strings for each field in the schema
- **Structured field definitions**: Use Typeify schemas to define field names, labels, and validation rules

**Example scenarios:**
- Complex product forms with multiple translatable fields and custom validation rules
- Content management systems with structured field definitions
- Forms requiring different validation rules for different translation fields
- Applications using Typeify for schema-driven form generation
- Multi-field translation forms with custom validation requirements

> This document covers request-side validation and labels only. No database or tests are discussed. Examples include **expected output** blocks you can compare against during development.

---

## What It Does

For each detected locale (`translation.{locale}` in your request payload or the app locale):

- Adds a container rule: `translation.{locale} => array`
- Adds a **primary field** (e.g., `name` or `title`) with:
    - `string`
    - `TranslationFieldExistRule` (per‑locale uniqueness for the primary field)
    - *(Note: this trait does **not** enforce `required` on the primary field; you can layer that in your own rule set if desired.)*
- Iterates over **Typeify** items to add rules for custom fields:
    - Base validation from `customField->validation` (defaults to `string|nullable|sometimes`)
    - Optional uniqueness with `TranslationFieldExistRule` if `customField->params['unique'] = true`
- Builds attribute labels for each `translation.{locale}.{field}` using `customField->label` if provided, otherwise falls back to the field’s `uniqName`.

---

## Quick Start (Typical FormRequest)

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Collection;
use JobMetric\Translation\Http\Requests\TranslationTypeObjectRequest;
use JobMetric\Translation\Typeify\Translation as TypeTranslation;

class StorePostRequest extends FormRequest
{
    use TranslationTypeObjectRequest;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'slug' => 'required|string',
        ];

        // Build a Typeify schema collection (for illustration here)
        /** @var Collection<int, TypeTranslation> $schema */
        $schema = collect([
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

        // IMPORTANT: method name is `renderTranslationFiled` (with a trailing "d").
        $this->renderTranslationFiled(
            $rules,
            $this->all(),               // request payload
            $schema,                    // Typeify items
            \App\Models\Post::class, // owner model FQCN
            'title',                    // primary field
            null,                       // object_id (null on create)
            null,                       // parent_id (optional scope)
            []                          // parent_where (optional constraints)
        );

        return $rules;
    }

    public function attributes(): array
    {
        $attributes = [
            'slug' => 'Slug',
        ];

        // Use the same Typeify schema to generate human-friendly labels per locale
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

        $this->renderTranslationAttribute($attributes, $this->all(), $schema);

        return $attributes;
    }
}
```

> Keep the exact method names `renderTranslationFiled` and `renderTranslationAttribute` as implemented in the trait.

---

## Example: Resulting `rules()` Output (Multiple Locales)

Assumptions:
- Incoming payload:
  ```json
  {
    "slug": "hello-world",
    "translation": {
      "en": { "title": "Hello", "summary": "First post", "slug": "hello-world" },
      "fa": { "title": "سلام",   "summary": "اولین پست", "slug": "salam-donya" }
    }
  }
  ```
- Primary field is `title`
- Typeify fields:
    - `summary` → not unique, validation: `string|nullable|max:500`
    - `slug` → unique, validation: `string|required|min:3`

**Code (excerpt):**
```php
$rules = ['slug' => 'required|string'];

$this->renderTranslationFiled(
    $rules,
    $payload,
    $schema,
    \App\Models\Post::class,
    'title',
    null,
    null,
    []
);

return $rules;
```

**Expected Output (pretty‑printed):**
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

> If you require the primary field to be present, add `required` to `translation.{locale}.{primary}` in your own rule set.

---

## Example: Resulting `attributes()` Output

Using the same payload and schema, labels are built from `customField->label` (fallback to `uniqName` if not provided).

**Code (excerpt):**
```php
$attributes = ['slug' => 'Slug'];

$this->renderTranslationAttribute($attributes, $payload, $schema);

return $attributes;
```

**Expected Output (pretty‑printed):**
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

> If a label is missing, the field’s `uniqName` is used as the label text.

---

## Handling Locales

- If `translation` is present and is an object/array, its keys are treated as locales (e.g., `en`, `fa`).
- Otherwise, `app()->getLocale()` is used as the only locale to build rules and labels.

---

## Primary Field and Uniqueness

- The primary field (default `name`, or your override like `title`) is added to each locale with:
    - `string`
    - `TranslationFieldExistRule` for per‑locale uniqueness
- Add `required` yourself if your flow demands it for creates/updates.

---

## End‑to‑End Minimal Flow

1. Build a `Collection<TypeTranslation>` describing your fields:
    - `customField->params['uniqName']` (required)
    - Optional `customField->params['unique']` (bool) for uniqueness
    - Optional `customField->validation` (string) for validation rules (defaults to `string|nullable|sometimes`)
    - Optional `customField->label` for attribute labels
2. Call `renderTranslationFiled($rules, $data, $schema, $className, $primary, $objectId, $parentId, $parentWhere)` in `rules()`.
3. Call `renderTranslationAttribute($attributes, $data, $schema)` in `attributes()`.
4. Done — the validator understands `translation.{locale}.{field}` per the payload’s locales (or app locale).

---

## Related Documentation

- [HasTranslation](/packages/laravel-translation/deep-diving/has-translation) - Core trait for multilingual models
- <Link to="/packages/laravel-translation/deep-diving/translation-field-exist-rule">TranslationFieldExistRule</Link> - Validation rule for unique translations
- [TranslationArrayRequest](/packages/laravel-translation/deep-diving/requests/translation-array-request) - Simpler array-based validation
- [MultiTranslationArrayRequest](/packages/laravel-translation/deep-diving/requests/multi-translation-array-request) - Multi-locale array validation
- [MultiTranslationTypeObjectRequest](/packages/laravel-translation/deep-diving/requests/multi-translation-type-object-request) - Multi-locale Typeify validation
- [TranslationResource](/packages/laravel-translation/deep-diving/resources/translation-resource) - JSON resource for API responses

## Summary

`TranslationTypeObjectRequest` gives you **schema‑driven**, multi‑locale validation and labeling for a single `translation` object:
- Locale detection from payload or fallback to app locale
- Per‑locale primary field uniqueness via `TranslationFieldExistRule`
- Custom field validation + optional uniqueness from Typeify
- Clean attribute labels for better error messages

Use the examples above as a template to build predictable and maintainable validators for translated content.
