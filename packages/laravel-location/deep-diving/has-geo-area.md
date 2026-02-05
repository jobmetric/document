---
sidebar_position: 3
sidebar_label: HasGeoArea
---

# HasGeoArea Trait

The `HasGeoArea` trait allows you to attach **Geo Areas** to any Eloquent model using a polymorphic pivot table (`geo_area_relations`).

Geo Areas are reusable groupings of multiple locations and are typically used for things like:

- Shipping zones
- Service availability areas
- Business regions
- Coverage maps

## Namespace

```php
JobMetric\Location\HasGeoArea
```

## Quick Start

```php
use Illuminate\Database\Eloquent\Model;
use JobMetric\Location\HasGeoArea;

class ShippingMethod extends Model
{
    use HasGeoArea;
}

$method = ShippingMethod::find(10);

// Attach existing geo area
$method->attachGeoArea(5);

// Check if a location is covered by any attached geo area
$method->isInGeoArea($locationId);
```

## Relationships

### geoAreaRelations()

Returns a `MorphMany` of `GeoAreaRelation` items.

## Read APIs

### geoAreas(bool $withTrashed = false)

Returns a `Collection` of `GeoArea` models attached to the entity.

### hasGeoArea(int $geo_area_id)

Checks if a geo area is attached.

### getGeoAreas(bool $withTrashed = false)

Returns an `AnonymousResourceCollection` of `GeoAreaResource`.

### getGeoAreaById(int $geo_area_id, bool $withTrashed = false)

Returns a single `GeoAreaResource` if attached.

## Mutation APIs

### attachGeoArea(int $geo_area_id)

Attaches an existing geo area.

> Note: only non-deleted geo areas can be attached.

### detachGeoArea(int $geo_area_id)

Removes the relation (does not delete the geo area).

### detachAllGeoAreas()

Removes all geo area relations.

### syncGeoAreas(array $geo_area_ids)

Detaches all and attaches the provided ids.

## Geo lookup helpers

### isInGeoArea(int $location_id)

Returns `true` if the given location exists in any attached geo area.

### getGeoAreaForLocation(int $location_id)

Returns the first geo area that contains the given location.

