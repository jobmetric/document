---
sidebar_position: 2
sidebar_label: ModelMetaableKeyNotAllowedFieldException
---

import Link from "@docusaurus/Link";

# ModelMetaableKeyNotAllowedFieldException

The `ModelMetaableKeyNotAllowedFieldException` exception is thrown when attempting to access or modify metadata with a key that is not in the model's allowed metadata list.

## Namespace

```php
JobMetric\Metadata\Exceptions\ModelMetaableKeyNotAllowedFieldException
```

## Overview

This exception is thrown when:

- Getting metadata with a key not in the allowed list
- Storing metadata with a key not in the allowed list
- Deleting metadata with a key not in the allowed list
- Removing a key that is not in the allowed list

## Exception Details

### Constructor

```php
public function __construct(string $model, string $key, int $code = 400, ?Throwable $previous = null)
```

**Parameters:**
- `string $model` - The model class name
- `string $key` - The key that was not allowed
- `int $code` - Exception code (default: `400`)
- `Throwable|null $previous` - Previous exception for chaining

## When It's Thrown

### Getting Metadata

```php
class Product extends Model
{
    use HasMeta;

    protected array $metadata = ['color', 'size'];
}

$product = Product::find(1);

// This will throw ModelMetaableKeyNotAllowedFieldException
$weight = $product->getMetadata('weight');
```

### Storing Metadata

```php
// This will throw ModelMetaableKeyNotAllowedFieldException
$product->storeMetadata('weight', 500);
```

### Deleting Metadata

```php
// This will throw ModelMetaableKeyNotAllowedFieldException
$product->forgetMetadata('weight');
```

## Handling the Exception

### Check Before Accessing

```php
$allowedKeys = $product->getMetaKeys();

if (in_array('weight', $allowedKeys) || in_array('*', $allowedKeys)) {
    $weight = $product->getMetadata('weight');
} else {
    // Handle: Key not allowed
}
```

### Try-Catch Block

```php
try {
    $product->storeMetadata('weight', 500);
} catch (ModelMetaableKeyNotAllowedFieldException $e) {
    // Handle: Key not allowed
    \Log::warning("Attempted to use disallowed metadata key: weight");
}
```

## Related Documentation

- <Link to="/packages/laravel-metadata/deep-diving/has-meta">HasMeta Trait</Link>
- <Link to="/packages/laravel-metadata/deep-diving/exceptions/metadata-key-not-found-exception">MetadataKeyNotFoundException</Link>

