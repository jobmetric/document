---
sidebar_position: 11
sidebar_label: Events
---

# Events

Laravel Location fires **domain events** for the lifecycle of its main entities.

All events implement `JobMetric\EventSystem\Contracts\DomainEvent` and expose:

- `public static function key(): string`
- `public static function definition(): DomainEventDefinition`

Typical event types:

- `Store` / `Update`
- `Delete` / `Restore` / `ForceDelete` (for soft-deletable entities)

Entities with events:

- Country
- Province
- City
- District
- Location (store only)
- GeoArea
- Address

## Listening to events

```php
use Illuminate\Support\Facades\Event;
use JobMetric\Location\Events\Country\CountryStoreEvent;

Event::listen(CountryStoreEvent::class, function (CountryStoreEvent $event) {
    $country = $event->country;
});
```

## Event classes (by entity)

### Country

- `JobMetric\Location\Events\Country\CountryStoreEvent` (payload: `Country $country`)
- `JobMetric\Location\Events\Country\CountryUpdateEvent` (payload: `Country $country`, `array $data`)
- `JobMetric\Location\Events\Country\CountryDeleteEvent` (payload: `Country $country`)
- `JobMetric\Location\Events\Country\CountryRestoreEvent` (payload: `Country $country`)
- `JobMetric\Location\Events\Country\CountryForceDeleteEvent` (payload: `Country $country`)

### Province / City / District

Each follows the same payload pattern as Country:

- Store: model only
- Update: model + data array
- Delete/Restore/ForceDelete: model only

### Location

- `JobMetric\Location\Events\Location\LocationStoreEvent` (payload: `Location $location`, `array $data = []`)

> Note: Location uses `firstOrCreate()`. If the record already exists, the store event is **not** fired.

### GeoArea

- `GeoAreaStoreEvent` (payload: `GeoArea $geoArea`)
- `GeoAreaUpdateEvent` (payload: `GeoArea $geoArea`, `array $data`)
- `GeoAreaDeleteEvent` / `GeoAreaRestoreEvent` / `GeoAreaForceDeleteEvent` (payload: `GeoArea $geoArea`)

### Address

Address events follow the same pattern:

- Store: address model only
- Update: address model + data array
- Delete/Restore/ForceDelete: address model only

## Note (naming convention)

The exact event class names follow the convention:

`JobMetric\Location\Events\{Entity}\{Entity}{Action}Event`

