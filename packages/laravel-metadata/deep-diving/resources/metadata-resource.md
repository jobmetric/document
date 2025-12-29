---
sidebar_position: 1
sidebar_label: MetadataResource
---

import Link from "@docusaurus/Link";

# MetadataResource

The `MetadataResource` class transforms `Meta` model instances into JSON responses for API endpoints. It automatically handles JSON decoding for complex values.

## Namespace

```php
JobMetric\Metadata\Http\Resources\MetadataResource
```

## Overview

The `MetadataResource` is a JSON resource that formats metadata for API responses. It automatically decodes JSON values and returns metadata in a clean key-value format.

## Basic Usage

### Single Metadata

```php
use JobMetric\Metadata\Http\Resources\MetadataResource;
use JobMetric\Metadata\Models\Meta;

$meta = Meta::find(1);
return new MetadataResource($meta);

// Response:
// {
//   "color": "red"
// }
```

### Metadata Collection

```php
$metas = $product->metas;
return MetadataResource::collection($metas);

// Response:
// [
//   { "color": "red" },
//   { "size": "large" },
//   { "dimensions": { "width": 10, "height": 20 } }
// ]
```

## Resource Structure

The resource returns metadata in the following format:

```json
{
  "key": "value"
}
```

For JSON values, the value is automatically decoded:

```json
{
  "dimensions": {
    "width": 10,
    "height": 20
  }
}
```

## Complete Examples

### Controller Response

```php
namespace App\Http\Controllers;

use App\Models\Product;
use JobMetric\Metadata\Http\Resources\MetadataResource;

class ProductMetadataController extends Controller
{
    public function index(Product $product)
    {
        $metas = $product->metas;
        return MetadataResource::collection($metas);
    }

    public function show(Product $product, string $key)
    {
        $meta = $product->metaKey($key)->first();
        
        if (!$meta) {
            return response()->json(['error' => 'Metadata not found'], 404);
        }
        
        return new MetadataResource($meta);
    }
}
```

### With Pagination

```php
public function index(Product $product)
{
    $metas = $product->metas()->paginate(15);
    return MetadataResource::collection($metas);
}
```

## Related Documentation

- <Link to="/packages/laravel-metadata/deep-diving/models/meta">Meta Model</Link>
- <Link to="/packages/laravel-metadata/deep-diving/has-meta">HasMeta Trait</Link>

