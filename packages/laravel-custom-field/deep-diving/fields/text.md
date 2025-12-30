---
sidebar_position: 1
sidebar_label: Text Field
---

import Link from "@docusaurus/Link";

# Text Field

The `text` field is the most commonly used input field type in forms. It provides a single-line text input for collecting user data like names, emails, addresses, and any other text-based information.

## Namespace

```php
JobMetric\CustomField\CustomFields\Text\Text
```

## Overview

The text field renders as a standard HTML `<input type="text">` element. It supports all common attributes and properties, making it versatile for various form scenarios. The text field includes built-in JavaScript and CSS assets for enhanced functionality.

## When to Use

**Use the text field when you need:**

- **Single-line text input** - Names, titles, descriptions, search queries
- **Simple data collection** - User names, addresses, phone numbers
- **Form inputs** - Any scenario requiring basic text input
- **Search fields** - Search boxes and filters
- **Custom text fields** - Any text-based data entry

**Example scenarios:**
- User registration forms (name, username)
- Contact forms (subject, message)
- Search functionality
- Product forms (title, SKU)
- Profile editing (bio, location)

## Builder Method

```php
CustomFieldBuilder::text()
```

## Available Methods

### Common Attributes

All standard field attributes are available:

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

### Data Attributes

- `data(string $key, mixed $value)` - Add data attribute
- `dataArray(array $data)` - Add multiple data attributes

## Basic Example

```php
use JobMetric\CustomField\Facades\CustomFieldBuilder;

$text = CustomFieldBuilder::text()
    ->name('user[name]')
    ->label('Full Name')
    ->info('Enter your full name as it appears on your ID')
    ->required()
    ->placeholder('John Doe')
    ->class('form-control')
    ->build();

$result = $text->toHtml();
echo $result['body'];
```

## Advanced Examples

### With Validation

```php
$text = CustomFieldBuilder::text()
    ->name('username')
    ->label('Username')
    ->required()
    ->validation(['required', 'string', 'min:3', 'max:20', 'alpha_dash'])
    ->placeholder('Choose a username')
    ->info('3-20 characters, letters, numbers, dashes, and underscores only')
    ->build();
```

### With Data Attributes

```php
$text = CustomFieldBuilder::text()
    ->name('search')
    ->label('Search')
    ->placeholder('Search products...')
    ->data('action', 'search')
    ->data('target', 'products')
    ->dataArray([
        'autocomplete' => 'on',
        'minlength' => 2
    ])
    ->build();
```

### With Value Pre-filled

```php
$text = CustomFieldBuilder::text()
    ->name('email')
    ->label('Email Address')
    ->value($user->email ?? '')
    ->required()
    ->placeholder('your@email.com')
    ->build();
```

### Nested Name Attributes

```php
$text = CustomFieldBuilder::text()
    ->name('user[profile][first_name]')
    ->label('First Name')
    ->build();
```

## Rendering

### HTML Output

```php
$result = $text->toHtml();

// $result contains:
// [
//     'body' => '<input type="text" ...>',
//     'scripts' => ['/path/to/script.js'],
//     'styles' => ['/path/to/style.css']
// ]

echo $result['body'];
```

### Array Output

```php
$array = $text->toArray();

// Returns complete field configuration as array
// Useful for API responses or form builders
```

## Assets

The text field includes built-in assets:

- **Scripts**: `script.js` - Enhanced text field functionality
- **Styles**: `style.css` - Text field styling

These assets are automatically included when rendering the field.

## HTML Output

The text field renders as:

```html
<input 
    type="text" 
    name="user[name]" 
    id="user_name" 
    class="form-control" 
    placeholder="John Doe" 
    required 
    value=""
/>
```

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Learn about the builder API
- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Field Attributes</Link> - All available attributes
- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Field Properties</Link> - Field properties like required, disabled
- <Link to="/packages/laravel-custom-field/deep-diving/data/data-builder">Data Builder</Link> - Adding data attributes

