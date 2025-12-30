---
sidebar_position: 1
sidebar_label: SlugResource
---

import Link from "@docusaurus/Link";

# SlugResource

The `SlugResource` transforms the `Slug` model into a structured JSON resource for API responses.

## Namespace

```php
JobMetric\Url\Http\Resources\SlugResource
```

## Overview

The resource provides:

- **Structured output**: Consistent JSON format
- **ISO 8601 timestamps**: Standard datetime formatting
- **Related model**: Slugable model resource (via event)

## When to Use SlugResource

**Use `SlugResource` when you need:**

- **API responses**: Return slug data in API endpoints
- **Structured output**: Consistent JSON format for slugs
- **Related model data**: Include slugable model information
- **Timestamp formatting**: Standard ISO 8601 datetime format

**Example scenarios:**
- API endpoints returning product slugs
- Slug management interfaces
- Admin panels showing slug information
- API responses with slug details

## Resource Structure

```json
{
  "slugable_type": "App\\Models\\Product",
  "slugable_id": 1,
  "slug": "macbook-pro-14",
  "collection": "products",
  "deleted_at": null,
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z",
  "slugable": {
    // Resource from UrlableResourceEvent
  }
}
```

## Field Details

| Field | Type | Description |
|-------|------|-------------|
| `slugable_type` | string | Model class name (polymorphic) |
| `slugable_id` | int | Model ID (polymorphic) |
| `slug` | string | URL-friendly slug (max 100 chars) |
| `collection` | string\|null | Optional collection name |
| `deleted_at` | string\|null | Soft delete timestamp (ISO 8601) |
| `created_at` | string | Creation timestamp (ISO 8601) |
| `updated_at` | string | Update timestamp (ISO 8601) |
| `slugable` | mixed | Related model resource (from event) |

## Usage

### Basic Usage

```php
use JobMetric\Url\Http\Resources\SlugResource;
use JobMetric\Url\Models\Slug;

$slug = Slug::find(1);
return new SlugResource($slug);
```

### Via HasUrl Trait

```php
$product = Product::find(1);

// Accessor
$resource = $product->slug_resource;  // SlugResource instance

// Method
$result = $product->slug();
// Returns: ['ok' => true, 'data' => SlugResource]
```

### In API Responses

```php
namespace App\Http\Controllers;

use App\Models\Product;
use JobMetric\Url\Http\Resources\SlugResource;

class ProductController extends Controller
{
    public function show(Product $product)
    {
        return response()->json([
            'product' => $product->toArray(),
            'slug' => new SlugResource($product->slug_resource),
        ]);
    }
}
```

## Complete Examples

### Example 1: Single Slug Resource

```php
$slug = Slug::find(1);
return new SlugResource($slug);
```

### Example 2: Collection of Slug Resources

```php
$slugs = Slug::where('collection', 'products')->get();
return SlugResource::collection($slugs);
```

### Example 3: With Related Model

```php
// Listen to UrlableResourceEvent to provide related model resource
Event::listen(UrlableResourceEvent::class, function (UrlableResourceEvent $event) {
    if ($event->urlable instanceof Product) {
        $event->resource = new ProductResource($event->urlable);
    }
});

$slug = Slug::find(1);
return new SlugResource($slug);
// slugable field will contain ProductResource
```

### Example 4: API Endpoint

```php
Route::get('/api/products/{product}/slug', function (Product $product) {
    return new SlugResource($product->slug_resource);
});
```

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/models/slug">Slug Model</Link> - Model that this resource transforms
- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl Trait</Link> - Trait that provides slug_resource accessor
- <Link to="/packages/laravel-url/deep-diving/events">Events</Link> - UrlableResourceEvent for related model
