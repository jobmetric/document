---
sidebar_position: 5
sidebar_label: Number Field
---

import Link from "@docusaurus/Link";

# Number Field

The `number` field provides a numeric input for collecting numeric data like ages, quantities, prices, and any numeric values. It includes built-in validation and browser-native number input controls.

## Namespace

```php
JobMetric\CustomField\CustomFields\Number\Number
```

## Overview

The number field renders as an HTML `<input type="number">` element. It supports min/max values, step increments, and provides native browser validation for numeric input.

## When to Use

**Use the number field when you need:**

- **Numeric input** - Ages, quantities, prices, scores
- **Integer values** - Counts, IDs, quantities
- **Decimal values** - Prices, measurements, percentages
- **Range validation** - Values within specific ranges
- **Mathematical operations** - Any numeric calculation input

**Example scenarios:**
- Age input (18-100)
- Quantity selection (1-100)
- Price input ($0.01-$9999.99)
- Rating input (1-5)
- Percentage input (0-100)

## Builder Method

```php
CustomFieldBuilder::number()
```

## Available Methods

### Common Attributes

- `name(string $name, ?string $uniq = null)` - Set field name
- `id(?string $id)` - Set field ID
- `class(?string $class)` - Set CSS class
- `placeholder(?string $placeholder)` - Set placeholder text
- `value(mixed $value)` - Set field value

### Number-Specific Attributes

- `min(?int|float $min)` - Set minimum value
- `max(?int|float $max)` - Set maximum value
- `step(?int|float $step)` - Set step increment

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

$number = CustomFieldBuilder::number()
    ->name('age')
    ->label('Age')
    ->info('Enter your age')
    ->min(18)
    ->max(100)
    ->required()
    ->placeholder('Enter age')
    ->build();

$result = $number->toHtml();
echo $result['body'];
```

## Advanced Examples

### Quantity Input

```php
$number = CustomFieldBuilder::number()
    ->name('quantity')
    ->label('Quantity')
    ->min(1)
    ->max(100)
    ->step(1)
    ->value(1)
    ->required()
    ->build();
```

### Price Input

```php
$number = CustomFieldBuilder::number()
    ->name('price')
    ->label('Price')
    ->min(0.01)
    ->max(9999.99)
    ->step(0.01)
    ->placeholder('0.00')
    ->required()
    ->build();
```

### Rating Input

```php
$number = CustomFieldBuilder::number()
    ->name('rating')
    ->label('Rating')
    ->min(1)
    ->max(5)
    ->step(1)
    ->required()
    ->info('Rate from 1 to 5')
    ->build();
```

### Percentage Input

```php
$number = CustomFieldBuilder::number()
    ->name('discount')
    ->label('Discount Percentage')
    ->min(0)
    ->max(100)
    ->step(1)
    ->placeholder('0')
    ->info('Enter discount percentage (0-100)')
    ->build();
```

### With Validation

```php
$number = CustomFieldBuilder::number()
    ->name('quantity')
    ->label('Quantity')
    ->min(1)
    ->max(100)
    ->validation(['required', 'integer', 'min:1', 'max:100'])
    ->build();
```

## Rendering

### HTML Output

```php
$result = $number->toHtml();

// $result contains:
// [
//     'body' => '<input type="number" ...>',
//     'scripts' => [],
//     'styles' => []
// ]

echo $result['body'];
```

### Array Output

```php
$array = $number->toArray();

// Returns complete field configuration
```

## HTML Output

The number field renders as:

```html
<input 
    type="number" 
    name="age" 
    id="age" 
    class="form-control" 
    min="18" 
    max="100" 
    placeholder="Enter age" 
    required
/>
```

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Field Attributes</Link> - All available attributes
- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Field Properties</Link> - Field properties
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Builder API reference

