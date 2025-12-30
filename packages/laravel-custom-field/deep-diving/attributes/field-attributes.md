---
sidebar_position: 1
sidebar_label: Field Attributes
---

import Link from "@docusaurus/Link";

# Field Attributes

Field attributes are HTML attributes that can be set on form fields. Laravel Custom Field provides fluent methods for setting common attributes like `name`, `id`, `class`, `placeholder`, `value`, and more.

## Overview

Attributes are HTML attributes that control the behavior and appearance of form fields. The package provides trait-based methods for setting attributes, making it easy to configure fields through the fluent builder API.

## Available Attributes

### Name

Set the field name attribute:

```php
$field = CustomFieldBuilder::text()
    ->name('user[email]')
    ->build();
```

### ID

Set the field ID attribute:

```php
$field = CustomFieldBuilder::text()
    ->id('user-email')
    ->build();
```

### Class

Set the field class attribute:

```php
$field = CustomFieldBuilder::text()
    ->class('form-control')
    ->build();
```

### Placeholder

Set the field placeholder attribute:

```php
$field = CustomFieldBuilder::text()
    ->placeholder('Enter your email')
    ->build();
```

### Value

Set the field value attribute:

```php
$field = CustomFieldBuilder::text()
    ->value('john@example.com')
    ->build();
```

### Pattern

Set the field pattern attribute (for validation):

```php
$field = CustomFieldBuilder::text()
    ->pattern('[0-9]{4}')
    ->build();
```

### Min/Max

Set min and max attributes (for number, date, range fields):

```php
$field = CustomFieldBuilder::number()
    ->min(1)
    ->max(100)
    ->build();
```

### Alt

Set the alt attribute (for image fields):

```php
$field = CustomFieldBuilder::image()
    ->alt('Profile picture')
    ->build();
```

### Src

Set the src attribute (for image fields):

```php
$field = CustomFieldBuilder::image()
    ->src('/images/default.jpg')
    ->build();
```

### Width/Height

Set width and height attributes (for image fields):

```php
$field = CustomFieldBuilder::image()
    ->width(200)
    ->height(200)
    ->build();
```

### Disable AutoComplete

Disable autocomplete for the field:

```php
$field = CustomFieldBuilder::text()
    ->disableAutoComplete()
    ->build();
```

## Complete Examples

### Form with Multiple Attributes

```php
use JobMetric\CustomField\CustomFieldBuilder;

$form = [
    'email' => CustomFieldBuilder::email()
        ->name('email')
        ->id('user-email')
        ->class('form-control form-control-lg')
        ->placeholder('Enter your email address')
        ->value(old('email'))
        ->disableAutoComplete()
        ->build(),
    
    'age' => CustomFieldBuilder::number()
        ->name('age')
        ->id('user-age')
        ->class('form-control')
        ->min(18)
        ->max(100)
        ->placeholder('Enter your age')
        ->build(),
];
```

## When to Use Attributes

Use attributes when you need to:

- **Set HTML Attributes**: Configure standard HTML attributes on fields
- **Styling**: Apply CSS classes for styling
- **JavaScript Integration**: Set IDs and data attributes for JavaScript selectors
- **Validation**: Use pattern, min, max for client-side validation hints
- **Accessibility**: Set alt text, labels, and other accessibility attributes

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Properties</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/data/data-builder">Data Attributes</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link>

