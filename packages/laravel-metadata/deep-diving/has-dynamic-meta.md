---
sidebar_position: 3
sidebar_label: HasDynamicMeta
---

import Link from "@docusaurus/Link";

# HasDynamicMeta

The `HasDynamicMeta` trait integrates with custom field systems to automatically manage allowed metadata keys based on model types. It dynamically determines which metadata keys are allowed based on the model's type field.

## Namespace

```php
JobMetric\Metadata\HasDynamicMeta
```

## Overview

The `HasDynamicMeta` trait is designed to work with type-based systems where different model types have different allowed metadata keys. It automatically loads allowed keys from a service type system and makes them available for metadata validation.

## Basic Usage

### Attach Trait to Model

```php
use JobMetric\Metadata\HasDynamicMeta;
use JobMetric\Metadata\HasMeta;

class Product extends Model
{
    use HasMeta, HasDynamicMeta;

    // The field name that contains the type
    // Default is 'type'
    public function dynamicMetaFieldTypeName(): string
    {
        return 'type'; // or 'category', 'product_type', etc.
    }
}
```

## Available Methods

### Metadata Allow Fields

Get the allowed metadata fields for the current model instance based on its type:

```php
$allowedFields = $product->metadataAllowFields();
// => ['color', 'size', 'weight'] (based on product type)
```

**Returns:** `array` - Array of allowed metadata keys

### Dynamic Meta Field Type Name

Override this method to specify which field contains the type:

```php
public function dynamicMetaFieldTypeName(): string
{
    return 'type'; // Default
}
```

**Returns:** `string` - Field name containing the type

## How It Works

1. On model boot, the trait loads metadata definitions from the service type system
2. It groups allowed keys by model type
3. When `metadataAllowFields()` is called, it returns keys for the model's current type
4. These keys can be used with `HasMeta` to restrict allowed metadata

## Complete Examples

### Product with Type-Based Metadata

```php
use JobMetric\Metadata\HasMeta;
use JobMetric\Metadata\HasDynamicMeta;

class Product extends Model
{
    use HasMeta, HasDynamicMeta;

    protected $fillable = ['name', 'type'];

    public function dynamicMetaFieldTypeName(): string
    {
        return 'type';
    }
}

// Product with type 'clothing' allows: color, size, material
// Product with type 'electronics' allows: brand, model, warranty

$clothing = Product::create(['name' => 'T-Shirt', 'type' => 'clothing']);
$allowed = $clothing->metadataAllowFields();
// => ['color', 'size', 'material']

$electronics = Product::create(['name' => 'Laptop', 'type' => 'electronics']);
$allowed = $electronics->metadataAllowFields();
// => ['brand', 'model', 'warranty']
```

### Integration with HasMeta

```php
class Product extends Model
{
    use HasMeta, HasDynamicMeta;

    protected function initializeHasMeta(): void
    {
        parent::initializeHasMeta();
        
        // Merge dynamic metadata keys
        $this->mergeMeta($this->metadataAllowFields());
    }
}
```

## Related Documentation

- <Link to="/packages/laravel-metadata/deep-diving/has-meta">HasMeta</Link>
- <Link to="/packages/laravel-metadata/deep-diving/models/meta">Meta Model</Link>

