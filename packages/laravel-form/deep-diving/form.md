---
sidebar_position: 2
sidebar_label: Form
---

import Link from "@docusaurus/Link";

# Form

The `Form` class represents a built form instance. It contains all form configuration (attributes, tabs, groups, fields) and provides methods to render HTML and export to arrays.

## Namespace

```php
JobMetric\Form\Form
```

## Overview

The `Form` class is the result of building a form with `FormBuilder`. It contains all the form configuration and provides methods to:

- Render HTML output
- Export to arrays (for APIs)
- Access form properties
- Get all custom fields

## Properties

### Action

```php
public ?string $action;
```

The form action URL.

### Method

```php
public string $method;
```

The HTTP method (GET, POST, PUT, PATCH, DELETE).

### Name

```php
public string $name;
```

The form name attribute.

### Enctype

```php
public string $enctype;
```

The form enctype (application/x-www-form-urlencoded, multipart/form-data, text/plain).

### Autocomplete

```php
public bool $autocomplete;
```

Whether autocomplete is enabled.

### Target

```php
public string $target;
```

The form target (_self, _blank, _parent, _top).

### Novalidate

```php
public bool $novalidate;
```

Whether HTML5 validation is disabled.

### Class

```php
public string $class;
```

The form CSS class.

### ID

```php
public string $id;
```

The form ID attribute.

### CSRF

```php
public bool $csrf;
```

Whether CSRF token is included.

### Hidden Custom Fields

```php
public array $hiddenCustomField;
```

Array of hidden custom field instances.

### Tabs

```php
public array $tabs = [];
```

Array of tab instances.

## Available Methods

### Get All Custom Fields

Get all custom fields from the form:

```php
$fields = $form->getAllCustomFields(true);
```

**Parameters:**
- `$includeHidden` (`bool`): Whether to include hidden fields (default: `true`)

**Returns:** `CustomField[]` - Array of custom field instances

### To HTML

Render the form as HTML:

```php
$html = $form->toHtml();
// Or with values
$html = $form->toHtml(['name' => 'John', 'email' => 'john@example.com']);
```

**Parameters:**
- `$values` (`array`): Optional array of field values to pre-fill

**Returns:** `string` - HTML string

**Throws:** `Throwable` - If rendering fails

### To Array

Export form configuration to array:

```php
$array = $form->toArray();
// Returns: [
//     'action' => '/users',
//     'method' => 'POST',
//     'name' => 'user-form',
//     'tabs' => [...],
//     ...
// ]
```

**Returns:** `array` - Form configuration as array

**Throws:** `Throwable` - If serialization fails

## Complete Examples

### Render Form with Values

```php
$form = FormBuilder::make()
    ->action('/users')
    ->method('POST')
    ->tab(function ($tab) {
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
    })
    ->build();

// Render with pre-filled values
$html = $form->toHtml([
    'name' => 'John Doe',
    'email' => 'john@example.com',
]);
```

### Export for API

```php
$form = FormBuilder::make()
    ->action('/products')
    ->method('POST')
    ->tab(function ($tab) {
        $tab->id('details')
            ->label('Product Details')
            ->build();
    })
    ->build();

return response()->json([
    'form' => $form->toArray(),
]);
```

### Get All Fields

```php
$form = FormBuilder::make()
    ->action('/users')
    ->method('POST')
    ->hiddenCustomField(function ($field) {
        $field->hidden()
            ->name('user_id')
            ->value(123)
            ->build();
    })
    ->tab(function ($tab) {
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
    })
    ->build();

// Get all fields including hidden
$allFields = $form->getAllCustomFields(true);

// Get only visible fields
$visibleFields = $form->getAllCustomFields(false);
```

## When to Use Form

Use `Form` when you need to:

- **Render HTML**: Convert form definitions to HTML for display
- **Export to Arrays**: Serialize forms for API responses or storage
- **Access Form Data**: Get all custom fields, tabs, and groups
- **Pre-fill Values**: Render forms with existing data
- **Form Validation**: Extract field names and validation rules

## Related Documentation

- <Link to="/packages/laravel-form/deep-diving/form-builder">FormBuilder</Link>
- <Link to="/packages/laravel-form/deep-diving/tabs/tab">Tab</Link>
- <Link to="/packages/laravel-form/deep-diving/groups/group">Group</Link>
- <Link to="/packages/laravel-form/deep-diving/support/io-form">IOForm</Link>

