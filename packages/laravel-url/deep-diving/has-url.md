---
sidebar_position: 1
sidebar_label: HasUrl
---

import Link from "@docusaurus/Link";

# HasUrl Trait

The `HasUrl` trait is the **core foundation** of Laravel URL package, providing powerful URL and slug management capabilities for your Eloquent models. It enables automatic URL versioning, intelligent conflict detection, cascading URL updates, and comprehensive slug management with collections.

## When to Use HasUrl

**Use `HasUrl` when you need:**

- **SEO-friendly URLs**: Create and manage clean, readable URLs for your models
- **Automatic URL versioning**: Track complete URL history for SEO redirects
- **Hierarchical URLs**: Build URLs that depend on parent models (e.g., category/product)
- **Conflict detection**: Ensure global uniqueness for active URLs
- **Cascading updates**: Automatically update child URLs when parent slugs change
- **Slug management**: Organize slugs with collections and handle soft deletes gracefully

**Example scenarios:**
- E-commerce products with category-based URLs (`/shop/category/product`)
- Blog posts with category and tag URLs (`/blog/category/post-slug`)
- CMS pages with hierarchical structures (`/about/team/member`)
- News articles with section-based URLs (`/news/politics/article`)
- Documentation pages with nested paths (`/docs/getting-started/installation`)
- Real estate listings with location-based URLs (`/properties/city/listing`)

## Overview

`HasUrl` transforms any Eloquent model into a URL-capable entity, allowing you to:

- **Manage slugs** - One slug per model with optional collection grouping
- **Version URLs** - Automatic versioning tracks complete URL history
- **Detect conflicts** - Global uniqueness enforcement for active URLs
- **Cascade updates** - Automatically update child URLs when parents change
- **Handle soft deletes** - Graceful conflict checking on restore
- **Rebuild URLs** - Bulk URL resynchronization for migrations

## Namespace

```php
JobMetric\Url\HasUrl
```

## Quick Start

Add the trait to your model and implement `UrlContract`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use JobMetric\Url\Contracts\UrlContract;
use JobMetric\Url\HasUrl;

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

// Create and assign slug
$product = Product::create(['name' => 'MacBook Pro 14']);
$product->dispatchSlug('macbook-pro-14', 'products');

// Access slug and URL
$product->slug;                    // "macbook-pro-14"
$product->getActiveFullUrl();     // "/shop/laptops/macbook-pro-14"
```

## Requirements

Your model **must** implement the `UrlContract` interface:

```php
use JobMetric\Url\Contracts\UrlContract;

class Product extends Model implements UrlContract
{
    use HasUrl;

    public function getFullUrl(): string
    {
        return '/shop/' . ($this->slug ?? 'product-' . $this->id);
    }
}
```

## Assigning Slugs

### Using `dispatchSlug()`

The primary method for assigning or updating slugs:

```php
// Assign slug with collection
$product->dispatchSlug('macbook-pro-14', 'products');

// Assign slug without collection (uses default)
$product->dispatchSlug('macbook-pro-14');

// Update slug
$product->dispatchSlug('mbp-14', 'products');
```

**What happens:**
1. Slug is normalized (slugified, trimmed, limited to 100 chars)
2. Collection is resolved (explicit → `getSlugCollectionDefault()` → `type` attribute → `null`)
3. Conflict check ensures no active slug conflict
4. Slug row is upserted (one slug per model)
5. Full URL is synchronized and versioned

### Using Virtual Attributes

You can also assign slugs via model attributes:

```php
$product = Product::create([
    'name' => 'MacBook Pro 14',
    'slug' => 'macbook-pro-14',
    'slug_collection' => 'products',
]);

// Slug is automatically assigned during save
```

## Reading Slugs

### Accessors

```php
// Slug string (default collection)
$product->slug;                 // "macbook-pro-14"

// SlugResource (default collection)
$product->slug_resource;        // SlugResource instance

// Collection name
$product->slug_collection;      // "products"
```

### Methods

```php
// Get slug resource (default collection)
$result = $product->slug();
// Returns: ['ok' => true, 'data' => SlugResource]

// Get slug by collection
$result = $product->slugByCollection('products');
// Returns: ['ok' => true, 'data' => SlugResource]

