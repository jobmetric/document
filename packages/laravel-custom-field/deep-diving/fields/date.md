---
sidebar_position: 8
sidebar_label: Date Field
---

import Link from "@docusaurus/Link";

# Date Field

The `date` field provides a date picker input for selecting dates. It renders a date-picker wrapper that provides a user-friendly interface for date selection.

## Namespace

```php
JobMetric\CustomField\CustomFields\Date\Date
```

## Overview

The date field renders as an HTML `<input type="date">` element with enhanced date-picker functionality. It provides native browser date pickers and can be enhanced with JavaScript date picker libraries.

## When to Use

**Use the date field when you need:**

- **Date selection** - Birth dates, event dates, deadlines
- **Date input** - Any scenario requiring date entry
- **Date filtering** - Date range filters
- **Calendar selection** - Appointment scheduling
- **Form dates** - Registration dates, expiration dates

**Example scenarios:**
- Birth date in registration forms
- Event date selection
- Deadline setting
- Appointment scheduling
- Date range filters

## Builder Method

```php
CustomFieldBuilder::date()
```

## Available Methods

### Common Attributes

- `name(string $name, ?string $uniq = null)` - Set field name
- `id(?string $id)` - Set field ID
- `class(?string $class)` - Set CSS class
- `placeholder(?string $placeholder)` - Set placeholder text
- `value(mixed $value)` - Set field value (date format: YYYY-MM-DD)

### Date-Specific Attributes

- `min(?string $min)` - Set minimum date (YYYY-MM-DD)
- `max(?string $max)` - Set maximum date (YYYY-MM-DD)

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

$date = CustomFieldBuilder::date()
    ->name('birthdate')
    ->label('Birth Date')
    ->info('Select your birth date')
    ->required()
    ->build();

$result = $date->toHtml();
echo $result['body'];
```

## Advanced Examples

### With Date Range

```php
$date = CustomFieldBuilder::date()
    ->name('event_date')
    ->label('Event Date')
    ->min(date('Y-m-d')) // Today or later
    ->max(date('Y-m-d', strtotime('+1 year'))) // Up to 1 year from now
    ->required()
    ->build();
```

### Pre-filled Date

```php
$date = CustomFieldBuilder::date()
    ->name('start_date')
    ->label('Start Date')
    ->value($model->start_date ?? date('Y-m-d'))
    ->required()
    ->build();
```

### With Validation

```php
$date = CustomFieldBuilder::date()
    ->name('birthdate')
    ->label('Birth Date')
    ->required()
    ->validation(['required', 'date', 'before:today'])
    ->info('Must be a valid date in the past')
    ->build();
```

### Date of Birth

```php
$date = CustomFieldBuilder::date()
    ->name('date_of_birth')
    ->label('Date of Birth')
    ->max(date('Y-m-d', strtotime('-18 years'))) // Must be 18+ years old
    ->required()
    ->info('You must be at least 18 years old')
    ->build();
```

## Rendering

### HTML Output

```php
$result = $date->toHtml();

// $result contains:
// [
//     'body' => '<input type="date" ...>',
//     'scripts' => [],
//     'styles' => []
// ]

echo $result['body'];
```

### Array Output

```php
$array = $date->toArray();

// Returns complete field configuration
```

## HTML Output

The date field renders as:

```html
<input 
    type="date" 
    name="birthdate" 
    id="birthdate" 
    class="form-control" 
    required
/>
```

With date picker wrapper:

```html
<div class="date-picker-wrapper">
    <input type="date" name="birthdate" id="birthdate" />
</div>
```

## Date Format

Dates should be provided in `YYYY-MM-DD` format:
- Value: `'2024-01-15'`
- Min: `'2024-01-01'`
- Max: `'2024-12-31'`

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Field Attributes</Link> - All available attributes
- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Field Properties</Link> - Field properties
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Builder API reference

