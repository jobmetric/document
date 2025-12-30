---
sidebar_position: 2
sidebar_label: Group
---

import Link from "@docusaurus/Link";

# Group

The `Group` class represents a built group instance within a tab. It contains group configuration (label, description) and provides methods to render HTML and export to arrays.

## Namespace

```php
JobMetric\Form\Group\Group
```

## Overview

The `Group` class is the result of building a group with `GroupBuilder`. It contains all the group configuration and provides methods to:

- Render HTML output
- Export to arrays (for APIs)
- Access group properties

## Properties

### Label

```php
public string $label;
```

The group label text.

### Description

```php
public string|null $description;
```

The group description text.

### Custom Fields

```php
public array $customFields = [];
```

Array of custom field instances within the group.

## Available Methods

### To HTML

Render the group as HTML:

```php
$html = $group->toHtml();
// Or with values
$html = $group->toHtml(['name' => 'John']);
```

**Parameters:**
- `$values` (`array`): Optional array of field values to pre-fill

**Returns:** `string` - HTML string

**Throws:** `Throwable` - If rendering fails

### To Array

Export group configuration to array:

```php
$array = $group->toArray();
// Returns: [
//     'label' => 'Basic Information',
//     'description' => '...',
//     'customFields' => [...]
// ]
```

**Returns:** `array` - Group configuration as array

**Throws:** `Throwable` - If serialization fails

## When to Use Group

Use `Group` when you need to:

- **Access Group Data**: Get group configuration and fields
- **Render Group Content**: Generate HTML for group sections
- **Export Group Structure**: Serialize groups for API responses
- **Extract Fields**: Get all custom fields within a group

## Related Documentation

- <Link to="/packages/laravel-form/deep-diving/groups/group-builder">GroupBuilder</Link>
- <Link to="/packages/laravel-form/deep-diving/tabs/tab">Tab</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field">CustomField</Link>

