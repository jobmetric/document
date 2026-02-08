---
sidebar_position: 2
sidebar_label: HasServiceTranslation
---

import Link from "@docusaurus/Link";

# HasServiceTranslation Trait

The `HasServiceTranslation` trait provides **reusable translation management methods for CRUD services**. It automatically reads translatable fields from your model's `$translatables` property and provides methods to sync and normalize translation payloads.

## When to Use HasServiceTranslation

**Use `HasServiceTranslation` when you need:**

- **Service-layer translation management**: Manage translations in your service classes instead of directly in models
- **Automatic field detection**: Automatically read translatable fields from your model class
- **Payload normalization**: Normalize translation payloads for store and update operations
- **Multiple format support**: Handle both locale-keyed and single-locale translation formats
- **Default values**: Set default values for translatable fields on store operations
- **Eager loading support**: Easily ensure translations relation is loaded

**Example scenarios:**
- Building CRUD services for translatable entities
- Creating API endpoints that handle multilingual content
- Building admin panels with translation support
- Implementing bulk translation operations

## Overview

`HasServiceTranslation` is designed to work alongside the `HasTranslation` trait on models. While `HasTranslation` provides the model-level translation capabilities, `HasServiceTranslation` provides the service-level utilities for managing those translations.

## Namespace

```php
JobMetric\Translation\HasServiceTranslation
```

## Requirements

- Service must define `protected static string $modelClass` pointing to a model
- The model must use the `HasTranslation` trait
- The model must define `protected array $translatables`

## Quick Start

Add the trait to your service class:

```php
<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use JobMetric\PackageCore\Services\AbstractCrudService;
use JobMetric\Translation\HasServiceTranslation;

class ProductService extends AbstractCrudService
{
    use HasServiceTranslation;

    protected static string $modelClass = Product::class;

    /**
     * Hook called after storing a model.
     */
    protected function afterStore(Model $model, array &$data): void
    {
        $this->syncTranslations($model, $data['translation'] ?? null, false);
    }

    /**
     * Hook called after updating a model.
     */
    protected function afterUpdate(Model $model, array &$data): void
    {
        if (array_key_exists('translation', $data)) {
            $this->syncTranslations($model, $data['translation'], true);
        }
    }
}
```

## Configuration Properties

### `$translationDefaults`

Set default values for translatable fields during store operations. This is useful when you want certain fields to have default values if not provided.

```php
class ProductService extends AbstractCrudService
{
    use HasServiceTranslation;

    protected static string $modelClass = Product::class;

    public function __construct()
    {
        parent::__construct();

        // Set default values for translatable fields
        $this->translationDefaults = [
            'status' => 'draft',
            'position' => 'left',
        ];
    }
}
```

:::warning Important
Do not override `$translationDefaults` as a class property directly, as it will conflict with the trait's property. Instead, set it in the constructor.
:::

## Available Methods

### `getTranslatableFields()`

Returns the translatable fields defined in the model. Results are cached statically per model class for performance.

```php
protected function getTranslatableFields(): array
```

**Returns:** Array of translatable field names, or empty array if wildcard `['*']` is defined.

**Example:**
```php
$fields = $this->getTranslatableFields();
// Returns: ['name', 'description', 'summary']
```

---

### `ensureTranslationsRelation()`

Ensures the `translations` relation is present in an eager-load array. This is useful when building queries.

```php
protected function ensureTranslationsRelation(array $with): array
```

**Parameters:**
- `$with` - Array of relations to eager-load

**Returns:** The array with `translations` added if not already present.

**Example:**
```php
$with = $this->ensureTranslationsRelation(['category', 'tags']);
// Returns: ['category', 'tags', 'translations']

$with = $this->ensureTranslationsRelation(['translations', 'category']);
// Returns: ['translations', 'category'] (no duplicate)
```

---

### `syncTranslations()`

Upserts translations for a model. Supports both locale-keyed and single-locale formats.

```php
protected function syncTranslations(Model $model, mixed $translation, bool $isUpdate): void
```

**Parameters:**
- `$model` - The Eloquent model instance
- `$translation` - Translation data (array or null)
- `$isUpdate` - True for update operations, false for store operations

**Supported Formats:**

**Locale-keyed format:**
```php
$this->syncTranslations($product, [
    'en' => ['name' => 'Product Name', 'description' => 'Description'],
    'fa' => ['name' => 'نام محصول', 'description' => 'توضیحات'],
], false);
```

**Single-locale (legacy) format:**
```php
// Uses current application locale
$this->syncTranslations($product, [
    'name' => 'Product Name',
    'description' => 'Description',
], false);
```

---

### `normalizeTranslationPayload()`

Normalizes translation input into a payload suitable for the model's `translate()` method.

