---
sidebar_position: 1
sidebar_label: FormBuilder
---

import Link from "@docusaurus/Link";

# FormBuilder

The `FormBuilder` class provides a fluent API for building forms programmatically. It allows you to set form attributes, add tabs, groups, and custom fields through a clean, chainable interface.

## Namespace

```php
JobMetric\Form\FormBuilder
```

## Overview

The `FormBuilder` is the entry point for creating forms. It provides methods to configure form attributes (action, method, enctype, etc.), add tabs with groups and fields, and build a `Form` instance ready for rendering or serialization.

## Static Methods

### Make

Create a new form builder instance:

```php
$builder = FormBuilder::make();
```

**Returns:** `FormBuilder` - A new form builder instance

## Form Attributes

### Action

Set the form action URL:

```php
$builder->action('/users');
```

**Parameters:**
- `$action` (`string`): The form action URL

**Returns:** `static` - Returns the builder for method chaining

### Method

Set the form method:

```php
$builder->method('POST');
```

**Parameters:**
- `$method` (`string`): The HTTP method (GET, POST, PUT, PATCH, DELETE)

**Returns:** `static` - Returns the builder for method chaining

**Default:** `POST`

### Name

Set the form name attribute:

```php
$builder->name('user-form');
```

**Parameters:**
- `$name` (`string`): The form name

**Returns:** `static` - Returns the builder for method chaining

**Default:** `form`

### Enctype

Set the form enctype:

```php
$builder->enctype('multipart/form-data');
```

**Parameters:**
- `$enctype` (`string`): The form enctype. Must be one of:
  - `application/x-www-form-urlencoded` (default)
  - `multipart/form-data`
  - `text/plain`

**Returns:** `static` - Returns the builder for method chaining

**Throws:** `InvalidArgumentException` - If an invalid enctype is provided

### Autocomplete

Enable autocomplete for the form:

```php
$builder->autocomplete();
```

**Returns:** `static` - Returns the builder for method chaining

### Target

Set the form target:

```php
$builder->target('_blank');
```

**Parameters:**
- `$target` (`string`): The form target. Must be one of:
  - `_self` (default)
  - `_blank`
  - `_parent`
  - `_top`

**Returns:** `static` - Returns the builder for method chaining

**Throws:** `InvalidArgumentException` - If an invalid target is provided

### Novalidate

Disable HTML5 validation:

```php
$builder->novalidate();
```

**Returns:** `static` - Returns the builder for method chaining

### Class

Set the form CSS class:

```php
$builder->class('my-custom-form');
```

**Parameters:**
- `$class` (`string`): The CSS class

**Returns:** `static` - Returns the builder for method chaining

**Default:** `form d-flex flex-column flex-lg-row`

### ID

Set the form ID attribute:

```php
$builder->id('user-form-id');
```

**Parameters:**
- `$id` (`string`): The form ID

**Returns:** `static` - Returns the builder for method chaining

**Default:** `form`

### Remove CSRF

Disable CSRF token:

```php
$builder->removeCsrf();
```

**Returns:** `static` - Returns the builder for method chaining

**Default:** CSRF is enabled

## Adding Content

### Hidden Custom Fields

Add hidden fields to the form:

```php
$builder->hiddenCustomField(function ($field) {
    $field->hidden()
        ->name('user_id')
        ->value(123)
        ->build();
});
```

**Parameters:**
- `$callable` (`Closure|array`): A closure that receives a `CustomFieldBuilder` instance, or an array of field configurations

**Returns:** `static` - Returns the builder for method chaining

### Tabs

Add tabs to the form:

```php
$builder->tab(function ($tab) {
    $tab->id('personal')
        ->label('Personal Information')
        ->group(function ($group) {
            $group->label('Basic Info')
                ->customField(function ($field) {
                    $field->text()
                        ->name('name')
                        ->label('Name')
                        ->build();
                })
                ->build();
        })
        ->build();
});
```

**Parameters:**
- `$callable` (`Closure|array`): A closure that receives a `TabBuilder` instance, or an array of tab configurations

