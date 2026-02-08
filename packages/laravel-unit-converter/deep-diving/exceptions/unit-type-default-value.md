---
sidebar_position: 4
sidebar_label: UnitTypeDefaultValueException
---

# UnitTypeDefaultValueException

Thrown when the first unit created for a type does not have `value = 1` (base unit requirement).

## Namespace

```php
JobMetric\UnitConverter\Exceptions\UnitTypeDefaultValueException
```

## HTTP Status Code

`400 Bad Request`

## Constructor

```php
public function __construct(
    string $type,
    int $code = 400,
    ?Throwable $previous = null
)
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `$type` | `string` | The unit type being created |
| `$code` | `int` | HTTP status code (default: 400) |
| `$previous` | `Throwable\|null` | Previous exception for chaining |

## Understanding the Base Unit System

Laravel Unit Converter uses a **base unit system** where:

1. Each unit type must have exactly one **base unit** with `value = 1`
2. All other units are defined **relative** to this base unit
3. The first unit created for any type **must** be the base unit

### How Conversion Works

```
result = input_value × (from_unit.value / to_unit.value)
```

Example with weight (base: gram = 1):
- Kilogram: `value = 1000` (1 kg = 1000 g)
- Milligram: `value = 0.001` (1 mg = 0.001 g)

Converting 2 kg to mg:
```
2 × (1000 / 0.001) = 2,000,000 mg
```

## When Is It Thrown?

This exception is thrown when you try to create the **first** unit for a type with a value other than 1.

### Incorrect: First Unit Without value = 1

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// No weight units exist yet
// Trying to create kilogram first (value = 1000) - WRONG!
UnitConverter::store([
    'type' => 'weight',
    'value' => 1000,  // Error! First unit must be value = 1
    'translation' => [
        'en' => ['name' => 'Kilogram', 'code' => 'kg'],
    ],
]);
// Throws: UnitTypeDefaultValueException
```

### Correct: Create Base Unit First

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Step 1: Create base unit (gram) with value = 1
UnitConverter::store([
    'type' => 'weight',
    'value' => 1,  // Base unit
    'translation' => [
        'en' => ['name' => 'Gram', 'code' => 'g'],
    ],
]);

// Step 2: Now create kilogram relative to gram
UnitConverter::store([
    'type' => 'weight',
    'value' => 1000,  // 1 kg = 1000 g
    'translation' => [
        'en' => ['name' => 'Kilogram', 'code' => 'kg'],
    ],
]);
```

## Handling the Exception

### In Controllers

```php
use JobMetric\UnitConverter\Exceptions\UnitTypeDefaultValueException;
use JobMetric\UnitConverter\Facades\UnitConverter;

class UnitController extends Controller
{
    public function store(Request $request)
    {
        try {
            $response = UnitConverter::store($request->all());
            return response()->json($response->data, 201);
        } catch (UnitTypeDefaultValueException $e) {
            return response()->json([
                'error' => 'base_unit_required',
                'message' => $e->getMessage(),
                'hint' => 'The first unit for this type must have value = 1 (base unit)',
            ], 400);
        }
    }
}
```

### In Seeders

```php
use JobMetric\UnitConverter\Facades\UnitConverter;
use JobMetric\UnitConverter\Models\Unit;

class WeightUnitSeeder extends Seeder
{
    public function run(): void
    {
        // Check if base unit already exists
        $baseExists = Unit::where('type', 'weight')
            ->where('value', 1)
            ->exists();
        
        if (!$baseExists) {
            // Create base unit first
            UnitConverter::store([
                'type' => 'weight',
                'value' => 1,
                'translation' => [
                    'en' => ['name' => 'Gram', 'code' => 'g'],
                ],
            ]);
        }
        
        // Now create other units
        $this->createOtherUnits();
    }
}
```

## Prevention

### 1. Always Create Base Unit First

When setting up units for a new type, always start with the base unit:

```php
// Weight: base = gram
UnitConverter::store(['type' => 'weight', 'value' => 1, ...]);

// Length: base = meter
UnitConverter::store(['type' => 'length', 'value' => 1, ...]);

// Volume: base = liter
UnitConverter::store(['type' => 'volume', 'value' => 1, ...]);
```

### 2. Check Before Creating

```php
use JobMetric\UnitConverter\Models\Unit;

function createUnit(string $type, float $value, array $translation): void
{
    $typeExists = Unit::where('type', $type)->exists();
    
    if (!$typeExists && $value !== 1.0) {
        throw new \InvalidArgumentException(
            "First unit for type '{$type}' must be the base unit (value = 1)"
        );
    }
    
    UnitConverter::store([
        'type' => $type,
        'value' => $value,
        'translation' => $translation,
    ]);
}
```

### 3. Use Built-in Seeders

Use the `unit:seed` command which handles base units correctly:

```bash
php artisan unit:seed
```

## Common Base Units by Type

| Type | Recommended Base Unit | value |
|------|----------------------|-------|
| weight | Gram | 1 |
| length | Meter | 1 |
| volume | Liter | 1 |
| area | Square Meter | 1 |
| temperature | Celsius | 1 |
| time | Second | 1 |
| currency | Your primary currency | 1 |
| data_storage | Byte | 1 |
| data_transfer | Bit per second | 1 |
| energy | Joule | 1 |
| power | Watt | 1 |
| pressure | Pascal | 1 |

## Related Exceptions

- [UnitTypeUseDefaultValueException](./unit-type-use-default-value) - When trying to create another unit with value = 1
- [UnitTypeCannotChangeDefaultValueException](./unit-type-cannot-change-default-value) - When trying to modify base unit's value
- [CannotDeleteDefaultValueException](./cannot-delete-default-value) - When trying to delete base unit

