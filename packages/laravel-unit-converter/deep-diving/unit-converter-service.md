---
sidebar_position: 2
sidebar_label: Unit Converter Service
---

import Link from "@docusaurus/Link";

# Unit Converter Service

The `UnitConverter` service provides a comprehensive API for managing units, performing conversions, and handling unit CRUD operations.

## Namespace

```php
JobMetric\UnitConverter\UnitConverter
```

## Facade

Access the service through its facade:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;
```

## Overview

The `UnitConverter` service provides:

- **CRUD Operations**: Create, read, update, delete units
- **Conversions**: Convert values between units of the same type
- **Pagination & Filtering**: Query units with filters
- **Translation Support**: Full multilingual support for unit names and codes
- **Default Value Management**: Change base units within a type
- **Usage Tracking**: Find where units are used

## CRUD Operations

### Store Unit

Create a new unit:

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

$response = UnitConverter::store([
    'type' => 'weight',
    'value' => 1000, // relative to base unit
    'status' => true,
    'translation' => [
        'en' => [
            'name' => 'Kilogram',
            'code' => 'kg',
            'position' => 'right',
            'description' => 'SI unit of mass',
        ],
        'fa' => [
            'name' => 'کیلوگرم',
            'code' => 'کیلو',
            'position' => 'right',
        ],
    ],
]);

if ($response->ok) {
    $unit = $response->data; // UnitResource
}
```

**Parameters:**
- `type` (required) - Unit type from `UnitTypeEnum`
- `value` (required) - Conversion value relative to base unit
- `status` (optional) - Active status (default: true)
- `translation` (required) - Array of translations by locale

**Important Rules:**
- The first unit created for a type must have `value = 1` (base unit)
- Subsequent units cannot have `value = 1`

**Returns:** `Response` with `UnitResource` data

### Get Unit

Retrieve a unit by ID:

```php
$response = UnitConverter::get($unitId);

if ($response->ok) {
    $unit = $response->data;
    echo $unit->type; // 'weight'
    echo $unit->value; // 1000
    echo $unit->translations['en']['name']; // 'Kilogram'
}
```

**Parameters:**
- `int $unit_id` - Unit ID
- `array $with` - Relations to eager load (default: [])
- `string|null $locale` - Specific locale for translations

**Returns:** `Response` with `UnitResource` data

### Get Unit Object

Get the raw Eloquent model:

```php
$unit = UnitConverter::getObject($unitId);
// => Unit model instance

echo $unit->type;
echo $unit->value;
```

**Parameters:**
- `int $unit_id` - Unit ID

**Returns:** `Unit` model

**Throws:** `UnitNotFoundException` if not found

### Update Unit

Update an existing unit:

```php
$response = UnitConverter::update($unitId, [
    'value' => 1000.5,
    'status' => false,
    'translation' => [
        'en' => [
            'name' => 'Kilogram (updated)',
        ],
    ],
]);
```

**Parameters:**
- `int $unitId` - Unit ID
- `array $data` - Fields to update

**Important Rules:**
- Cannot change the base unit's value from 1

**Returns:** `Response` with updated `UnitResource`

### Delete Unit

Delete a unit:

```php
$response = UnitConverter::destroy($unitId);

if ($response->ok) {
    echo "Unit deleted successfully";
}
```

**Parameters:**
- `int $unitId` - Unit ID

**Important Rules:**
- Cannot delete a unit that is used in relations
- Cannot delete base unit (value = 1) if other units of the same type exist

**Returns:** `Response`

## Query Operations

### Get All Units

Retrieve all units with optional filters:

```php
$response = UnitConverter::all(
    filters: ['type' => 'weight'],
    with: ['translations'],
);

foreach ($response->data as $unit) {
    echo $unit->translations['en']['name'];
}
```

**Parameters:**
- `array $filters` - Filter criteria
- `array $with` - Relations to eager load
- `string|null $mode` - Query mode

**Returns:** `Response` with collection of `UnitResource`

