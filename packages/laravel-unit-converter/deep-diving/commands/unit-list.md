---
sidebar_position: 1
sidebar_label: unit:list
---

# unit:list Command

List all available units in the database with optional filtering and locale support.

## Signature

```bash
php artisan unit:list [options]
```

## Description

The `unit:list` command displays all units stored in the database in a formatted, easy-to-read output. Units are grouped by their type and sorted by their conversion value. This command is useful for quickly viewing available units, verifying seeded data, and debugging unit-related issues.

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--type=TYPE` | Filter units by type (e.g., weight, length, volume) | All types |
| `--locale=LOCALE` | Display translations in specified locale | App locale |

## Examples

### List All Units

Display all units in the database:

```bash
php artisan unit:list
```

**Output:**
```
Available Units: (locale: en)

Weight:
  ID: 1    Gram (g)               value: 1
  ID: 2    Kilogram (kg)          value: 1000
  ID: 3    Metric Ton (t)         value: 1000000
  ID: 4    Pound (lb)             value: 453.592
  ID: 5    Ounce (oz)             value: 28.3495

Length:
  ID: 6    Meter (m)              value: 1
  ID: 7    Centimeter (cm)        value: 0.01
  ID: 8    Kilometer (km)         value: 1000
  ID: 9    Inch (in)              value: 0.0254
  ID: 10   Foot (ft)              value: 0.3048
```

### Filter by Type

Display only units of a specific type:

```bash
php artisan unit:list --type=weight
```

**Output:**
```
Available Units: (locale: en)

Weight:
  ID: 1    Gram (g)               value: 1
  ID: 2    Kilogram (kg)          value: 1000
  ID: 3    Metric Ton (t)         value: 1000000
  ID: 4    Pound (lb)             value: 453.592
  ID: 5    Ounce (oz)             value: 28.3495
```

### Display in Different Locale

Show unit names in a specific language:

```bash
php artisan unit:list --locale=fa
```

**Output:**
```
Available Units: (locale: fa)

Weight:
  ID: 1    گرم (g)                value: 1
  ID: 2    کیلوگرم (kg)           value: 1000
  ID: 3    تن (t)                 value: 1000000
  ID: 4    پوند (lb)              value: 453.592
```

### Combine Options

Filter by type and display in specific locale:

```bash
php artisan unit:list --type=length --locale=en
```

## Error Handling

### Invalid Type

If an invalid unit type is provided:

```bash
php artisan unit:list --type=invalid
```

**Output:**
```
Error: Invalid unit type: invalid. Available types: weight, length, currency, volume, ...
```

### No Units Found

If no units exist in the database:

```bash
php artisan unit:list
```

**Output:**
```
Warning: No units found.
```

## Available Unit Types

The following types can be used with the `--type` option:

| Type | Description |
|------|-------------|
| `weight` | Weight units (gram, kilogram, etc.) |
| `length` | Length units (meter, centimeter, etc.) |
| `currency` | Currency units (USD, EUR, etc.) |
| `volume` | Volume units (liter, milliliter, etc.) |
| `temperature` | Temperature units (Celsius, Fahrenheit, etc.) |
| `area` | Area units (square meter, hectare, etc.) |
| `pressure` | Pressure units (Pascal, bar, etc.) |
| `speed` | Speed units (m/s, km/h, etc.) |
| `time` | Time units (second, minute, etc.) |
| `energy` | Energy units (Joule, calorie, etc.) |
| `power` | Power units (Watt, kilowatt, etc.) |
| `data_storage` | Data storage units (Byte, KB, MB, etc.) |
| `data_transfer` | Data transfer units (bps, Mbps, etc.) |
| ... | And 20+ more types |

## Use Cases

### Development Debugging

Quickly check if units were seeded correctly:

```bash
php artisan unit:list --type=weight
```

### Finding Unit IDs

Find the ID of a specific unit for use in code:

```bash
php artisan unit:list --type=currency | grep USD
```

### Verifying Translations

Check if translations exist for a specific locale:

```bash
php artisan unit:list --locale=fa
```

### Documentation Generation

Export unit list for documentation purposes:

```bash
php artisan unit:list > units.txt
```

