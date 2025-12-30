---
sidebar_position: 11
sidebar_label: Color Field
---

import Link from "@docusaurus/Link";

# Color Field

The `color` field provides a color picker input for selecting colors. It renders a native browser color picker that allows users to visually select colors.

## Namespace

```php
JobMetric\CustomField\CustomFields\Color\Color
```

## Overview

The color field renders as an HTML `<input type="color">` element. It provides a native browser color picker interface for selecting colors, making it perfect for theme customization, design tools, and any scenario requiring color selection.

## When to Use

**Use the color field when you need:**

- **Color selection** - Theme colors, brand colors, design colors
- **Color customization** - User theme preferences
- **Design tools** - Color pickers in design applications
- **Visual customization** - Background colors, text colors
- **Form color input** - Any scenario requiring color selection

**Example scenarios:**
- Theme color selection
- Brand color customization
- Background color selection
- Text color selection
- Design tool color pickers

## Builder Method

```php
CustomFieldBuilder::color()
```

## Available Methods

### Common Attributes

- `name(string $name, ?string $uniq = null)` - Set field name
- `id(?string $id)` - Set field ID
- `class(?string $class)` - Set CSS class
- `value(mixed $value)` - Set field value (hex color format: #RRGGBB)

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

$color = CustomFieldBuilder::color()
    ->name('favcolor')
    ->label('Favorite Color')
    ->info('Pick a color')
    ->required()
    ->build();

$result = $color->toHtml();
echo $result['body'];
```

## Advanced Examples

### Theme Color Selection

```php
$color = CustomFieldBuilder::color()
    ->name('primary_color')
    ->label('Primary Color')
    ->value('#007bff')
    ->required()
    ->info('Select your primary brand color')
    ->build();
```

### With Default Color

```php
$color = CustomFieldBuilder::color()
    ->name('background_color')
    ->label('Background Color')
    ->value('#ffffff')
    ->build();
```

### With Validation

```php
$color = CustomFieldBuilder::color()
    ->name('theme_color')
    ->label('Theme Color')
    ->required()
    ->validation(['required', 'regex:/^#[0-9A-Fa-f]{6}$/'])
    ->info('Must be a valid hex color (e.g., #FF5733)')
    ->build();
```

### Multiple Color Selection

```php
$primaryColor = CustomFieldBuilder::color()
    ->name('primary_color')
    ->label('Primary Color')
    ->value('#007bff')
    ->build();

$secondaryColor = CustomFieldBuilder::color()
    ->name('secondary_color')
    ->label('Secondary Color')
    ->value('#6c757d')
    ->build();
```

## Rendering

### HTML Output

```php
$result = $color->toHtml();

// $result contains:
// [
//     'body' => '<input type="color" ...>',
//     'scripts' => [],
//     'styles' => []
// ]

echo $result['body'];
```

### Array Output

```php
$array = $color->toArray();

// Returns complete field configuration
```

## HTML Output

The color field renders as:

```html
<input 
    type="color" 
    name="favcolor" 
    id="favcolor" 
    class="form-control" 
    value="#000000"
    required
/>
```

## Color Format

Colors should be provided in hexadecimal format:
- Value: `'#FF5733'` (red)
- Value: `'#007bff'` (blue)
- Value: `'#28a745'` (green)

The format is `#RRGGBB` where:
- RR = Red (00-FF)
- GG = Green (00-FF)
- BB = Blue (00-FF)

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Field Attributes</Link> - All available attributes
- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Field Properties</Link> - Field properties
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Builder API reference

