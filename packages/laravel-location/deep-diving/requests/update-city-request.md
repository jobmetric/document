---
sidebar_position: 6
sidebar_label: UpdateCityRequest
---

# UpdateCityRequest

Form request class for validating City update data. This request supports partial updates and context injection.

## Namespace

`JobMetric\Location\Http\Requests\City\UpdateCityRequest`

## Context

```php
$request->setContext([
    'city_id' => 120,
    'province_id' => 10,
]);
```

## Validation Rules

| Field | Rule | Description |
|------|------|-------------|
| `province_id` | `sometimes\|required\|integer\|exists:{provinces},id` | Parent province id |
| `name` | `sometimes\|required\|string\|max:255` | City name (unique within province, excluding current) |
| `status` | `sometimes\|boolean` | Enabled/disabled |

## Usage Example

```php
use JobMetric\Location\Facades\City;

$response = City::update(120, [
    'province_id' => 10,
    'name' => 'Tehran (Updated)',
]);
```

