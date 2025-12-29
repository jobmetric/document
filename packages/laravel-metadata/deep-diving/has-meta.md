---
sidebar_position: 1
sidebar_label: HasMeta
---

import Link from "@docusaurus/Link";

# HasMeta

The `HasMeta` trait adds metadata functionality to any Eloquent model, allowing you to store, retrieve, query, and manage arbitrary key-value pairs through a polymorphic relationship.

## Namespace

```php
JobMetric\Metadata\HasMeta
```

## Overview

The `HasMeta` trait provides:

- **Metadata Storage**: Store key-value pairs for any model
- **Key Whitelisting**: Control which keys are allowed
- **Automatic JSON Handling**: Arrays are automatically JSON-encoded/decoded
- **Query Scopes**: Filter models by metadata
- **Batch Operations**: Store or delete multiple metadata entries
- **Event Integration**: Fires events on metadata operations

## Basic Usage

### Attach Trait to Model

```php
use JobMetric\Metadata\HasMeta;

class Product extends Model
{
    use HasMeta;
}
```

### Optional: Limit Allowed Keys

Define allowed metadata keys in your model:

```php
class Product extends Model
{
    use HasMeta;

    protected array $metadata = [
        'color',
        'size',
        'weight',
        'dimensions',
    ];
}
```

If omitted or set to `['*']`, all keys are allowed.

## Available Methods

### Store Metadata

Store or update a single metadata value:

```php
$product->storeMetadata('color', 'red');
$product->storeMetadata('dimensions', ['width' => 10, 'height' => 20]);
```

**Parameters:**
- `string $key` - Metadata key
- `array|string|bool|null $value` - Metadata value

**Returns:** `static` - Fluent interface

**Throws:** `ModelMetaableKeyNotAllowedFieldException` if key is not allowed

### Store Multiple Metadata

Store multiple metadata entries in a batch:

```php
$product->storeMetadataBatch([
    'color' => 'red',
    'size' => 'large',
    'weight' => 500,
    'dimensions' => ['width' => 10, 'height' => 20],
]);
```

**Parameters:**
- `array $metas` - Associative array of key => value pairs

**Returns:** `static` - Fluent interface

### Get Metadata

Retrieve metadata value(s):

```php
// Get single value
$color = $product->getMetadata('color');
// => 'red'

// Get single value with default
$price = $product->getMetadata('price', 0);
// => 0 (if 'price' doesn't exist)

// Get all metadata
$all = $product->getMetadata();
// => Collection with all key-value pairs
```

**Parameters:**
- `string|null $key` - Metadata key (null for all)
- `array|string|bool|null $default` - Default value if key doesn't exist

**Returns:** `mixed` - Single value or Collection

**Throws:** `ModelMetaableKeyNotAllowedFieldException` if key is not allowed

### Check Metadata Exists

Check if a metadata key exists:

```php
if ($product->hasMetadata('color')) {
    // Metadata exists
}
```

**Parameters:**
- `string $key` - Metadata key to check

**Returns:** `bool` - `true` if key exists, `false` otherwise

### Delete Metadata

Delete metadata by key or all metadata:

```php
// Delete specific key
$product->forgetMetadata('color');

// Delete all metadata
$product->forgetMetadata();
```

**Parameters:**
- `string|null $key` - Metadata key to delete (null for all)

**Returns:** `static` - Fluent interface

**Throws:** `ModelMetaableKeyNotAllowedFieldException` if key is not allowed

### Get Metadata Keys

Get the list of allowed metadata keys:

```php
$keys = $product->getMetaKeys();
// => ['color', 'size', 'weight', 'dimensions']
// or ['*'] if all keys are allowed
```

**Returns:** `array` - Array of allowed keys or `['*']`

### Merge Metadata Keys

Add additional allowed keys at runtime:

```php
$product->mergeMeta(['nickname', 'website']);
```

**Parameters:**
- `array $meta` - Array of keys to add

**Returns:** `void`

### Remove Metadata Key

Remove a key from the allowed list:

```php
$product->removeMetaKey('bio');
```

**Parameters:**
- `string $key` - Key to remove

**Returns:** `void`

**Throws:** `ModelMetaableKeyNotAllowedFieldException` if key is not in allowed list

## Relationships

### Metas Relationship

Access the polymorphic relationship directly:

```php
$metas = $product->metas;
// => Collection of Meta models

// Query relationship
$colorMeta = $product->metas()->where('key', 'color')->first();
```

### Meta Key Relationship

Filter metadata by key:

```php
$colorMeta = $product->metaKey('color')->first();
```

**Parameters:**
- `string $key` - Metadata key

**Returns:** `MorphMany` - Query builder instance

## Query Scopes

### Has Meta Key

Filter models that have a specific metadata key:

```php
$productsWithColor = Product::hasMetaKey('color')->get();
```

**Parameters:**
- `string $key` - Metadata key to filter by

**Returns:** `Builder` - Query builder instance

## Storing via Model Attributes

You can store metadata when creating or updating models:

```php
$product = Product::create([
    'name' => 'Test Product',
    'metadata' => [
        'color' => 'red',
        'size' => 'large',
    ],
]);
```

The metadata will be validated against allowed keys and stored after the model is saved.

## Events

The trait fires the following events:

- `MetadataStoringEvent` - Before metadata is stored
- `MetadataStoredEvent` - After metadata is stored
- `MetadataDeletingEvent` - Before metadata is deleted
- `MetadataDeletedEvent` - After metadata is deleted

Listen to these events in your `EventServiceProvider`:

```php
protected $listen = [
    \JobMetric\Metadata\Events\MetadataStoredEvent::class => [
        \App\Listeners\LogMetadataStored::class,
    ],
];
```

## Complete Examples

### E-Commerce Product Attributes

```php
class Product extends Model
{
    use HasMeta;

    protected array $metadata = [
        'color',
        'size',
        'weight',
        'dimensions',
        'material',
        'warranty_period',
    ];
}

// Store product attributes
$product = Product::find(1);
$product->storeMetadataBatch([
    'color' => 'blue',
    'size' => 'large',
    'weight' => 500,
    'dimensions' => ['width' => 10, 'height' => 20, 'depth' => 5],
    'material' => 'cotton',
    'warranty_period' => '1 year',
]);

// Retrieve attributes
$color = $product->getMetadata('color');
$dimensions = $product->getMetadata('dimensions');
```

### User Preferences

```php
class User extends Model
{
    use HasMeta;
    // No $metadata array = all keys allowed
}

// Store user preferences
$user = User::find(1);
$user->storeMetadata('theme', 'dark');
$user->storeMetadata('notifications', [
    'email' => true,
    'sms' => false,
    'push' => true,
]);

// Get preferences
$theme = $user->getMetadata('theme', 'light');
$notifications = $user->getMetadata('notifications', []);
```

## Related Documentation

- <Link to="/packages/laravel-metadata/deep-diving/has-filter-meta">HasFilterMeta</Link>
- <Link to="/packages/laravel-metadata/deep-diving/has-dynamic-meta">HasDynamicMeta</Link>
- <Link to="/packages/laravel-metadata/deep-diving/models/meta">Meta Model</Link>
- <Link to="/packages/laravel-metadata/deep-diving/events/metadata-events">Events</Link>

