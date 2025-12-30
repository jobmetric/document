---
sidebar_position: 9
sidebar_label: Time Field
---

import Link from "@docusaurus/Link";

# Time Field

The `time` field provides a time picker input for selecting times. It renders a time-picker wrapper that provides a user-friendly interface for time selection.

## Namespace

```php
JobMetric\CustomField\CustomFields\Time\Time
```

## Overview

The time field renders as an HTML `<input type="time">` element with enhanced time-picker functionality. It provides native browser time pickers and can be enhanced with JavaScript time picker libraries.

## When to Use

**Use the time field when you need:**

- **Time selection** - Meeting times, appointment times, opening hours
- **Time input** - Any scenario requiring time entry
- **Time filtering** - Time range filters
- **Schedule management** - Work schedules, event times
- **Form times** - Registration times, deadline times

**Example scenarios:**
- Meeting time selection
- Appointment scheduling
- Opening hours
- Work schedule
- Event time selection

## Builder Method

```php
CustomFieldBuilder::time()
```

## Available Methods

### Common Attributes

- `name(string $name, ?string $uniq = null)` - Set field name
- `id(?string $id)` - Set field ID
- `class(?string $class)` - Set CSS class
- `placeholder(?string $placeholder)` - Set placeholder text
- `value(mixed $value)` - Set field value (time format: HH:MM)

### Time-Specific Attributes

- `min(?string $min)` - Set minimum time (HH:MM)
- `max(?string $max)` - Set maximum time (HH:MM)

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

$time = CustomFieldBuilder::time()
    ->name('meeting_time')
    ->label('Meeting Time')
    ->info('Select meeting time')
    ->required()
    ->build();

$result = $time->toHtml();
echo $result['body'];
```

## Advanced Examples

### With Time Range

```php
$time = CustomFieldBuilder::time()
    ->name('appointment_time')
    ->label('Appointment Time')
    ->min('09:00') // Business hours start
    ->max('17:00') // Business hours end
    ->required()
    ->info('Available between 9:00 AM and 5:00 PM')
    ->build();
```

### Pre-filled Time

```php
$time = CustomFieldBuilder::time()
    ->name('start_time')
    ->label('Start Time')
    ->value($model->start_time ?? '09:00')
    ->required()
    ->build();
```

### With Validation

```php
$time = CustomFieldBuilder::time()
    ->name('meeting_time')
    ->label('Meeting Time')
    ->required()
    ->validation(['required', 'date_format:H:i'])
    ->build();
```

### Opening Hours

```php
$openingTime = CustomFieldBuilder::time()
    ->name('opening_time')
    ->label('Opening Time')
    ->value('09:00')
    ->required()
    ->build();

$closingTime = CustomFieldBuilder::time()
    ->name('closing_time')
    ->label('Closing Time')
    ->value('17:00')
    ->required()
    ->build();
```

## Rendering

### HTML Output

```php
$result = $time->toHtml();

// $result contains:
// [
//     'body' => '<input type="time" ...>',
//     'scripts' => [],
//     'styles' => []
// ]

echo $result['body'];
```

### Array Output

```php
$array = $time->toArray();

// Returns complete field configuration
```

## HTML Output

The time field renders as:

```html
<input 
    type="time" 
    name="meeting_time" 
    id="meeting_time" 
    class="form-control" 
    required
/>
```

With time picker wrapper:

```html
<div class="time-picker-wrapper">
    <input type="time" name="meeting_time" id="meeting_time" />
</div>
```

## Time Format

Times should be provided in `HH:MM` format (24-hour):
- Value: `'14:30'` (2:30 PM)
- Min: `'09:00'` (9:00 AM)
- Max: `'17:00'` (5:00 PM)

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Field Attributes</Link> - All available attributes
- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Field Properties</Link> - Field properties
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Builder API reference

