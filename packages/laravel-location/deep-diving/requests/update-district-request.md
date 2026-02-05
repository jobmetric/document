---
sidebar_position: 8
sidebar_label: UpdateDistrictRequest
---

# UpdateDistrictRequest

Form request class for validating District update data. Supports partial updates and context injection.

## Namespace

`JobMetric\Location\Http\Requests\District\UpdateDistrictRequest`

## Context

```php
$request->setContext([
    'district_id' => 900,
    'city_id' => 120,
]);
```

## Validation Rules

| Field | Rule | Description |
|------|------|-------------|
| `city_id` | `sometimes\|required\|integer\|exists:{cities},id` | Parent city id |
| `name` | `sometimes\|required\|string\|max:255` | District name (unique within city, excluding current) |
| `subtitle` | `sometimes\|nullable\|string\|max:255` | Subtitle |
| `keywords` | `sometimes\|nullable\|array` | Keywords list |
| `keywords.*` | `string\|max:100` | Single keyword |
| `status` | `sometimes\|boolean` | Enabled/disabled |

## Usage Example

```php
use JobMetric\Location\Facades\District;

$response = District::update(900, [
    'name' => 'District 1 (Updated)',
    'keywords' => ['central', 'updated'],
]);
```

