---
sidebar_position: 1
sidebar_label: Slug
---

import Link from "@docusaurus/Link";

# Slug Model

The `Slug` model represents a URL slug entry associated with any Eloquent model via a polymorphic relation. Each model using `HasUrl` has exactly one slug row.

## Namespace

```php
JobMetric\Url\Models\Slug
```

## Overview

The `Slug` model stores:
- **Slug**: The URL-friendly identifier (normalized, max 100 chars)
- **Collection**: Optional grouping for organizing slugs
- **Polymorphic relation**: Links to any model using `HasUrl`

## Properties

### Slugable Type

```php
public string $slugable_type;
```

Model class name (polymorphic).

### Slugable ID

```php
public int $slugable_id;
```

Model ID (polymorphic).

### Slug

```php
public string $slug;
```

URL-friendly slug (normalized, max 100 chars).

### Collection

```php
public string|null $collection;
```

Optional collection name for organizing slugs.

## Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | int | Primary key |
| `slugable_type` | string | Model class name (polymorphic) |
| `slugable_id` | int | Model ID (polymorphic) |
| `slug` | string | URL-friendly slug (max 100 chars) |
| `collection` | string\|null | Optional collection name |
| `deleted_at` | timestamp\|null | Soft delete timestamp |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Update timestamp |

## Relationships

### slugable (MorphTo)

Polymorphic relation to the model that owns this slug:

```php
$slug = Slug::find(1);
$model = $slug->slugable;  // Product, Category, etc.
```

## Query Scopes

### active()

Returns only active (non-deleted) slugs:

```php
Slug::active()->get();
```

### ofSlugable(string $type, int $id)

Filter by slugable type and ID:

```php
Slug::ofSlugable(Product::class, 1)->first();
```

### whereCollection(?string $collection)

Filter by collection (NULL-safe):

```php
Slug::whereCollection('products')->get();
Slug::whereCollection(null)->get();  // NULL collection
```

## Accessors

### slugable_resource

Returns the resource representation of the slugable model (via `UrlableResourceEvent`):

```php
$slug = Slug::find(1);
$resource = $slug->slugable_resource;  // Resource from event listeners
```

## Complete Examples

### Finding Slugs

```php
// Find by slugable
$slug = Slug::ofSlugable(Product::class, 1)->first();

// Find active slugs
$slugs = Slug::active()->get();

// Find by collection
$slugs = Slug::whereCollection('products')->get();
```

### Accessing Related Model

```php
$slug = Slug::find(1);
$product = $slug->slugable;  // Product instance
```

### Querying with Relationships

```php
// Eager load related model
$slugs = Slug::with('slugable')->get();

// Filter by related model type
$slugs = Slug::where('slugable_type', Product::class)->get();
```

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl Trait</Link> - Trait that manages slugs
- <Link to="/packages/laravel-url/deep-diving/models/url">Url Model</Link> - Model that stores full URLs
