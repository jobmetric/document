---
sidebar_position: 1
sidebar_label: HasUnit
---

import Link from "@docusaurus/Link";

# HasUnit Trait

The `HasUnit` trait adds unit functionality to any Eloquent model, allowing you to store, retrieve, convert, and manage measurement values through a polymorphic relationship.

## Namespace

```php
JobMetric\UnitConverter\HasUnit
```

## Overview

The `HasUnit` trait provides:

- **Unit Storage**: Store unit values for any model
- **Key Configuration**: Control which unit keys are allowed and their expected types
- **Automatic Conversion**: Convert values between units of the same type
- **Query Scopes**: Filter models by unit attributes
- **Batch Operations**: Store multiple unit values in a single operation
- **Mass Assignment**: Support for storing units via model attributes

## Basic Usage

### Attach Trait to Model

```php
use JobMetric\UnitConverter\HasUnit;

class Product extends Model
{
    use HasUnit;
}
```

### Define Allowed Unit Keys

Define which unit keys are allowed and their expected unit types:

```php
class Product extends Model
{
    use HasUnit;

    protected array $unitables = [
        'weight' => 'weight',    // key => expected unit type
        'length' => 'length',
        'width' => 'length',
        'height' => 'length',
        'volume' => 'volume',
    ];
}
```

If omitted or set to `['*']`, all keys are allowed without type enforcement.

### Configuration Formats

The `$unitables` property supports multiple formats:

```php
// Allow all keys (no type enforcement)
protected array $unitables = ['*'];

// List format (key and type are the same)
protected array $unitables = ['weight', 'length', 'volume'];

// Map format (key => expected type)
protected array $unitables = [
    'weight' => 'weight',
    'width' => 'length',
    'height' => 'length',
];

// Using enum values
use JobMetric\UnitConverter\Enums\UnitTypeEnum;

protected array $unitables = [
    'weight' => UnitTypeEnum::WEIGHT,
    'length' => UnitTypeEnum::LENGTH,
];
```

## Available Methods

### Store Unit

Store or update a single unit value:

```php
$product->storeUnit('weight', $kilogramId, 2.5);
$product->storeUnit('length', $centimeterId, 100);
```

**Parameters:**
- `string $key` - Unit key (e.g., weight, length)
- `int $unitId` - ID of the unit
- `float $value` - Value in the specified unit

**Returns:** `static` - Fluent interface

**Throws:**
- `UnitNotFoundException` - If unit ID doesn't exist
- `TypeNotFoundInAllowTypesException` - If key is not allowed

### Store Multiple Units

Store multiple unit values in a batch:

```php
$product->storeUnitBatch([
    'weight' => ['unit_id' => $kilogramId, 'value' => 2.5],
    'length' => ['unit_id' => $centimeterId, 'value' => 100],
    'width' => ['unit_id' => $centimeterId, 'value' => 50],
]);
```

**Parameters:**
- `array $units` - Array of `[key => ['unit_id' => int, 'value' => float]]`

**Returns:** `static` - Fluent interface

### Get Unit Value

Retrieve a unit value, optionally converted to another unit:

```php
// Get original value
$weight = $product->getUnit('weight');
// => ['unit' => Unit, 'value' => 2.5, 'translation' => ['name' => 'Kilogram', ...]]

// Get converted value
$weightGrams = $product->getUnit('weight', $gramId);
// => ['unit' => Unit, 'value' => 2500, 'translation' => ['name' => 'Gram', ...]]
```

**Parameters:**
- `string $key` - Unit key
- `int|null $convertUnitId` - Optional unit ID to convert to

**Returns:** `array` with keys:
- `unit` - Unit model (or null if not set)
- `value` - Float value (or null if not set)
- `translation` - Translation data array (or null)

**Throws:**
- `TypeNotFoundInAllowTypesException` - If key is not allowed
- `UnitNotFoundException` - If unit or convert unit doesn't exist

### Get All Units

Retrieve all unit values for the model:

```php
$units = $product->getUnits();
// => Collection<string, ['unit' => Unit, 'value' => float, 'translation' => array]>

foreach ($units as $key => $data) {
    echo "{$key}: {$data['value']} {$data['translation']['code']}";
}
```

**Returns:** `Collection` keyed by unit key

### Get Unit Values Only

