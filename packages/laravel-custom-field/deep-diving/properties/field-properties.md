---
sidebar_position: 1
sidebar_label: Field Properties
---

import Link from "@docusaurus/Link";

# Field Properties

Field properties control the behavior and state of form fields. Laravel Custom Field provides fluent methods for setting properties like `required`, `disabled`, `readonly`, `autofocus`, and `multiple`.

## Overview

Properties are boolean or state-based attributes that control how fields behave. Unlike HTML attributes, properties often don't have values—they're either present or absent. The package provides trait-based methods for setting properties through the fluent builder API.

## Available Properties

### Required

Mark the field as required:

```php
$field = CustomFieldBuilder::text()
    ->required()
    ->build();
```

### Disabled

Disable the field:

```php
$field = CustomFieldBuilder::text()
    ->disabled()
    ->build();
```

### Readonly

Make the field readonly:

```php
$field = CustomFieldBuilder::text()
    ->readonly()
    ->build();
```

### Autofocus

Set autofocus on the field:

```php
$field = CustomFieldBuilder::text()
    ->autofocus()
    ->build();
```

### Multiple

Enable multiple selection (for select fields):

```php
$field = CustomFieldBuilder::select()
    ->multiple()
    ->build();
```

## Complete Examples

### Registration Form with Properties

```php
use JobMetric\CustomField\CustomFieldBuilder;

$form = [
    'name' => CustomFieldBuilder::text()
        ->name('name')
        ->label('Full Name')
        ->required()
        ->autofocus()
        ->build(),
    
    'email' => CustomFieldBuilder::email()
        ->name('email')
        ->label('Email')
        ->required()
        ->build(),
    
    'country' => CustomFieldBuilder::select()
        ->name('country')
        ->label('Country')
        ->required()
        ->multiple()
        ->build(),
    
    'notes' => CustomFieldBuilder::text()
        ->name('notes')
        ->label('Notes')
        ->readonly()
        ->value('This field is readonly')
        ->build(),
];
```

### Conditional Properties

```php
function buildField(array $config) {
    $builder = CustomFieldBuilder::{$config['type']}();
    
    $builder->name($config['name'])
        ->label($config['label']);
    
    if ($config['required'] ?? false) {
        $builder->required();
    }
    
    if ($config['disabled'] ?? false) {
        $builder->disabled();
    }
    
    if ($config['readonly'] ?? false) {
        $builder->readonly();
    }
    
    if ($config['autofocus'] ?? false) {
        $builder->autofocus();
    }
    
    if ($config['multiple'] ?? false && $config['type'] === 'select') {
        $builder->multiple();
    }
    
    return $builder->build();
}
```

## When to Use Properties

Use properties when you need to:

- **Form Validation**: Mark fields as required for validation
- **User Experience**: Control field interactivity (disabled, readonly)
- **Accessibility**: Set autofocus for better keyboard navigation
- **Data Collection**: Enable multiple selection for select fields
- **Conditional Logic**: Dynamically set properties based on business rules

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Attributes</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link>

