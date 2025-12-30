---
sidebar_position: 2
sidebar_label: CustomField
---

import Link from "@docusaurus/Link";

# CustomField

The `CustomField` class represents a configured form field instance. It contains all field configuration (attributes, properties, options, data, etc.) and provides methods to render HTML and export to arrays.

## Namespace

```php
JobMetric\CustomField\CustomField
```

## Overview

The `CustomField` class is the result of building a field with `CustomFieldBuilder`. It contains all the field configuration and provides methods to:

- Render HTML output
- Export to arrays (for APIs)
- Access field properties
- Get asset paths (scripts/styles)

## Properties

### Type

```php
public string $type;
```

The field type (e.g., 'text', 'select', 'radio').

### Attributes

```php
public array $attributes = [];
```

HTML attributes (id, name, class, placeholder, etc.).

### Properties

```php
public array $properties = [];
```

Field properties (required, disabled, readonly, etc.).

### Data

```php
public array $data = [];
```

Data attributes (data-* attributes).

### Label

```php
public ?string $label;
```

Field label text.

### Info

```php
public ?string $info;
```

Field help/info text.

### Validation

```php
public array|string|null $validation = null;
```

Validation rules.

### Options

```php
public array $options = [];
```

Field options (for select, radio, checkbox).

### Images

```php
public array $images = [];
```

Image configurations (for image fields).

## Available Methods

### To HTML

Render the field as HTML:

```php
$html = $field->toHtml();
// Returns: [
//     'body' => '<input ...>',
//     'scripts' => ['/path/to/script.js'],
//     'styles' => ['/path/to/style.css']
// ]

echo $html['body'];
```

**Returns:** `array` - Array with 'body', 'scripts', and 'styles' keys

### To Array

Export field configuration to array:

```php
$array = $field->toArray();
// Returns: [
//     'type' => 'text',
//     'name' => 'email',
//     'label' => 'Email',
//     'attributes' => [...],
//     'properties' => [...],
//     ...
// ]
```

**Returns:** `array` - Field configuration as array

### Get Scripts

Get JavaScript asset paths:

```php
$scripts = $field->getScripts();
// => ['/path/to/script.js']
```

**Returns:** `array` - Array of script paths

### Get Styles

Get CSS asset paths:

```php
$styles = $field->getStyles();
// => ['/path/to/style.css']
```

**Returns:** `array` - Array of style paths

## Complete Examples

### Render Field with Assets

```php
$field = CustomFieldBuilder::text()
    ->name('search')
    ->label('Search')
    ->build();

$html = $field->toHtml();

// Include in blade template
@push('styles')
    @foreach($html['styles'] as $style)
        <link rel="stylesheet" href="{{ $style }}">
    @endforeach
@endpush

@push('scripts')
    @foreach($html['scripts'] as $script)
        <script src="{{ $script }}"></script>
    @endforeach
@endpush

{!! $html['body'] !!}
```

### Export for API

```php
$field = CustomFieldBuilder::select()
    ->name('country')
    ->label('Country')
    ->options(function ($opt) {
        $opt->label('Iran')->value('IR')->build();
    })
    ->build();

return response()->json([
    'field' => $field->toArray(),
]);
```

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link>




