---
sidebar_position: 9
sidebar_label: Address
---

# Address Model

Represents an address record linked to an owner (polymorphic) and optionally linked to a unique `Location`.

## Namespace

```php
JobMetric\Location\Models\Address
```

## Table

- `location.tables.address` (default: `location_addresses`)

## Versioning

Address updates may create a **new version** with:

- `parent_id` pointing to the previous address record
- the previous record soft-deleted

## Relationships

- `owner()` (morph-to)
- `locationRelation()` (single)

