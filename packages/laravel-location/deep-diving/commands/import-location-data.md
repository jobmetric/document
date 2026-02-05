---
sidebar_position: 2
sidebar_label: location:import
---

# `location:import`

Imports location base data (countries and optionally provinces/cities/districts) from JSON files under `database/data/`.

## Prerequisites

Make sure your tables exist before importing:

```bash
php artisan migrate
```

## Signature

```bash
php artisan location:import {country?*} --data-path= --force
```

## Behavior

- Without arguments, imports **all countries** from `database/data/countries.json`
- With one or more country keys (e.g. `ir`, `tr`), it imports **provinces/cities/districts** for those countries if hierarchy files exist

## Data sources

- `database/data/countries.json` (master list)
- `database/data/{country_key}/data.json` (preferred)
- `database/data/{country_key}/subdivisions.json` (legacy, optional)

## Options

- `--data-path`: Override base data directory (defaults to package `database/data/`)
- `--force`: Update existing records (otherwise only create/restore)

## Idempotency & updates

- Without `--force`, the command is conservative: it focuses on creating missing records and restoring soft-deleted ones.
- With `--force`, it will update existing records (useful when your JSON has changed).

## Example

```bash
php artisan location:import
php artisan location:import ir --force
```

## Common troubleshooting

- If you see a “Missing table ...” message, run migrations first.
- If hierarchy import is skipped for a country key, ensure `database/data/{key}/data.json` exists (or legacy `subdivisions.json`).
