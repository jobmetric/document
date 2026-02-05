---
sidebar_position: 3
sidebar_label: CityResource
---

# CityResource

JSON resource class for transforming City models into structured API responses.

## Namespace

`JobMetric\Location\Http\Resources\CityResource`

## Base Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | City ID |
| `name` | `string` | City name |
| `status` | `bool` | Enabled/disabled |

## Conditional Properties

| Property | Relation | Type |
|----------|----------|------|
| `country` | `country` | `CountryResource` |
| `province` | `province` | `ProvinceResource` |
| `districts` | `districts` | `array<DistrictResource>` |

## Usage Example

```php
use JobMetric\Location\Http\Resources\CityResource;
use JobMetric\Location\Models\City;

$city = City::with(['province', 'districts'])->find(120);

return CityResource::make($city);
```

