---
sidebar_position: 10
sidebar_label: DateTime Local Field
---

import Link from "@docusaurus/Link";

# DateTime Local Field

The `dateTimeLocal` field provides a combined date and time picker input for selecting both date and time in a single field. It's perfect for appointment scheduling, event planning, and any scenario requiring both date and time.

## Namespace

```php
JobMetric\CustomField\CustomFields\DateTimeLocal\DateTimeLocal
```

## Overview

The dateTimeLocal field renders as an HTML `<input type="datetime-local">` element. It combines date and time selection into a single input, providing a convenient way to select both date and time values.

## When to Use

**Use the dateTimeLocal field when you need:**

- **Date and time selection** - Appointments, events, deadlines
- **Scheduling** - Meeting scheduling, booking systems
- **Event planning** - Event dates and times
- **Timestamp input** - Any scenario requiring both date and time
- **Form datetime** - Registration datetime, expiration datetime

**Example scenarios:**
- Appointment scheduling
- Event date and time
- Deadline setting (date + time)
- Booking systems
- Meeting scheduling

## Builder Method

```php
CustomFieldBuilder::dateTimeLocal()
```

## Available Methods

### Common Attributes

- `name(string $name, ?string $uniq = null)` - Set field name
- `id(?string $id)` - Set field ID
- `class(?string $class)` - Set CSS class
- `placeholder(?string $placeholder)` - Set placeholder text
- `value(mixed $value)` - Set field value (format: YYYY-MM-DDTHH:MM)

### DateTime-Specific Attributes

- `min(?string $min)` - Set minimum datetime (YYYY-MM-DDTHH:MM)
- `max(?string $max)` - Set maximum datetime (YYYY-MM-DDTHH:MM)

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

$datetime = CustomFieldBuilder::dateTimeLocal()
    ->name('appointment')
    ->label('Appointment Date & Time')
    ->info('Select appointment date and time')
    ->required()
    ->build();

$result = $datetime->toHtml();
echo $result['body'];
```

## Advanced Examples

### With DateTime Range

```php
$datetime = CustomFieldBuilder::dateTimeLocal()
    ->name('event_datetime')
    ->label('Event Date & Time')
    ->min(date('Y-m-d\TH:i')) // Now or later
    ->max(date('Y-m-d\TH:i', strtotime('+1 year'))) // Up to 1 year from now
    ->required()
    ->build();
```

### Pre-filled DateTime

```php
$datetime = CustomFieldBuilder::dateTimeLocal()
    ->name('start_datetime')
    ->label('Start Date & Time')
    ->value($model->start_datetime ?? date('Y-m-d\TH:i'))
    ->required()
    ->build();
```

### With Validation

```php
$datetime = CustomFieldBuilder::dateTimeLocal()
    ->name('appointment')
    ->label('Appointment')
    ->required()
    ->validation(['required', 'date', 'after:now'])
    ->info('Must be a future date and time')
    ->build();
```

### Appointment Scheduling

```php
$datetime = CustomFieldBuilder::dateTimeLocal()
    ->name('appointment_datetime')
    ->label('Appointment Date & Time')
    ->min(date('Y-m-d\T09:00')) // Today at 9 AM
    ->max(date('Y-m-d\T17:00', strtotime('+30 days'))) // 30 days from now at 5 PM
    ->required()
    ->info('Select a date and time within the next 30 days')
    ->build();
```

## Rendering

### HTML Output

```php
$result = $datetime->toHtml();

// $result contains:
// [
//     'body' => '<input type="datetime-local" ...>',
//     'scripts' => [],
//     'styles' => []
// ]

echo $result['body'];
```

### Array Output

```php
$array = $datetime->toArray();

// Returns complete field configuration
```

## HTML Output

The dateTimeLocal field renders as:

```html
<input 
    type="datetime-local" 
    name="appointment" 
    id="appointment" 
    class="form-control" 
    required
/>
```

## DateTime Format

DateTimes should be provided in `YYYY-MM-DDTHH:MM` format:
- Value: `'2024-01-15T14:30'` (January 15, 2024 at 2:30 PM)
- Min: `'2024-01-01T00:00'`
- Max: `'2024-12-31T23:59'`

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Field Attributes</Link> - All available attributes
- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Field Properties</Link> - Field properties
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Builder API reference

