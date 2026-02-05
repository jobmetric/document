---
sidebar_position: 13
sidebar_label: UpdateAddressRequest
---

# UpdateAddressRequest

Form request class for validating Address update data. Supports partial updates.

## Namespace

`JobMetric\Location\Http\Requests\Address\UpdateAddressRequest`

## Overview

Key features:

- **Partial updates** via `sometimes`
- If `country_id` is present, `province_id` and `city_id` become required (`required_with`)
- Address object and info object enforce allowed keys (same as StoreAddressRequest)

> The Address service applies versioning on update (old row is soft-deleted and a new row may be created).

## Validation Rules (high level)

- Location fields: `country_id` (sometimes|required), `province_id`/`city_id` required with country, `district_id` nullable
- Address: `address` is sometimes|required|array, with allowed keys
- Optional: `postcode`, `lat`, `lng`, `info` (allowed keys)

## Usage Example

```php
use JobMetric\Location\Facades\Address;

$response = Address::update($addressId, [
    'postcode' => '1111111111',
    'info' => [
        'notes' => 'Updated at checkout',
    ],
]);
```