Get all unit values as key-value pairs:

```php
$values = $product->getUnitValues();
// => Collection ['weight' => 2.5, 'length' => 100, 'width' => 50]
```

**Returns:** `Collection<string, float>`

### Check Unit Exists

Check if a unit key has a value:

```php
if ($product->hasUnit('weight')) {
    // Unit value exists
}
```

**Parameters:**
- `string $key` - Unit key to check

**Returns:** `bool`

### Forget Unit

Delete a unit value by key:

```php
$product->forgetUnit('weight');
```

**Parameters:**
- `string $key` - Unit key to delete

**Returns:** `static` - Fluent interface

### Forget All Units

Delete all unit values or for a specific key:

```php
// Delete specific key
$product->forgetUnits('weight');

// Delete all
$product->forgetUnits();
```

**Parameters:**
- `string|null $key` - Unit key to delete (null for all)

**Returns:** `static` - Fluent interface

## Mass Assignment

You can store units through model attributes during create or update:

```php
$product = Product::create([
    'name' => 'Laptop',
    'price' => 999.99,
    'unit' => [
        'weight' => ['unit_id' => $kilogramId, 'value' => 2.1],
        'length' => ['unit_id' => $centimeterId, 'value' => 35],
        'width' => ['unit_id' => $centimeterId, 'value' => 25],
        'height' => ['unit_id' => $centimeterId, 'value' => 2],
    ],
]);
```

The `unit` attribute is automatically handled by the trait:
1. Values are validated against allowed keys
2. Unit types are verified
3. Values are stored after the model is saved

## Relationships

### Units Relationship

Access the polymorphic relationship directly:

```php
$units = $product->units;
// => Collection of Unit models with pivot data

// Query relationship
$weightUnit = $product->units()->wherePivot('type', 'weight')->first();
```

### Unit Relations Relationship

Access the pivot records directly:

```php
$relations = $product->unitRelations;
// => Collection of UnitRelation models

// Filter by key
$weightRelation = $product->unitRelation('weight')->first();
```

## Query Scopes

### Has Unit Key

Filter models that have a specific unit key:

```php
$productsWithWeight = Product::hasUnitKey('weight')->get();
```

**Parameters:**
- `string $key` - Unit key to filter by

**Returns:** `Builder`

### Where Unit Equals

Filter models by unit key and unit ID (optionally value):

```php
// Products with a specific unit
$products = Product::whereUnitEquals('weight', $kilogramId)->get();

// Products with specific unit and value
$products = Product::whereUnitEquals('weight', $kilogramId, 2.5)->get();
```

**Parameters:**
- `string $key` - Unit key
- `int $unitId` - Unit ID
- `float|null $value` - Optional exact value

**Returns:** `Builder`

## Configuration Methods

### Get Unitables

Get the configured unitables mapping:

```php
$unitables = $product->getUnitables();
// => ['weight' => 'weight', 'length' => 'length', ...]
```

### Allow All Keys

Check if all keys are allowed:

```php
if ($product->unitablesAllowAll()) {
    // Any key is allowed
}
```

### Merge Unitables

Add additional allowed keys at runtime:

```php
$product->mergeUnitables([
    'depth' => 'length',
    'capacity' => 'volume',
]);
```

### Remove Unitable

Remove a key from the allowed list:

```php
$product->removeUnitable('volume');
```

## Events

The trait integrates with model events:

- **saving**: Validates and buffers unit data from `unit` attribute
- **saved**: Persists buffered unit data
- **deleted**: Cleans up unit relations (respects SoftDeletes)
- **forceDeleted**: Cleans up unit relations for soft-deleted models

## Complete Examples

### E-Commerce Product

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use JobMetric\UnitConverter\HasUnit;

class Product extends Model
{
    use HasUnit;

    protected $fillable = ['name', 'sku', 'price'];

    protected array $unitables = [
        'weight' => 'weight',
        'length' => 'length',
        'width' => 'length',
        'height' => 'length',
    ];

    /**
     * Get shipping weight in grams.
     */
    public function getShippingWeightInGrams(): float
    {
        $weight = $this->getUnit('weight', $this->gramUnitId());
        return $weight['value'] ?? 0;
    }

