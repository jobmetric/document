---
sidebar_position: 2
sidebar_label: HasAddress
---

# HasAddress Trait

The `HasAddress` trait allows you to attach **multiple addresses** to any Eloquent model using a polymorphic pivot table (`address_relations`).

It supports optional **collections** (e.g. `billing`, `shipping`) and can include soft-deleted addresses in read operations.

## Namespace

```php
JobMetric\Location\HasAddress
```

## Quick Start

```php
use Illuminate\Database\Eloquent\Model;
use JobMetric\Location\HasAddress;

class User extends Model
{
    use HasAddress;
}

$user = User::find(1);

// Store and attach a new address to the "shipping" collection
$user->storeAddress([
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
        'name' => 'Warehouse',
        'mobile_prefix' => '+98',
        'mobile' => '9120000000',
    ],
], 'shipping');

// Read addresses
$user->addresses();              // all
$user->addresses('shipping');    // only "shipping"
```

## Relationships

### addressRelations()

Returns a `MorphMany` of `AddressRelation` items.

## Read APIs

### addresses(?string $collection = null, bool $withTrashed = false)

Returns a `Collection` of `Address` models attached to the entity.

### hasAddress(int $address_id, ?string $collection = null)

Checks if an address is attached.

### getAddresses(?string $collection = null, bool $withTrashed = false)

Returns an `AnonymousResourceCollection` of `AddressResource`.

### getAddressById(int $address_id, ?string $collection = null, bool $withTrashed = false)

Returns a single `AddressResource` if the address is attached.

### getAddressByCollection(string $collection, bool $withTrashed = false)

Returns the first `Address` record in a collection.

## Mutation APIs

### storeAddress(array $data, ?string $collection = null)

Stores an address through the `Address` service (facade) and attaches it.

### attachAddress(int $address_id, ?string $collection = null)

Attaches an existing address to the model.

> Note: only non-deleted addresses can be attached.

### detachAddress(int $address_id, ?string $collection = null)

Removes the relation (does not delete the address).

### detachAllAddresses(?string $collection = null)

Removes all relations (optionally filtered by collection).

### syncAddresses(array $address_ids, ?string $collection = null)

Detaches all addresses in the collection and attaches the provided ids.

### updateAddress(int $address_id, array $data)

Updates an attached address via the `Address` service.

### deleteAddress(int $address_id)

Soft-deletes an attached address and removes the relation.

## Backward compatibility aliases

- `getAddress()` → alias for `getAddresses()`
- `forgetAddress(int $address_id)` → alias for `deleteAddress()`

