---
sidebar_position: 1
sidebar_label: CustomFieldBuilder
---

import Link from "@docusaurus/Link";

# CustomFieldBuilder

The `CustomFieldBuilder` class provides static methods to create field builders for all available field types. It uses Laravel's macroable trait to dynamically register field type methods.

## Namespace

```php
JobMetric\CustomField\CustomFieldBuilder
```

## Overview

The `CustomFieldBuilder` is the entry point for creating form fields. It provides static methods for each field type (text, select, radio, etc.) that return a field instance ready for configuration.

## Available Field Types

The builder supports the following field types:

- `text()` - Text input field
- `number()` - Number input field
- `email()` - Email input field
- `tel()` - Telephone input field
- `password()` - Password input field
- `hidden()` - Hidden input field
- `select()` - Select dropdown field
- `radio()` - Radio button field
- `checkbox()` - Checkbox field
- `date()` - Date input field
- `datetimeLocal()` - Date-time local input field
- `time()` - Time input field
- `week()` - Week input field
- `month()` - Month input field
- `color()` - Color picker field
- `range()` - Range slider field
- `image()` - Image upload field

## Basic Usage

### Create a Field

```php
use JobMetric\CustomField\CustomFieldBuilder;

// Text field
$text = CustomFieldBuilder::text()
    ->name('user[name]')
    ->label('Name')
    ->required()
    ->build();

// Select field
$select = CustomFieldBuilder::select()
    ->name('country')
    ->label('Country')
    ->build();
```

### Build and Render

```php
$field = CustomFieldBuilder::text()
    ->name('email')
    ->label('Email')
    ->required()
    ->placeholder('Enter your email')
    ->build();

$html = $field->toHtml();
// Returns: ['body' => '...', 'scripts' => [...], 'styles' => [...]]

echo $html['body'];
```

## Fluent Methods

All field types support fluent method chaining for configuration:

### Attributes

```php
$field = CustomFieldBuilder::text()
    ->name('username')
    ->id('user-name')
    ->class('form-control')
    ->placeholder('Enter username')
    ->value('john_doe')
    ->build();
```

### Properties

```php
$field = CustomFieldBuilder::text()
    ->required()
    ->disabled()
    ->readonly()
    ->autofocus()
    ->multiple()  // For select fields
    ->build();
```

### Options (Select, Radio, Checkbox)

```php
$select = CustomFieldBuilder::select()
    ->name('country')
    ->options(function ($opt) {
        $opt->label('Iran')->value('IR')->selected()->build();
        $opt->label('Germany')->value('DE')->build();
        $opt->label('USA')->value('US')->build();
    })
    ->build();
```

### Data Attributes

```php
$field = CustomFieldBuilder::text()
    ->name('search')
    ->data('ajax-url', '/api/search')
    ->data('min-length', 3)
    ->build();
```

## Complete Examples

### Registration Form

```php
use JobMetric\CustomField\CustomFieldBuilder;

$fields = [
    'name' => CustomFieldBuilder::text()
        ->name('name')
        ->label('Full Name')
        ->required()
        ->placeholder('Enter your full name')
        ->build(),
    
    'email' => CustomFieldBuilder::email()
        ->name('email')
        ->label('Email Address')
        ->required()
        ->placeholder('Enter your email')
        ->build(),
    
    'password' => CustomFieldBuilder::password()
        ->name('password')
        ->label('Password')
        ->required()
        ->build(),
    
    'country' => CustomFieldBuilder::select()
        ->name('country')
        ->label('Country')
        ->required()
        ->options(function ($opt) {
            $opt->label('Select Country')->value('')->build();
            $opt->label('Iran')->value('IR')->build();
            $opt->label('Germany')->value('DE')->build();
        })
        ->build(),
];

// Render all fields
foreach ($fields as $field) {
    $html = $field->toHtml();
    echo $html['body'];
}
```

### Dynamic Form Builder

```php
function buildField(array $config) {
    $builder = CustomFieldBuilder::{$config['type']}();
    
    $builder->name($config['name'])
        ->label($config['label'] ?? null);
    
    if ($config['required'] ?? false) {
        $builder->required();
    }
    
    if (isset($config['options'])) {
        $builder->options(function ($opt) use ($config) {
            foreach ($config['options'] as $option) {
                $opt->label($option['label'])
                    ->value($option['value']);
                
                if ($option['selected'] ?? false) {
                    $opt->selected();
                }
                
                $opt->build();
            }
        });
    }
    
    return $builder->build();
}
```

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/custom-field">CustomField</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Attributes</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Properties</Link>




