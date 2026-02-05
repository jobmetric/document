---
sidebar_position: 5
sidebar_label: Location
---

# Location Model

Represents a unique geographic combination.

## Namespace

```php
JobMetric\Location\Models\Location
```

## Table

- `location.tables.location` (default: `locations`)

## Uniqueness

Each unique tuple of:

- `country_id`
- `province_id`
- `city_id`
- `district_id`

should exist at most once.

## Relationships

- `country()`
- `province()`
- `city()`
- `district()`
- `locationRelations()`