// Get slug string by collection
$slug = $product->slugByCollection('products', true);
// Returns: "macbook-pro-14"
```

### Finding Models by Slug

```php
// Find by slug (any collection)
$product = Product::findBySlug('macbook-pro-14');

// Find by slug (or throw)
$product = Product::findBySlugOrFail('macbook-pro-14');

// Find by slug and collection
$product = Product::findBySlugAndCollection('macbook-pro-14', 'products');

// Find by slug and collection (or throw)
$product = Product::findBySlugAndCollectionOrFail('macbook-pro-14', 'products');
```

## Collections

Collections allow you to organize slugs by context:

```php
// Assign to specific collection
$product->dispatchSlug('mbp-14', 'products');

// Assign to different collection
$product->dispatchSlug('mbp-14', 'featured-products');
```

### Collection Resolution

The collection is resolved in this order:
1. Explicit collection parameter
2. `getSlugCollectionDefault()` method
3. Model's `type` attribute
4. `null`

### Custom Default Collection

```php
class Product extends Model implements UrlContract
{
    use HasUrl;

    public function getSlugCollectionDefault(): ?string
    {
        return 'products';
    }
}
```

## URL Versioning

The trait automatically manages versioned URLs:

### How It Works

1. **First URL**: Creates version `1` when first assigned
2. **URL Change**: Soft-deletes previous active URL, creates new version
3. **No Change**: Updates collection if changed, no new version
4. **Conflict Check**: Ensures global uniqueness for active URLs
5. **Event Firing**: Dispatches `UrlChanged` event on create/change

### Reading URLs

```php
// Current active full URL
$url = $product->getActiveFullUrl();  // "/shop/laptops/macbook-pro-14"

// Full URL history (active + trashed)
$history = $product->urlHistory();  // Collection of Url models

// Only active URLs
$active = $product->urlHistory(withTrashed: false);
```

### URL Resolution

```php
// Resolve active model by full URL (static)
$model = Product::resolveActiveByFullUrl('/shop/laptops/macbook-pro-14');

// Resolve redirect target for old URL
$target = Product::resolveRedirectTarget('/shop/old-path');
// Returns current active URL or null
```

## Cascading URL Updates

When a parent model's slug changes, child URLs can automatically update:

### Implementing Cascading

```php
class Category extends Model implements UrlContract
{
    use HasUrl;

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function getFullUrl(): string
    {
        return '/shop/' . ($this->slug ?? 'uncategorized');
    }

    // Return children that need URL refresh
    public function getUrlDescendants(): iterable
    {
        return $this->products;  // Must implement UrlContract
    }
}

class Product extends Model implements UrlContract
{
    use HasUrl;

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getFullUrl(): string
    {
        $categorySlug = $this->category->slug ?? 'uncategorized';
        return "/shop/{$categorySlug}/{$this->slug}";
    }
}

// Change category slug → all products get new URLs
$category->dispatchSlug('computers');
// Product URLs automatically update from /shop/laptops/... to /shop/computers/...
```

### Disabling Cascade

```php
$category->withoutUrlCascade(function () use ($category) {
    // Slug change without touching descendants
    $category->dispatchSlug('new-category-slug');
});
```

## Soft Delete and Restore

### Soft Delete

When a model is soft-deleted:
- Slug row is soft-deleted
- All active URL rows are soft-deleted
- No model claims the path anymore

```php
$product->delete();  // Soft delete
```

### Restore

When restoring:
- Slug conflict is checked (same type & collection)
- Slug row is restored
- URL is resynced
- Full URL conflict is checked (throws `UrlConflictException` if conflict)

```php
$product->restore();  // May throw SlugConflictException or UrlConflictException
```

### Force Delete

Permanently removes slug and all URL history:

```php
$product->forceDelete();
```

## Bulk Operations

### Rebuilding URLs

Rebuild URLs for all records (useful after changing `getFullUrl()` logic):

```php
// Rebuild all products
Product::rebuildAllUrls();