### Paginate Units

Get paginated units:

```php
$response = UnitConverter::paginate(
    pageLimit: 15,
    filters: ['type' => 'length'],
    with: ['translations'],
);

$units = $response->data; // Paginated collection
$meta = $response->meta; // Pagination metadata
```

**Parameters:**
- `int $pageLimit` - Items per page (default: 15)
- `array $filters` - Filter criteria
- `array $with` - Relations to eager load
- `string|null $mode` - Query mode

**Returns:** `Response` with paginated `UnitResource` collection

### Query Builder

Get a query builder instance for custom queries:

```php
$query = UnitConverter::query(
    filters: ['status' => true],
    with: ['translations'],
);

$units = $query->orderBy('value')->get();
```

**Returns:** `QueryBuilder` instance

## Conversion Operations

### Convert Value

Convert a value from one unit to another:

```php
$result = UnitConverter::convert(
    from_unit_id: $kilogramId,
    to_unit_id: $gramId,
    value: 2.5
);
// => 2500.0

// Using helper function
$result = unitConvert($kilogramId, $gramId, 2.5);
// => 2500.0
```

**Parameters:**
- `int $from_unit_id` - Source unit ID
- `int $to_unit_id` - Target unit ID
- `float $value` - Value to convert

**Formula:** `result = value * from_unit.value / to_unit.value`

**Returns:** `float` - Converted value

**Throws:**
- `UnitNotFoundException` - If either unit doesn't exist
- `FromAndToMustSameTypeException` - If units are of different types

### Find Unit by Code

Find a unit by its translation code:

```php
$unit = UnitConverter::findUnitByCode('kg');
// => Unit model or null

if ($unit) {
    echo $unit->id;
    echo $unit->type; // 'weight'
}
```

**Parameters:**
- `string $code` - Unit code from translations

**Returns:** `Unit|null`

## Default Value Management

### Change Default Value

Change the base unit for a type:

```php
// Make kilogram the new base unit (instead of gram)
$response = UnitConverter::changeDefaultValue($kilogramId);

// Now:
// - Kilogram has value = 1
// - Gram has value = 0.001
// - Ton has value = 1000
```

**What happens:**
1. The selected unit becomes the base unit (value = 1)
2. All other units of the same type are recalculated proportionally
3. Existing stored values remain correct (they reference unit IDs)

**Parameters:**
- `int $unit_id` - Unit to make the base unit

**Returns:** `Response` with updated `UnitResource`

**Throws:**
- `UnitNotFoundException` - If unit doesn't exist
- `UnitValueZeroException` - If unit has value = 0
- `UnitTypeUsedInException` - If unit is used in relations

## Usage Tracking

### Get Used In

Find all places where a unit is used:

```php
$response = UnitConverter::usedIn($unitId);

foreach ($response->data as $relation) {
    echo $relation->unitable_type; // 'App\Models\Product'
    echo $relation->unitable_id; // 42
    echo $relation->type; // 'weight'
    echo $relation->value; // 2.5
}
```

**Parameters:**
- `int $unit_id` - Unit ID

**Returns:** `Response` with collection of `UnitRelationResource`

### Check Has Used

Check if a unit is used anywhere:

```php
$isUsed = UnitConverter::hasUsed($unitId);

if ($isUsed) {
    // Cannot safely delete this unit
}
```

**Parameters:**
- `int $unit_id` - Unit ID

**Returns:** `bool`

## Response Object

All service methods return a `Response` object:

```php
$response = UnitConverter::store([...]);

$response->ok; // bool - Success status
$response->message; // string - Human-readable message
$response->data; // mixed - Response data (usually resource)
$response->errors; // array - Validation errors (if any)
```

## Complete Examples

### Create Weight Units

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

// Create base unit (gram) - must be first with value = 1
UnitConverter::store([
    'type' => 'weight',
    'value' => 1,
    'status' => true,
    'translation' => [
        'en' => ['name' => 'Gram', 'code' => 'g'],
        'fa' => ['name' => 'گرم', 'code' => 'گرم'],
    ],
]);

