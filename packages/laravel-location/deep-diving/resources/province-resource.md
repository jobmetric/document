---
sidebar_position: 2
sidebar_label: ProvinceResource
---

# ProvinceResource

JSON resource class for transforming Province models into structured API responses.

## Namespace

`JobMetric\Location\Http\Resources\ProvinceResource`

## Base Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | Province ID |
| `name` | `string` | Province name |
| `status` | `bool` | Enabled/disabled |

## Conditional Properties

| Property | Relation | Type |
|----------|----------|------|
| `country` | `country` | `CountryResource` |
| `cities` | `cities` | `array<CityResource>` |
| `districts` | `districts` | `array<DistrictResource>` |

## Usage Example

```php
use JobMetric\Location\Http\Resources\ProvinceResource;
use JobMetric\Location\Models\Province;

$province = Province::with(['country', 'cities'])->find(10);

return ProvinceResource::make($province);
```

