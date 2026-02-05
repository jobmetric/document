---
sidebar_position: 7
sidebar_label: StoreDistrictRequest
---

# StoreDistrictRequest

Form request class for validating District creation data.

## Namespace

`JobMetric\Location\Http\Requests\District\StoreDistrictRequest`

## Overview

District validation includes:

- Required `city_id`
- Name uniqueness **within the parent city**
- Optional metadata fields: `subtitle`, `keywords`

## Validation Rules

### Required Fields

| Field | Rule | Description |
|------|------|-------------|
| `city_id` | `required\|integer\|exists:{cities},id` | Parent city id |
| `name` | `required\|string\|max:255` | District name (unique within city) |

### Optional Fields

| Field | Rule | Description |
|------|------|-------------|
| `subtitle` | `sometimes\|nullable\|string\|max:255` | Subtitle |
| `keywords` | `sometimes\|nullable\|array` | Keywords list |
| `keywords.*` | `string\|max:100` | Single keyword |
| `status` | `sometimes\|boolean` | Enabled/disabled |

## Usage Example

```php
use JobMetric\Location\Facades\District;

$response = District::store([
    'city_id' => 120,
    'name' => 'District 1',
    'subtitle' => 'Central',
    'keywords' => ['downtown', 'business'],
    'status' => true,
]);
```

