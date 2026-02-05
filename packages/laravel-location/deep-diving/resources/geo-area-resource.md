---
sidebar_position: 6
sidebar_label: GeoAreaResource
---

# GeoAreaResource

JSON resource class for transforming GeoArea models into structured API responses. Supports translations and location mapping.

## Namespace

`JobMetric\Location\Http\Resources\GeoAreaResource`

## Overview

Geo areas represent a logical area that can be associated with one or more locations. This resource supports:

- Translation output via `TranslationCollectionResource` (only when `translations` relation is loaded)
- Location mapping via `locationRelations` (and optionally `locationRelations.location` for full location objects)

## Base Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | Geo area ID |
| `status` | `bool` | Enabled/disabled |
| `deleted_at` | `string\|null` | ISO 8601 deletion timestamp |
| `created_at` | `string\|null` | ISO 8601 creation timestamp |
| `updated_at` | `string\|null` | ISO 8601 update timestamp |

## Conditional Properties

| Property | Relation | Type | Notes |
|----------|----------|------|------|
| `translations` | `translations` | `object` | `TranslationCollectionResource::make($this)->withLocale(app()->getLocale())` |
| `locations` | `locationRelations` | `array` | Each item is either a `LocationResource` (when `location` relation on each relation row is loaded) or `{ "location_id": int }` |

## Usage Examples

### Basic usage

```php
use JobMetric\Location\Http\Resources\GeoAreaResource;
use JobMetric\Location\Models\GeoArea;

$geoArea = GeoArea::find(1);

return GeoAreaResource::make($geoArea);
```

### With translations and locations

```php
$geoArea = GeoArea::with([
    'translations',
    'locationRelations.location.country',
    'locationRelations.location.province',
    'locationRelations.location.city',
    'locationRelations.location.district',
])->find(1);

return GeoAreaResource::make($geoArea);
```

## Response Example (simplified)

```json
{
  "id": 1,
  "translations": {
    "en": {
      "name": "Tehran Zone",
      "description": "All supported districts in Tehran."
    }
  },
  "status": true,
  "deleted_at": null,
  "created_at": "2026-02-05T12:00:00.000000Z",
  "updated_at": "2026-02-05T12:00:00.000000Z",
  "locations": [
    {
      "id": 10,
      "country_id": 1,
      "province_id": 10,
      "city_id": 120,
      "district_id": null,
      "created_at": "2026-02-05T12:00:00.000000Z"
    }
  ]
}
```

