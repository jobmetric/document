---
sidebar_position: 2
sidebar_label: Installation
---

import Link from "@docusaurus/Link";

# Installation

## Requirements

Before installing Laravel Unit Converter, make sure you have:

- **PHP** >= 8.1
- **Laravel** >= 10.0
- **Composer**
- **jobmetric/laravel-package-core** (auto-installed)
- **jobmetric/laravel-translation** (auto-installed)
- **jobmetric/laravel-language** (recommended for multi-language support)

## Install via Composer

Run the following command to pull in the latest version:

```bash
composer require jobmetric/laravel-unit-converter
```

## Service Provider

Laravel Package Auto-Discovery will automatically register the service provider. If you're using Laravel < 5.5 or have disabled auto-discovery, manually register the provider in `config/app.php`:

```php
'providers' => [
    // ...
    JobMetric\UnitConverter\UnitConverterServiceProvider::class,
],
```

## Publish Configuration

After installation, publish the configuration file:

```bash
php artisan vendor:publish --provider="JobMetric\UnitConverter\UnitConverterServiceProvider" --tag="unit-converter-config"
```

This will create a `config/unit-converter.php` file with the following structure:

```php
return [
    'tables' => [
        'unit' => 'units',
        'unit_relation' => 'unit_relations'
    ],
];
```

You can customize the table names if needed.

## Run Migrations

**Important:** Before using the package, you must run the migrations to create the necessary database tables:

```bash
php artisan migrate
```

This will create two tables:

### Units Table

The `units` table stores unit definitions:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `type` | string | Unit type (weight, length, etc.) |
| `value` | decimal(20,10) | Conversion value relative to base unit |
| `status` | boolean | Active status |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Update timestamp |

### Unit Relations Table

The `unit_relations` table stores polymorphic relations between units and models:

| Column | Type | Description |
|--------|------|-------------|
| `unit_id` | bigint | Foreign key to units table |
| `unitable_type` | string | Model class name |
| `unitable_id` | bigint | Model ID |
| `type` | string | Unit key (e.g., weight, width) |
| `value` | decimal(15,8) | Value in the specified unit |
| `created_at` | timestamp | Creation timestamp |

## Seed Default Units

Laravel Unit Converter includes seeders for all unit types. Run the interactive seeder to add default units:

```bash
php artisan unit:seed
```

This command will present you with an interactive menu to select which unit types to seed:

- Weight (gram, kilogram, ton, pound, ounce)
- Length (meter, centimeter, kilometer, inch, foot, yard, mile)
- Volume (liter, milliliter, gallon, quart)
- Temperature (Celsius, Fahrenheit, Kelvin)
- And 30+ more unit types!

## Verify Installation

To verify the package is installed correctly, run the unit list command:

```bash
php artisan unit:list
```

This will display all available units grouped by type.

## Quick Test

Create a simple test to ensure everything is working:

```php
use JobMetric\UnitConverter\HasUnit;
use JobMetric\UnitConverter\Facades\UnitConverter;

class Product extends Model
{
    use HasUnit;

    protected array $unitables = [
        'weight' => 'weight',
    ];
}

// Seed some units first
// php artisan unit:seed (select weight)

// Get units list
$units = UnitConverter::all();

// Find a unit by code
$kilogram = UnitConverter::findUnitByCode('kg');

// Create a product with unit
$product = Product::create(['name' => 'Test Product']);
$product->storeUnit('weight', $kilogram->id, 2.5);

// Retrieve unit value
$weight = $product->getUnit('weight');
// => ['unit' => Unit, 'value' => 2.5, 'translation' => [...]]

// If no errors occurred, installation is successful!
```

## Artisan Commands

Laravel Unit Converter provides several helpful commands:

### List Units

```bash
# List all units
php artisan unit:list

# Filter by type
php artisan unit:list --type=weight

# Specify locale for translations
php artisan unit:list --locale=fa
```

### Convert Units

```bash
# Convert 2.5 kilograms to grams
php artisan unit:convert 2.5 kg g

# With precision
php artisan unit:convert 2.5 kg g --precision=2

# With locale
php artisan unit:convert 2.5 kg g --locale=fa
```

### Seed Units

```bash
# Interactive seeder
php artisan unit:seed
```

### Export Units

```bash
# Export units to file
php artisan unit:export
```

## Next Steps

Now that you've installed Laravel Unit Converter, you can:

- Learn about <Link to="/packages/laravel-unit-converter/deep-diving/has-unit">using the HasUnit trait</Link>
- Explore <Link to="/packages/laravel-unit-converter/showcase">real-world examples</Link>
- Check out the <Link to="/packages/laravel-unit-converter/deep-diving/unit-converter-service">UnitConverter Service API</Link>
- Review the <Link to="/packages/laravel-unit-converter/deep-diving/unit-types">available unit types</Link>

## Troubleshooting

### Migration Errors

If you encounter migration errors:

1. Make sure you've run `composer require jobmetric/laravel-unit-converter`
2. Check that all dependencies are installed (`jobmetric/laravel-translation`)
3. Run `php artisan migrate:fresh` if needed (warning: this will drop all tables)

### Trait Not Found

If you get a "Trait not found" error:

1. Make sure the package is properly installed via Composer
2. Run `composer dump-autoload`

### Unit Not Found

If you get "Unit not found" errors:

1. Make sure you've seeded the units with `php artisan unit:seed`
2. Check that the unit ID or code exists in the database

### Type Mismatch Errors

If you get "Cannot convert between different unit types" errors:

1. Ensure both units belong to the same type (e.g., both are weight units)
2. Check your model's `$unitables` configuration to ensure correct type mapping

