---
sidebar_position: 10
sidebar_label: AddressRelation
---

# AddressRelation Model

The pivot model used by `HasAddress` to connect any model to an `Address`.

## Namespace

```php
JobMetric\Location\Models\AddressRelation
```

## Table

- `location.tables.address_relation` (default: `location_address_relations`)

## Relationships

- `addressable()` (morph-to)
- `address()`

