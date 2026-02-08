---
sidebar_position: 7
sidebar_label: CannotDeleteDefaultValueException
---

# CannotDeleteDefaultValueException

Thrown when attempting to delete the base unit while other units of the same type exist.

## Namespace

```php
JobMetric\UnitConverter\Exceptions\CannotDeleteDefaultValueException
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

## Understanding the Restriction

The base unit cannot be deleted while other units exist because:

1. Other units' values are defined **relative to the base unit**
2. Deleting the base would leave other units **without a reference point**
3. All conversion calculations would become **invalid**

### Example Scenario

```
Weight Type:
├── Gram (value = 1) ← BASE UNIT
├── Kilogram (value = 1000) ← relative to gram
├── Milligram (value = 0.001) ← relative to gram
└── Ton (value = 1000000) ← relative to gram
```

If gram is deleted:
- What does `value = 1000` for kilogram mean?
- There's no reference point for conversions
- The entire type becomes unusable

## When Is It Thrown?

This exception is thrown when:
1. You try to delete a unit with `value = 1` (base unit)
2. AND other units of the same type still exist

### Example: Invalid Delete Attempt

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Weight type has: gram (base), kilogram, ton

$gram = UnitConverter::findUnitByCode('g');

// Trying to delete the base unit - WRONG!
UnitConverter::destroy($gram->id);
// Throws: CannotDeleteDefaultValueException
```

### When Delete IS Allowed

You CAN delete the base unit if it's the **only** unit in that type:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Assume: Weight type has ONLY gram (no other units)

$gram = UnitConverter::findUnitByCode('g');
UnitConverter::destroy($gram->id);
// Success! Type is now empty
```

## Handling the Exception

### In Controllers

```php
use JobMetric\UnitConverter\Exceptions\CannotDeleteDefaultValueException;
use JobMetric\UnitConverter\Facades\UnitConverter;

class UnitController extends Controller
{
    public function destroy(int $id)
    {
        try {
            $response = UnitConverter::destroy($id);
            return response()->json(['message' => 'Unit deleted']);
        } catch (CannotDeleteDefaultValueException $e) {
            return response()->json([
                'error' => 'cannot_delete_base_unit',
                'message' => $e->getMessage(),
                'hint' => 'Delete all other units first, or use changeDefaultValue() to set a different base unit.',
            ], 400);
        }
    }
}
```

### In Admin Panels

Show a clear warning when users try to delete the base unit:

```php
// Check if unit can be deleted
public function canDelete(Unit $unit): array
{
    // Base unit with other units in type
    if ((float) $unit->value === 1.0) {
        $otherUnitsExist = Unit::where('type', $unit->type)
            ->where('id', '!=', $unit->id)
            ->exists();
        
        if ($otherUnitsExist) {
            return [
                'can_delete' => false,
                'reason' => 'This is the base unit. Delete other units first or change the base unit.',
            ];
        }
    }
    
    // Check if unit is used in relations
    if ($unit->unitRelations()->exists()) {
        return [
            'can_delete' => false,
            'reason' => 'This unit is in use by other models.',
        ];
    }
    
    return ['can_delete' => true];
}
```

## Solutions

### Solution 1: Change the Base Unit First

If you need to delete the current base unit, first designate another unit as the base:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Current: Gram (base), Kilogram, Ton

// Step 1: Make Kilogram the new base
$kilogram = UnitConverter::findUnitByCode('kg');
UnitConverter::changeDefaultValue($kilogram->id);

// After: Gram (0.001), Kilogram (base), Ton (1000)

// Step 2: Now you can delete Gram
$gram = UnitConverter::findUnitByCode('g');
UnitConverter::destroy($gram->id);
// Success!
```

### Solution 2: Delete All Other Units First

If you want to completely remove a unit type:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;
use JobMetric\UnitConverter\Models\Unit;

// Get all weight units
$weightUnits = Unit::where('type', 'weight')
    ->orderByDesc('value') // Delete non-base units first
    ->get();

foreach ($weightUnits as $unit) {
    // Skip base unit for now
    if ((float) $unit->value === 1.0) {
        continue;
    }
    
    UnitConverter::destroy($unit->id);
}

// Now delete the base unit (it's the only one left)
$baseUnit = Unit::where('type', 'weight')->first();
UnitConverter::destroy($baseUnit->id);
```

### Solution 3: Bulk Delete Entire Type

If you need to delete all units of a type at once:

```php
use JobMetric\UnitConverter\Models\Unit;

// WARNING: This bypasses business logic checks
// Use only when you're certain no relations exist

Unit::where('type', 'weight')->delete();
```

⚠️ **Warning**: Direct deletion bypasses the exception and could leave orphaned `unit_relations` records.

## Prevention

### 1. Disable Delete Button for Base Units

```javascript
// Frontend
function canDeleteUnit(unit, allUnitsOfType) {
    // Is base unit?
    if (unit.value === 1) {
        // Check if other units exist
        const otherUnits = allUnitsOfType.filter(u => u.id !== unit.id);
        if (otherUnits.length > 0) {
            return false;
        }
    }
    return true;
}
```

### 2. Show Base Unit Badge

```html
<!-- In unit list -->
<tr v-for="unit in units">
    <td>{{ unit.name }}</td>
    <td>
        {{ unit.value }}
        <span v-if="unit.value === 1" class="badge badge-primary">Base Unit</span>
    </td>
    <td>
        <button 
            @click="deleteUnit(unit)"
            :disabled="!canDeleteUnit(unit)"
            :title="canDeleteUnit(unit) ? 'Delete' : 'Cannot delete base unit'"
        >
            Delete
        </button>
    </td>
</tr>
```

### 3. Provide Change Base Option

Instead of delete, offer to change the base unit:

```php
// In your controller
public function changeBase(Request $request, int $currentBaseId)
{
    $request->validate(['new_base_id' => 'required|exists:units,id']);
    
    $response = UnitConverter::changeDefaultValue($request->new_base_id);
    
    return response()->json([
        'message' => 'Base unit changed successfully',
        'new_base' => $response->data,
    ]);
}
```

## Related Exceptions

- [UnitTypeDefaultValueException](./unit-type-default-value) - When first unit doesn't have value = 1
- [UnitTypeUseDefaultValueException](./unit-type-use-default-value) - When creating duplicate base unit
- [UnitTypeCannotChangeDefaultValueException](./unit-type-cannot-change-default-value) - When trying to modify base unit's value
- [UnitTypeUsedInException](./unit-type-used-in) - When unit is used in relations

