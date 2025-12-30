---
sidebar_position: 3
sidebar_label: SlugNotFoundException
---

import Link from "@docusaurus/Link";

# SlugNotFoundException

Thrown when attempting to find a model by slug but no matching slug exists.

## Namespace

```php
JobMetric\Url\Exceptions\SlugNotFoundException
```

## Overview

This exception is thrown by:
- `findBySlugOrFail()` - When slug doesn't exist
- `findBySlugAndCollectionOrFail()` - When slug doesn't exist in collection

## When It's Thrown

The exception is thrown when:

1. `findBySlugOrFail()` is called with a slug that doesn't exist
2. `findBySlugAndCollectionOrFail()` is called with a slug/collection that doesn't exist

## Example

```php
// Slug doesn't exist
try {
    $product = Product::findBySlugOrFail('non-existent-slug');  // Throws SlugNotFoundException
} catch (SlugNotFoundException $e) {
    // Handle not found
}
```

## Handling

```php
try {
    $product = Product::findBySlugOrFail($slug);
} catch (SlugNotFoundException $e) {
    abort(404, 'Product not found');
}
```

## Error Message

The exception message is translated using `url::base.exceptions.slug_not_found`:

```php
trans('url::base.exceptions.slug_not_found')
```

## Prevention

Use `findBySlug()` instead of `findBySlugOrFail()` if you want to handle null:

```php
$product = Product::findBySlug($slug);
if (!$product) {
    abort(404, 'Product not found');
}
```

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl Trait</Link> - Trait that throws this exception
