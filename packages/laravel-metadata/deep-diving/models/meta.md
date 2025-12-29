---
sidebar_position: 1
sidebar_label: Meta
---

import Link from "@docusaurus/Link";

# Meta Model

The `Meta` model represents a key-value metadata entry associated with any Eloquent model via a polymorphic relation. It stores arbitrary metadata for models such as posts, products, users, etc., allowing extensibility without altering their main table.

## Namespace

```php
JobMetric\Metadata\Models\Meta
```

## Overview

The `Meta` model is designed to store arbitrary metadata for models via a polymorphic relationship. It supports complex data types by marking values as JSON-encoded and provides a clean API for querying metadata.

## Table Structure

The `metas` table has the following structure:

- `id` - Primary key
- `metaable_type` - Model class name (polymorphic)
- `metaable_id` - Model ID (polymorphic)
- `key` - Metadata key (indexed)
- `value` - Metadata value (text, nullable)
- `is_json` - Boolean flag indicating if value is JSON
- `created_at` - Timestamp
- `updated_at` - Timestamp
- Unique index on `(metaable_type, metaable_id, key)`

## Relationships

### Metaable (Polymorphic)

Get the parent model that owns this metadata:

```php
$meta = Meta::find(1);
$product = $meta->metaable;
// => Product model instance
```

**Returns:** `MorphTo` - Polymorphic relationship

## Available Methods

### Query Scopes

The model provides query scopes for common operations:

```php
// Filter by metaable type
Meta::whereMetaableType(Product::class)->get();

// Filter by metaable ID
Meta::whereMetaableId(1)->get();

// Filter by key
Meta::whereKey('color')->get();

// Filter by value
Meta::whereValue('red')->get();

// Filter by JSON flag
Meta::whereIsJson(true)->get();
```

## Direct Usage

While you typically interact with metadata through the `HasMeta` trait, you can also work with the `Meta` model directly:

```php
use JobMetric\Metadata\Models\Meta;

// Create metadata directly
$meta = Meta::create([
    'metaable_type' => Product::class,
    'metaable_id' => 1,
    'key' => 'color',
    'value' => 'red',
    'is_json' => false,
]);

// Query metadata
$colorMetas = Meta::where('key', 'color')->get();

// Find metadata for a specific model
$productMetas = Meta::where('metaable_type', Product::class)
    ->where('metaable_id', 1)
    ->get();
```

## JSON Values

When storing arrays or objects, the value is automatically JSON-encoded and `is_json` is set to `true`:

```php
$meta = Meta::create([
    'metaable_type' => Product::class,
    'metaable_id' => 1,
    'key' => 'dimensions',
    'value' => json_encode(['width' => 10, 'height' => 20]),
    'is_json' => true,
]);

// When retrieving, decode if needed
$dimensions = $meta->is_json 
    ? json_decode($meta->value, true) 
    : $meta->value;
```

## Related Documentation

- <Link to="/packages/laravel-metadata/deep-diving/has-meta">HasMeta Trait</Link>
- <Link to="/packages/laravel-metadata/deep-diving/resources/metadata-resource">MetadataResource</Link>

