---
sidebar_position: 4
sidebar_label: Models
---

import Link from "@docusaurus/Link";

# Models

Laravel Unit Converter provides two Eloquent models for managing units and their relations to other models.

## Unit Model

The `Unit` model represents a measurement unit that can be used for conversions.

### Namespace

```php
JobMetric\UnitConverter\Models\Unit
```

### Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `type` | string | Unit type (weight, length, etc.) |
| `value` | decimal(20,10) | Conversion value relative to base unit |
| `status` | boolean | Active status (true=enabled) |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Update timestamp |

### Properties

```php
/**
 * @property int $id                         The primary identifier of the unit.
 * @property string $type                    The type of measurement unit.
 * @property float $value                    Conversion value relative to base unit.
 * @property bool $status                    Active flag (true=enabled, false=disabled).
 * @property Carbon $created_at              Creation timestamp.
 * @property Carbon $updated_at              Update timestamp.
 */
```

### Fillable Attributes

```php
protected $fillable = [
    'type',
    'value',
    'status',
];
```

### Casts

```php
protected $casts = [
    'type'   => 'string',
    'value'  => 'decimal:15',
    'status' => 'boolean',
];
```

### Traits Used

- `HasFactory` - Factory support for testing
- `HasBooleanStatus` - Status management helpers
- `HasTranslation` - Translation support

### Translatable Fields

The Unit model supports translations for:

```php
protected array $translatables = [
    'name',        // Unit name (e.g., "Kilogram")
    'code',        // Unit code/symbol (e.g., "kg")
    'position',    // Symbol position ("left" or "right")
    'description', // Optional description
];
```

### Relationships

#### unitRelations

Get all polymorphic relations where this unit is used:

```php
public function unitRelations(): HasMany
```

**Returns:** `HasMany` relationship to `UnitRelation` model

**Example:**
```php
$unit = Unit::find(1);

// Get all places where this unit is used
$relations = $unit->unitRelations;

foreach ($relations as $relation) {
    echo $relation->unitable_type; // 'App\Models\Product'
    echo $relation->unitable_id;   // 42
    echo $relation->value;         // 2.5
}
```

### Query Scopes

#### ofType

Filter units by type:

```php
$weightUnits = Unit::ofType('weight')->get();
$lengthUnits = Unit::ofType('length')->get();
```

### Example Usage

```php
use JobMetric\UnitConverter\Models\Unit;

// Find a unit
$kilogram = Unit::where('type', 'weight')
    ->whereHas('translations', function ($query) {
        $query->where('field', 'code')
              ->where('value', 'kg');
    })
    ->first();

// Get unit with translations
$unit = Unit::with('translations')->find(1);

// Check if unit is active
if ($unit->status) {
    // Unit is enabled
}

// Get translation
$name = $unit->translations
    ->where('locale', 'en')
    ->where('field', 'name')
    ->first()?->value;
```

---

## UnitRelation Model

The `UnitRelation` model represents the polymorphic relationship between units and any Eloquent model.

### Namespace

```php
JobMetric\UnitConverter\Models\UnitRelation
```

### Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `unit_id` | bigint | Foreign key to units table |
| `unitable_type` | string | Model class name |
| `unitable_id` | bigint | Model ID |
| `type` | string | Unit key (e.g., weight, width) |
| `value` | decimal(15,8) | Value in the specified unit |
| `created_at` | timestamp | Creation timestamp |

**Note:** This model extends `Pivot` and does not have an `updated_at` column.

### Properties

```php
/**
 * @property int $unit_id            The attached unit identifier.
 * @property string $unitable_type   The class name of the related model.
 * @property int $unitable_id        The ID of the related model instance.
 * @property string $type            The unit key (weight, length, etc.).
 * @property float $value            The value stored in the attached unit.
 * @property Carbon $created_at      Creation timestamp.
 */
```

### Fillable Attributes

```php
protected $fillable = [
    'unit_id',
    'unitable_type',
    'unitable_id',
    'type',
    'value',
    'created_at',
];
```

### Casts

```php
protected $casts = [
    'unit_id'       => 'integer',
    'unitable_type' => 'string',
    'unitable_id'   => 'integer',
    'type'          => 'string',
    'value'         => 'float',
    'created_at'    => 'datetime',
];
```

### Relationships

#### unit

Get the associated Unit model:

```php
public function unit(): BelongsTo
```

**Example:**
```php
$relation = UnitRelation::first();
$unit = $relation->unit;

echo $unit->type;  // 'weight'
echo $unit->value; // 1000
```

#### unitable

Get the polymorphic parent model:

```php
public function unitable(): MorphTo
```

**Example:**
```php
$relation = UnitRelation::first();
$model = $relation->unitable;

// $model could be Product, Order, etc.
echo get_class($model); // 'App\Models\Product'
```

### Query Scopes

#### ofType

Filter relations by unit key:

```php
$weightRelations = UnitRelation::ofType('weight')->get();
```

### Accessor: unitable_resource

Get a resource representation of the related model:

```php
$relation = UnitRelation::first();
$resource = $relation->unitable_resource;
```

### Example Usage

```php
use JobMetric\UnitConverter\Models\UnitRelation;

// Find all relations for a specific model
$relations = UnitRelation::where('unitable_type', Product::class)
    ->where('unitable_id', 42)
    ->with('unit.translations')
    ->get();

// Find all models using a specific unit
$productsUsingKg = UnitRelation::where('unit_id', $kilogramId)
    ->where('unitable_type', Product::class)
    ->get();

// Get all weight values across all models
$weights = UnitRelation::ofType('weight')
    ->with('unit', 'unitable')
    ->get();

// Calculate total weight
$totalWeight = UnitRelation::ofType('weight')
    ->where('unit_id', $gramId)
    ->sum('value');
```

---

## Configuration

Both models use configurable table names from `config/unit-converter.php`:

```php
return [
    'tables' => [
        'unit' => 'units',
        'unit_relation' => 'unit_relations',
    ],
];
```

To customize table names:

```php
// config/unit-converter.php
return [
    'tables' => [
        'unit' => 'custom_units',
        'unit_relation' => 'custom_unit_relations',
    ],
];
```

The models automatically use these config values:

```php
public function getTable(): string
{
    return config('unit-converter.tables.unit', parent::getTable());
}
```

