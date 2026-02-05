---
sidebar_position: 2
sidebar_label: Province
---

# Province Service

The Province service manages provinces within a specific country. It supports soft-deletes and status toggling.

## Facade

```php
use JobMetric\Location\Facades\Province;
```

## Basic CRUD Operations

### Store

```php
$response = Province::store([
    'country_id' => 1,
    'name' => 'Tehran',
    'status' => true,
]);
```

The `name` uniqueness is validated **within the parent country**.

### Show

```php
$response = Province::show($provinceId);

// With relations (if defined)
$response = Province::show($provinceId, ['country', 'cities']);
```

### Update

```php
$response = Province::update($provinceId, [
    'country_id' => 1,
    'name' => 'Tehran (Updated)',
]);
```

### Destroy / Restore / Force Delete

```php
$response = Province::destroy($provinceId);
$response = Province::restore($provinceId);
$response = Province::forceDelete($provinceId);
```

### Toggle Status

```php
$response = Province::toggleStatus($provinceId);
```

## Querying

```php
// Get all provinces for a country
$response = Province::all(['country_id' => 1]);

// Paginate enabled provinces, include soft-deleted rows
$response = Province::paginate(15, ['status' => true], [], 'withTrashed');
```

## Related

- [Country Service](/packages/laravel-location/deep-diving/services/country)

