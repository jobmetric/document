---
sidebar_position: 10
sidebar_label: Datasets
---

# Datasets (`database/data`)

Laravel Location includes a dataset workflow under `database/data/` to standardize country and subdivision data.

## Goals

- Maintain a **single master list** of countries (`countries.json`)
- Allow adding **country-specific subdivisions** under `database/data/{country_key}/`

## Folder structure

Recommended:

- `database/data/countries.json` (required)
- `database/data/{country_key}/data.json` (optional; preferred)
- `database/data/{country_key}/subdivisions.json` (optional; legacy)

Example:

```text
database/data/
  countries.json
  ir/
    data.json
  us/
    data.json
```

## Data shapes

### `countries.json`

The generator command produces a list of countries. The import command primarily uses fields like `key`, `name`, `flag`, `mobile_prefix`, `validation`, and `address_on_letter`.

Example (simplified):

```json
[
  {
    "key": "ir",
    "name": "Iran",
    "flag": "ir.svg",
    "mobile_prefix": 98,
    "validation": ["/^9\\d{9}$/"],
    "address_on_letter": "{country}, {province}, {city}\n{district}, {street}, {number}",
    "status": true
  }
]
```

### `{country_key}/data.json`

Hierarchy file is optional and used when you want to import provinces/cities/districts for that country.

Recommended shape:

```json
{
  "provinces": [
    {
      "name": "Tehran",
      "status": true,
      "cities": [
        {
          "name": "Tehran",
          "status": true,
          "districts": [
            { "name": "District 1", "status": true }
          ]
        }
      ]
    }
  ]
}
```

## Workflow

1) Generate/update countries dataset:

```bash
php artisan location:generate-countries --pretty
```

2) Add subdivisions for the countries you care about (optional)

3) Import:

```bash
php artisan location:import
php artisan location:import ir --force
```

## Where to read more

This documentation is a summary. The dataset layer is documented in detail in the package dataset README:

- `packages/laravel-location/database/data/README.md`

## Related

- [location:generate-countries](/packages/laravel-location/deep-diving/commands/generate-countries-data)
- [location:import](/packages/laravel-location/deep-diving/commands/import-location-data)

