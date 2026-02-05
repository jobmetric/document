---
sidebar_position: 1
sidebar_label: CountryResource
---

# CountryResource

JSON resource class for transforming Country models into structured API responses. This resource provides a consistent format for country data with conditional relation loading.

## Namespace

`JobMetric\Location\Http\Resources\CountryResource`

## Overview

The `CountryResource` transforms Country model instances into structured JSON responses. It includes:

- Core country properties
- Conditional relation loading (provinces/cities/districts)

## Base Properties

The resource always includes these properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | Country ID |
| `name` | `string` | Country name |
| `flag` | `string\|null` | Flag key/filename |
| `mobile_prefix` | `string\|null` | Calling code (may be formatted by model accessor) |
| `validation` | `array\|null` | Mobile validation regex patterns |
| `status` | `bool` | Enabled/disabled |

## Conditional Properties

These properties are only included when their relations are loaded:

- `provinces` → `ProvinceResource::collection(...)`
- `cities` → `CityResource::collection(...)`
- `districts` → `DistrictResource::collection(...)`

## Usage Examples

### Basic usage

```php
use JobMetric\Location\Http\Resources\CountryResource;
use JobMetric\Location\Models\Country;

$country = Country::find(1);

return CountryResource::make($country);
```

### With relations

```php
$country = Country::with(['provinces'])->find(1);

return CountryResource::make($country);
```

## Response Example (simplified)

```json
{
  "id": 1,
  "name": "Iran",
  "flag": "ir.svg",
  "mobile_prefix": "+98",
  "validation": ["/^9\\d{9}$/"],
  "status": true,
  "provinces": []
}
```

