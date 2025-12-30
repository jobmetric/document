---
sidebar_position: 2
sidebar_label: UrlContract
---

import Link from "@docusaurus/Link";

# UrlContract Interface

The `UrlContract` interface defines the contract that models must implement to use the `HasUrl` trait. It requires a single method that returns the canonical full URL for the model.

## Namespace

```php
JobMetric\Url\Contracts\UrlContract
```

## Overview

`UrlContract` ensures that models using `HasUrl` can compute their full URLs. The returned URL is used for:

- **Persistence**: Stored in the `urls` table
- **Uniqueness checks**: Global uniqueness enforcement
- **Redirects**: Legacy URL redirects to canonical URLs
- **Routing resolution**: Fallback route matching

## Interface Definition

```php
interface UrlContract
{
    public function getFullUrl(): string;
}
```

## Requirements

### Deterministic

The `getFullUrl()` method **must** be deterministic and side-effect free. It should return the same value for the same model state.

```php
// Good: Deterministic
public function getFullUrl(): string
{
    return '/shop/' . ($this->category->slug ?? 'uncategorized') . '/' . ($this->slug ?? 'product-' . $this->id);
}

// Bad: Non-deterministic
public function getFullUrl(): string
{
    return '/shop/' . $this->slug . '?t=' . time();  // Changes every call
}
```

### Length Limit

The returned URL **must** be ≤ 2000 characters (database constraint).

### Format Consistency

Choose ONE consistent format across your application:

- **Path-only** (recommended): `"category/product"`
- **Absolute**: `"https://example.com/category/product"`

**Recommended:** Use path-only without leading slash for consistency.

### Normalization

URLs should be normalized according to your URL policy:

- No trailing slashes (or consistent trailing slashes)
- Stable casing
- No query strings or fragments (canonical path only)

## Implementation Examples

### Example 1: Simple Product

```php
class Product extends Model implements UrlContract
{
    use HasUrl;

    public function getFullUrl(): string
    {
        return '/shop/' . ($this->slug ?? 'product-' . $this->id);
    }
}
```

### Example 2: Product with Category

```php
class Product extends Model implements UrlContract
{
    use HasUrl;

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getFullUrl(): string
    {
        $categorySlug = optional($this->category)->slug ?? 'uncategorized';
        $productSlug = $this->slug ?? 'product-' . $this->id;
        return "/shop/{$categorySlug}/{$productSlug}";
    }
}
```

### Example 3: Hierarchical Pages

```php
class Page extends Model implements UrlContract
{
    use HasUrl;

    public function parent()
    {
        return $this->belongsTo(Page::class, 'parent_id');
    }

    public function getFullUrl(): string
    {
        $segments = [];
        $page = $this;

        while ($page) {
            array_unshift($segments, $page->slug ?? 'page-' . $page->id);
            $page = $page->parent;
        }

        return '/' . implode('/', $segments);
    }
}
```

### Example 4: Blog Post with Category

```php
class Post extends Model implements UrlContract
{
    use HasUrl;

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getFullUrl(): string
    {
        $categorySlug = $this->category->slug ?? 'uncategorized';
        $postSlug = $this->slug ?? 'post-' . $this->id;
        return "/blog/{$categorySlug}/{$postSlug}";
    }
}
```

## Best Practices

### 1. Handle Missing Slugs

Always provide a fallback when slug might be null:

```php
// Good: Fallback provided
return '/shop/' . ($this->slug ?? 'product-' . $this->id);

// Bad: May return null
return '/shop/' . $this->slug;
```

### 2. Use Optional Relationships

Use `optional()` or null coalescing for relationships:

```php
// Good: Safe relationship access
$categorySlug = optional($this->category)->slug ?? 'uncategorized';

// Bad: May throw exception
$categorySlug = $this->category->slug;
```

### 3. Keep It Simple

Avoid complex logic in `getFullUrl()`:

```php
// Good: Simple and clear
public function getFullUrl(): string
{
    return '/shop/' . ($this->slug ?? 'product-' . $this->id);
}

// Bad: Too complex
public function getFullUrl(): string
{
    $base = config('app.url');
    $locale = app()->getLocale();
    $category = $this->category ? $this->category->slug : 'uncategorized';
    $product = $this->slug ?? 'product-' . $this->id;
    return "{$base}/{$locale}/shop/{$category}/{$product}";
}
```

## Common Mistakes

### Mistake 1: Non-Deterministic URLs

```php
// Bad: Changes every call
public function getFullUrl(): string
{
    return '/shop/' . $this->slug . '?ref=' . time();
}
```

### Mistake 2: Missing Fallbacks

```php
// Bad: May return null
public function getFullUrl(): string
{
    return '/shop/' . $this->slug;
}
```

### Mistake 3: Including Query Strings

```php
// Bad: Query strings should not be in canonical URL
public function getFullUrl(): string
{
    return '/shop/' . $this->slug . '?utm_source=email';
}
```

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl Trait</Link> - Core trait that uses this interface
- <Link to="/packages/laravel-url/deep-diving/models/url">Url Model</Link> - Model that stores full URLs