// Rebuild with query filter
Product::rebuildAllUrls(function ($query) {
    $query->where('status', 'published');
}, chunk: 1000);
```

**Note:** This does not trigger `saved()` hooks or cascades—it directly resyncs URLs.

## Conflict Detection

### Slug Conflicts

The trait checks for slug conflicts before assigning:

```php
// Throws SlugConflictException if another Product uses same slug in same collection
$product->dispatchSlug('existing-slug', 'products');
```

**Conflict Rules:**
- Same model type
- Same slug
- Same collection (or both null)
- Active (not soft-deleted)
- Different model ID

### URL Conflicts

The trait checks for full URL conflicts before creating:

```php
// Throws UrlConflictException if another active model uses same full URL
$product->dispatchSlug('conflicting-slug');
```

**Conflict Rules:**
- Same full URL
- Active (not soft-deleted)
- Different model (type or ID)

## Removing Slugs

```php
// Remove slug (any collection)
$product->forgetSlug();

// Remove slug (specific collection)
$product->forgetSlug('products');
```

## Real-World Examples

### Example 1: E-Commerce Product

```php
class Category extends Model implements UrlContract
{
    use HasUrl;

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function getFullUrl(): string
    {
        return '/shop/' . ($this->slug ?? 'uncategorized');
    }

    public function getUrlDescendants(): iterable
    {
        return $this->products;
    }
}

class Product extends Model implements UrlContract
{
    use HasUrl;

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getFullUrl(): string
    {
        $categorySlug = $this->category->slug ?? 'uncategorized';
        return "/shop/{$categorySlug}/{$this->slug}";
    }
}

// Create category
$category = Category::create(['name' => 'Laptops']);
$category->dispatchSlug('laptops', 'categories');

// Create product
$product = Product::create(['name' => 'MacBook Pro 14']);
$product->dispatchSlug('macbook-pro-14', 'products');

// Product URL: /shop/laptops/macbook-pro-14

// Change category slug
$category->dispatchSlug('computers', 'categories');
// Product URLs automatically update to: /shop/computers/macbook-pro-14
// Old URL redirects with 301
```

### Example 2: Blog Post with Category

```php
class Category extends Model implements UrlContract
{
    use HasUrl;

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function getFullUrl(): string
    {
        return '/blog/' . ($this->slug ?? 'uncategorized');
    }

    public function getUrlDescendants(): iterable
    {
        return $this->posts;
    }
}

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

// Create post
$post = Post::create(['title' => 'Getting Started with Laravel']);
$post->dispatchSlug('getting-started-with-laravel', 'posts');

// URL: /blog/laravel/getting-started-with-laravel

// Update slug
$post->dispatchSlug('laravel-beginners-guide', 'posts');
// New URL: /blog/laravel/laravel-beginners-guide
// Old URL redirects with 301
```

### Example 3: Handling Conflicts

```php
try {
    $product->dispatchSlug('existing-slug', 'products');
} catch (\JobMetric\Url\Exceptions\SlugConflictException $e) {
    return back()->withErrors(['slug' => 'This slug is already taken.']);
}

try {
    $product->dispatchSlug('conflicting-slug');
} catch (\JobMetric\Url\Exceptions\UrlConflictException $e) {
    return back()->withErrors(['slug' => 'This URL is already in use.']);
}
```

### Example 4: Using Collections

```php
// Products in different collections
$product->dispatchSlug('mbp-14', 'products');
$product->dispatchSlug('mbp-14', 'featured-products');

// Find by collection
$product = Product::findBySlugAndCollection('mbp-14', 'products');
```

### Example 5: URL History and Redirects

```php
// Get URL history
$history = $product->urlHistory();

foreach ($history as $url) {
    echo $url->full_url . ' (version ' . $url->version . ')' . PHP_EOL;
}

// Resolve redirect target
$target = Product::resolveRedirectTarget('/shop/old-path');
if ($target) {
    return redirect($target, 301);
}
```

### Example 6: Rebuilding URLs

```php
// After changing getFullUrl() logic, rebuild all URLs
Product::rebuildAllUrls(function ($query) {
    $query->where('status', 'published');
}, chunk: 500);
```

## Method Reference

### Slug Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `dispatchSlug(?string $slug, ?string $collection = null)` | Assign or update slug | `array{ok: bool, data?: SlugResource}` |
| `forgetSlug(?string $collection = null)` | Remove slug | `array{ok: bool}` |
| `slug()` | Get slug resource (default collection) | `array{ok: bool, data?: SlugResource}` |
| `slugByCollection(?string $collection, bool $mode = false)` | Get slug by collection | `array\|string\|null` |
| `getSlug()` | Get slug string | `string\|null` |
| `$model->slug` | Accessor for slug | `string\|null` |
| `$model->slug_resource` | Accessor for SlugResource | `SlugResource\|null` |
| `$model->slug_collection` | Accessor for collection | `string\|null` |

### URL Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getActiveFullUrl()` | Get current active full URL | `string\|null` |
| `urlHistory(bool $withTrashed = true)` | Get URL history | `Collection<Url>` |

