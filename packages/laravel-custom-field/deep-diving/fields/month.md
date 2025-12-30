---
sidebar_position: 13
sidebar_label: Month Field
---

import Link from "@docusaurus/Link";

# Month Field

The `month` field provides a month picker input for selecting months and years. It's perfect for selecting billing months, reporting periods, and any scenario requiring month selection.

## Namespace

```php
JobMetric\CustomField\CustomFields\Month\Month
```

## Overview

The month field renders as an HTML `<input type="month">` element. It provides a native browser month picker that allows users to select a month and year combination.

## When to Use

**Use the month field when you need:**

- **Month selection** - Billing months, reporting periods
- **Monthly data** - Monthly reports, monthly subscriptions
- **Period selection** - Financial periods, academic periods
- **Month-based filtering** - Filtering by month
- **Form month input** - Any scenario requiring month selection

**Example scenarios:**
- Billing month selection
- Monthly report generation
- Subscription billing period
- Academic month selection
- Financial period selection

## Builder Method

```php
CustomFieldBuilder::month()
```

## Available Methods

### Common Attributes

- `name(string $name, ?string $uniq = null)` - Set field name
- `id(?string $id)` - Set field ID
- `class(?string $class)` - Set CSS class
- `placeholder(?string $placeholder)` - Set placeholder text
- `value(mixed $value)` - Set field value (format: YYYY-MM)

### Month-Specific Attributes

- `min(?string $min)` - Set minimum month (YYYY-MM)
- `max(?string $max)` - Set maximum month (YYYY-MM)

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

$month = CustomFieldBuilder::month()
    ->name('salary_month')
    ->label('Salary Month')
    ->info('Select the month for salary calculation')
    ->required()
    ->build();

$result = $month->toHtml();
echo $result['body'];
```

## Advanced Examples

### With Month Range

```php
$month = CustomFieldBuilder::month()
    ->name('report_month')
    ->label('Report Month')
    ->min(date('Y-m', strtotime('-12 months'))) // Last 12 months
    ->max(date('Y-m')) // Current month
    ->required()
    ->build();
```

### Pre-filled Month

```php
$month = CustomFieldBuilder::month()
    ->name('billing_month')
    ->label('Billing Month')
    ->value(date('Y-m')) // Current month
    ->required()
    ->build();
```

### With Validation

```php
$month = CustomFieldBuilder::month()
    ->name('period')
    ->label('Period')
    ->required()
    ->validation(['required', 'date_format:Y-m'])
    ->info('Select a month in YYYY-MM format')
    ->build();
```

### Billing Period

```php
$month = CustomFieldBuilder::month()
    ->name('billing_period')
    ->label('Billing Period')
    ->min(date('Y-m', strtotime('-6 months'))) // Last 6 months
    ->max(date('Y-m', strtotime('+1 month'))) // Next month
    ->value(date('Y-m'))
    ->required()
    ->build();
```

## Rendering

### HTML Output

```php
$result = $month->toHtml();

// $result contains:
// [
//     'body' => '<input type="month" ...>',
//     'scripts' => [],
//     'styles' => []
// ]

echo $result['body'];
```

### Array Output

```php
$array = $month->toArray();

// Returns complete field configuration
```

## HTML Output

The month field renders as:

```html
<input 
    type="month" 
    name="salary_month" 
    id="salary_month" 
    class="form-control" 
    required
/>
```

## Month Format

Months should be provided in `YYYY-MM` format:
- Value: `'2024-01'` (January 2024)
- Min: `'2024-01'`
- Max: `'2024-12'`

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Field Attributes</Link> - All available attributes
- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Field Properties</Link> - Field properties
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Builder API reference

