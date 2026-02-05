---
sidebar_position: 12
sidebar_label: StoreAddressRequest
---

# StoreAddressRequest

Form request class for validating Address creation data.

## Namespace

`JobMetric\Location\Http\Requests\Address\StoreAddressRequest`

## Overview

This request validates the address payload including:

- Required geography fields: `country_id`, `province_id`, `city_id`
- Address object keys whitelist (`blvd`, `street`, `alley`, `number`, `floor`, `unit`)
- Optional info keys whitelist (`mobile_prefix`, `mobile`, `name`, `landline`, `notes`)

> Owner fields (`owner_type`, `owner_id`) are validated by the Address service.

## Validation Rules

### Required location fields

| Field | Rule |
|------|------|
| `country_id` | `required\|integer\|exists:{countries},id` |
| `province_id` | `required\|integer\|exists:{provinces},id` |
| `city_id` | `required\|integer\|exists:{cities},id` |

### Optional location field

| Field | Rule |
|------|------|
| `district_id` | `nullable\|integer\|exists:{districts},id` |

### Address object

| Field | Rule |
|------|------|
| `address` | `required\|array` (with allowed keys validation) |
| `address.blvd` | `nullable\|string\|max:255` |
| `address.street` | `nullable\|string\|max:255` |
| `address.alley` | `nullable\|string\|max:255` |
| `address.number` | `nullable\|string\|max:50` |
| `address.floor` | `nullable\|string\|max:50` |
| `address.unit` | `nullable\|string\|max:50` |

### Optional fields

| Field | Rule |
|------|------|
| `postcode` | `nullable\|string\|max:20` |
| `lat` | `nullable\|string\|max:20` |
| `lng` | `nullable\|string\|max:20` |
| `info` | `nullable\|array` (with allowed keys validation) |
| `info.mobile_prefix` | `nullable\|string\|max:20` |
| `info.mobile` | `nullable\|string\|max:50` |
| `info.name` | `nullable\|string\|max:255` |
| `info.landline` | `nullable\|string\|max:50` |
| `info.notes` | `nullable\|string` |

## Usage Example

```php
use JobMetric\Location\Facades\Address;

$response = Address::store([
    'owner_type' => \App\Models\User::class,
    'owner_id' => 1,

    'country_id' => 1,
    'province_id' => 10,
    'city_id' => 120,
    'district_id' => 900,

    'address' => [
        'street' => 'Valiasr St',
        'number' => '12',
    ],
    'postcode' => '1234567890',
    'info' => [
        'name' => 'John Doe',
        'mobile_prefix' => '+98',
        'mobile' => '9120000000',
        'notes' => 'Leave at reception',
    ],
]);
```