### Static Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `findBySlug(string $slug)` | Find by slug (any collection) | `Model\|null` |
| `findBySlugOrFail(string $slug)` | Find by slug (or throw) | `Model` |
| `findBySlugAndCollection(string $slug, ?string $collection)` | Find by slug and collection | `Model\|null` |
| `findBySlugAndCollectionOrFail(string $slug, ?string $collection)` | Find by slug and collection (or throw) | `Model` |
| `rebuildAllUrls(?callable $queryHook, int $chunk = 500)` | Rebuild URLs for all records | `void` |
| `resolveActiveByFullUrl(string $fullUrl)` | Resolve model by full URL | `Model\|null` |
| `resolveRedirectTarget(string $fullUrl)` | Resolve redirect target | `string\|null` |

### Cascade Control

| Method | Description | Returns |
|--------|-------------|---------|
| `withoutUrlCascade(callable $fn)` | Disable cascade in callback | `mixed` |
| `getUrlDescendants(): iterable` | Return children for cascade | `iterable<Model>` |

## Best Practices

### 1. Always Implement UrlContract

```php
// Good: Implements UrlContract
class Product extends Model implements UrlContract
{
    use HasUrl;
    // ...
}

// Bad: Missing UrlContract
class Product extends Model
{
    use HasUrl;  // Will throw ModelUrlContractNotFoundException
}
```

### 2. Make getFullUrl() Deterministic

```php
// Good: Deterministic, no side effects
public function getFullUrl(): string
{
    return '/shop/' . ($this->category->slug ?? 'uncategorized') . '/' . ($this->slug ?? 'product-' . $this->id);
}

// Bad: Non-deterministic
public function getFullUrl(): string
{
    return '/shop/' . $this->category->slug . '/' . $this->slug . '?ref=' . time();  // Changes every call
}
```

### 3. Handle Conflicts Gracefully

```php
// Good: Handle conflicts
try {
    $product->dispatchSlug($slug, 'products');
} catch (SlugConflictException $e) {
    return back()->withErrors(['slug' => 'This slug is already taken.']);
}
```

### 4. Use Collections for Organization

```php
// Good: Use collections
$product->dispatchSlug('mbp-14', 'products');
$product->dispatchSlug('mbp-14', 'featured-products');

// Bad: No organization
$product->dispatchSlug('mbp-14');  // Harder to manage
```

### 5. Implement getUrlDescendants() for Hierarchies

```php
// Good: Cascade support
public function getUrlDescendants(): iterable
{
    return $this->products;
}

// Bad: No cascade
// Children URLs won't update when parent changes
```

## Common Mistakes

### Mistake 1: Not Implementing UrlContract

```php
// Bad: Missing interface
class Product extends Model
{
    use HasUrl;  // Throws exception
}
```

### Mistake 2: Non-Deterministic getFullUrl()

```php
// Bad: Returns different values
public function getFullUrl(): string
{
    return '/shop/' . $this->slug . '?t=' . time();
}
```

### Mistake 3: Not Handling Conflicts

```php
// Bad: No error handling
$product->dispatchSlug('existing-slug');  // May throw exception
```

### Mistake 4: Forgetting Cascade

```php
// Bad: Children URLs don't update
class Category extends Model implements UrlContract
{
    use HasUrl;
    // Missing getUrlDescendants()
}
```

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/url-contract">UrlContract</Link> - Interface for URL-capable models
- <Link to="/packages/laravel-url/deep-diving/models/slug">Slug Model</Link> - Slug model reference
- <Link to="/packages/laravel-url/deep-diving/models/url">Url Model</Link> - URL model reference
- <Link to="/packages/laravel-url/deep-diving/events">Events</Link> - URL-related events
- <Link to="/packages/laravel-url/deep-diving/slug-exist-rule">SlugExistRule</Link> - Validation rule for slugs
