---
sidebar_position: 14
sidebar_label: Week Field
---

import Link from "@docusaurus/Link";

# Week Field

The `week` field provides a week picker input for selecting weeks. It's perfect for selecting work weeks, reporting weeks, and any scenario requiring week selection.

## Namespace

```php
JobMetric\CustomField\CustomFields\Week\Week
```

## Overview

The week field renders as an HTML `<input type="week">` element. It provides a native browser week picker that allows users to select a week (year and week number).

## When to Use

**Use the week field when you need:**

- **Week selection** - Work weeks, reporting weeks
- **Weekly data** - Weekly reports, weekly schedules
- **Period selection** - Weekly periods, weekly planning
- **Week-based filtering** - Filtering by week
- **Form week input** - Any scenario requiring week selection

**Example scenarios:**
- Work week selection
- Weekly report generation
- Weekly schedule planning
- Weekly time tracking
- Weekly performance reports

## Builder Method

```php
CustomFieldBuilder::week()
```

## Available Methods

### Common Attributes

- `name(string $name, ?string $uniq = null)` - Set field name
- `id(?string $id)` - Set field ID
- `class(?string $class)` - Set CSS class
- `placeholder(?string $placeholder)` - Set placeholder text
- `value(mixed $value)` - Set field value (format: YYYY-Www)

### Week-Specific Attributes

- `min(?string $min)` - Set minimum week (YYYY-Www)
- `max(?string $max)` - Set maximum week (YYYY-Www)

### Common Properties

- `required()` - Make field required
- `disabled()` - Disable the field
- `readonly()` - Make field readonly
- `autofocus()` - Auto-focus on page load

### Field Labels

- `label(?string $label)` - Set field label
- `info(?string $info)` - Set help/info text

### Validation

- `validation(array|string $rules)` - Set validation rules

## Basic Example

```php
use JobMetric\CustomField\Facades\CustomFieldBuilder;

$week = CustomFieldBuilder::week()
    ->name('week_of_year')
    ->label('Week')
    ->info('Select the week')
    ->required()
    ->build();

$result = $week->toHtml();
echo $result['body'];
```

## Advanced Examples

### With Week Range

```php
$week = CustomFieldBuilder::week()
    ->name('report_week')
    ->label('Report Week')
    ->min(date('Y-\WW', strtotime('-12 weeks'))) // Last 12 weeks
    ->max(date('Y-\WW')) // Current week
    ->required()
    ->build();
```

### Pre-filled Week

```php
$week = CustomFieldBuilder::week()
    ->name('work_week')
    ->label('Work Week')
    ->value(date('Y-\WW')) // Current week
    ->required()
    ->build();
```

### With Validation

```php
$week = CustomFieldBuilder::week()
    ->name('week')
    ->label('Week')
    ->required()
    ->validation(['required', 'date_format:Y-\WW'])
    ->info('Select a week in YYYY-Www format')
    ->build();
```

### Work Week Selection

```php
$week = CustomFieldBuilder::week()
    ->name('work_week')
    ->label('Work Week')
    ->min(date('Y-\WW', strtotime('-4 weeks'))) // Last 4 weeks
    ->max(date('Y-\WW', strtotime('+4 weeks'))) // Next 4 weeks
    ->value(date('Y-\WW'))
    ->required()
    ->build();
```

## Rendering

### HTML Output

```php
$result = $week->toHtml();

// $result contains:
// [
//     'body' => '<input type="week" ...>',
//     'scripts' => [],
//     'styles' => []
// ]

echo $result['body'];
```

### Array Output

```php
$array = $week->toArray();

// Returns complete field configuration
```

## HTML Output

The week field renders as:

```html
<input 
    type="week" 
    name="week_of_year" 
    id="week_of_year" 
    class="form-control" 
    required
/>
```

## Week Format

Weeks should be provided in `YYYY-Www` format:
- Value: `'2024-W01'` (Week 1 of 2024)
- Min: `'2024-W01'`
- Max: `'2024-W52'`

The format consists of:
- YYYY = Year (4 digits)
- W = Literal "W"
- ww = Week number (01-53)

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Field Attributes</Link> - All available attributes
- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Field Properties</Link> - Field properties
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Builder API reference

