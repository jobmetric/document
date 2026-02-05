---
sidebar_position: 4
sidebar_label: District
---

# District Service

The `District` service manages districts within a specific city.

## Facade

```php
use JobMetric\Location\Facades\District;
```

## Basic CRUD Operations

### Store

Create a new district.

```php
$response = District::store([
    'city_id' => 120,
    'name' => 'District 1',
    'status' => true,
]);
```

The `name` uniqueness is validated **within the parent city**.

### Show

```php
$response = District::show($districtId);

// With relations (if defined)
$response = District::show($districtId, ['city']);
```

### Update

```php
$response = District::update($districtId, [
    'city_id' => 120,
    'name' => 'District 1 (Updated)',
]);
```

### Destroy / Restore / Force Delete

```php
$response = District::destroy($districtId);
$response = District::restore($districtId);
$response = District::forceDelete($districtId);
```

### Toggle Status

```php
$response = District::toggleStatus($districtId);
```

## Querying

```php
// Get all districts for a city
$response = District::all(['city_id' => 120]);
```

## Related

- [City Service](/packages/laravel-location/deep-diving/services/city)