```php
protected function normalizeTranslationPayload(array $fields, bool $isUpdate): array
```

**Parameters:**
- `$fields` - Input fields from the request
- `$isUpdate` - True for update, false for store

**Behavior:**
- **On store (`$isUpdate = false`)**: Includes all translatable fields with defaults
- **On update (`$isUpdate = true`)**: Only includes fields that are present in input

**Example:**
```php
// Model has translatables: ['name', 'description', 'status']
// Defaults: ['status' => 'draft']

// On store
$payload = $this->normalizeTranslationPayload(['name' => 'Test'], false);
// Returns: ['name' => 'Test', 'description' => null, 'status' => 'draft']

// On update
$payload = $this->normalizeTranslationPayload(['name' => 'Updated'], true);
// Returns: ['name' => 'Updated']
```

---

### `setTranslationDefaults()`

Dynamically set default values for translatable fields.

```php
public function setTranslationDefaults(array $defaults): static
```

**Parameters:**
- `$defaults` - Associative array of field => default value

**Returns:** The service instance (fluent interface)

**Example:**
```php
$service->setTranslationDefaults([
    'status' => 'active',
    'position' => 'right',
])->store($data);
```

---

### `getTranslationDefault()`

Get the default value for a specific translatable field.

```php
protected function getTranslationDefault(string $field): mixed
```

**Parameters:**
- `$field` - Field name

**Returns:** The default value or null if not set.

---

### `clearTranslatableFieldsCache()`

Clears the static cache for translatable fields. Useful for testing or when model configuration changes at runtime.

```php
public static function clearTranslatableFieldsCache(): void
```

**Example:**
```php
ProductService::clearTranslatableFieldsCache();
```

## Complete Example

Here's a complete example of a service using `HasServiceTranslation`:

```php
<?php

namespace JobMetric\UnitConverter;

use Illuminate\Database\Eloquent\Model;
use JobMetric\PackageCore\Services\AbstractCrudService;
use JobMetric\Translation\HasServiceTranslation;
use JobMetric\UnitConverter\Models\Unit;
use JobMetric\UnitConverter\Http\Resources\UnitResource;

class UnitConverter extends AbstractCrudService
{
    use HasServiceTranslation;

    protected string $entityName = 'unit::base.entity_names.unit';

    protected static string $modelClass = Unit::class;
    protected static string $resourceClass = UnitResource::class;

    public function __construct()
    {
        parent::__construct();

        // Set default for 'position' field
        $this->translationDefaults = [
            'position' => 'left',
        ];
    }

    /**
     * Store hook: sync translations after creating the model.
     */
    protected function afterStore(Model $model, array &$data): void
    {
        $this->syncTranslations($model, $data['translation'] ?? null, false);
    }

    /**
     * Update hook: sync translations if provided.
     */
    protected function afterUpdate(Model $model, array &$data): void
    {
        if (array_key_exists('translation', $data)) {
            $this->syncTranslations($model, $data['translation'], true);
        }
    }

    /**
     * Query hook: ensure translations are always eager-loaded.
     */
    protected function afterQuery($qb, array $filters, array &$with, ?string $mode): void
    {
        $with = $this->ensureTranslationsRelation($with);
    }

    /**
     * Show hook: ensure translations are loaded for single item.
     */
    protected function afterShow(Model $model, array &$with): void
    {
        $with = $this->ensureTranslationsRelation($with);
    }
}
```

## Format Detection

The trait automatically detects whether the translation input is in locale-keyed format or single-locale format:

**Locale-keyed format** is detected when:
- The first key is a string with 2-5 characters (like locale codes: `en`, `fa`, `ar`, `zh-CN`)
- The first value is an array
- The first key is not a translatable field name

**Single-locale format** is assumed otherwise, and the current application locale is used.

```php
// Locale-keyed (detected automatically)
[
    'en' => ['name' => 'English Name'],
    'fa' => ['name' => 'نام فارسی'],
]

// Single-locale (uses app()->getLocale())
[
    'name' => 'Product Name',
    'description' => 'Description',
]
```

## Caching

Translatable fields are cached statically per model class. This means:

- Fields are only resolved once per request, regardless of how many service instances are created
- Cache is shared across all instances of the same service
- Use `clearTranslatableFieldsCache()` to clear the cache if needed

## Best Practices

1. **Always call parent constructor** when overriding the constructor
2. **Set defaults in constructor**, not as class property
3. **Use `array_key_exists`** when checking for translation in update operations
4. **Ensure translations relation** in query hooks for consistent eager loading

## See Also

- <Link to="./has-translation">HasTranslation Trait</Link> - Model-level translation trait
- <Link to="./events">Translation Events</Link> - Events fired during translation operations

