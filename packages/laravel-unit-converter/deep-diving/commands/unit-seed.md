---
sidebar_position: 3
sidebar_label: unit:seed
---

# unit:seed Command

Seed default units into the database with an interactive selection menu.

## Signature

```bash
php artisan unit:seed
```

## Description

The `unit:seed` command provides an interactive interface to seed default units into your database. It presents a multi-select menu where you can choose which unit types to seed. Each unit type includes a comprehensive set of commonly used units with translations for supported locales.

## Interactive Menu

When you run the command, you'll see an interactive selection menu:

```
┌ Select unit types to seed ──────────────────────────────────────┐
│ › ◉ Weight (وزن)                                                │
│   ◉ Length (طول)                                                │
│   ◯ Currency (ارز)                                              │
│   ◯ Number (تعداد)                                              │
│   ◉ Volume (حجم)                                                │
│   ◯ Temperature (دما)                                           │
│   ◯ Area (مساحت)                                                │
│   ◯ Pressure (فشار)                                             │
│   ◯ Speed (سرعت)                                                │
│   ... (30+ types)                                               │
└─────────────────────────────────────────────────────────────────┘
```

Use arrow keys to navigate, space to select/deselect, and enter to confirm.

## Available Unit Types

The seeder supports all 30+ unit types:

### Physical Units

| Type | Label | Example Units |
|------|-------|---------------|
| `weight` | Weight (وزن) | Gram, Kilogram, Ton, Pound, Ounce |
| `length` | Length (طول) | Meter, Centimeter, Kilometer, Inch, Foot, Mile |
| `volume` | Volume (حجم) | Liter, Milliliter, Gallon, Quart, Pint |
| `area` | Area (مساحت) | Square Meter, Hectare, Acre, Square Foot |
| `temperature` | Temperature (دما) | Celsius, Fahrenheit, Kelvin |
| `pressure` | Pressure (فشار) | Pascal, Bar, PSI, Atmosphere |
| `speed` | Speed (سرعت) | m/s, km/h, mph, Knot |
| `force` | Force (نیرو) | Newton, Kilonewton, Pound-force |
| `time` | Time (زمان) | Second, Minute, Hour, Day, Week |
| `angle` | Angle (زاویه) | Degree, Radian, Gradian |

### Energy & Power Units

| Type | Label | Example Units |
|------|-------|---------------|
| `energy` | Energy (انرژی) | Joule, Calorie, kWh, BTU |
| `power` | Power (توان) | Watt, Kilowatt, Horsepower |
| `torque` | Torque (گشتاور) | Newton-meter, Pound-foot |
| `frequency` | Frequency (بسامد) | Hertz, kHz, MHz, GHz |
| `acceleration` | Acceleration (شتاب) | m/s², G-force |

### Electrical Units

| Type | Label | Example Units |
|------|-------|---------------|
| `electric_current` | Electric Current (جریان الکتریکی) | Ampere, Milliampere |
| `electric_voltage` | Electric Voltage (ولتاژ) | Volt, Millivolt, Kilovolt |
| `electric_resistance` | Electric Resistance (مقاومت) | Ohm, Kiloohm, Megaohm |
| `electric_capacitance` | Electric Capacitance (خازن) | Farad, Microfarad, Picofarad |
| `electric_inductance` | Electric Inductance (القا) | Henry, Millihenry |
| `magnetic_flux` | Magnetic Flux (شار مغناطیسی) | Weber, Tesla |

### Scientific Units

| Type | Label | Example Units |
|------|-------|---------------|
| `density` | Density (چگالی) | kg/m³, g/cm³, lb/ft³ |
| `viscosity` | Viscosity (ویسکوزیته) | Pascal-second, Poise |
| `concentration` | Concentration (غلظت) | mol/L, ppm, percent |
| `radiation` | Radiation (تابش) | Becquerel, Sievert, Gray |
| `luminosity` | Luminosity (روشنایی) | Lumen, Candela, Lux |
| `heat_transfer_coefficient` | Heat Transfer (ضریب انتقال حرارت) | W/(m²·K) |

### Digital Units

