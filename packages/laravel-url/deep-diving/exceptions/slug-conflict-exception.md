---
sidebar_position: 2
sidebar_label: SlugConflictException
---

import Link from "@docusaurus/Link";

# SlugConflictException

Thrown when attempting to assign a slug that already exists for another model of the same type in the same collection.

## Namespace

```php
JobMetric\Url\Exceptions\SlugConflictException
```

## Overview

This exception is thrown when:
- Another model of the same type uses the same slug
- In the same collection (or both null)
- The conflicting slug is active (not soft-deleted)

## When It's Thrown

The exception is thrown by:

- `dispatchSlug()` - When assigning a slug that conflicts
- `restore()` - When restoring a model with a conflicting slug

## Example

```php
// First product
$product1 = Product::create(['name' => 'Product 1']);
$product1->dispatchSlug('my-product', 'products');

// Second product with same slug
$product2 = Product::create(['name' => 'Product 2']);
try {
    $product2->dispatchSlug('my-product', 'products');  // Throws SlugConflictException
} catch (SlugConflictException $e) {
    // Handle conflict
}
```

## Handling

```php
try {
    $product->dispatchSlug($slug, 'products');
} catch (SlugConflictException $e) {
    return back()->withErrors(['slug' => 'This slug is already taken.']);
}
```

## Error Message

The exception message is translated using `url::base.exceptions.slug_conflict`:

```php
trans('url::base.exceptions.slug_conflict')
```

## Prevention

Use `SlugExistRule` in form requests to catch conflicts before `dispatchSlug()`:

```php
use JobMetric\Url\Rules\SlugExistRule;

public function rules(): array
{
    return [
        'slug' => [
            'required',
            'string',
            'max:100',
            new SlugExistRule(Product::class, 'products'),
        ],
    ];
}
```

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl Trait</Link> - Trait that throws this exception
- <Link to="/packages/laravel-url/deep-diving/slug-exist-rule">SlugExistRule</Link> - Validation rule to prevent conflicts
