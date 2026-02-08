---
sidebar_position: 6
sidebar_label: UnitTypeCannotChangeDefaultValueException
---

# UnitTypeCannotChangeDefaultValueException

Thrown when attempting to change the base unit's value from 1 to a different value through the update operation.

## Namespace

```php
JobMetric\UnitConverter\Exceptions\UnitTypeCannotChangeDefaultValueException
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

## Understanding the Protection

The base unit (with `value = 1`) is protected from direct value modifications because:

1. It serves as the **reference point** for all other units in the type
2. Changing its value would **break all existing conversions**
3. All stored values in `unit_relations` would become **incorrect**

### Example: Why This Protection Matters

Consider the weight type with gram as base:
- Gram: `value = 1` (base)
- Kilogram: `value = 1000`

A product has `weight = 2500` stored with unit_id = gram.

If you could change gram's value to `0.001`:
- The stored value `2500` would now mean 2.5 grams instead of 2500 grams
- All historical data would be corrupted

## When Is It Thrown?

This exception is thrown when you try to update a base unit and change its value from 1.

### Example: Invalid Update Attempt

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Gram is the base unit (value = 1)
$gram = UnitConverter::findUnitByCode('g');

// Trying to change its value - WRONG!
UnitConverter::update($gram->id, [
    'value' => 0.001,  // Error! Cannot change base unit value
]);
// Throws: UnitTypeCannotChangeDefaultValueException
```

### What You CAN Update on a Base Unit

You can update other properties without changing the value:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

$gram = UnitConverter::findUnitByCode('g');

// These updates are allowed
UnitConverter::update($gram->id, [
    'status' => false,  // OK - disable the unit
]);

UnitConverter::update($gram->id, [
    'translation' => [  // OK - update translations
        'en' => ['name' => 'Gram (updated)', 'code' => 'g'],
    ],
]);

// Even including value = 1 is OK (not changing it)
UnitConverter::update($gram->id, [
    'value' => 1,  // OK - same value
    'translation' => [...],
]);
```

## Handling the Exception

### In Controllers

```php
use JobMetric\UnitConverter\Exceptions\UnitTypeCannotChangeDefaultValueException;
use JobMetric\UnitConverter\Facades\UnitConverter;

class UnitController extends Controller
{
    public function update(Request $request, int $id)
    {
        try {
            $response = UnitConverter::update($id, $request->all());
            return response()->json($response->data);
        } catch (UnitTypeCannotChangeDefaultValueException $e) {
            return response()->json([
                'error' => 'cannot_modify_base_unit',
                'message' => $e->getMessage(),
                'hint' => 'Use changeDefaultValue() to change the base unit to a different unit.',
            ], 400);
        }
    }
}
```

### In Form Validation

Prevent the issue in validation:

```php
use JobMetric\UnitConverter\Models\Unit;

class UpdateUnitRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'value' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|boolean',
            'translation' => 'sometimes|array',
        ];
    }
    
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (!$this->has('value')) {
                return;
            }
            
            $unit = Unit::find($this->route('id'));
            
            if ($unit && (float) $unit->value === 1.0 && (float) $this->value !== 1.0) {
                $validator->errors()->add(
                    'value',
                    'Cannot change the value of a base unit. Use changeDefaultValue() instead.'
                );
            }
        });
    }
}
```

## The Correct Way to Change Base Units

If you need a different unit to be the base, use `changeDefaultValue()`:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Current state:
// - Gram: value = 1 (base)
// - Kilogram: value = 1000
// - Ton: value = 1000000

// Make Kilogram the new base
$kilogram = UnitConverter::findUnitByCode('kg');
UnitConverter::changeDefaultValue($kilogram->id);

// New state (all values recalculated):
// - Gram: value = 0.001
// - Kilogram: value = 1 (new base)
// - Ton: value = 1000
```

### What changeDefaultValue() Does

1. Gets the target unit's current value (e.g., 1000 for kilogram)
2. Divides all units' values by this pivot value
3. The target unit becomes `value = 1`
4. All other units are proportionally adjusted

```php
// Before: Gram (1), Kilogram (1000), Ton (1000000)
// Pivot = 1000 (kilogram's value)
// After: Gram (1/1000 = 0.001), Kilogram (1000/1000 = 1), Ton (1000000/1000 = 1000)
```

## Prevention

### 1. Check If Unit Is Base Before Update

```php
use JobMetric\UnitConverter\Models\Unit;
use JobMetric\UnitConverter\Facades\UnitConverter;

function updateUnitSafely(int $unitId, array $data): mixed
{
    if (isset($data['value'])) {
        $unit = Unit::find($unitId);
        
        if ($unit && (float) $unit->value === 1.0 && (float) $data['value'] !== 1.0) {
            // Remove value from update or throw custom error
            unset($data['value']);
            // Or: throw new \InvalidArgumentException('Cannot change base unit value');
        }
    }
    
    return UnitConverter::update($unitId, $data);
}
```

### 2. UI Indication

In your admin panel, clearly indicate which unit is the base:

```php
// In your view/API
$units = Unit::where('type', 'weight')->get()->map(function ($unit) {
    return [
        'id' => $unit->id,
        'name' => $unit->name,
        'value' => $unit->value,
        'is_base' => (float) $unit->value === 1.0,
        'value_editable' => (float) $unit->value !== 1.0,
    ];
});
```

### 3. Disable Value Field for Base Units

```javascript
// Frontend example
function isValueEditable(unit) {
    return unit.value !== 1;
}

// In form
<input 
    type="number" 
    v-model="unit.value"
    :disabled="!isValueEditable(unit)"
    :title="isValueEditable(unit) ? '' : 'Base unit value cannot be changed'"
/>
```

## Related Exceptions

- [UnitTypeDefaultValueException](./unit-type-default-value) - When first unit doesn't have value = 1
- [UnitTypeUseDefaultValueException](./unit-type-use-default-value) - When creating duplicate base unit
- [CannotDeleteDefaultValueException](./cannot-delete-default-value) - When trying to delete base unit

