---
sidebar_position: 15
sidebar_label: Tel Field
---

import Link from "@docusaurus/Link";

# Tel Field

The `tel` field provides a telephone number input optimized for phone number entry. It's perfect for contact forms, user profiles, and any scenario requiring phone number input.

## Namespace

```php
JobMetric\CustomField\CustomFields\Tel\Tel
```

## Overview

The tel field renders as an HTML `<input type="tel">` element. While it looks like a text field, it's optimized for telephone number input and can trigger numeric keyboards on mobile devices.

## When to Use

**Use the tel field when you need:**

- **Phone number input** - Contact forms, user profiles
- **Telephone entry** - Any scenario requiring phone numbers
- **Mobile optimization** - Mobile-friendly phone input
- **Contact information** - Contact details forms
- **Form phone input** - Any form requiring phone numbers

**Example scenarios:**
- Contact forms
- User registration (phone number)
- Profile editing (phone number)
- Business contact forms
- Support request forms

## Builder Method

```php
CustomFieldBuilder::tel()
```

## Available Methods

### Common Attributes

- `name(string $name, ?string $uniq = null)` - Set field name
- `id(?string $id)` - Set field ID
- `class(?string $class)` - Set CSS class
- `placeholder(?string $placeholder)` - Set placeholder text
- `value(mixed $value)` - Set field value

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

$tel = CustomFieldBuilder::tel()
    ->name('phone')
    ->label('Phone')
    ->info('Enter your phone number')
    ->required()
    ->placeholder('+1 234 567 8900')
    ->build();

$result = $tel->toHtml();
echo $result['body'];
```

## Advanced Examples

### With Validation

```php
$tel = CustomFieldBuilder::tel()
    ->name('phone')
    ->label('Phone Number')
    ->required()
    ->validation(['required', 'regex:/^\+?[1-9]\d{1,14}$/'])
    ->placeholder('+1234567890')
    ->info('Enter phone number with country code')
    ->build();
```

### International Format

```php
$tel = CustomFieldBuilder::tel()
    ->name('phone')
    ->label('Phone Number')
    ->placeholder('+1 (234) 567-8900')
    ->required()
    ->info('Include country code (e.g., +1 for US)')
    ->build();
```

### With Pattern

```php
$tel = CustomFieldBuilder::tel()
    ->name('phone')
    ->label('Phone')
    ->placeholder('(123) 456-7890')
    ->pattern('[0-9]{3}-[0-9]{3}-[0-9]{4}')
    ->required()
    ->build();
```

### Multiple Phone Numbers

```php
$mobile = CustomFieldBuilder::tel()
    ->name('mobile')
    ->label('Mobile Phone')
    ->required()
    ->build();

$home = CustomFieldBuilder::tel()
    ->name('home_phone')
    ->label('Home Phone')
    ->build();
```

## Rendering

### HTML Output

```php
$result = $tel->toHtml();

// $result contains:
// [
//     'body' => '<input type="tel" ...>',
//     'scripts' => [],
//     'styles' => []
// ]

echo $result['body'];
```

### Array Output

```php
$array = $tel->toArray();

// Returns complete field configuration
```

## HTML Output

The tel field renders as:

```html
<input 
    type="tel" 
    name="phone" 
    id="phone" 
    class="form-control" 
    placeholder="+1 234 567 8900" 
    required
/>
```

## Mobile Optimization

On mobile devices, the tel field automatically triggers the numeric keyboard, making it easier for users to enter phone numbers.

## Phone Number Formats

Common phone number formats:
- International: `+1 234 567 8900`
- US Format: `(234) 567-8900`
- Simple: `1234567890`
- With spaces: `123 456 7890`

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Field Attributes</Link> - All available attributes
- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Field Properties</Link> - Field properties
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Builder API reference

