---
sidebar_position: 7
sidebar_label: Address
---

# Address Service

The Address service manages addresses and includes a **versioning pattern** for updates.

Key behaviors:

- `store()` validates the owner model (`owner_type` + `owner_id`) and ensures the owner model uses `HasAddress`
- If location fields are provided, it creates/reuses a unique `Location` and links it to the address (single mode)
- `update()` uses versioning:
  - if something changes, the old address is soft-deleted
  - a new address is created with `parent_id` pointing to the previous version

## Facade

```php
use JobMetric\Location\Facades\Address;
```

## Store

Create a new address for an owner.

```php
$response = Address::store([
    'owner_type' => \App\Models\User::class,
    'owner_id' => 1,

    'address' => [
        'street' => 'Valiasr St',
        'number' => '12',
    ],
    'postcode' => '1234567890',
    'lat' => 35.7000,
    'lng' => 51.4000,
    'info' => [
        'name' => 'John Doe',
        'mobile_prefix' => '+98',
        'mobile' => '9120000000',
        'notes' => 'Leave at reception',
    ],

    // Optional location fields
    'country_id' => 1,
    'province_id' => 10,
    'city_id' => 120,
    'district_id' => 900,
]);
```

## Show

```php
$response = Address::show($addressId);

// With location and version chain (if relations are defined)
$response = Address::show($addressId, [
    'locationRelation.location',
    'parent',
    'child',
]);
```

## Update (Versioning)

Update is versioned: if any tracked field changes, the service soft-deletes the old row and creates a new row with `parent_id` set.

```php
$response = Address::update($addressId, [
    'postcode' => '1111111111',
    'info' => [
        'notes' => 'Updated at checkout',
    ],
]);
```

If nothing changes, the service returns the current record without creating a new version.

## Destroy

```php
$response = Address::destroy($addressId);
```

## Querying

```php
// List addresses for a given owner
$response = Address::paginate(15, [
    'owner_type' => \App\Models\User::class,
    'owner_id' => 1,
]);

// Include soft-deleted versions
$response = Address::paginate(15, [], [], 'withTrashed');
```

## Related

- [HasAddress Trait](/packages/laravel-location/deep-diving/has-address)
- [Location Service](/packages/laravel-location/deep-diving/services/location)
