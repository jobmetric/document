---
sidebar_position: 3
sidebar_label: StoreProvinceRequest
---

# StoreProvinceRequest

Form request class for validating Province creation data.

## Namespace

`JobMetric\Location\Http\Requests\Province\StoreProvinceRequest`

## Overview

The `StoreProvinceRequest` validates incoming data when creating a new Province entity.

Key behaviors:

- Requires a valid `country_id`
- Enforces name uniqueness **within the parent country** via `CheckExistNameRule`

## Validation Rules

### Required Fields

| Field | Rule | Description |
|------|------|-------------|
| `country_id` | `required\|integer\|exists:{countries},id` | Parent country id |
| `name` | `required\|string\|max:255` | Province name (unique within country) |

### Optional Fields

| Field | Rule | Description |
|------|------|-------------|
| `status` | `sometimes\|boolean` | Enabled/disabled |

> `{countries}` is resolved from `config('location.tables.country')`.

## Usage Examples

```php
use JobMetric\Location\Facades\Province;

$response = Province::store([
    'country_id' => 1,
    'name' => 'Tehran',
    'status' => true,
]);
```

