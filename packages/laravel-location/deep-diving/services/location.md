---
sidebar_position: 5
sidebar_label: Location
---

# Location Service

The Location service manages **unique** Location records.

A Location is a unique combination of:

- `country_id`
- `province_id` (nullable)
- `city_id` (nullable)
- `district_id` (nullable)

Unlike other services, Location is designed to be **immutable**:

- Store is allowed
- Update is disabled
- Destroy is disabled

## Facade

```php
use JobMetric\Location\Facades\Location;
```

## Store (Uniqueness behavior)

`Location::store()` uses `firstOrCreate()`:

- If the combination does not exist, it creates a new Location and fires the store event.
- If it already exists, it returns the existing Location (no mutation hooks are called).

```php
$response = Location::store([
    'country_id' => 1,
    'province_id' => 10,
    'city_id' => 120,
    'district_id' => 900,
]);
```

Minimal payload (country-only):

```php
$response = Location::store([
    'country_id' => 1,
]);
```

## Show / Paginate / All

The facade still exposes read-only methods like `show`, `paginate`, and `all`:

```php
$response = Location::show($locationId);
$response = Location::paginate(15, ['country_id' => 1]);
$response = Location::all(['province_id' => 10]);
```

## Notes & Best Practices

- Location records are intended to be **immutable** (no update).
- Location records are intended to **never be deleted**.
- Prefer attaching by data (`attachLocationByData`) when working through traits, to guarantee uniqueness and avoid manual lookups.

