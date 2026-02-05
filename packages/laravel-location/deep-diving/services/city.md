---
sidebar_position: 3
sidebar_label: City
---

# City Service

The `City` service manages cities within a specific province.

## Facade

```php
use JobMetric\Location\Facades\City;
```

## Basic CRUD Operations

### Store

Create a new city.

```php
$response = City::store([
    'province_id' => 10,
    'name' => 'Tehran',
    'status' => true,
]);
```

The `name` uniqueness is validated **within the parent province**.

### Show

```php
$response = City::show($cityId);

// With relations (if defined)
$response = City::show($cityId, ['province', 'districts']);
```

### Update

```php
$response = City::update($cityId, [
    'province_id' => 10,
    'name' => 'Tehran (Updated)',
]);
```

### Destroy / Restore / Force Delete

```php
$response = City::destroy($cityId);
$response = City::restore($cityId);
$response = City::forceDelete($cityId);
```

### Toggle Status

```php
$response = City::toggleStatus($cityId);
```

## Querying

```php
// Get all cities for a province
$response = City::all(['province_id' => 10]);
```

## Related

- [Province Service](/packages/laravel-location/deep-diving/services/province)