**Returns:** `static` - Returns the builder for method chaining

**Throws:** `Throwable` - If tab building fails

## Building

### Build

Build the form instance:

```php
$form = $builder->build();
```

**Returns:** `Form` - The built form instance

## Utility Methods

### GetAll Custom Fields

Get all custom fields from the form (including hidden fields and fields in tabs):

```php
$fields = $builder->getAllCustomFields(true);
```

**Parameters:**
- `$includeHidden` (`bool`): Whether to include hidden fields (default: `true`)

**Returns:** `CustomField[]` - Array of custom field instances

## Complete Examples

### Simple Form

```php
use JobMetric\Form\FormBuilder;

$form = FormBuilder::make()
    ->action('/users')
    ->method('POST')
    ->name('user-form')
    ->tab(function ($tab) {
        $tab->id('personal')
            ->label('Personal Information')
            ->group(function ($group) {
                $group->label('Basic Info')
                    ->customField(function ($field) {
                        $field->text()
                            ->name('name')
                            ->label('Full Name')
                            ->required()
                            ->build();
                    })
                    ->customField(function ($field) {
                        $field->email()
                            ->name('email')
                            ->label('Email Address')
                            ->required()
                            ->build();
                    })
                    ->build();
            })
            ->build();
    })
    ->build();
```

### Complex Form with Multiple Tabs

```php
$form = FormBuilder::make()
    ->action('/products')
    ->method('POST')
    ->enctype('multipart/form-data')
    ->name('product-form')
    ->tab(function ($tab) {
        $tab->id('basic')
            ->label('Basic Information')
            ->selected()
            ->group(function ($group) {
                $group->label('Product Details')
                    ->customField(function ($field) {
                        $field->text()
                            ->name('name')
                            ->label('Product Name')
                            ->required()
                            ->build();
                    })
                    ->customField(function ($field) {
                        $field->number()
                            ->name('price')
                            ->label('Price')
                            ->required()
                            ->min(0)
                            ->build();
                    })
                    ->build();
            })
            ->build();
    })
    ->tab(function ($tab) {
        $tab->id('media')
            ->label('Media')
            ->group(function ($group) {
                $group->label('Images')
                    ->customField(function ($field) {
                        $field->image()
                            ->name('main_image')
                            ->label('Main Image')
                            ->build();
                    })
                    ->build();
            })
            ->build();
    })
    ->build();
```

### Form with Hidden Fields

```php
$form = FormBuilder::make()
    ->action('/orders')
    ->method('POST')
    ->hiddenCustomField(function ($field) {
        $field->hidden()
            ->name('user_id')
            ->value(auth()->id())
            ->build();
    })
    ->hiddenCustomField(function ($field) {
        $field->hidden()
            ->name('order_type')
            ->value('online')
            ->build();
    })
    ->tab(function ($tab) {
        $tab->id('details')
            ->label('Order Details')
            ->group(function ($group) {
                $group->label('Information')
                    ->customField(function ($field) {
                        $field->text()
                            ->name('notes')
                            ->label('Notes')
                            ->build();
                    })
                    ->build();
            })
            ->build();
    })
    ->build();
```

## When to Use FormBuilder

Use `FormBuilder` when you need to:

- **Programmatic Form Creation**: Build forms programmatically instead of writing HTML manually
- **Complex Form Structures**: Create forms with tabs, groups, and multiple field types
- **Consistent Form Structure**: Ensure all forms follow the same structure and styling
- **Dynamic Forms**: Build forms based on configuration, database data, or user input
- **API Integration**: Export form definitions for frontend frameworks or API responses
- **Maintainable Code**: Keep form logic organized and easy to maintain

## Related Documentation

- <Link to="/packages/laravel-form/deep-diving/form">Form</Link>
- <Link to="/packages/laravel-form/deep-diving/tabs/tab-builder">TabBuilder</Link>
- <Link to="/packages/laravel-form/deep-diving/groups/group-builder">GroupBuilder</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link>

