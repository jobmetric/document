---
sidebar_position: 8
sidebar_label: UnitTypeUsedInException
---

# UnitTypeUsedInException

Thrown when attempting to delete or modify a unit that is currently used in unit relations.

## Namespace

```php
JobMetric\UnitConverter\Exceptions\UnitTypeUsedInException
```

## HTTP Status Code

`400 Bad Request`

## Constructor

```php
public function __construct(
    int $unit_id,
    int $number,
    int $code = 400,
    ?Throwable $previous = null
)
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `$unit_id` | `int` | The unit ID that is being used |
| `$number` | `int` | Number of relations using this unit |
| `$code` | `int` | HTTP status code (default: 400) |
| `$previous` | `Throwable\|null` | Previous exception for chaining |

## Understanding Unit Relations

When you attach a unit to a model using `HasUnit`, a record is created in `unit_relations`:

```php
// This creates a unit_relation record
$product->storeUnit('weight', $kilogramId, 2.5);

// unit_relations table:
// | unit_id | unitable_type      | unitable_id | type   | value |
// |---------|-------------------|-------------|--------|-------|
// | 2       | App\Models\Product | 1           | weight | 2.5   |
```

A unit **cannot be deleted** if any relations reference it.

## When Is It Thrown?

### 1. Deleting a Used Unit

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Kilogram is used by 150 products
UnitConverter::destroy($kilogramId);
// Throws: UnitTypeUsedInException with number = 150
```

### 2. Changing Default Value of a Used Unit

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Kilogram is used by products
UnitConverter::changeDefaultValue($kilogramId);
// Throws: UnitTypeUsedInException
```

## Exception Properties

You can access the count of relations from the exception message:

```php
try {
    UnitConverter::destroy($unitId);
} catch (UnitTypeUsedInException $e) {
    // Message includes: "Unit {unit_id} is used in {number} relations"
    echo $e->getMessage();
}
```

## Handling the Exception

### In Controllers

```php
use JobMetric\UnitConverter\Exceptions\UnitTypeUsedInException;
use JobMetric\UnitConverter\Facades\UnitConverter;

class UnitController extends Controller
{
    public function destroy(int $id)
    {
        try {
            $response = UnitConverter::destroy($id);
            return response()->json(['message' => 'Unit deleted']);
        } catch (UnitTypeUsedInException $e) {
            // Get usage details
            $usageResponse = UnitConverter::usedIn($id);
            
            return response()->json([
                'error' => 'unit_in_use',
                'message' => $e->getMessage(),
                'usage_count' => $usageResponse->data->count(),
                'hint' => 'Remove all usages before deleting, or migrate to a different unit.',
            ], 400);
        }
    }
}
```

### Show Usage Details

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

class UnitController extends Controller
{
    public function usedIn(int $id)
    {
        $response = UnitConverter::usedIn($id);
        
        return response()->json([
            'unit_id' => $id,
            'usage_count' => $response->data->count(),
            'usages' => $response->data->map(function ($relation) {
                return [
                    'model_type' => $relation->unitable_type,
                    'model_id' => $relation->unitable_id,
                    'key' => $relation->type,
                    'value' => $relation->value,
                ];
            }),
        ]);
    }
}
```

## Solutions

### Solution 1: Remove All Usages First

Delete all unit relations before deleting the unit:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;
use JobMetric\UnitConverter\Models\UnitRelation;

$unitId = 2; // Kilogram

// Step 1: Remove all relations
UnitRelation::where('unit_id', $unitId)->delete();

// Step 2: Now delete the unit
UnitConverter::destroy($unitId);
```

### Solution 2: Migrate to Another Unit

If you want to replace one unit with another, migrate the data:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;
use JobMetric\UnitConverter\Models\UnitRelation;

$oldUnitId = 2; // Kilogram (to be deleted)
$newUnitId = 1; // Gram (replacement)

// Step 1: Convert all values and update relations
$relations = UnitRelation::where('unit_id', $oldUnitId)->get();

foreach ($relations as $relation) {
    // Convert value from old unit to new unit
    $convertedValue = UnitConverter::convert($oldUnitId, $newUnitId, $relation->value);
    
    // Update the relation
    $relation->update([
        'unit_id' => $newUnitId,
        'value' => $convertedValue,
    ]);
}

// Step 2: Now delete the old unit
UnitConverter::destroy($oldUnitId);
```

### Solution 3: Soft Delete / Disable Instead

Instead of deleting, disable the unit:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Instead of deleting, just disable
UnitConverter::update($unitId, ['status' => false]);

// The unit still exists for historical data
// But won't appear in active unit lists
```

### Solution 4: Check Before Attempting Delete

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

class UnitService
{
    public function safeDelete(int $unitId): array
    {
        // Check if unit is used
        if (UnitConverter::hasUsed($unitId)) {
            $usage = UnitConverter::usedIn($unitId);
            
            return [
                'success' => false,
                'reason' => 'unit_in_use',
                'usage_count' => $usage->data->count(),
            ];
        }
        
        // Safe to delete
        UnitConverter::destroy($unitId);
        
        return ['success' => true];
    }
}
```

## Prevention

### 1. Check Usage Before Delete UI

```php
// API endpoint for checking deletability
public function canDelete(int $id): JsonResponse
{
    $unit = Unit::find($id);
    
    if (!$unit) {
        return response()->json(['error' => 'Unit not found'], 404);
    }
    
    $isUsed = UnitConverter::hasUsed($id);
    $isBase = (float) $unit->value === 1.0;
    $hasOtherUnits = Unit::where('type', $unit->type)
        ->where('id', '!=', $id)
        ->exists();
    
    return response()->json([
        'can_delete' => !$isUsed && (!$isBase || !$hasOtherUnits),
        'is_used' => $isUsed,
        'is_base' => $isBase,
        'usage_count' => $isUsed ? UnitConverter::usedIn($id)->data->count() : 0,
    ]);
}
```

### 2. Confirmation Dialog with Usage Count

```javascript
// Frontend
async function confirmDeleteUnit(unitId) {
    const { can_delete, is_used, usage_count } = await checkCanDelete(unitId);
    
    if (!can_delete) {
        if (is_used) {
            alert(`Cannot delete: Unit is used by ${usage_count} items. Please migrate or remove usages first.`);
        }
        return false;
    }
    
    return confirm('Are you sure you want to delete this unit?');
}
```

### 3. Provide Migration Tool

Build a UI for migrating from one unit to another:

```php
// Migration endpoint
public function migrateUnit(Request $request): JsonResponse
{
    $request->validate([
        'from_unit_id' => 'required|exists:units,id',
        'to_unit_id' => 'required|exists:units,id|different:from_unit_id',
    ]);
    
    $fromUnit = Unit::find($request->from_unit_id);
    $toUnit = Unit::find($request->to_unit_id);
    
    // Ensure same type
    if ($fromUnit->type !== $toUnit->type) {
        return response()->json([
            'error' => 'Units must be of the same type'
        ], 400);
    }
    
    // Migrate all relations
    $migrated = $this->unitService->migrateRelations(
        $request->from_unit_id,
        $request->to_unit_id
    );
    
    return response()->json([
        'success' => true,
        'migrated_count' => $migrated,
    ]);
}
```

## Related Exceptions

- [CannotDeleteDefaultValueException](./cannot-delete-default-value) - When trying to delete base unit
- [UnitNotFoundException](./unit-not-found) - When unit doesn't exist

