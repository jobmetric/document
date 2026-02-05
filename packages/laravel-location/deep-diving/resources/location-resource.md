---
sidebar_position: 5
sidebar_label: LocationResource
---

# LocationResource

JSON resource class for transforming Location models into structured API responses.

## Namespace

`JobMetric\Location\Http\Resources\LocationResource`

## Overview

Locations represent unique tuples of (country, province, city, district). The resource includes ids and can optionally include related models when loaded.

## Base Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | Location ID |
| `country_id` | `int` | Country id |
| `province_id` | `int\|null` | Province id |
| `city_id` | `int\|null` | City id |
| `district_id` | `int\|null` | District id |
| `created_at` | `mixed` | Created timestamp (as provided by the model) |

## Conditional Properties

| Property | Relation | Type |
|----------|----------|------|
| `country` | `country` | `CountryResource` |
| `province` | `province` | `ProvinceResource` |
| `city` | `city` | `CityResource` |
| `district` | `district` | `DistrictResource` |
| `location_relations` | `locationRelations` | `mixed` |

## Usage Example

```php
use JobMetric\Location\Http\Resources\LocationResource;
use JobMetric\Location\Models\Location;

$location = Location::with(['country', 'province', 'city', 'district'])->find(1);

return LocationResource::make($location);
```

