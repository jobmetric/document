---
sidebar_position: 1
sidebar_label: TranslationResource
---

# TranslationResource

`TranslationResource` is a lightweight JSON resource for serializing a **single translation row**. It provides toggles to include or exclude version, timestamps, and soft‑deletion metadata, so your API can shape output per use case without custom transformers.

## Use Cases

**Use `TranslationResource` when you need:**

- **Single translation row serialization**: Return a single translation record in API responses
- **Flexible metadata control**: Toggle version, timestamps, and soft-deletion metadata as needed
- **API consistency**: Standardize translation output format across your API endpoints
- **Version history display**: Show translation version information in API responses
- **Audit and tracking**: Include timestamps and deletion status for translation records
- **Lightweight responses**: Return minimal translation data without unnecessary metadata

**Example scenarios:**
- API endpoints returning a specific translation field for a model
- Translation management interfaces showing individual translation records
- Version history APIs displaying specific translation versions
- Audit logs showing translation changes with timestamps
- Translation detail pages in admin panels
- Single translation retrieval endpoints

> This guide focuses on usage and outputs. No tests or database details are discussed.

---

## Constructor

```php
use JobMetric\Translation\Http\Resources\TranslationResource;

// Wrap a single Translation model (or any object exposing the needed properties)
return new TranslationResource($translationRow);
```

If the underlying resource is `null`, the resource returns an **empty array** (`[]`).

---

## Default Behavior

By default:
- `version` **is included** (if present on the resource)
- `created_at` and `updated_at` are **excluded**
- `deleted_at` is **excluded**

You can change these with chainable methods:
- `withVersion(bool $with = true)`
- `withTimestamps(bool $with = true)`
- `withDeletedAt(bool $with = true)`

---

## Output Shape

Base fields (always present if available on the resource):
- `translatable_type`
- `translatable_id`
- `locale`
- `field`
- `value`

Optional fields (based on toggles and availability):
- `version` (integer)
- `created_at` (string datetime)
- `updated_at` (string datetime)
- `deleted_at` (string datetime or `null`)

---

## Examples

### 1) Default Output (version included, timestamps & deleted_at excluded)

**Usage:**
```php
return new TranslationResource($translation);
```

**Expected Output:**
```json
{
  "translatable_type": "App\\Models\\Post",
  "translatable_id": 42,
  "locale": "fa",
  "field": "title",
  "value": "تیتر فارسی",
  "version": 3
}
```

---

### 2) Exclude Version

**Usage:**
```php
return (new TranslationResource($translation))
    ->withVersion(false);
```

**Expected Output:**
```json
{
  "translatable_type": "App\\Models\\Post",
  "translatable_id": 42,
  "locale": "fa",
  "field": "title",
  "value": "تیتر فارسی"
}
```

---

### 3) Include Timestamps

**Usage:**
```php
return (new TranslationResource($translation))
    ->withTimestamps();
```

**Expected Output:**
```json
{
  "translatable_type": "App\\Models\\Post",
  "translatable_id": 42,
  "locale": "fa",
  "field": "title",
  "value": "تیتر فارسی",
  "version": 3,
  "created_at": "2025-08-10 12:00:00",
  "updated_at": "2025-08-12 09:15:30"
}
```

---

### 4) Include Soft‑Deletion Metadata

**Usage:**
```php
return (new TranslationResource($translation))
    ->withDeletedAt();
```

**Expected Output (soft‑deleted row example):**
```json
{
  "translatable_type": "App\\Models\\Post",
  "translatable_id": 42,
  "locale": "fa",
  "field": "summary",
  "value": "خلاصه قدیمی",
  "version": 2,
  "deleted_at": "2025-08-10 12:34:56"
}
```

**Expected Output (active row example):**
```json
{
  "translatable_type": "App\\Models\\Post",
  "translatable_id": 42,
  "locale": "fa",
  "field": "summary",
  "value": "خلاصه جدید",
  "version": 3,
  "deleted_at": null
}
```

---

### 5) Full Metadata (Version + Timestamps + DeletedAt)

**Usage:**
```php
return (new TranslationResource($translation))
    ->withVersion()
    ->withTimestamps()
    ->withDeletedAt();
```

**Expected Output:**
```json
{
  "translatable_type": "App\\Models\\Post",
  "translatable_id": 42,
  "locale": "fa",
  "field": "title",
  "value": "تیتر فارسی",
  "version": 3,
  "created_at": "2025-08-10 12:00:00",
  "updated_at": "2025-08-12 09:15:30",
  "deleted_at": null
}
```

---

## Chaining Patterns

- Minimal:
  ```php
  new TranslationResource($row);
  ```

- Without version:
  ```php
  (new TranslationResource($row))->withVersion(false);
  ```

- All metadata:
  ```php
  (new TranslationResource($row))->withTimestamps()->withDeletedAt();
  ```

- Custom combination:
  ```php
  (new TranslationResource($row))->withVersion(false)->withDeletedAt();
  ```

---

## Edge Cases

- **Null resource** → `[]`
- **Missing `version` property** on the resource while `withVersion(true)` is used → `version` is simply omitted.
- **Missing `created_at`/`updated_at`/`deleted_at`** on the resource → the corresponding fields are omitted (or `null` if accessors return null).

---

## Summary

`TranslationResource` gives you a small, reliable surface to serialize a single translation row. Toggle version, timestamps, and soft‑deletion data as needed, keep your controllers lean, and your API responses consistent.

## Related Documentation

- [HasTranslation](/packages/laravel-translation/deep-diving/has-translation) - Core trait for multilingual models
- [TranslationCollectionResource](/packages/laravel-translation/deep-diving/resources/translation-collection-resource) - JSON resource for translation collections
- [TranslationArrayRequest](/packages/laravel-translation/deep-diving/requests/translation-array-request) - Form request for array-based translations
- [TranslationTypeObjectRequest](/packages/laravel-translation/deep-diving/requests/translation-type-object-request) - Form request for Typeify-based translations
- [Events](/packages/laravel-translation/deep-diving/events) - Translation events system
