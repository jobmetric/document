---
sidebar_position: 1
sidebar_label: UnitNotFoundException
---

# UnitNotFoundException

Thrown when attempting to access a unit that does not exist in the database.

## Namespace

```php
JobMetric\UnitConverter\Exceptions\UnitNotFoundException
```

## HTTP Status Code

`404 Not Found`

## Constructor

```php
public function __construct(
    int $number,
    int $code = 404,
    ?Throwable $previous = null
)
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `$number` | `int` | The unit ID that was not found |
| `$code` | `int` | HTTP status code (default: 404) |
| `$previous` | `Throwable\|null` | Previous exception for chaining |

## When Is It Thrown?

This exception is thrown in the following scenarios:

### 1. Getting a Unit by ID

When using `UnitConverter::getObject()` or `UnitConverter::get()` with an invalid ID:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Unit with ID 99999 does not exist
$unit = UnitConverter::getObject(99999);
// Throws: UnitNotFoundException
```

### 2. Converting Between Units

When either the source or target unit ID is invalid:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Invalid source unit
UnitConverter::convert(99999, 1, 100);
// Throws: UnitNotFoundException

// Invalid target unit
UnitConverter::convert(1, 99999, 100);
// Throws: UnitNotFoundException
```

### 3. Storing Unit on a Model

When attaching a unit to a model with an invalid unit ID:

```php
$product = Product::find(1);
$product->storeUnit('weight', 99999, 2.5);
// Throws: UnitNotFoundException
```

### 4. Getting Unit Value with Conversion

When retrieving a unit value with conversion to a non-existent unit:

```php
$product = Product::find(1);
$weight = $product->getUnit('weight', 99999);
// Throws: UnitNotFoundException
```

## Handling the Exception

### In Controllers

```php
use JobMetric\UnitConverter\Exceptions\UnitNotFoundException;
use JobMetric\UnitConverter\Facades\UnitConverter;

class UnitController extends Controller
{
    public function show(int $id)
    {
        try {
            $response = UnitConverter::get($id);
            return response()->json($response->data);
        } catch (UnitNotFoundException $e) {
            return response()->json([
                'error' => 'not_found',
                'message' => $e->getMessage(),
            ], 404);
        }
    }
}
```

### In Services

```php
use JobMetric\UnitConverter\Exceptions\UnitNotFoundException;
use JobMetric\UnitConverter\Facades\UnitConverter;

class ProductService
{
    public function setWeight(Product $product, int $unitId, float $value): bool
    {
        try {
            $product->storeUnit('weight', $unitId, $value);
            return true;
        } catch (UnitNotFoundException $e) {
            Log::warning("Invalid unit ID: {$unitId}", [
                'product_id' => $product->id,
                'exception' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
```

### Global Exception Handler

Register in `App\Exceptions\Handler`:

```php
use JobMetric\UnitConverter\Exceptions\UnitNotFoundException;

public function register(): void
{
    $this->renderable(function (UnitNotFoundException $e, $request) {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'unit_not_found',
                'message' => $e->getMessage(),
            ], 404);
        }
        
        return redirect()->back()->with('error', $e->getMessage());
    });
}
```

## Prevention

### Validate Unit ID Before Use

```php
use JobMetric\UnitConverter\Models\Unit;

// Check if unit exists before using
if (Unit::where('id', $unitId)->exists()) {
    $product->storeUnit('weight', $unitId, $value);
} else {
    // Handle invalid unit ID
}
```

### Use findUnitByCode Instead

When working with user input, use `findUnitByCode()` which returns `null` instead of throwing:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

$unit = UnitConverter::findUnitByCode('kg');

if ($unit) {
    $product->storeUnit('weight', $unit->id, $value);
} else {
    // Handle: unit code not found
}
```

## Related Exceptions

- [TypeNotFoundInAllowTypesException](./type-not-found-in-allow-types) - When unit key is not allowed
- [FromAndToMustSameTypeException](./from-and-to-must-same-type) - When converting between different types