| Type | Label | Example Units |
|------|-------|---------------|
| `data_storage` | Data Storage (ذخیره‌سازی داده) | Byte, KB, MB, GB, TB, PB |
| `data_transfer` | Data Transfer (انتقال داده) | bps, Kbps, Mbps, Gbps |

### Flow Units

| Type | Label | Example Units |
|------|-------|---------------|
| `mass_flow` | Mass Flow (جریان جرمی) | kg/s, lb/h, t/h |
| `volumetric_flow` | Volumetric Flow (جریان حجمی) | L/s, m³/h, gal/min |

### Other Units

| Type | Label | Example Units |
|------|-------|---------------|
| `currency` | Currency (ارز) | USD, EUR, GBP, IRR |
| `number` | Number (تعداد) | Piece, Dozen, Gross |
| `cooking` | Cooking (پخت و پز) | Cup, Tablespoon, Teaspoon |
| `fuel_consumption` | Fuel Consumption (مصرف سوخت) | L/100km, mpg, km/L |
| `crypto` | Cryptocurrency (رمزارز) | Bitcoin, Ethereum, Satoshi |

## Output

After selecting types and confirming, the command shows progress:

```
Seeding Weight units...
✓ Gram created
✓ Kilogram created
✓ Milligram created
✓ Metric Ton created
✓ Pound created
✓ Ounce created

Seeding Length units...
✓ Meter created
✓ Centimeter created
✓ Millimeter created
✓ Kilometer created
✓ Inch created
✓ Foot created
✓ Yard created
✓ Mile created

Seeding Volume units...
✓ Liter created
✓ Milliliter created
✓ Cubic Meter created
✓ Gallon created

All selected unit types have been seeded successfully!
```

## Base Unit Handling

Each seeder automatically creates the base unit first (with `value = 1`), then creates other units relative to it:

```
Weight:
├── Gram (base unit, value = 1)
├── Kilogram (value = 1000)
├── Milligram (value = 0.001)
├── Metric Ton (value = 1000000)
├── Pound (value = 453.592)
└── Ounce (value = 28.3495)
```

## Translations

Each seeded unit includes translations for supported locales:

```php
// Example: Kilogram unit
[
    'en' => [
        'name' => 'Kilogram',
        'code' => 'kg',
        'position' => 'right',
    ],
    'fa' => [
        'name' => 'کیلوگرم',
        'code' => 'کیلو',
        'position' => 'right',
    ],
]
```

## Non-Interactive Mode

For CI/CD pipelines or automated scripts, you may need to seed all units without interaction. This can be done by calling the seeder classes directly:

```php
// In a seeder or command
use JobMetric\UnitConverter\Database\Seeders\WeightUnitSeeder;
use JobMetric\UnitConverter\Database\Seeders\LengthUnitSeeder;

(new WeightUnitSeeder())->run();
(new LengthUnitSeeder())->run();
```

Or create a custom seeder that calls multiple seeders:

```php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            \JobMetric\UnitConverter\Database\Seeders\WeightUnitSeeder::class,
            \JobMetric\UnitConverter\Database\Seeders\LengthUnitSeeder::class,
            \JobMetric\UnitConverter\Database\Seeders\VolumeUnitSeeder::class,
            // Add more as needed
        ]);
    }
}
```

Then run:

```bash
php artisan db:seed --class=UnitSeeder
```

## Re-running the Seeder

If units already exist, the seeder will skip them to avoid duplicates. To re-seed:

1. Delete existing units first:
   ```php
   use JobMetric\UnitConverter\Models\Unit;
   Unit::where('type', 'weight')->delete();
   ```

2. Run the seeder again:
   ```bash
   php artisan unit:seed
   ```

## Use Cases

### Initial Setup

Seed common units when setting up a new project:

```bash
php artisan migrate
php artisan unit:seed
# Select: weight, length, volume, currency
```

### Adding New Unit Types

Add units for new features:

```bash
php artisan unit:seed
# Select: temperature, pressure (for a new scientific module)
```

### Development Environment

Seed all units for development:

```bash
php artisan unit:seed
# Select all types
```

