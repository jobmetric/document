---
sidebar_position: 6
sidebar_label: LocationRelation
---

# LocationRelation Model

The pivot model used by `HasLocation` to connect any model to a `Location` record.

## Namespace

```php
JobMetric\Location\Models\LocationRelation
```

## Table

- `location.tables.location_relation` (default: `location_relations`)

## Relationships

- `locationable()` (morph-to)
- `location()`

