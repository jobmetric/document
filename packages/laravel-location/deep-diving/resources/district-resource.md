---
sidebar_position: 4
sidebar_label: DistrictResource
---

# DistrictResource

JSON resource class for transforming District models into structured API responses.

## Namespace

`JobMetric\Location\Http\Resources\DistrictResource`

## Base Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | District ID |
| `name` | `string` | District name |
| `subtitle` | `string\|null` | Optional subtitle |
| `keywords` | `array\|null` | Optional keywords list |
| `status` | `bool` | Enabled/disabled |

## Conditional Properties

| Property | Relation | Type |
|----------|----------|------|
| `country` | `country` | `CountryResource` |
| `province` | `province` | `ProvinceResource` |
| `city` | `city` | `CityResource` |

## Usage Example

```php
use JobMetric\Location\Http\Resources\DistrictResource;
use JobMetric\Location\Models\District;

$district = District::with(['city', 'province', 'country'])->find(900);

return DistrictResource::make($district);
```

