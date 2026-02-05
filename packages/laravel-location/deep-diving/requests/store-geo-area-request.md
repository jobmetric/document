---
sidebar_position: 10
sidebar_label: StoreGeoAreaRequest
---

# StoreGeoAreaRequest

Form request class for validating GeoArea creation data.

## Namespace

`JobMetric\Location\Http\Requests\GeoArea\StoreGeoAreaRequest`

## Overview

Geo areas are reusable groupings of multiple locations.

Key features validated by this request:

- `translation` is required and must include at least one locale with a `name`
- Optional `locations` array supports location tuples
- Duplicate locations inside the payload are rejected

## Validation Rules

### Required Fields

| Field | Rule | Description |
|------|------|-------------|
| `translation` | `required\|array` | Translation map |
| `translation.*.name` | `required\|string\|max:255` | Geo area name |

### Optional Fields

| Field | Rule | Description |
|------|------|-------------|
| `translation.*.description` | `nullable\|string` | Optional description |
| `status` | `sometimes\|boolean` | Enabled/disabled |
| `locations` | `nullable\|array` | List of location tuples |
| `locations.*.country_id` | `required\|integer\|exists:{countries},id` | Country id |
| `locations.*.province_id` | `nullable\|integer\|exists:{provinces},id` | Province id |
| `locations.*.city_id` | `nullable\|integer\|exists:{cities},id` | City id |
| `locations.*.district_id` | `nullable\|integer\|exists:{districts},id` | District id |

## Duplicate locations check

The request rejects duplicates based on the tuple `(country_id, province_id, city_id, district_id)` within the `locations` array.

## Usage Example

```php
use JobMetric\Location\Facades\GeoArea;

$response = GeoArea::store([
    'translation' => [
        'en' => [
            'name' => 'Tehran Zone',
            'description' => 'All supported districts in Tehran.',
        ],
    ],
    'status' => true,
    'locations' => [
        ['country_id' => 1, 'province_id' => 10, 'city_id' => 120],
        ['country_id' => 1, 'province_id' => 10, 'city_id' => 120, 'district_id' => 900],
    ],
]);
```

