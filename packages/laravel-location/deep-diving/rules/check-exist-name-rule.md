---
sidebar_position: 1
sidebar_label: CheckExistNameRule
---

# CheckExistNameRule

Validation rule used to prevent duplicate names in geography entities.

It supports parent-scoped uniqueness:

- Province name must be unique within a country
- City name must be unique within a province
- District name must be unique within a city

## Namespace

```php
JobMetric\Location\Rules\CheckExistNameRule
```

## Constructor

```php
new CheckExistNameRule(string $model, ?int $object_id = null, ?int $parent_id = null)
```

## Usage examples

### Country (global uniqueness)

```php
use JobMetric\Location\Models\Country as CountryModel;
use JobMetric\Location\Rules\CheckExistNameRule;

'name' => [
    'required',
    'string',
    new CheckExistNameRule(CountryModel::class),
],
```

### Province (unique within country)

```php
use JobMetric\Location\Models\Province as ProvinceModel;

$countryId = $this->input('country_id');

'name' => [
    'required',
    'string',
    new CheckExistNameRule(ProvinceModel::class, object_id: null, parent_id: $countryId),
],
```

### Update (exclude current row)

```php
new CheckExistNameRule(ProvinceModel::class, object_id: $provinceId, parent_id: $countryId)
```

## Notes

The rule implements `DataAwareRule` to reliably read the parent id from the validated payload when used via `dto(...)`.

