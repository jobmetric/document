---
sidebar_position: 1
sidebar_label: MetadataKeyNotFoundException
---

import Link from "@docusaurus/Link";

# MetadataKeyNotFoundException

The `MetadataKeyNotFoundException` exception is thrown when attempting to store metadata with keys that are not in the model's allowed metadata list.

## Namespace

```php
JobMetric\Metadata\Exceptions\MetadataKeyNotFoundException
```

## Overview

This exception is thrown when:

- Storing metadata via model attributes with keys not in the `$metadata` array
- The model has a restricted `$metadata` list (not `['*']`)
- One or more keys in the metadata array are not allowed

## Exception Details

### Constructor

```php
public function __construct(string|array $key, int $code = 400, ?Throwable $previous = null)
```

**Parameters:**
- `string|array $key` - The key(s) that were not found/allowed
- `int $code` - Exception code (default: `400`)
- `Throwable|null $previous` - Previous exception for chaining

## When It's Thrown

### Storing via Model Attributes

```php
class Product extends Model
{
    use HasMeta;

    protected array $metadata = ['color', 'size'];
}

// This will throw MetadataKeyNotFoundException
$product = Product::create([
    'name' => 'Test',
    'metadata' => [
        'color' => 'red',    // OK
        'weight' => 500,     // Not allowed!
    ],
]);
```

## Handling the Exception

### Check Keys Before Storing

```php
try {
    $product = Product::create([
        'name' => 'Test',
        'metadata' => $metadata,
    ]);
} catch (MetadataKeyNotFoundException $e) {
    // Handle: Invalid metadata keys
    return response()->json([
        'error' => 'Invalid metadata keys',
        'keys' => $e->getMessage(),
    ], 400);
}
```

### Validate Before Assignment

```php
$allowedKeys = $product->getMetaKeys();
$metadata = request()->input('metadata', []);

$invalidKeys = array_diff(array_keys($metadata), $allowedKeys);
if (!empty($invalidKeys) && !in_array('*', $allowedKeys)) {
    throw new MetadataKeyNotFoundException($invalidKeys);
}
```

## Related Documentation

- <Link to="/packages/laravel-metadata/deep-diving/has-meta">HasMeta Trait</Link>
- <Link to="/packages/laravel-metadata/deep-diving/exceptions/model-metaable-key-not-allowed-field-exception">ModelMetaableKeyNotAllowedFieldException</Link>

