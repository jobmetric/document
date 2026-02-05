---
sidebar_position: 9
sidebar_label: StoreLocationRequest
---

# StoreLocationRequest

Form request class for validating Location creation data.

## Namespace

`JobMetric\Location\Http\Requests\Location\StoreLocationRequest`

## Overview

Locations represent unique tuples of:

- `country_id`
- `province_id` (optional)
- `city_id` (optional)
- `district_id` (optional)

The Location service uses `firstOrCreate()` to guarantee uniqueness.

## Validation Rules

| Field | Rule | Description |
|------|------|-------------|
| `country_id` | `required\|integer\|exists:{countries},id` | Country id |
| `province_id` | `nullable\|integer\|exists:{provinces},id` | Province id |
| `city_id` | `nullable\|integer\|exists:{cities},id` | City id |
| `district_id` | `nullable\|integer\|exists:{districts},id` | District id |

## Usage Example

```php
use JobMetric\Location\Facades\Location;

$response = Location::store([
    'country_id' => 1,
    'province_id' => 10,
    'city_id' => 120,
    'district_id' => 900,
]);
```

