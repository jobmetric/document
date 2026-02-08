---
sidebar_position: 2
sidebar_label: TypeNotFoundInAllowTypesException
---

# TypeNotFoundInAllowTypesException

Thrown when attempting to use a unit key that is not allowed in the model's `$unitables` configuration.

## Namespace

```php
JobMetric\UnitConverter\Exceptions\TypeNotFoundInAllowTypesException
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
| `$type` | `string` | The unit key/type that was not allowed |
| `$code` | `int` | HTTP status code (default: 400) |
| `$previous` | `Throwable\|null` | Previous exception for chaining |

## When Is It Thrown?

This exception is thrown when you try to use a unit key that is not defined in the model's `$unitables` property.

### Understanding $unitables

The `$unitables` property defines which unit keys are allowed for a model:

```php
class Product extends Model
{
    use HasUnit;
    
    // Only these keys are allowed
    protected array $unitables = [
        'weight' => 'weight',
        'length' => 'length',
        'width' => 'length',
        'height' => 'length',
    ];
}
```

### Scenario 1: Storing with Invalid Key

```php
$product = Product::find(1);

// 'volume' is not in $unitables
$product->storeUnit('volume', $literId, 5);
// Throws: TypeNotFoundInAllowTypesException
```

### Scenario 2: Getting with Invalid Key

```php
$product = Product::find(1);

// 'temperature' is not in $unitables
$product->getUnit('temperature');
// Throws: TypeNotFoundInAllowTypesException
```

### Scenario 3: Forgetting with Invalid Key

```php
$product = Product::find(1);

// 'pressure' is not in $unitables
$product->forgetUnit('pressure');
// Throws: TypeNotFoundInAllowTypesException
```

### Scenario 4: Unit Type Mismatch

When the unit's type doesn't match the expected type for the key:

```php
class Product extends Model
{
    use HasUnit;
    
    protected array $unitables = [
        'weight' => 'weight', // expects weight type units
    ];
}

$product = Product::find(1);

// $meterId is a 'length' type unit, but 'weight' key expects 'weight' type
$product->storeUnit('weight', $meterId, 100);
// Throws: TypeNotFoundInAllowTypesException
```

## Handling the Exception

### In Controllers

```php
use JobMetric\UnitConverter\Exceptions\TypeNotFoundInAllowTypesException;

class ProductController extends Controller
{
    public function updateUnit(Request $request, Product $product)
    {
        try {
            $product->storeUnit(
                $request->key,
                $request->unit_id,
                $request->value
            );
            
            return response()->json(['success' => true]);
        } catch (TypeNotFoundInAllowTypesException $e) {
            return response()->json([
                'error' => 'invalid_unit_key',
                'message' => $e->getMessage(),
                'allowed_keys' => array_keys($product->getUnitables()),
            ], 400);
        }
    }
}
```

### In Form Requests

Validate the key before it reaches the model:

```php
use JobMetric\UnitConverter\Models\Unit;

class StoreProductUnitRequest extends FormRequest
{
    public function rules(): array
    {
        $product = $this->route('product');
        $allowedKeys = array_keys($product->getUnitables());
        
        return [
            'key' => ['required', 'string', 'in:' . implode(',', $allowedKeys)],
            'unit_id' => ['required', 'integer', 'exists:units,id'],
            'value' => ['required', 'numeric'],
        ];
    }
}
```

### Global Exception Handler

```php
use JobMetric\UnitConverter\Exceptions\TypeNotFoundInAllowTypesException;

public function register(): void
{
    $this->renderable(function (TypeNotFoundInAllowTypesException $e, $request) {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'invalid_unit_key',
                'message' => $e->getMessage(),
            ], 400);
        }
        
        return redirect()->back()
            ->withInput()
            ->withErrors(['key' => $e->getMessage()]);
    });
}
```

## Prevention

### 1. Check Allowed Keys First

```php
$product = Product::find(1);
$unitables = $product->getUnitables();

if (array_key_exists($key, $unitables)) {
    $product->storeUnit($key, $unitId, $value);
} else {
    // Handle: key not allowed
}
```

### 2. Allow All Keys

If you want to allow any key, set `$unitables` to `['*']`:

```php
class FlexibleModel extends Model
{
    use HasUnit;
    
    // Allow any unit key
    protected array $unitables = ['*'];
}
```

### 3. Add Keys at Runtime

Use `mergeUnitables()` to add keys dynamically:

```php
$product = Product::find(1);

// Add 'volume' key at runtime
$product->mergeUnitables(['volume' => 'volume']);

// Now this works
$product->storeUnit('volume', $literId, 5);
```

### 4. Validate Unit Type Match

Ensure the unit type matches the expected type for the key:

```php
use JobMetric\UnitConverter\Models\Unit;

$unit = Unit::find($unitId);
$product = Product::find(1);
$unitables = $product->getUnitables();

if (isset($unitables[$key]) && $unit->type === $unitables[$key]) {
    $product->storeUnit($key, $unitId, $value);
} else {
    // Handle: type mismatch
}
```

## Configuration Examples

### Strict Configuration

Only allow specific keys with specific types:

```php
protected array $unitables = [
    'weight' => 'weight',
    'length' => 'length',
    'width' => 'length',
    'height' => 'length',
];
```

### Flexible Configuration

Allow any key (no validation):

```php
protected array $unitables = ['*'];
```

### List Configuration

Keys and expected types are the same:

```php
protected array $unitables = ['weight', 'length', 'volume'];
// Equivalent to: ['weight' => 'weight', 'length' => 'length', 'volume' => 'volume']
```

## Related Exceptions

- [UnitNotFoundException](./unit-not-found) - When unit ID doesn't exist
- [FromAndToMustSameTypeException](./from-and-to-must-same-type) - When converting between different types

