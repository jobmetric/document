---
sidebar_position: 1
sidebar_label: HasLocation
---

# HasLocation Trait

The `HasLocation` trait provides **location attachment** capabilities for Eloquent models.

It supports two modes:

- **Single**: one location per model (via `MorphOne`)
- **Multiple**: many locations per model (via `MorphMany`)

It also guarantees that `Location` records are **unique** and should **never be deleted**.

## Namespace

```php
JobMetric\Location\HasLocation
```

## How it works

`HasLocation` stores the relationship through `LocationRelation`:

- Single mode: `locationRelation() : MorphOne`
- Multiple mode: `locationRelations() : MorphMany`

The actual `Location` record represents a **unique combination** of:

- `country_id`
- `province_id` (nullable)
- `city_id` (nullable)
- `district_id` (nullable)

When you attach by data, it uses `Location::firstOrCreate()` to avoid duplicates.

## Choosing the mode (single vs multiple)

By default, the trait uses **single** mode.

To enable multiple mode on a model, add:

```php
protected string $locationMode = 'multiple';
```

Valid values:

- `'single'` (default)
- `'multiple'`

## Quick Start (single mode)

```php
use Illuminate\Database\Eloquent\Model;
use JobMetric\Location\HasLocation;

class Address extends Model
{
    use HasLocation;

    protected string $locationMode = 'single';
}

$address = Address::find(1);

// Attach by an existing Location id
$address->attachLocation($locationId);

// Attach by data (creates the Location if missing)
$address->attachLocationByData([
    'country_id' => 1,
    'province_id' => 10,
    'city_id' => 120,
    'district_id' => 900,
]);

// Read accessors (single mode only)
$address->location; // Location|null
$address->country;  // Country|null
$address->province; // Province|null
$address->city;     // City|null
$address->district; // District|null
```

## Quick Start (multiple mode)

```php
use Illuminate\Database\Eloquent\Model;
use JobMetric\Location\HasLocation;

class GeoArea extends Model
{
    use HasLocation;

    protected string $locationMode = 'multiple';
}

$geoArea = GeoArea::find(1);

$geoArea->attachLocation($locationId);
$geoArea->attachLocationByData([
    'country_id' => 1,
    'province_id' => 10,
]);

// Accessor (multiple mode only)
$geoArea->locations; // Collection<Location>

// Derived accessors (multiple mode only)
$geoArea->countries;
$geoArea->provinces;
$geoArea->cities;
$geoArea->districts;
```

## APIs

### attachLocation(int $locationId)

Attach an existing location id:

- Single mode: replaces existing relation (if any)
- Multiple mode: creates a new relation if not already attached

### attachLocationByData(array $locationData)

Creates or reuses a unique `Location` record and attaches it to the model.

### detachLocation(?int $locationId = null)

- Single mode: detaches the single relation
- Multiple mode: detaches the specified location id (required)

### detachAllLocations()

Multiple mode only.

### syncLocations(array $locationIds)

Multiple mode only. Detaches all and attaches the provided ids.

### hasLocation(int $locationId)

Checks if this model has the given location attached.

## Notes & best practices

- **Eager load for performance**: for multiple mode, eager load `locationRelations.location` when querying.
- **Locations are immutable**: `Location` records are not intended to be updated or deleted.

## Eager loading patterns

### Single mode

```php
Address::query()
    ->with(['locationRelation.location.country', 'locationRelation.location.province'])
    ->first();
```

### Multiple mode

```php
GeoArea::query()
    ->with(['locationRelations.location'])
    ->first();
```

## Prefer attach by data

When you have (country/province/city/district) ids, prefer `attachLocationByData()` instead of manually resolving a `Location` id:

```php
$model->attachLocationByData([
    'country_id' => 1,
    'province_id' => 10,
    'city_id' => 120,
    'district_id' => 900,
]);
```

This guarantees uniqueness via `Location::firstOrCreate()` and avoids duplicates.

