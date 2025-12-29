---
sidebar_position: 2
sidebar_label: HasFilterMeta
---

import Link from "@docusaurus/Link";

# HasFilterMeta

The `HasFilterMeta` trait provides dynamic filtering capability based on metadata for any Eloquent model. It checks for metadata input in the HTTP request and applies conditional join and where clauses to the query builder accordingly.

## Namespace

```php
JobMetric\Metadata\HasFilterMeta
```

## Overview

The `HasFilterMeta` trait is typically used in controllers or services to allow filtering models via polymorphic metadata key-value pairs in APIs or admin panels. It automatically joins the metadata table and applies where clauses based on request parameters.

## Basic Usage

### Attach Trait to Controller or Service

```php
use JobMetric\Metadata\HasFilterMeta;

class ProductController extends Controller
{
    use HasFilterMeta;

    public function index(Request $request)
    {
        $query = Product::query();
        
        // Apply metadata filtering
        $this->queryFilterMetadata($query, Product::class);
        
        return $query->get();
    }
}
```

## Available Methods

### Query Filter Metadata

Applies dynamic filtering to a query based on metadata sent via HTTP request:

```php
$query = Product::query();
$this->queryFilterMetadata($query, Product::class);
```

**Parameters:**
- `Builder &$query` - The Eloquent query builder instance (passed by reference)
- `string $className` - The fully-qualified class name of the model being filtered
- `string $primaryColumn` - The column name used as primary identifier (default: `'id'`)

**Returns:** `void`

## How It Works

The method:

1. Checks if a `metadata` key exists in the request
2. Validates that metadata contains valid key-value pairs
3. Joins the metadata table using a polymorphic relation
4. Applies `where` clauses to match requested metadata keys and values

## Request Format

The method expects metadata in the request as an associative array:

```
GET /products?metadata[color]=red&metadata[size]=large
```

Or in JSON:

```json
{
  "metadata": {
    "color": "red",
    "size": "large"
  }
}
```

## Complete Examples

### Controller with Metadata Filtering

```php
namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use JobMetric\Metadata\HasFilterMeta;

class ProductController extends Controller
{
    use HasFilterMeta;

    public function index(Request $request)
    {
        $query = Product::query();
        
        // Apply metadata filtering
        $this->queryFilterMetadata($query, Product::class);
        
        // Apply other filters
        if ($request->has('category')) {
            $query->where('category_id', $request->get('category'));
        }
        
        return $query->paginate(15);
    }
}
```

### Service with Custom Primary Column

```php
namespace App\Services;

use App\Models\Product;
use JobMetric\Metadata\HasFilterMeta;

class ProductService
{
    use HasFilterMeta;

    public function search(array $filters)
    {
        $query = Product::query();
        
        // Use custom primary column
        $this->queryFilterMetadata($query, Product::class, 'product_id');
        
        return $query->get();
    }
}
```

### API Endpoint Example

```php
// Request: GET /api/products?metadata[color]=red&metadata[size]=large
// Returns: Products with color='red' AND size='large'

Route::get('/products', [ProductController::class, 'index']);
```

## Related Documentation

- <Link to="/packages/laravel-metadata/deep-diving/has-meta">HasMeta</Link>
- <Link to="/packages/laravel-metadata/deep-diving/models/meta">Meta Model</Link>

