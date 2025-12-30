---
sidebar_position: 2
sidebar_label: UrlResource
---

import Link from "@docusaurus/Link";

# UrlResource

The `UrlResource` transforms the `Url` model into a structured JSON resource for API responses.

## Namespace

```php
JobMetric\Url\Http\Resources\UrlResource
```

## Overview

The resource provides:

- **Structured output**: Consistent JSON format
- **ISO 8601 timestamps**: Standard datetime formatting
- **Version information**: URL version number
- **Related model**: Urlable model resource (via event)

## When to Use UrlResource

**Use `UrlResource` when you need:**

- **API responses**: Return URL data in API endpoints
- **Structured output**: Consistent JSON format for URLs
- **Version history**: Display URL version information
- **Related model data**: Include urlable model information

**Example scenarios:**
- API endpoints returning URL information
- URL history endpoints
- Admin panels showing URL details
- Version tracking interfaces

## Resource Structure

```json
{
  "urlable_type": "App\\Models\\Product",
  "urlable_id": 1,
  "full_url": "/shop/laptops/macbook-pro-14",
  "collection": "products",
  "version": 1,
  "deleted_at": null,
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z",
  "urlable": {
    // Resource from UrlableResourceEvent
  }
}
```

## Field Details

| Field | Type | Description |
|-------|------|-------------|
| `urlable_type` | string | Model class name (polymorphic) |
| `urlable_id` | int | Model ID (polymorphic) |
| `full_url` | string | Complete canonical URL (max 2000 chars) |
| `collection` | string\|null | Optional collection name |
| `version` | int | Version number (starts at 1) |
| `deleted_at` | string\|null | Soft delete timestamp (ISO 8601) |
| `created_at` | string | Creation timestamp (ISO 8601) |
| `updated_at` | string | Update timestamp (ISO 8601) |
| `urlable` | mixed | Related model resource (from event) |

## Usage

### Basic Usage

```php
use JobMetric\Url\Http\Resources\UrlResource;
use JobMetric\Url\Models\Url;

$url = Url::find(1);
return new UrlResource($url);
```

### In API Responses

```php
namespace App\Http\Controllers;

use App\Models\Product;
use JobMetric\Url\Http\Resources\UrlResource;

class ProductController extends Controller
{
    public function urlHistory(Product $product)
    {
        $urls = $product->urlHistory();
        return UrlResource::collection($urls);
    }
}
```

## Complete Examples

### Example 1: Single URL Resource

```php
$url = Url::find(1);
return new UrlResource($url);
```

### Example 2: URL History Collection

```php
$product = Product::find(1);
$urls = $product->urlHistory();
return UrlResource::collection($urls);
```

### Example 3: Active URL Only

```php
$product = Product::find(1);
$activeUrl = $product->urlRecord()->first();
return new UrlResource($activeUrl);
```

### Example 4: With Related Model

```php
// Listen to UrlableResourceEvent to provide related model resource
Event::listen(UrlableResourceEvent::class, function (UrlableResourceEvent $event) {
    if ($event->urlable instanceof Product) {
        $event->resource = new ProductResource($event->urlable);
    }
});

$url = Url::find(1);
return new UrlResource($url);
// urlable field will contain ProductResource
```

### Example 5: API Endpoint

```php
Route::get('/api/products/{product}/urls', function (Product $product) {
    $urls = $product->urlHistory();
    return UrlResource::collection($urls);
});
```

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/models/url">Url Model</Link> - Model that this resource transforms
- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl Trait</Link> - Trait that manages URLs
- <Link to="/packages/laravel-url/deep-diving/events">Events</Link> - UrlableResourceEvent for related model
