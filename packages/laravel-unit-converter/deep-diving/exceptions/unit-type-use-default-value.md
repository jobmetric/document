---
sidebar_position: 5
sidebar_label: UnitTypeUseDefaultValueException
---

# UnitTypeUseDefaultValueException

Thrown when attempting to create a unit with `value = 1` when a base unit already exists for that type.

## Namespace

```php
JobMetric\UnitConverter\Exceptions\UnitTypeUseDefaultValueException
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
| `$type` | `string` | The unit type where a base unit already exists |
| `$code` | `int` | HTTP status code (default: 400) |
| `$previous` | `Throwable\|null` | Previous exception for chaining |

## Understanding the Rule

In Laravel Unit Converter's base unit system:

1. Each type can have **only one** base unit with `value = 1`
2. The base unit serves as the **reference point** for all conversions
3. Having multiple base units would break the conversion mathematics

### Why Only One Base Unit?

The conversion formula relies on a single reference:

```
result = input_value × (from_unit.value / to_unit.value)
```

If two units had `value = 1`, they would be mathematically equivalent, causing confusion and potential data integrity issues.

## When Is It Thrown?

This exception is thrown when you try to create a unit with `value = 1` for a type that already has a base unit.

### Example: Duplicate Base Unit Attempt

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Gram already exists as the base unit for weight (value = 1)

// Trying to create another unit with value = 1 - WRONG!
UnitConverter::store([
    'type' => 'weight',
    'value' => 1,  // Error! Base unit already exists
    'translation' => [
        'en' => ['name' => 'Base Weight', 'code' => 'bw'],
    ],
]);
// Throws: UnitTypeUseDefaultValueException
```

### Correct Approach

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Gram (base unit) already exists

// Create new unit with value relative to gram
UnitConverter::store([
    'type' => 'weight',
    'value' => 1000,  // Not 1, relative to gram
    'translation' => [
        'en' => ['name' => 'Kilogram', 'code' => 'kg'],
    ],
]);
// Success!
```

## Handling the Exception

### In Controllers

```php
use JobMetric\UnitConverter\Exceptions\UnitTypeUseDefaultValueException;
use JobMetric\UnitConverter\Facades\UnitConverter;

class UnitController extends Controller
{
    public function store(Request $request)
    {
        try {
            $response = UnitConverter::store($request->all());
            return response()->json($response->data, 201);
        } catch (UnitTypeUseDefaultValueException $e) {
            return response()->json([
                'error' => 'base_unit_exists',
                'message' => $e->getMessage(),
                'hint' => 'A base unit (value = 1) already exists for this type. Use a different value.',
            ], 400);
        }
    }
}
```

### In Form Validation

Prevent the issue before it reaches the service:

```php
use JobMetric\UnitConverter\Models\Unit;

class StoreUnitRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'type' => 'required|string',
            'value' => 'required|numeric|min:0',
            'translation' => 'required|array',
        ];
    }
    
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $type = $this->input('type');
            $value = (float) $this->input('value');
            
            if ($value === 1.0) {
                $baseExists = Unit::where('type', $type)
                    ->where('value', 1)
                    ->exists();
                
                if ($baseExists) {
                    $validator->errors()->add(
                        'value',
                        "A base unit (value = 1) already exists for type '{$type}'"
                    );
                }
            }
        });
    }
}
```

## Prevention

### 1. Check Before Creating

```php
use JobMetric\UnitConverter\Models\Unit;
use JobMetric\UnitConverter\Facades\UnitConverter;

function createUnitSafely(array $data): mixed
{
    $type = $data['type'];
    $value = (float) $data['value'];
    
    if ($value === 1.0) {
        $baseExists = Unit::where('type', $type)->where('value', 1)->exists();
        
        if ($baseExists) {
            throw new \InvalidArgumentException(
                "Base unit already exists for type '{$type}'. Use changeDefaultValue() to change the base unit."
            );
        }
    }
    
    return UnitConverter::store($data);
}
```

### 2. Use changeDefaultValue() Instead

If you want to change which unit is the base unit, use `changeDefaultValue()`:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Current state:
// - Gram: value = 1 (base)
// - Kilogram: value = 1000

// Make Kilogram the new base unit
UnitConverter::changeDefaultValue($kilogramId);

// New state:
// - Gram: value = 0.001
// - Kilogram: value = 1 (new base)
```

### 3. UI Validation

In your frontend, prevent users from entering `value = 1` if a base unit exists:

```javascript
// Example Vue.js validation
async function validateUnitValue(type, value) {
    if (value === 1) {
        const response = await fetch(`/api/units/base-exists/${type}`);
        const { exists } = await response.json();
        
        if (exists) {
            return 'A base unit already exists for this type';
        }
    }
    return null;
}
```

## What If You Need to Change the Base Unit?

Use the `changeDefaultValue()` method to designate a different unit as the base:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Scenario: You want Kilogram to be the base unit instead of Gram

// Find the kilogram unit
$kilogram = UnitConverter::findUnitByCode('kg');

// Make it the base unit
$response = UnitConverter::changeDefaultValue($kilogram->id);

if ($response->ok) {
    // All other units in the type are automatically recalculated
    // Kilogram: value = 1 (new base)
    // Gram: value = 0.001 (was 1, now relative to kg)
    // Ton: value = 1000 (was 1000000, now relative to kg)
}
```

## Related Exceptions

- [UnitTypeDefaultValueException](./unit-type-default-value) - When first unit doesn't have value = 1
- [UnitTypeCannotChangeDefaultValueException](./unit-type-cannot-change-default-value) - When trying to modify base unit's value
- [CannotDeleteDefaultValueException](./cannot-delete-default-value) - When trying to delete base unit

