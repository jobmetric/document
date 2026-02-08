---
sidebar_position: 3
sidebar_label: FromAndToMustSameTypeException
---

# FromAndToMustSameTypeException

Thrown when attempting to convert a value between units of different types.

## Namespace

```php
JobMetric\UnitConverter\Exceptions\FromAndToMustSameTypeException
```

## HTTP Status Code

`400 Bad Request`

## Constructor

```php
public function __construct(
    int $code = 400,
    ?Throwable $previous = null
)
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `$code` | `int` | HTTP status code (default: 400) |
| `$previous` | `Throwable\|null` | Previous exception for chaining |

## When Is It Thrown?

This exception is thrown when you try to convert a value between units that belong to different measurement types. Unit conversion only makes sense within the same type family.

### Understanding Unit Types

Each unit belongs to a specific type:

| Type | Example Units |
|------|---------------|
| `weight` | gram, kilogram, pound |
| `length` | meter, centimeter, inch |
| `volume` | liter, milliliter, gallon |
| `temperature` | Celsius, Fahrenheit, Kelvin |

### Invalid Conversion Examples

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Cannot convert weight to length
UnitConverter::convert($kilogramId, $meterId, 5);
// Throws: FromAndToMustSameTypeException

// Cannot convert volume to temperature
UnitConverter::convert($literId, $celsiusId, 100);
// Throws: FromAndToMustSameTypeException

// Cannot convert currency to data storage
UnitConverter::convert($usdId, $gigabyteId, 50);
// Throws: FromAndToMustSameTypeException
```

### Valid Conversion Examples

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Weight to weight: OK
UnitConverter::convert($kilogramId, $gramId, 5);
// Returns: 5000

// Length to length: OK
UnitConverter::convert($meterId, $centimeterId, 2);
// Returns: 200

// Currency to currency: OK
UnitConverter::convert($usdId, $eurId, 100);
// Returns: ~92 (depending on exchange rate)
```

## Handling the Exception

### In Controllers

```php
use JobMetric\UnitConverter\Exceptions\FromAndToMustSameTypeException;
use JobMetric\UnitConverter\Facades\UnitConverter;

class ConversionController extends Controller
{
    public function convert(Request $request)
    {
        try {
            $result = UnitConverter::convert(
                $request->from_unit_id,
                $request->to_unit_id,
                $request->value
            );
            
            return response()->json([
                'success' => true,
                'result' => $result,
            ]);
        } catch (FromAndToMustSameTypeException $e) {
            return response()->json([
                'error' => 'incompatible_units',
                'message' => 'Cannot convert between different unit types',
            ], 400);
        }
    }
}
```

### In API Resources

```php
use JobMetric\UnitConverter\Exceptions\FromAndToMustSameTypeException;

class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        $weightInPounds = null;
        
        try {
            if ($this->hasUnit('weight')) {
                $weightInPounds = $this->getUnit('weight', $this->poundUnitId());
            }
        } catch (FromAndToMustSameTypeException $e) {
            // Log the error, unit type mismatch
            Log::error('Weight conversion failed', [
                'product_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }
        
        return [
            'id' => $this->id,
            'name' => $this->name,
            'weight_lbs' => $weightInPounds['value'] ?? null,
        ];
    }
}
```

### Global Exception Handler

```php
use JobMetric\UnitConverter\Exceptions\FromAndToMustSameTypeException;

public function register(): void
{
    $this->renderable(function (FromAndToMustSameTypeException $e, $request) {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'incompatible_units',
                'message' => 'Units must be of the same type for conversion',
                'hint' => 'Ensure both units belong to the same measurement type (e.g., both weight, both length)',
            ], 400);
        }
        
        return redirect()->back()->withErrors([
            'conversion' => 'Cannot convert between different unit types',
        ]);
    });
}
```

## Prevention

### 1. Validate Unit Types Before Conversion

```php
use JobMetric\UnitConverter\Models\Unit;
use JobMetric\UnitConverter\Facades\UnitConverter;

$fromUnit = Unit::find($fromUnitId);
$toUnit = Unit::find($toUnitId);

if ($fromUnit && $toUnit && $fromUnit->type === $toUnit->type) {
    $result = UnitConverter::convert($fromUnitId, $toUnitId, $value);
} else {
    // Handle: incompatible types
}
```

### 2. Use Form Request Validation

```php
use JobMetric\UnitConverter\Models\Unit;

class ConvertRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'from_unit_id' => 'required|integer|exists:units,id',
            'to_unit_id' => 'required|integer|exists:units,id',
            'value' => 'required|numeric',
        ];
    }
    
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $fromUnit = Unit::find($this->from_unit_id);
            $toUnit = Unit::find($this->to_unit_id);
            
            if ($fromUnit && $toUnit && $fromUnit->type !== $toUnit->type) {
                $validator->errors()->add(
                    'to_unit_id',
                    "Cannot convert from {$fromUnit->type} to {$toUnit->type}"
                );
            }
        });
    }
}
```

### 3. Filter Units by Type in UI

When building a conversion UI, filter the target units by the source unit's type:

```php
// Controller
public function getCompatibleUnits(int $unitId)
{
    $unit = Unit::find($unitId);
    
    if (!$unit) {
        return response()->json([]);
    }
    
    $compatibleUnits = Unit::where('type', $unit->type)
        ->where('id', '!=', $unitId)
        ->where('status', true)
        ->with('translations')
        ->get();
    
    return response()->json($compatibleUnits);
}
```

### 4. Use Model's getUnit with Type Safety

The `getUnit()` method on models with `HasUnit` trait validates type compatibility:

```php
class Product extends Model
{
    use HasUnit;
    
    protected array $unitables = [
        'weight' => 'weight', // Only accepts weight type units
    ];
}

$product = Product::find(1);

// This validates that $targetUnitId is a weight unit
$converted = $product->getUnit('weight', $targetUnitId);
```

## The Conversion Formula

Understanding why types must match:

```
result = value × (from_unit.value / to_unit.value)
```

This formula only makes mathematical sense when both units measure the same physical quantity. For example:

- **Valid**: 5 kg → grams: `5 × (1000 / 1) = 5000 g`
- **Invalid**: 5 kg → meters: Makes no physical sense

## Related Exceptions

- [UnitNotFoundException](./unit-not-found) - When unit ID doesn't exist
- [TypeNotFoundInAllowTypesException](./type-not-found-in-allow-types) - When unit key is not allowed

