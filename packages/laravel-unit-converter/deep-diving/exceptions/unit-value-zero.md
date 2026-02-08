---
sidebar_position: 9
sidebar_label: UnitValueZeroException
---

# UnitValueZeroException

Thrown when attempting to change the default value to a unit with `value = 0`.

## Namespace

```php
JobMetric\UnitConverter\Exceptions\UnitValueZeroException
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

## Understanding the Problem

When changing the default (base) unit, all other units are recalculated using the formula:

```
new_value = old_value / pivot_value
```

Where `pivot_value` is the current value of the new base unit.

If `pivot_value = 0`, this results in **division by zero**, which is mathematically undefined.

### Example: Why Zero Fails

```
Current state:
├── Gram: value = 1 (base)
├── Kilogram: value = 1000
└── ZeroUnit: value = 0

Trying to make ZeroUnit the base:
├── Gram: 1 / 0 = ??? (undefined!)
├── Kilogram: 1000 / 0 = ??? (undefined!)
└── ZeroUnit: 0 / 0 = ??? (undefined!)
```

## When Is It Thrown?

This exception is thrown when calling `changeDefaultValue()` with a unit that has `value = 0`.

### Example

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Create a unit with value = 0 (unusual but possible)
$response = UnitConverter::store([
    'type' => 'custom',
    'value' => 0,
    'translation' => [...],
]);

$zeroUnit = $response->data;

// Later, trying to make it the base unit - WRONG!
UnitConverter::changeDefaultValue($zeroUnit->id);
// Throws: UnitValueZeroException
```

## Handling the Exception

### In Controllers

```php
use JobMetric\UnitConverter\Exceptions\UnitValueZeroException;
use JobMetric\UnitConverter\Facades\UnitConverter;

class UnitController extends Controller
{
    public function changeBase(Request $request)
    {
        try {
            $response = UnitConverter::changeDefaultValue($request->unit_id);
            return response()->json($response->data);
        } catch (UnitValueZeroException $e) {
            return response()->json([
                'error' => 'invalid_base_unit',
                'message' => $e->getMessage(),
                'hint' => 'Cannot use a unit with value = 0 as the base unit (division by zero).',
            ], 400);
        }
    }
}
```

## Prevention

### 1. Validate Before Changing Base

```php
use JobMetric\UnitConverter\Models\Unit;
use JobMetric\UnitConverter\Facades\UnitConverter;

function safeChangeBase(int $unitId): mixed
{
    $unit = Unit::find($unitId);
    
    if (!$unit) {
        throw new \InvalidArgumentException('Unit not found');
    }
    
    if ((float) $unit->value === 0.0) {
        throw new \InvalidArgumentException(
            'Cannot use a unit with value = 0 as base unit'
        );
    }
    
    return UnitConverter::changeDefaultValue($unitId);
}
```

### 2. Filter Zero-Value Units in UI

When showing units that can become base:

```php
// Only show units with non-zero values as base candidates
$eligibleForBase = Unit::where('type', $type)
    ->where('value', '!=', 0)
    ->get();
```

### 3. Prevent Creating Zero-Value Units

Consider if zero-value units make sense in your application:

```php
class StoreUnitRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'type' => 'required|string',
            'value' => 'required|numeric|gt:0', // Must be greater than 0
            'translation' => 'required|array',
        ];
    }
}
```

## When Are Zero-Value Units Valid?

In most cases, a unit with `value = 0` doesn't make practical sense. However, there might be edge cases:

1. **Placeholder units** - Temporarily created units awaiting proper values
2. **Special markers** - Units that represent "none" or "not applicable"
3. **Data migration** - During data cleanup or migration processes

If you have such units, just ensure they're never used as the base unit.

## Related Exceptions

- [UnitTypeDefaultValueException](./unit-type-default-value) - When first unit doesn't have value = 1
- [UnitTypeCannotChangeDefaultValueException](./unit-type-cannot-change-default-value) - When trying to modify base unit's value
- [UnitTypeUsedInException](./unit-type-used-in) - When unit is used in relations