// Create kilogram (1000 grams)
UnitConverter::store([
    'type' => 'weight',
    'value' => 1000,
    'status' => true,
    'translation' => [
        'en' => ['name' => 'Kilogram', 'code' => 'kg'],
        'fa' => ['name' => 'کیلوگرم', 'code' => 'کیلو'],
    ],
]);

// Create ton (1,000,000 grams)
UnitConverter::store([
    'type' => 'weight',
    'value' => 1000000,
    'status' => true,
    'translation' => [
        'en' => ['name' => 'Metric Ton', 'code' => 't'],
        'fa' => ['name' => 'تن', 'code' => 'تن'],
    ],
]);

// Create pound (453.592 grams)
UnitConverter::store([
    'type' => 'weight',
    'value' => 453.592,
    'status' => true,
    'translation' => [
        'en' => ['name' => 'Pound', 'code' => 'lb'],
        'fa' => ['name' => 'پوند', 'code' => 'پوند'],
    ],
]);
```

### Conversion Calculator

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

class ConversionCalculator
{
    public function convert(string $fromCode, string $toCode, float $value): array
    {
        $fromUnit = UnitConverter::findUnitByCode($fromCode);
        $toUnit = UnitConverter::findUnitByCode($toCode);
        
        if (!$fromUnit || !$toUnit) {
            throw new \InvalidArgumentException('Invalid unit code');
        }
        
        if ($fromUnit->type !== $toUnit->type) {
            throw new \InvalidArgumentException('Cannot convert between different types');
        }
        
        $result = UnitConverter::convert($fromUnit->id, $toUnit->id, $value);
        
        return [
            'from' => [
                'value' => $value,
                'unit' => $fromCode,
                'name' => $fromUnit->translations->where('locale', app()->getLocale())->first()?->name,
            ],
            'to' => [
                'value' => $result,
                'unit' => $toCode,
                'name' => $toUnit->translations->where('locale', app()->getLocale())->first()?->name,
            ],
        ];
    }
}

// Usage
$calculator = new ConversionCalculator();
$result = $calculator->convert('kg', 'lb', 5);
// => ['from' => ['value' => 5, 'unit' => 'kg', ...], 'to' => ['value' => 11.023, 'unit' => 'lb', ...]]
```

### Unit Management API

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

class UnitController extends Controller
{
    public function index(Request $request)
    {
        $response = UnitConverter::paginate(
            pageLimit: $request->input('per_page', 15),
            filters: $request->only(['type', 'status']),
            with: ['translations'],
        );
        
        return response()->json($response->data);
    }
    
    public function store(Request $request)
    {
        $response = UnitConverter::store($request->all());
        
        if (!$response->ok) {
            return response()->json([
                'message' => $response->message,
                'errors' => $response->errors,
            ], 422);
        }
        
        return response()->json($response->data, 201);
    }
    
    public function show(int $id)
    {
        $response = UnitConverter::get($id, ['translations']);
        
        if (!$response->ok) {
            return response()->json(['message' => $response->message], 404);
        }
        
        return response()->json($response->data);
    }
    
    public function convert(Request $request)
    {
        $request->validate([
            'from_unit_id' => 'required|integer',
            'to_unit_id' => 'required|integer',
            'value' => 'required|numeric',
        ]);
        
        try {
            $result = UnitConverter::convert(
                $request->from_unit_id,
                $request->to_unit_id,
                $request->value
            );
            
            return response()->json(['result' => $result]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}
```

## Helper Function

A global helper function is available for quick conversions:

```php
/**
 * Convert a value between units.
 *
 * @param int $from_unit_id Source unit ID
 * @param int $to_unit_id Target unit ID
 * @param float $value Value to convert
 * @return float Converted value
 */
$result = unitConvert($fromId, $toId, $value);
```

This is equivalent to calling `UnitConverter::convert()`.

