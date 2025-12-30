---
sidebar_position: 12
sidebar_label: Range Field
---

import Link from "@docusaurus/Link";

# Range Field

The `range` field provides a slider input for selecting numeric values within a range. It's perfect for volume controls, rating sliders, and any scenario where users need to select a value from a continuous range.

## Namespace

```php
JobMetric\CustomField\CustomFields\Range\Range
```

## Overview

The range field renders as an HTML `<input type="range">` element. It provides a visual slider interface for selecting numeric values within a specified range. The package automatically adds the `form-range` class for Bootstrap styling.

## When to Use

**Use the range field when you need:**

- **Slider controls** - Volume, brightness, opacity
- **Range selection** - Price ranges, age ranges, quantity ranges
- **Rating sliders** - Star ratings, satisfaction ratings
- **Continuous values** - Any numeric value within a range
- **Visual input** - When a slider is more intuitive than a number input

**Example scenarios:**
- Volume control
- Price range filter
- Age range selection
- Rating slider (1-5 stars)
- Brightness/opacity control

## Builder Method

```php
CustomFieldBuilder::range()
```

## Available Methods

### Range-Specific Attributes

- `min(?int $min)` - Set minimum value
- `max(?int $max)` - Set maximum value
- `step(?int $step)` - Set step increment

### Common Attributes

- `name(string $name, ?string $uniq = null)` - Set field name
- `id(?string $id)` - Set field ID
- `class(?string $class)` - Set CSS class
- `value(mixed $value)` - Set field value (default: midpoint of min/max)

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

$range = CustomFieldBuilder::range()
    ->name('volume')
    ->label('Volume')
    ->min(0)
    ->max(100)
    ->build();

$result = $range->toHtml();
echo $result['body'];
```

## Advanced Examples

### Volume Control

```php
$range = CustomFieldBuilder::range()
    ->name('volume')
    ->label('Volume')
    ->min(0)
    ->max(100)
    ->step(1)
    ->value(50)
    ->info('Adjust volume from 0 to 100')
    ->build();
```

### Rating Slider

```php
$range = CustomFieldBuilder::range()
    ->name('rating')
    ->label('Rating')
    ->min(1)
    ->max(5)
    ->step(1)
    ->value(3)
    ->required()
    ->info('Rate from 1 to 5')
    ->build();
```

### Price Range Filter

```php
$range = CustomFieldBuilder::range()
    ->name('price_range')
    ->label('Price Range')
    ->min(0)
    ->max(1000)
    ->step(10)
    ->value(500)
    ->info('Select maximum price')
    ->build();
```

### With Validation

```php
$range = CustomFieldBuilder::range()
    ->name('quantity')
    ->label('Quantity')
    ->min(1)
    ->max(100)
    ->step(1)
    ->required()
    ->validation(['required', 'integer', 'min:1', 'max:100'])
    ->build();
```

### Brightness Control

```php
$range = CustomFieldBuilder::range()
    ->name('brightness')
    ->label('Brightness')
    ->min(0)
    ->max(100)
    ->step(1)
    ->value(75)
    ->info('Adjust brightness (0-100)')
    ->build();
```

## Rendering

### HTML Output

```php
$result = $range->toHtml();

// $result contains:
// [
//     'body' => '<input type="range" ...>',
//     'scripts' => [],
//     'styles' => []
// ]

echo $result['body'];
```

### Array Output

```php
$array = $range->toArray();

// Returns complete field configuration
```

## HTML Output

The range field renders as:

```html
<input 
    type="range" 
    name="volume" 
    id="volume" 
    class="form-range" 
    min="0" 
    max="100" 
    step="1" 
    value="50"
/>
```

## Displaying Current Value

To display the current value of a range slider, you can use JavaScript:

```html
<input type="range" name="volume" id="volume" min="0" max="100" />
<span id="volume-value">50</span>

<script>
document.getElementById('volume').addEventListener('input', function(e) {
    document.getElementById('volume-value').textContent = e.target.value;
});
</script>
```

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Field Attributes</Link> - All available attributes
- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Field Properties</Link> - Field properties
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Builder API reference

