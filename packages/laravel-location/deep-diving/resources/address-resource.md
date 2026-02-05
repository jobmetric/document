---
sidebar_position: 7
sidebar_label: AddressResource
---

# AddressResource

JSON resource class for transforming Address models into structured API responses. It can optionally include related geography (country/province/city/district) and versioning information (parent/child/history).

## Namespace

`JobMetric\Location\Http\Resources\AddressResource`

## Overview

This resource is typically used when you need to expose an Address entity for an owner model (polymorphic), including normalized location relations and the resolved address fields such as `full_address` and `address_for_letter`.

## Base Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | Address ID |
| `parent_id` | `int\|null` | Previous version ID (when address is versioned) |
| `owner_type` | `string` | Polymorphic owner type (FQCN) |
| `owner_id` | `int` | Polymorphic owner id |
| `address` | `object\|null` | Structured address payload (as stored) |
| `postcode` | `string\|null` | Postal code |
| `lat` | `string\|null` | Latitude |
| `lng` | `string\|null` | Longitude |
| `info` | `array\|null` | Additional info payload |
| `full_address` | `string` | Human readable full address |
| `address_for_letter` | `string` | Address formatted for letter/printing |
| `owner` | `mixed` | Owner representation (via `owner_resource` accessor on the model) |

## Conditional Properties

| Property | Condition | Type | Notes |
|----------|----------|------|------|
| `country` | `country` loaded | `CountryResource` | `whenLoaded('country')` |
| `province` | `province` loaded | `ProvinceResource` | `whenLoaded('province')` |
| `city` | `city` loaded | `CityResource` | `whenLoaded('city')` |
| `district` | `district` loaded | `DistrictResource` | `whenLoaded('district')` |
| `parent` | `parent` loaded | `AddressResource` | Previous version |
| `child` | `child` loaded | `AddressResource` | Next version |
| `history` | `parent_id !== null` | `array` | Computed chain of parent addresses (oldest → newest). If `parent` is not eager loaded, the resource will load it. |

## Usage Examples

### Basic usage

```php
use JobMetric\Location\Http\Resources\AddressResource;
use JobMetric\Location\Models\Address;

$address = Address::find(10);

return AddressResource::make($address);
```

### With geography relations

```php
$address = Address::with(['country', 'province', 'city', 'district'])->find(10);

return AddressResource::make($address);
```

### With versioning chain (parent/child/history)

```php
$address = Address::with(['parent.parent', 'child'])->find(10);

return AddressResource::make($address);
```

## Response Example (simplified)

```json
{
  "id": 10,
  "parent_id": null,
  "owner_type": "App\\\\Models\\\\User",
  "owner_id": 1,
  "country": { "id": 1, "name": "Iran" },
  "province": { "id": 10, "name": "Tehran" },
  "city": { "id": 120, "name": "Tehran" },
  "district": { "id": 900, "name": "District 1" },
  "address": { "street": "Valiasr St", "number": "12" },
  "postcode": "1234567890",
  "lat": "35.7000",
  "lng": "51.4000",
  "info": { "name": "John Doe", "mobile": "9120000000" },
  "full_address": "Iran, Tehran, Tehran ...",
  "address_for_letter": "Iran, Tehran, Tehran\\n...",
  "history": [],
  "owner": {}
}
```

