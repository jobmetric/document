---
sidebar_position: 2
sidebar_label: Url
---

import Link from "@docusaurus/Link";

# Url Model

The `Url` model represents a versioned full URL entry associated with any Eloquent model via a polymorphic relation. It tracks the complete history of URLs for SEO-friendly redirects.

## Namespace

```php
JobMetric\Url\Models\Url
```

## Overview

The `Url` model stores:
- **Full URL**: The complete canonical URL path
- **Version**: Version number for tracking history
- **Collection**: Optional grouping (inherited from slug)
- **Polymorphic relation**: Links to any model using `HasUrl`

## Properties

### Urlable Type

```php
public string $urlable_type;
```

Model class name (polymorphic).

### Urlable ID

```php
public int $urlable_id;
```

Model ID (polymorphic).

### Full URL

```php
public string $full_url;
```

Complete canonical URL (max 2000 chars).

### Collection

```php
public string|null $collection;
```

Optional collection name (inherited from slug).

### Version

```php
public int $version;
```

Version number (starts at 1, increments on URL changes).

## Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | int | Primary key |
| `urlable_type` | string | Model class name (polymorphic) |
| `urlable_id` | int | Model ID (polymorphic) |
| `full_url` | string | Complete canonical URL (max 2000 chars) |
| `collection` | string\|null | Optional collection name |
| `version` | int | Version number (starts at 1) |
| `deleted_at` | timestamp\|null | Soft delete timestamp |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Update timestamp |

## Relationships

### urlable (MorphTo)

Polymorphic relation to the model that owns this URL:

```php
$url = Url::find(1);
$model = $url->urlable;  // Product, Category, etc.
```

## Query Scopes

### active()

Returns only active (non-deleted) URLs:

```php
Url::active()->get();
```

### ofUrlable(string $type, int $id)

Filter by urlable type and ID:

```php
Url::ofUrlable(Product::class, 1)->get();
```

### whereCollection(?string $collection)

Filter by collection (NULL-safe):

```php
Url::whereCollection('products')->get();
```

## Accessors

### urlable_resource

Returns the resource representation of the urlable model (via `UrlableResourceEvent`):

```php
$url = Url::find(1);
$resource = $url->urlable_resource;  // Resource from event listeners
```

## Static Methods

### resolveActiveByFullUrl(string $fullUrl)

Resolve the active model that currently owns a given full URL:

```php
$model = Url::resolveActiveByFullUrl('/shop/laptops/macbook-pro-14');
// Returns Product instance or null
```

**Parameters:**
- `$fullUrl` (string): The full URL to resolve

**Returns:** `Model|null` - The model instance or null if not found

### resolveRedirectTarget(string $fullUrl)

Resolve redirect target for a legacy URL:

```php
$target = Url::resolveRedirectTarget('/shop/old-path');
// Returns current active URL or null
```

**Parameters:**
- `$fullUrl` (string): The legacy URL to resolve

**Returns:** `string|null` - The current active URL or null if not found

## Complete Examples

### Finding URLs

```php
// Find by urlable
$urls = Url::ofUrlable(Product::class, 1)->get();

// Find active URLs
$active = Url::active()->get();

// Find by collection
$urls = Url::whereCollection('products')->get();
```

### Accessing Related Model

```php
$url = Url::find(1);
$product = $url->urlable;  // Product instance
```

### Resolving Active Model

```php
$model = Url::resolveActiveByFullUrl('/shop/laptops/macbook-pro-14');
if ($model instanceof Product) {
    // Handle product
}
```

### Resolving Redirects

```php
$target = Url::resolveRedirectTarget('/shop/old-path');
if ($target) {
    return redirect($target, 301);
}
```

### URL History

```php
$product = Product::find(1);
$history = $product->urlHistory();

foreach ($history as $url) {
    echo $url->full_url . ' (version ' . $url->version . ')' . PHP_EOL;
}
```

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl Trait</Link> - Trait that manages URLs
- <Link to="/packages/laravel-url/deep-diving/models/slug">Slug Model</Link> - Model that stores slugs
- <Link to="/packages/laravel-url/deep-diving/events">Events</Link> - URL-related events
