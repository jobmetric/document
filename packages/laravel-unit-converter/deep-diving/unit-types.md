---
sidebar_position: 3
sidebar_label: Unit Types
---

import Link from "@docusaurus/Link";

# Unit Types

Laravel Unit Converter supports over 30 unit types, each representing an isolated conversion family. Units can only be converted within their own type.

## Namespace

```php
JobMetric\UnitConverter\Enums\UnitTypeEnum
```

## Overview

The `UnitTypeEnum` enum defines all supported unit types:

```php
use JobMetric\UnitConverter\Enums\UnitTypeEnum;

// Get all values
$types = UnitTypeEnum::values();

// Use specific type
$weightType = UnitTypeEnum::WEIGHT;
echo $weightType->value; // 'weight'
echo $weightType->label(); // Translated label
```

## Physical Units

### Weight

```php
UnitTypeEnum::WEIGHT // 'weight'
```

Units for measuring mass: gram, kilogram, ton, pound, ounce, etc.

**Common units:**
| Unit | Code | Value (relative to gram) |
|------|------|--------------------------|
| Gram | g | 1 |
| Kilogram | kg | 1000 |
| Milligram | mg | 0.001 |
| Metric Ton | t | 1000000 |
| Pound | lb | 453.592 |
| Ounce | oz | 28.3495 |

### Length

```php
UnitTypeEnum::LENGTH // 'length'
```

Units for measuring distance: meter, centimeter, kilometer, inch, foot, etc.

**Common units:**
| Unit | Code | Value (relative to meter) |
|------|------|---------------------------|
| Meter | m | 1 |
| Centimeter | cm | 0.01 |
| Millimeter | mm | 0.001 |
| Kilometer | km | 1000 |
| Inch | in | 0.0254 |
| Foot | ft | 0.3048 |
| Yard | yd | 0.9144 |
| Mile | mi | 1609.344 |

### Volume

```php
UnitTypeEnum::VOLUME // 'volume'
```

Units for measuring capacity: liter, milliliter, gallon, quart, etc.

**Common units:**
| Unit | Code | Value (relative to liter) |
|------|------|---------------------------|
| Liter | L | 1 |
| Milliliter | mL | 0.001 |
| Cubic meter | m³ | 1000 |
| Gallon (US) | gal | 3.78541 |
| Quart | qt | 0.946353 |
| Pint | pt | 0.473176 |
| Fluid ounce | fl oz | 0.0295735 |

### Area

```php
UnitTypeEnum::AREA // 'area'
```

Units for measuring surface area: square meter, hectare, acre, etc.

**Common units:**
| Unit | Code | Value (relative to m²) |
|------|------|------------------------|
| Square meter | m² | 1 |
| Square centimeter | cm² | 0.0001 |
| Square kilometer | km² | 1000000 |
| Hectare | ha | 10000 |
| Acre | ac | 4046.86 |
| Square foot | ft² | 0.092903 |
| Square inch | in² | 0.00064516 |

### Temperature

```php
UnitTypeEnum::TEMPERATURE // 'temperature'
```

Units for measuring temperature: Celsius, Fahrenheit, Kelvin.

**Note:** Temperature conversions require special handling due to non-linear relationships. The base unit approach works for relative differences but not absolute conversions.

**Common units:**
| Unit | Code | Notes |
|------|------|-------|
| Celsius | °C | Base unit |
| Fahrenheit | °F | °F = °C × 9/5 + 32 |
| Kelvin | K | K = °C + 273.15 |

### Pressure

```php
UnitTypeEnum::PRESSURE // 'pressure'
```

Units for measuring force per area: Pascal, bar, psi, atmosphere, etc.

**Common units:**
| Unit | Code | Value (relative to Pascal) |
|------|------|----------------------------|
| Pascal | Pa | 1 |
| Kilopascal | kPa | 1000 |
| Bar | bar | 100000 |
| Atmosphere | atm | 101325 |
| PSI | psi | 6894.76 |
| mmHg | mmHg | 133.322 |

### Speed

```php
UnitTypeEnum::SPEED // 'speed'
```

Units for measuring velocity: meters/second, km/h, mph, knots, etc.

**Common units:**
| Unit | Code | Value (relative to m/s) |
|------|------|-------------------------|
| Meter/second | m/s | 1 |
| Kilometer/hour | km/h | 0.277778 |
| Mile/hour | mph | 0.44704 |
| Knot | kn | 0.514444 |
| Foot/second | ft/s | 0.3048 |

### Force

```php
UnitTypeEnum::FORCE // 'force'
```

Units for measuring force: Newton, kilonewton, pound-force, etc.

**Common units:**
| Unit | Code | Value (relative to Newton) |
|------|------|----------------------------|
| Newton | N | 1 |
| Kilonewton | kN | 1000 |
| Pound-force | lbf | 4.44822 |
| Dyne | dyn | 0.00001 |
| Kilogram-force | kgf | 9.80665 |

### Time

