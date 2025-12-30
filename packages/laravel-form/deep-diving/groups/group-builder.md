---
sidebar_position: 1
sidebar_label: GroupBuilder
---

import Link from "@docusaurus/Link";

# GroupBuilder

The `GroupBuilder` class provides a fluent API for building groups within tabs. Groups organize related fields together with labels and descriptions, making forms easier to understand and navigate.

## Namespace

```php
JobMetric\Form\Group\GroupBuilder
```

## Overview

The `GroupBuilder` allows you to create groups that contain custom fields. Each group can have a label and description, providing visual separation and logical organization for form fields.

## Available Methods

### Label

Set the group label:

```php
$group->label('Basic Information');
```

**Parameters:**
- `$label` (`string`): The group label

**Returns:** `static` - Returns the builder for method chaining

**Required:** Yes - Label is required when building

### Description

Set the group description:

```php
$group->description('Enter your basic information');
```

**Parameters:**
- `$description` (`string`): The group description

**Returns:** `static` - Returns the builder for method chaining

### Custom Field

Add a custom field to the group:

```php
$group->customField(function ($field) {
    $field->text()
        ->name('name')
        ->label('Name')
        ->required()
        ->build();
});
```

**Parameters:**
- `$callable` (`Closure`): A closure that receives a `CustomFieldBuilder` instance

**Returns:** `static` - Returns the builder for method chaining

### Build

Build the group instance:

```php
$groupInstance = $group->build();
```

**Returns:** `Group` - The built group instance

**Throws:** `InvalidArgumentException` - If group label is missing

## Complete Examples

### Simple Group

```php
$group = GroupBuilder::make()
    ->label('Basic Information')
    ->description('Enter your basic details')
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
```

### Group with Multiple Fields

```php
$group = GroupBuilder::make()
    ->label('Contact Information')
    ->customField(function ($field) {
        $field->tel()
            ->name('phone')
            ->label('Phone Number')
            ->build();
    })
    ->customField(function ($field) {
        $field->text()
            ->name('address')
            ->label('Address')
            ->build();
    })
    ->customField(function ($field) {
        $field->select()
            ->name('country')
            ->label('Country')
            ->options(function ($opt) {
                $opt->label('Iran')->value('IR')->build();
                $opt->label('Germany')->value('DE')->build();
            })
            ->build();
    })
    ->build();
```

## When to Use GroupBuilder

Use `GroupBuilder` when you need to:

- **Organize Related Fields**: Group fields that belong together logically
- **Visual Separation**: Create visual sections within tabs
- **Add Context**: Provide labels and descriptions for field groups
- **Improve UX**: Make forms easier to understand and navigate
- **Maintain Structure**: Keep form organization consistent

## Related Documentation

- <Link to="/packages/laravel-form/deep-diving/groups/group">Group</Link>
- <Link to="/packages/laravel-form/deep-diving/tabs/tab-builder">TabBuilder</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link>

