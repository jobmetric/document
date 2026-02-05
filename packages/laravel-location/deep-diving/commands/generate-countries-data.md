---
sidebar_position: 1
sidebar_label: location:generate-countries
---

# `location:generate-countries`

Generates/updates the `database/data/countries.json` dataset (English-only, rich metadata).

## Signature

```bash
php artisan location:generate-countries \
  --out= \
  --source= \
  --phone-metadata= \
  --pretty
```

## Options

- `--out`: Output file path (defaults to the package `database/data/countries.json`)
- `--source`: Source URL (defaults to RestCountries `countriesV3.1.json` on GitHub)
- `--phone-metadata`: Phone metadata URL (defaults to Google libphonenumber metadata XML)
- `--pretty`: Pretty-print JSON output

## Notes

The generated dataset includes fields used by the import command (key, name, flag, mobile prefix, validations, address template) plus additional rich metadata.