```php
UnitTypeEnum::TIME // 'time'
```

Units for measuring duration: second, minute, hour, day, etc.

**Common units:**
| Unit | Code | Value (relative to second) |
|------|------|----------------------------|
| Second | s | 1 |
| Millisecond | ms | 0.001 |
| Minute | min | 60 |
| Hour | h | 3600 |
| Day | d | 86400 |
| Week | wk | 604800 |
| Year | yr | 31536000 |

### Angle

```php
UnitTypeEnum::ANGLE // 'angle'
```

Units for measuring angles: degree, radian, gradian, etc.

**Common units:**
| Unit | Code | Value (relative to degree) |
|------|------|----------------------------|
| Degree | ° | 1 |
| Radian | rad | 57.2958 |
| Gradian | grad | 0.9 |
| Arcminute | ' | 0.0166667 |
| Arcsecond | " | 0.000277778 |

## Energy & Power

### Energy

```php
UnitTypeEnum::ENERGY // 'energy'
```

Units for measuring energy: Joule, calorie, kilowatt-hour, BTU, etc.

**Common units:**
| Unit | Code | Value (relative to Joule) |
|------|------|---------------------------|
| Joule | J | 1 |
| Kilojoule | kJ | 1000 |
| Calorie | cal | 4.184 |
| Kilocalorie | kcal | 4184 |
| Watt-hour | Wh | 3600 |
| Kilowatt-hour | kWh | 3600000 |
| BTU | BTU | 1055.06 |

### Power

```php
UnitTypeEnum::POWER // 'power'
```

Units for measuring power: Watt, kilowatt, horsepower, etc.

**Common units:**
| Unit | Code | Value (relative to Watt) |
|------|------|--------------------------|
| Watt | W | 1 |
| Kilowatt | kW | 1000 |
| Megawatt | MW | 1000000 |
| Horsepower | hp | 745.7 |
| BTU/hour | BTU/h | 0.293071 |

### Torque

```php
UnitTypeEnum::TORQUE // 'torque'
```

Units for measuring rotational force: Newton-meter, pound-foot, etc.

**Common units:**
| Unit | Code | Value (relative to N·m) |
|------|------|-------------------------|
| Newton-meter | N·m | 1 |
| Kilonewton-meter | kN·m | 1000 |
| Pound-foot | lb·ft | 1.35582 |
| Pound-inch | lb·in | 0.112985 |

### Frequency

```php
UnitTypeEnum::FREQUENCY // 'frequency'
```

Units for measuring frequency: Hertz, kilohertz, megahertz, etc.

**Common units:**
| Unit | Code | Value (relative to Hz) |
|------|------|------------------------|
| Hertz | Hz | 1 |
| Kilohertz | kHz | 1000 |
| Megahertz | MHz | 1000000 |
| Gigahertz | GHz | 1000000000 |
| RPM | rpm | 0.0166667 |

### Acceleration

```php
UnitTypeEnum::ACCELERATION // 'acceleration'
```

Units for measuring acceleration: m/s², g-force, etc.

**Common units:**
| Unit | Code | Value (relative to m/s²) |
|------|------|--------------------------|
| Meter/s² | m/s² | 1 |
| G-force | g | 9.80665 |
| Foot/s² | ft/s² | 0.3048 |
| Gal | Gal | 0.01 |

## Electrical Units

### Electric Current

```php
UnitTypeEnum::ELECTRIC_CURRENT // 'electric_current'
```

Units for measuring current: Ampere, milliampere, microampere.

### Electric Voltage

```php
UnitTypeEnum::ELECTRIC_VOLTAGE // 'electric_voltage'
```

Units for measuring voltage: Volt, millivolt, kilovolt.

### Electric Resistance

```php
UnitTypeEnum::ELECTRIC_RESISTANCE // 'electric_resistance'
```

Units for measuring resistance: Ohm, kiloohm, megaohm.

### Electric Capacitance

```php
UnitTypeEnum::ELECTRIC_CAPACITANCE // 'electric_capacitance'
```

Units for measuring capacitance: Farad, microfarad, picofarad.

### Electric Inductance

```php
UnitTypeEnum::ELECTRIC_INDUCTANCE // 'electric_inductance'
```

Units for measuring inductance: Henry, millihenry, microhenry.

### Magnetic Flux

```php
UnitTypeEnum::MAGNETIC_FLUX // 'magnetic_flux'
```

Units for measuring magnetic flux: Weber, Tesla, Gauss.

## Scientific Units

### Density

```php
UnitTypeEnum::DENSITY // 'density'
```

Units for measuring density: kg/m³, g/cm³, lb/ft³.

### Viscosity

```php
UnitTypeEnum::VISCOSITY // 'viscosity'
```

Units for measuring viscosity: Pascal-second, Poise, Stokes.

### Concentration

```php
UnitTypeEnum::CONCENTRATION // 'concentration'
```

Units for measuring concentration: mol/L, ppm, percent.

