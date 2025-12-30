---
sidebar_position: 2
sidebar_label: Select Field
---

import Link from "@docusaurus/Link";

# Select Field

The `select` field provides a dropdown menu for selecting one or multiple options from a list. It's perfect for choices like countries, categories, statuses, and any scenario where users need to pick from predefined options.

## Namespace

```php
JobMetric\CustomField\CustomFields\Select\Select
```

## Overview

The select field renders as an HTML `<select>` element with `<option>` children. It supports single and multiple selection modes, making it versatile for various selection scenarios. Options can be defined using closures for complex scenarios or arrays for simple cases.

## When to Use

**Use the select field when you need:**

- **Single choice selection** - Countries, categories, statuses
- **Multiple choice selection** - Tags, permissions, features
- **Predefined options** - Any scenario with a fixed list of choices
- **Hierarchical data** - Categories with subcategories
- **Form dropdowns** - Any dropdown selection in forms

**Example scenarios:**
- Country/region selection
- Category selection (products, posts)
- Status selection (active, inactive, pending)
- Multi-select tags
- Permission selection
- Language selection

## Builder Method

```php
CustomFieldBuilder::select()
```

## Available Methods

### Common Attributes

- `name(string $name, ?string $uniq = null)` - Set field name
- `id(?string $id)` - Set field ID
- `class(?string $class)` - Set CSS class
- `placeholder(?string $placeholder)` - Set placeholder text (for first option)
- `value(mixed $value)` - Set selected value(s)

### Common Properties

- `required()` - Make field required
- `disabled()` - Disable the field
- `readonly()` - Make field readonly
- `autofocus()` - Auto-focus on page load
- `multiple()` - Enable multiple selection

### Field Labels

- `label(?string $label)` - Set field label
- `info(?string $info)` - Set help/info text

### Options

- `options(Closure|array $options)` - Define select options

### Validation

- `validation(array|string $rules)` - Set validation rules

## Basic Example

```php
use JobMetric\CustomField\Facades\CustomFieldBuilder;

$select = CustomFieldBuilder::select()
    ->name('country')
    ->label('Country')
    ->info('Select your country')
    ->required()
    ->placeholder('Choose a country')
    ->options(function ($opt) {
        $opt->label('Iran')->value('IR')->selected()->build();
        $opt->label('Germany')->value('DE')->build();
        $opt->label('United States')->value('US')->build();
    })
    ->build();

$result = $select->toHtml();
echo $result['body'];
```

## Advanced Examples

### Array Options

```php
$select = CustomFieldBuilder::select()
    ->name('language')
    ->label('Language')
    ->options([
        ['label' => 'English', 'value' => 'en', 'selected' => true],
        ['label' => 'Persian', 'value' => 'fa'],
        ['label' => 'German', 'value' => 'de'],
    ])
    ->build();
```

### Multiple Selection

```php
$select = CustomFieldBuilder::select()
    ->name('tags')
    ->label('Tags')
    ->info('Select one or more tags')
    ->multiple()
    ->options(function ($opt) {
        $opt->label('PHP')->value('php')->build();
        $opt->label('Laravel')->value('laravel')->selected()->build();
        $opt->label('JavaScript')->value('js')->build();
        $opt->label('Vue.js')->value('vue')->build();
    })
    ->build();
```

### With Validation

```php
$select = CustomFieldBuilder::select()
    ->name('status')
    ->label('Status')
    ->required()
    ->validation(['required', 'in:active,inactive,pending'])
    ->options([
        ['label' => 'Active', 'value' => 'active'],
        ['label' => 'Inactive', 'value' => 'inactive'],
        ['label' => 'Pending', 'value' => 'pending'],
    ])
    ->build();
```

### Dynamic Options from Database

```php
$categories = Category::all();

$select = CustomFieldBuilder::select()
    ->name('category_id')
    ->label('Category')
    ->options(function ($opt) use ($categories) {
        foreach ($categories as $category) {
            $opt->label($category->name)
                ->value($category->id)
                ->build();
        }
    })
    ->build();
```

### With Pre-selected Value

```php
$select = CustomFieldBuilder::select()
    ->name('country')
    ->label('Country')
    ->value('IR') // Pre-select Iran
    ->options(function ($opt) {
        $opt->label('Iran')->value('IR')->build();
        $opt->label('Germany')->value('DE')->build();
    })
    ->build();
```

## Rendering

### HTML Output

```php
$result = $select->toHtml();

// $result contains:
// [
//     'body' => '<select>...</select>',
//     'scripts' => [],
//     'styles' => []
// ]

echo $result['body'];
```

### Array Output

```php
$array = $select->toArray();

// Returns complete field configuration including options
```

## HTML Output

The select field renders as:

```html
<select name="country" id="country" class="form-select" required>
    <option value="">Choose a country</option>
    <option value="IR" selected>Iran</option>
    <option value="DE">Germany</option>
    <option value="US">United States</option>
</select>
```

For multiple selection:

```html
<select name="tags[]" id="tags" class="form-select" multiple>
    <option value="php">PHP</option>
    <option value="laravel" selected>Laravel</option>
    <option value="js">JavaScript</option>
</select>
```

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/options/option-builder">Option Builder</Link> - Learn how to build options
- <Link to="/packages/laravel-custom-field/deep-diving/options/option">Option</Link> - Understanding option structure
- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Field Properties</Link> - Multiple selection and other properties
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Builder API reference

