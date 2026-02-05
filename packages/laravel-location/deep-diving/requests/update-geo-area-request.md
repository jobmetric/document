---
sidebar_position: 11
sidebar_label: UpdateGeoAreaRequest
---

# UpdateGeoAreaRequest

Form request class for validating GeoArea update data. Supports partial updates.

## Namespace

`JobMetric\Location\Http\Requests\GeoArea\UpdateGeoAreaRequest`

## Overview

Key features:

- **Partial updates**: fields are optional (`sometimes`)
- Translation fields require `translation.*.name` when `translation` is present
- Optional `locations` array with duplicate tuple detection

## Validation Rules

| Field | Rule | Description |
|------|------|-------------|
| `translation` | `sometimes\|array` | Translation map |
| `translation.*.name` | `required\|string\|max:255` | Geo area name |
| `translation.*.description` | `nullable\|string` | Optional description |
| `status` | `sometimes\|boolean` | Enabled/disabled |
| `locations` | `sometimes\|nullable\|array` | Location tuples |
| `locations.*.country_id` | `required\|integer\|exists:{countries},id` | Country id |
| `locations.*.province_id` | `nullable\|integer\|exists:{provinces},id` | Province id |
| `locations.*.city_id` | `nullable\|integer\|exists:{cities},id` | City id |
| `locations.*.district_id` | `nullable\|integer\|exists:{districts},id` | District id |

## Usage Example

```php
use JobMetric\Location\Facades\GeoArea;

$response = GeoArea::update($geoAreaId, [
    'translation' => [
        'en' => [
            'name' => 'Tehran Zone (Updated)',
            'description' => 'Updated coverage.',
        ],
    ],
    'locations' => [
        ['country_id' => 1, 'province_id' => 10, 'city_id' => 120],
    ],
]);
```

