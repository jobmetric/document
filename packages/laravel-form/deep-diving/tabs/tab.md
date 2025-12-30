---
sidebar_position: 2
sidebar_label: Tab
---

import Link from "@docusaurus/Link";

# Tab

The `Tab` class represents a built tab instance within a form. It contains tab configuration (ID, label, description, position, selected state) and provides methods to render HTML and export to arrays.

## Namespace

```php
JobMetric\Form\Tab\Tab
```

## Overview

The `Tab` class is the result of building a tab with `TabBuilder`. It contains all the tab configuration and provides methods to:

- Render tab link HTML
- Render tab content HTML
- Export to arrays (for APIs)
- Get all custom fields within the tab

## Properties

### ID

```php
public string $id;
```

The tab ID (prefixed with 'tab-').

### Label

```php
public string $label;
```

The tab label text.

### Description

```php
public string|null $description;
```

The tab description text.

### Position

```php
public string $position;
```

The tab position (start or end).

### Selected

```php
public bool $selected;
```

Whether the tab is selected (active).

### Fields

```php
public array $fields = [];
```

Array of field instances (groups or custom fields).

## Available Methods

### To HTML Link

Render the tab link as HTML:

```php
$linkHtml = $tab->toHtmlLink();
```

**Returns:** `string` - HTML string for the tab link

**Throws:** `Throwable` - If rendering fails

### To HTML Data

Render the tab content as HTML:

```php
$contentHtml = $tab->toHtmlData();
// Or with values
$contentHtml = $tab->toHtmlData(['name' => 'John']);
```

**Parameters:**
- `$values` (`array`): Optional array of field values to pre-fill

**Returns:** `string` - HTML string for the tab content

**Throws:** `Throwable` - If rendering fails

### To Array

Export tab configuration to array:

```php
$array = $tab->toArray();
// Returns: [
//     'id' => 'tab-personal',
//     'label' => 'Personal Information',
//     'description' => '...',
//     'position' => 'start',
//     'selected' => true,
//     'fields' => [...]
// ]
```

**Returns:** `array` - Tab configuration as array

### Get Custom Fields

Get all custom fields within the tab (from groups and direct fields):

```php
$fields = $tab->getCustomFields();
```

**Returns:** `CustomField[]` - Array of custom field instances

## When to Use Tab

Use `Tab` when you need to:

- **Access Tab Data**: Get tab configuration and fields
- **Render Tab Content**: Generate HTML for tab links and content
- **Export Tab Structure**: Serialize tabs for API responses
- **Extract Fields**: Get all custom fields within a tab

## Related Documentation

- <Link to="/packages/laravel-form/deep-diving/tabs/tab-builder">TabBuilder</Link>
- <Link to="/packages/laravel-form/deep-diving/groups/group">Group</Link>
- <Link to="/packages/laravel-form/deep-diving/form">Form</Link>

