---
sidebar_position: 5
sidebar_label: StoreCityRequest
---

# StoreCityRequest

Form request class for validating City creation data.

## Namespace

`JobMetric\Location\Http\Requests\City\StoreCityRequest`

## Overview

Key behaviors:

- Requires a valid `province_id`
- Enforces name uniqueness **within the parent province** via `CheckExistNameRule`

## Validation Rules

### Required Fields

| Field | Rule | Description |
|------|------|-------------|
| `province_id` | `required\|integer\|exists:{provinces},id` | Parent province id |
| `name` | `required\|string\|max:255` | City name (unique within province) |

### Optional Fields

| Field | Rule | Description |
|------|------|-------------|
| `status` | `sometimes\|boolean` | Enabled/disabled |

> `{provinces}` is resolved from `config('location.tables.province')`.

## Usage Example

```php
use JobMetric\Location\Facades\City;

$response = City::store([
    'province_id' => 10,
    'name' => 'Tehran',
    'status' => true,
]);
```

