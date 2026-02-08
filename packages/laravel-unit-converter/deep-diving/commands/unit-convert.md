---
sidebar_position: 2
sidebar_label: unit:convert
---

# unit:convert Command

Convert a value from one unit to another directly from the command line.

## Signature

```bash
php artisan unit:convert {value} {from} {to} [options]
```

## Description

The `unit:convert` command allows you to perform unit conversions directly from the terminal. Simply provide the value to convert, the source unit code, and the target unit code. The command will display the converted result with optional precision control and localized unit names.

## Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `value` | The numeric value to convert | Yes |
| `from` | The source unit code (e.g., kg, g, m, cm) | Yes |
| `to` | The target unit code | Yes |

## Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--precision` | `-p` | Number of decimal places in result | 4 |
| `--locale` | `-l` | Locale for unit names display | App locale |

## Examples

### Basic Conversion

Convert 2.5 kilograms to grams:

```bash
php artisan unit:convert 2.5 kg g
```

**Output:**
```
  2.5 Kilogram = 2500 Gram
```

### Length Conversion

Convert 100 centimeters to inches:

```bash
php artisan unit:convert 100 cm in
```

**Output:**
```
  100 Centimeter = 39.3701 Inch
```

### With Precision Control

Specify the number of decimal places:

```bash
php artisan unit:convert 100 cm in --precision=2
```

**Output:**
```
  100 Centimeter = 39.37 Inch
```

Or using the short option:

```bash
php artisan unit:convert 100 cm in -p 2
```

### With Locale

Display unit names in a specific language:

```bash
php artisan unit:convert 5 km mi --locale=fa
```

**Output:**
```
  5 کیلومتر = 3.1069 مایل
```

### Temperature Conversion

Convert Celsius to Fahrenheit:

```bash
php artisan unit:convert 25 C F
```

**Output:**
```
  25 Celsius = 77 Fahrenheit
```

### Data Storage Conversion

Convert gigabytes to megabytes:

```bash
php artisan unit:convert 1.5 GB MB
```

**Output:**
```
  1.5 Gigabyte = 1536 Megabyte
```

### Currency Conversion

Convert USD to EUR (requires currency units to be seeded):

```bash
php artisan unit:convert 100 USD EUR
```

**Output:**
```
  100 US Dollar = 92.00 Euro
```

## Error Handling

### Unit Not Found

If a unit code doesn't exist:

```bash
php artisan unit:convert 100 xyz abc
```

**Output:**
```
Error: Unit with code 'xyz' not found.
```

### Different Unit Types

If trying to convert between incompatible types:

```bash
php artisan unit:convert 100 kg m
```

**Output:**
```
Error: Cannot convert between different unit types. From: weight, To: length
```

### Invalid Value

If a non-numeric value is provided:

```bash
php artisan unit:convert abc kg g
```

**Output:**
```
Error: Value must be a numeric value.
```

## Common Unit Codes

### Weight
| Code | Unit |
|------|------|
| `g` | Gram |
| `kg` | Kilogram |
| `t` | Metric Ton |
| `lb` | Pound |
| `oz` | Ounce |

### Length
| Code | Unit |
|------|------|
| `m` | Meter |
| `cm` | Centimeter |
| `mm` | Millimeter |
| `km` | Kilometer |
| `in` | Inch |
| `ft` | Foot |
| `mi` | Mile |

### Volume
| Code | Unit |
|------|------|
| `L` | Liter |
| `mL` | Milliliter |
| `gal` | Gallon |

### Data Storage
| Code | Unit |
|------|------|
| `B` | Byte |
| `KB` | Kilobyte |
| `MB` | Megabyte |
| `GB` | Gigabyte |
| `TB` | Terabyte |

## Use Cases

### Quick Calculations

Quickly convert values without writing code:

```bash
php artisan unit:convert 5 mi km
# 5 Mile = 8.0467 Kilometer
```

### Recipe Scaling

Convert cooking measurements:

```bash
php artisan unit:convert 2 cup mL
# 2 Cup = 480 Milliliter
```

### Shipping Calculations

Calculate weights for shipping:

```bash
php artisan unit:convert 2.5 kg lb -p 2
# 2.5 Kilogram = 5.51 Pound
```

### Scientific Work

High-precision scientific conversions:

```bash
php artisan unit:convert 101325 Pa bar -p 6
# 101325 Pascal = 1.013250 Bar
```

## Scripting

Use in shell scripts for automated conversions:

```bash
#!/bin/bash
# convert-weights.sh

weights=(1 2 5 10)
for w in "${weights[@]}"; do
    php artisan unit:convert $w kg lb -p 2
done
```

**Output:**
```
  1 Kilogram = 2.20 Pound
  2 Kilogram = 4.41 Pound
  5 Kilogram = 11.02 Pound
  10 Kilogram = 22.05 Pound
```

