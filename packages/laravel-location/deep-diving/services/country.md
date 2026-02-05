---
sidebar_position: 1
sidebar_label: Country
---

# Country Service

The Country service provides CRUD operations for countries and a clean facade-driven API to manage country-level metadata such as calling code, validations, and address templates.

## Namespace

```php
JobMetric\Location\Services\Country
```

## Facade

```php
use JobMetric\Location\Facades\Country;
```

## Response Shape

Most service methods return a `JobMetric\PackageCore\Output\Response` instance:

```php
$response->ok;      // bool
$response->message; // string
$response->data;    // resource|collection|null
$response->status;  // int
$response->errors;  // array
```

## Basic CRUD Operations

### Store

Create a new country.

```php
$response = Country::store([
    'name' => 'Iran',
    'flag' => 'ir.svg',
    'mobile_prefix' => 98,
    'validation' => [
        '/^9\\d{9}$/',
    ],
    'address_on_letter' => "{country}, {province}, {city}\n{district}, {street}, {number}",
    'status' => true,
]);
```

Minimal payload:

```php
$response = Country::store([
    'name' => 'Germany',
]);
```

### Show

Retrieve a specific country by ID.

```php
$response = Country::show($countryId);

// With relations (if your model defines them)
$response = Country::show($countryId, ['provinces']);
```

### Update

Update a country by ID.

```php
$response = Country::update($countryId, [
    'flag' => 'de.svg',
    'mobile_prefix' => 49,
]);
```

### Destroy / Restore / Force Delete

Country supports soft deletes:

```php
$response = Country::destroy($countryId);
$response = Country::restore($countryId);
$response = Country::forceDelete($countryId);
```

### Toggle Status

Enable/disable the country (requires a `status` boolean column).

```php
$response = Country::toggleStatus($countryId);
```

## Querying & Pagination

### QueryBuilder

All Location services expose a `query()` method built on Spatie QueryBuilder. It supports:

- Allowed fields / filters / sorts (package-defined)
- Default sorting
- Simple `where($filters)` injection
- Optional soft-delete mode: `withTrashed` | `onlyTrashed` | `null`

```php
$qb = Country::query(
    filters: ['status' => true],
    with: ['provinces'],
    mode: null
);

$countries = $qb->get();
```

### Paginate / All

```php
// Paginated
$response = Country::paginate(15, ['status' => true], ['provinces']);

// All (no pagination)
$response = Country::all(['status' => true]);
```

### Soft-delete modes

```php
// Include soft-deleted rows
$response = Country::paginate(15, [], [], 'withTrashed');

// Only soft-deleted rows
$response = Country::paginate(15, [], [], 'onlyTrashed');
```

## Notes

- `mobile_prefix` is stored without a plus sign and may be formatted by the model accessor.
- For datasets and import workflow, see: [Datasets](/packages/laravel-location/deep-diving/datasets) and [location:import](/packages/laravel-location/deep-diving/commands/import-location-data).

