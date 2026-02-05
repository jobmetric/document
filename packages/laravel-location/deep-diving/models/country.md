---
sidebar_position: 1
sidebar_label: Country
---

# Country Model

Represents a country in the location system.

## Namespace

```php
JobMetric\Location\Models\Country
```

## Table

The table name is configurable via `config/location.php`:

- `location.tables.country` (default: `location_countries`)

## Key fields

- `name`
- `flag` (typically a filename)
- `mobile_prefix` (stored without `+`, accessor adds `+`)
- `validation` (cast to array)
- `address_on_letter` (template string)
- `status` (boolean)

## Relationships

- `provinces()`
- `locations()`

