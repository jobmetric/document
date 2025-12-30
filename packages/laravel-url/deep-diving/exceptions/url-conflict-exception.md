---
sidebar_position: 4
sidebar_label: UrlConflictException
---

import Link from "@docusaurus/Link";

# UrlConflictException

Thrown when attempting to create a URL that already exists for another active model.

## Namespace

```php
JobMetric\Url\Exceptions\UrlConflictException
```

## Overview

This exception is thrown when:
- Another active model uses the same full URL
- The conflicting URL is active (not soft-deleted)
- Different model (type or ID)

## When It's Thrown

The exception is thrown by:

- `dispatchSlug()` - When creating a URL that conflicts
- `syncVersionedUrl()` - During URL synchronization
- `restore()` - When restoring a model with a conflicting URL
- Cascading updates - When child URLs conflict

## Example

```php
// First product
$product1 = Product::create(['name' => 'Product 1']);
$product1->dispatchSlug('my-product', 'products');
// URL: /shop/category/my-product

// Second product that would create same URL
$product2 = Product::create(['name' => 'Product 2']);
try {
    $product2->dispatchSlug('my-product', 'products');  // May throw UrlConflictException
} catch (UrlConflictException $e) {
    // Handle conflict
}
```

## Handling

```php
try {
    $product->dispatchSlug($slug, 'products');
} catch (UrlConflictException $e) {
    return back()->withErrors(['slug' => 'This URL is already in use.']);
}
```

## Error Message

The exception message is translated using `url::base.exceptions.url_conflict`:

```php
trans('url::base.exceptions.url_conflict')
```

## Prevention

Ensure `getFullUrl()` returns unique URLs for different models:

```php
public function getFullUrl(): string
{
    // Include unique identifier
    return '/shop/' . ($this->category->slug ?? 'uncategorized') . '/' . ($this->slug ?? 'product-' . $this->id);
}
```

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl Trait</Link> - Trait that throws this exception