### Radiation

```php
UnitTypeEnum::RADIATION // 'radiation'
```

Units for measuring radiation: Becquerel, Sievert, Gray.

### Luminosity

```php
UnitTypeEnum::LUMINOSITY // 'luminosity'
```

Units for measuring light: Lumen, Candela, Lux.

### Heat Transfer Coefficient

```php
UnitTypeEnum::HEAT_TRANSFER_COEFFICIENT // 'heat_transfer_coefficient'
```

Units for measuring heat transfer: W/(m²·K), BTU/(h·ft²·°F).

## Flow Units

### Mass Flow

```php
UnitTypeEnum::MASS_FLOW // 'mass_flow'
```

Units for measuring mass flow rate: kg/s, lb/h, t/h.

### Volumetric Flow

```php
UnitTypeEnum::VOLUMETRIC_FLOW // 'volumetric_flow'
```

Units for measuring volume flow rate: L/s, m³/h, gal/min.

## Digital Units

### Data Storage

```php
UnitTypeEnum::DATA_STORAGE // 'data_storage'
```

Units for measuring digital storage: Byte, KB, MB, GB, TB, PB.

**Common units:**
| Unit | Code | Value (relative to Byte) |
|------|------|--------------------------|
| Byte | B | 1 |
| Kilobyte | KB | 1024 |
| Megabyte | MB | 1048576 |
| Gigabyte | GB | 1073741824 |
| Terabyte | TB | 1099511627776 |
| Petabyte | PB | 1125899906842624 |

### Data Transfer

```php
UnitTypeEnum::DATA_TRANSFER // 'data_transfer'
```

Units for measuring data transfer rate: bps, Kbps, Mbps, Gbps.

**Common units:**
| Unit | Code | Value (relative to bps) |
|------|------|-------------------------|
| Bit/second | bps | 1 |
| Kilobit/s | Kbps | 1000 |
| Megabit/s | Mbps | 1000000 |
| Gigabit/s | Gbps | 1000000000 |
| Byte/second | B/s | 8 |
| Megabyte/s | MB/s | 8000000 |

## Financial Units

### Currency

```php
UnitTypeEnum::CURRENCY // 'currency'
```

Units for representing currencies with exchange rates.

**Example setup:**
| Currency | Code | Value (relative to base) |
|----------|------|--------------------------|
| US Dollar | USD | 1 (base) |
| Euro | EUR | 0.92 |
| British Pound | GBP | 0.79 |
| Japanese Yen | JPY | 149.5 |

### Cryptocurrency

```php
UnitTypeEnum::CRYPTO // 'crypto'
```

Units for representing cryptocurrencies.

**Example units:**
- Bitcoin (BTC)
- Ethereum (ETH)
- Satoshi (sat)

### Number

```php
UnitTypeEnum::NUMBER // 'number'
```

Units for counting: pieces, dozen, gross, etc.

## Cooking Units

```php
UnitTypeEnum::COOKING // 'cooking'
```

Units for cooking measurements: cup, tablespoon, teaspoon, etc.

**Common units:**
| Unit | Code | Value (relative to mL) |
|------|------|------------------------|
| Milliliter | mL | 1 |
| Teaspoon | tsp | 5 |
| Tablespoon | tbsp | 15 |
| Cup (US) | cup | 240 |
| Fluid ounce | fl oz | 30 |
| Pint | pt | 480 |

## Fuel Consumption

```php
UnitTypeEnum::FUEL_CONSUMPTION // 'fuel_consumption'
```

Units for measuring fuel efficiency: L/100km, mpg, km/L.

## Using Unit Types

### In Model Configuration

```php
use JobMetric\UnitConverter\HasUnit;
use JobMetric\UnitConverter\Enums\UnitTypeEnum;

class Product extends Model
{
    use HasUnit;

    protected array $unitables = [
        'weight' => UnitTypeEnum::WEIGHT,
        'length' => UnitTypeEnum::LENGTH,
        'price' => UnitTypeEnum::CURRENCY,
    ];
}
```

### In Unit Creation

```php
use JobMetric\UnitConverter\Facades\UnitConverter;
use JobMetric\UnitConverter\Enums\UnitTypeEnum;

UnitConverter::store([
    'type' => UnitTypeEnum::WEIGHT->value, // or just 'weight'
    'value' => 1000,
    'translation' => [...],
]);
```

### Getting Available Types

```php
use JobMetric\UnitConverter\Enums\UnitTypeEnum;

// Get all type values
$types = UnitTypeEnum::values();
// => ['weight', 'length', 'currency', ...]

// Get all cases
$cases = UnitTypeEnum::cases();

// Get translated label
$label = UnitTypeEnum::WEIGHT->label();
// => 'Weight' (translated)
```

## Seeding Units

Use the `unit:seed` command to seed default units:

```bash
php artisan unit:seed
```

This presents an interactive menu to select which unit types to seed. Each seeder creates common units for that type with multilingual translations.

