---
sidebar_position: 1
sidebar_label: DataBuilder
---

import Link from "@docusaurus/Link";

# DataBuilder

The `DataBuilder` class provides a fluent API for building data attributes (data-*) for form fields. Data attributes are useful for JavaScript integration, AJAX handling, and custom functionality.

## Namespace

```php
JobMetric\CustomField\Attribute\Data\DataBuilder
```

## Overview

Data attributes allow you to attach custom data to HTML elements. The `DataBuilder` provides a fluent interface for adding data attributes to fields, making it easy to integrate with JavaScript frameworks and AJAX functionality.

## Available Methods

### Name

Set the name of the data attribute:

```php
$data->name('ajax-url')
```

### Value

Set the value of the data attribute:

```php
$data->value('/api/search')
```

### Build

Build the data attribute and add it to the collection:

```php
$data->build()
```

## Basic Usage

### Adding Data Attributes to Fields

```php
$field = CustomFieldBuilder::text()
    ->name('search')
    ->label('Search')
    ->data('ajax-url', '/api/search')
    ->data('min-length', 3)
    ->data('debounce', 300)
    ->build();
```

### Using DataBuilder Directly

```php
use JobMetric\CustomField\Attribute\Data\DataBuilder;

$dataBuilder = new DataBuilder();
$dataBuilder->name('product-id')->value(123)->build();
$dataBuilder->name('update-price')->value(true)->build();

$dataAttributes = $dataBuilder->get();
```

## Complete Examples

### AJAX Search Field

```php
$search = CustomFieldBuilder::text()
    ->name('search')
    ->label('Search Products')
    ->placeholder('Type to search...')
    ->data('ajax-url', route('api.products.search'))
    ->data('min-length', 3)
    ->data('debounce', 300)
    ->data('result-container', '#search-results')
    ->build();
```

### Dynamic Form Field

```php
$field = CustomFieldBuilder::select()
    ->name('category')
    ->label('Category')
    ->data('parent-field', 'department')
    ->data('load-options-url', route('api.categories.by-department'))
    ->data('dependent-field', 'subcategory')
    ->build();
```

### Image Upload with Preview

```php
$image = CustomFieldBuilder::image()
    ->name('avatar')
    ->label('Profile Picture')
    ->data('preview-container', '#avatar-preview')
    ->data('max-size', 2048)
    ->data('allowed-types', 'jpg,jpeg,png')
    ->data('crop-enabled', true)
    ->build();
```

## When to Use DataBuilder

Use the data builder when you need to:

- **JavaScript Integration**: Pass data to JavaScript for dynamic behavior
- **AJAX Handling**: Configure AJAX endpoints and parameters
- **Frontend Frameworks**: Integrate with React, Vue, or Angular components
- **Custom Functionality**: Add custom data for plugin or extension systems
- **Dynamic Behavior**: Enable conditional field behavior based on data attributes

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link>

