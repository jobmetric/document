---
sidebar_position: 6
sidebar_label: GeoArea
---

# GeoArea Service

The GeoArea service manages geo areas. A geo area is a reusable grouping of multiple locations.

Geo areas support:

- Soft delete / restore / force delete
- Status toggling
- Attaching and syncing locations (via `HasLocation` in multiple mode)

## Facade

```php
use JobMetric\Location\Facades\GeoArea;
```

## Basic CRUD Operations

### Store

Create a new geo area. `translation` is required.

```php
$response = GeoArea::store([
    'translation' => [
        'en' => [
            'name' => 'Tehran Zone',
            'description' => 'All supported districts in Tehran.',
        ],
    ],
    'status' => true,
    'locations' => [
        ['country_id' => 1, 'province_id' => 10],
        ['country_id' => 1, 'province_id' => 10, 'city_id' => 120],
    ],
]);
```

Notes:

- `locations` is optional; if present, the service will attach locations after store.
- Duplicate locations in the payload are rejected by the request validation.

### Show

```php
$response = GeoArea::show($geoAreaId);

// With relations (typical)
$response = GeoArea::show($geoAreaId, ['locationRelations.location']);
```

### Update

When `locations` is provided on update, the service will:

1. Detach all existing locations
2. Attach the provided locations

```php
$response = GeoArea::update($geoAreaId, [
    'translation' => [
        'en' => [
            'name' => 'Tehran Zone (Updated)',
            'description' => 'Updated coverage.',
        ],
    ],
    'locations' => [
        ['country_id' => 1, 'province_id' => 10, 'city_id' => 120, 'district_id' => 900],
    ],
]);
```

### Destroy / Restore / Force Delete

```php
$response = GeoArea::destroy($geoAreaId);
$response = GeoArea::restore($geoAreaId);
$response = GeoArea::forceDelete($geoAreaId);
```

### Toggle Status

```php
$response = GeoArea::toggleStatus($geoAreaId);
```

## Querying

```php
// List only active geo areas
$response = GeoArea::paginate(15, ['status' => true]);
```

## Related

- [HasGeoArea Trait](/packages/laravel-location/deep-diving/has-geo-area)
- [HasLocation Trait](/packages/laravel-location/deep-diving/has-location)
