---
sidebar_position: 4
sidebar_label: unit:export
---

# unit:export Command

Export units to JSON or CSV file for backup, migration, or documentation purposes.

## Signature

```bash
php artisan unit:export [options]
```

## Description

The `unit:export` command exports units from the database to a file in JSON or CSV format. This is useful for creating backups, migrating data between environments, generating documentation, or sharing unit configurations.

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--type=TYPE` | Filter units by type (e.g., weight, length) | All types |
| `--format=FORMAT` | Output format (json or csv) | json |
| `--output=PATH` | Output file path | Auto-generated |

## Examples

### Export All Units as JSON

Export all units to a JSON file:

```bash
php artisan unit:export
```

**Output:**
```
Units exported successfully to: /storage/app/units_2024-01-15_143052.json
  Total units exported: 150
```

### Export Specific Type

Export only weight units:

```bash
php artisan unit:export --type=weight
```

**Output:**
```
Units exported successfully to: /storage/app/units_weight_2024-01-15_143052.json
  Total units exported: 6
```

### Export as CSV

Export units in CSV format:

```bash
php artisan unit:export --format=csv
```

**Output:**
```
Units exported successfully to: /storage/app/units_2024-01-15_143052.csv
  Total units exported: 150
```

### Custom Output Path

Specify a custom output file path:

```bash
php artisan unit:export --output=/path/to/backup/units.json
```

### Combine Options

Export weight units as CSV to a specific path:

```bash
php artisan unit:export --type=weight --format=csv --output=./exports/weight-units.csv
```

## Output Formats

### JSON Format

The JSON format includes full unit data with translations:

```json
[
    {
        "id": 1,
        "type": "weight",
        "value": 1,
        "status": true,
        "translations": {
            "en": {
                "name": "Gram",
                "code": "g",
                "position": "right",
                "description": "Base unit of weight"
            },
            "fa": {
                "name": "گرم",
                "code": "گرم",
                "position": "right",
                "description": "واحد پایه وزن"
            }
        },
        "created_at": "2024-01-15T10:30:00+00:00",
        "updated_at": "2024-01-15T10:30:00+00:00"
    },
    {
        "id": 2,
        "type": "weight",
        "value": 1000,
        "status": true,
        "translations": {
            "en": {
                "name": "Kilogram",
                "code": "kg",
                "position": "right",
                "description": null
            },
            "fa": {
                "name": "کیلوگرم",
                "code": "کیلو",
                "position": "right",
                "description": null
            }
        },
        "created_at": "2024-01-15T10:30:00+00:00",
        "updated_at": "2024-01-15T10:30:00+00:00"
    }
]
```

### CSV Format

The CSV format provides a flat structure:

```csv
ID,Type,Value,Status,"Name (en)","Code (en)","Name (fa)","Code (fa)","Created At","Updated At"
1,weight,1,1,Gram,g,گرم,گرم,2024-01-15T10:30:00+00:00,2024-01-15T10:30:00+00:00
2,weight,1000,1,Kilogram,kg,کیلوگرم,کیلو,2024-01-15T10:30:00+00:00,2024-01-15T10:30:00+00:00
3,weight,1000000,1,"Metric Ton",t,تن,تن,2024-01-15T10:30:00+00:00,2024-01-15T10:30:00+00:00
```

**CSV Columns:**
- ID
- Type
- Value
- Status (1 = active, 0 = inactive)
- Name (en)
- Code (en)
- Name (fa)
- Code (fa)
- Created At
- Updated At

## Error Handling

### Invalid Format

If an invalid format is specified:

```bash
php artisan unit:export --format=xml
```

**Output:**
```
Error: Invalid format: xml. Valid formats: json, csv
```

### Invalid Type

If an invalid unit type is specified:

```bash
php artisan unit:export --type=invalid
```

**Output:**
```
Error: Invalid unit type: invalid. Available types: weight, length, currency, ...
```

### No Units Found

If no units match the criteria:

```bash
php artisan unit:export --type=crypto
```

**Output:**
```
Warning: No units found to export.
```

## Use Cases

### Database Backup

Create regular backups of unit data:

```bash
# Daily backup script
php artisan unit:export --output=/backups/units/units_$(date +%Y%m%d).json
```

### Environment Migration

Export from production and import to staging:

```bash
# On production
php artisan unit:export --output=units-export.json

# Transfer file to staging, then import using a custom seeder
```

### Documentation Generation

Export units for documentation purposes:

```bash
php artisan unit:export --format=csv --output=docs/available-units.csv
```

### Spreadsheet Analysis

Export to CSV for analysis in Excel or Google Sheets:

```bash
php artisan unit:export --format=csv --type=currency --output=currency-rates.csv
```

### Scheduled Exports

Add to Laravel scheduler for regular exports:

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    $schedule->command('unit:export --output=storage/backups/units.json')
        ->daily()
        ->at('02:00');
}
```

## Importing Exported Data

To import previously exported JSON data, create a custom seeder:

```php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use JobMetric\UnitConverter\Facades\UnitConverter;

class ImportUnitsSeeder extends Seeder
{
    public function run(): void
    {
        $json = File::get(storage_path('app/units-export.json'));
        $units = json_decode($json, true);

        foreach ($units as $unitData) {
            UnitConverter::store([
                'type' => $unitData['type'],
                'value' => $unitData['value'],
                'status' => $unitData['status'],
                'translation' => $unitData['translations'],
            ]);
        }
    }
}
```

Run the seeder:

```bash
php artisan db:seed --class=ImportUnitsSeeder
```

