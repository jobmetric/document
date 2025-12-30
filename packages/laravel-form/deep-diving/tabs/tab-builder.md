---
sidebar_position: 1
sidebar_label: TabBuilder
---

import Link from "@docusaurus/Link";

# TabBuilder

The `TabBuilder` class provides a fluent API for building tabs within forms. Tabs organize form fields into logical sections, improving user experience for complex forms.

## Namespace

```php
JobMetric\Form\Tab\TabBuilder
```

## Overview

The `TabBuilder` allows you to create tabs that contain groups and custom fields. Each tab can have an ID, label, description, position, and selected state. Tabs provide a clean way to organize complex forms into manageable sections.

## Available Methods

### ID

Set the tab ID:

```php
$tab->id('personal');
```

**Parameters:**
- `$id` (`string`): The tab ID (will be prefixed with 'tab-')

**Returns:** `static` - Returns the builder for method chaining

**Note:** The ID will be automatically prefixed with 'tab-', so `id('personal')` becomes `tab-personal`.

### Label

Set the tab label:

```php
$tab->label('Personal Information');
```

**Parameters:**
- `$label` (`string`): The tab label

**Returns:** `static` - Returns the builder for method chaining

### Description

Set the tab description:

```php
$tab->description('Enter your personal information');
```

**Parameters:**
- `$description` (`string`): The tab description

**Returns:** `static` - Returns the builder for method chaining

### Position

Set the tab position:

```php
$tab->position('start');
```

**Parameters:**
- `$position` (`string`): The tab position. Must be one of:
  - `start` (default)
  - `end`

**Returns:** `static` - Returns the builder for method chaining

**Throws:** `InvalidArgumentException` - If an invalid position is provided

### Selected

Mark the tab as selected (active):

```php
$tab->selected();
```

**Returns:** `static` - Returns the builder for method chaining

### Group

Add a group to the tab:

```php
$tab->group(function ($group) {
    $group->label('Basic Info')
        ->customField(function ($field) {
            $field->text()
                ->name('name')
                ->label('Name')
                ->build();
        })
        ->build();
});
```

**Parameters:**
- `$callable` (`Closure|array`): A closure that receives a `GroupBuilder` instance, or an array of group configurations

**Returns:** `static` - Returns the builder for method chaining

**Throws:** `Throwable` - If group building fails

### Custom Field

Add a custom field directly to the tab (without a group):

```php
$tab->customField(function ($field) {
    $field->text()
        ->name('name')
        ->label('Name')
        ->build();
});
```

**Parameters:**
- `$callable` (`Closure|array`): A closure that receives a `CustomFieldBuilder` instance, or an array of field configurations

**Returns:** `static` - Returns the builder for method chaining

**Throws:** `Throwable` - If field building fails

### Build

Build the tab instance:

```php
$tabInstance = $tab->build();
```

**Returns:** `Tab` - The built tab instance

**Throws:** `InvalidArgumentException` - If tab ID or label is missing

## Complete Examples

### Simple Tab with Group

```php
$tab = TabBuilder::make()
    ->id('personal')
    ->label('Personal Information')
    ->description('Enter your personal details')
    ->selected()
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
```

### Tab with Multiple Groups

```php
$tab = TabBuilder::make()
    ->id('product')
    ->label('Product Information')
    ->group(function ($group) {
        $group->label('Basic Details')
            ->customField(function ($field) {
                $field->text()
                    ->name('name')
                    ->label('Product Name')
                    ->required()
                    ->build();
            })
            ->build();
    })
    ->group(function ($group) {
        $group->label('Pricing')
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
```

### Tab with Direct Fields

```php
$tab = TabBuilder::make()
    ->id('settings')
    ->label('Settings')
    ->customField(function ($field) {
        $field->checkbox()
            ->name('notifications')
            ->label('Enable Notifications')
            ->build();
    })
    ->customField(function ($field) {
        $field->select()
            ->name('theme')
            ->label('Theme')
            ->options(function ($opt) {
                $opt->label('Light')->value('light')->build();
                $opt->label('Dark')->value('dark')->build();
            })
            ->build();
    })
    ->build();
```

## When to Use TabBuilder

Use `TabBuilder` when you need to:

- **Organize Complex Forms**: Break large forms into manageable sections
- **Improve User Experience**: Create tabbed interfaces for better navigation
- **Logical Grouping**: Separate form sections by purpose or category
- **Multi-Step Forms**: Build wizard-style forms with step-by-step navigation
- **Conditional Display**: Show/hide tabs based on user permissions or data

## Related Documentation

- <Link to="/packages/laravel-form/deep-diving/tabs/tab">Tab</Link>
- <Link to="/packages/laravel-form/deep-diving/groups/group-builder">GroupBuilder</Link>
- <Link to="/packages/laravel-form/deep-diving/form-builder">FormBuilder</Link>