    /**
     * Get volumetric weight for shipping.
     */
    public function getVolumetricWeight(): float
    {
        $cmUnit = $this->centimeterUnitId();
        
        $length = $this->getUnit('length', $cmUnit)['value'] ?? 0;
        $width = $this->getUnit('width', $cmUnit)['value'] ?? 0;
        $height = $this->getUnit('height', $cmUnit)['value'] ?? 0;
        
        // Volumetric weight formula: L × W × H / 5000
        return ($length * $width * $height) / 5000;
    }
}

// Usage
$product = Product::create([
    'name' => 'Wireless Mouse',
    'sku' => 'WM-001',
    'price' => 29.99,
    'unit' => [
        'weight' => ['unit_id' => 2, 'value' => 100], // 100 grams
        'length' => ['unit_id' => 4, 'value' => 12], // 12 cm
        'width' => ['unit_id' => 4, 'value' => 6], // 6 cm
        'height' => ['unit_id' => 4, 'value' => 4], // 4 cm
    ],
]);

$shippingWeight = $product->getShippingWeightInGrams();
$volumetricWeight = $product->getVolumetricWeight();
```

### Scientific Sample

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use JobMetric\UnitConverter\HasUnit;

class LabSample extends Model
{
    use HasUnit;

    protected $fillable = ['name', 'collected_at'];

    protected array $unitables = [
        'temperature' => 'temperature',
        'pressure' => 'pressure',
        'volume' => 'volume',
        'concentration' => 'concentration',
    ];

    /**
     * Get temperature in Kelvin for calculations.
     */
    public function getTemperatureKelvin(): float
    {
        $temp = $this->getUnit('temperature', $this->kelvinUnitId());
        return $temp['value'] ?? 273.15; // Default to 0°C
    }

    /**
     * Check if sample is at standard conditions.
     */
    public function isAtStandardConditions(): bool
    {
        $temp = $this->getTemperatureKelvin();
        $pressure = $this->getUnit('pressure', $this->pascalUnitId())['value'] ?? 0;
        
        // STP: 273.15 K and 101325 Pa
        return abs($temp - 273.15) < 0.5 && abs($pressure - 101325) < 100;
    }
}
```

### Recipe Ingredient

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use JobMetric\UnitConverter\HasUnit;

class RecipeIngredient extends Model
{
    use HasUnit;

    protected $fillable = ['recipe_id', 'ingredient_id', 'notes'];

    protected array $unitables = [
        'amount' => 'cooking',
    ];

    /**
     * Scale the ingredient amount.
     */
    public function scale(float $factor): array
    {
        $current = $this->getUnit('amount');
        
        return [
            'unit' => $current['unit'],
            'value' => $current['value'] * $factor,
            'translation' => $current['translation'],
        ];
    }

    /**
     * Get amount in metric units.
     */
    public function getMetricAmount(): array
    {
        return $this->getUnit('amount', $this->gramUnitId());
    }
}
```

## Tips and Best Practices

### 1. Define Unitables Explicitly

Always define the `$unitables` property to prevent invalid keys:

```php
// Good: Explicit configuration
protected array $unitables = [
    'weight' => 'weight',
    'length' => 'length',
];

// Avoid: Allow all (less type safety)
protected array $unitables = ['*'];
```

### 2. Use Constants for Unit IDs

Store unit IDs in config or constants:

```php
class Product extends Model
{
    protected function kilogramUnitId(): int
    {
        return config('units.weight.kilogram');
    }
}
```

### 3. Handle Missing Values

Always handle cases where unit values might not be set:

```php
$weight = $product->getUnit('weight');

if ($weight['value'] === null) {
    // Handle missing value
}
```

### 4. Use Batch Operations

For multiple units, use `storeUnitBatch()` for better performance:

```php
// Good: Single batch operation
$product->storeUnitBatch([
    'weight' => ['unit_id' => 1, 'value' => 2.5],
    'length' => ['unit_id' => 2, 'value' => 100],
]);

// Avoid: Multiple individual operations
$product->storeUnit('weight', 1, 2.5);
$product->storeUnit('length', 2, 100);
```

### 5. Leverage Query Scopes

Use query scopes for filtering:

```php
// Find all products with weight defined
$productsWithWeight = Product::hasUnitKey('weight')->get();

// Find products with specific unit
$productsInKg = Product::whereUnitEquals('weight', $kilogramId)->get();
```

