---
sidebar_position: 1
sidebar_label: IOForm
---

import Link from "@docusaurus/Link";

# IOForm

The `IOForm` class is a lightweight helper that normalizes payloads according to form definitions. It ensures that only form-defined keys are kept in data arrays, making it perfect for sanitizing input data and preparing it for storage or rendering.

## Namespace

```php
JobMetric\Form\Support\IOForm
```

## Overview

`IOForm` provides static methods to normalize data based on form definitions. It filters out any keys that are not defined in the form, ensuring data integrity and preventing unwanted data from being processed.

## Available Methods

### Normalize

Core normalization method that keeps only form-defined keys:

```php
IOForm::normalize(FormBuilder|Form $form, array $data, bool $includeHidden = true): array
```

**Parameters:**
- `$form` (`FormBuilder|Form`): The form builder or form instance
- `$data` (`array`): The data array to normalize
- `$includeHidden` (`bool`): Whether to include hidden fields (default: `true`)

**Returns:** `array` - Normalized data array containing only form-defined keys

### For Store

Normalize data for storing (e.g., in JSON columns):

```php
IOForm::forStore(FormBuilder|Form $form, array $data, bool $includeHidden = true): array
```

**Parameters:**
- `$form` (`FormBuilder|Form`): The form builder or form instance
- `$data` (`array`): The data array to normalize
- `$includeHidden` (`bool`): Whether to include hidden fields (default: `true`)

**Returns:** `array` - Normalized data array ready for storage

**Note:** This is an alias for `normalize()` method.

### To HTML

Render HTML form using normalized values:

```php
IOForm::toHtml(FormBuilder|Form $form, array $values = [], bool $includeHidden = true): string
```

**Parameters:**
- `$form` (`FormBuilder|Form`): The form builder or form instance
- `$values` (`array`): Optional array of values to pre-fill
- `$includeHidden` (`bool`): Whether to include hidden fields (default: `true`)

**Returns:** `string` - HTML string

### To Array

Get normalized values as plain array:

```php
IOForm::toArray(FormBuilder|Form $form, array $values = [], bool $includeHidden = true): array
```

**Parameters:**
- `$form` (`FormBuilder|Form`): The form builder or form instance
- `$values` (`array`): Optional array of values to normalize
- `$includeHidden` (`bool`): Whether to include hidden fields (default: `true`)

**Returns:** `array` - Normalized data array

## Basic Usage

### Normalize Input Data

```php
use JobMetric\Form\FormBuilder;
use JobMetric\Form\Support\IOForm;

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
                    ->customField(function ($field) {
                        $field->email()
                            ->name('email')
                            ->label('Email')
                            ->build();
                    })
                    ->build();
            })
            ->build();
    })
    ->build();

// Raw input data (may contain extra keys)
$input = [
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'malicious_field' => 'hack attempt', // This will be filtered out
    'another_field' => 'unwanted data',   // This will be filtered out
];

// Normalize data (only keeps form-defined keys)
$normalized = IOForm::normalize($form, $input);
// Returns: ['name' => 'John Doe', 'email' => 'john@example.com']
```

### Store Normalized Data

```php
$form = FormBuilder::make()
    // ... form definition
    ->build();

$input = request()->all();

// Normalize for storage
$normalized = IOForm::forStore($form, $input);

// Store in database
$user = User::create($normalized);
```

### Render Form with Normalized Values

```php
$form = FormBuilder::make()
    // ... form definition
    ->build();

$values = [
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'extra_field' => 'will be filtered',
];

// Render with normalized values
$html = IOForm::toHtml($form, $values);
```

## Complete Examples

### Sanitizing Request Data

```php
use JobMetric\Form\FormBuilder;
use JobMetric\Form\Support\IOForm;

class UserController extends Controller
{
    public function store(Request $request)
    {
        $form = $this->getUserForm();
        
        // Normalize input data (remove unwanted keys)
        $normalized = IOForm::normalize($form, $request->all());
        
        // Create user with only form-defined fields
        $user = User::create($normalized);
        
        return redirect()->route('users.show', $user);
    }

    protected function getUserForm(): Form
    {
        return FormBuilder::make()
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
                            ->customField(function ($field) {
                                $field->email()
                                    ->name('email')
                                    ->label('Email')
                                    ->build();
                            })
                            ->build();
                    })
                    ->build();
            })
            ->build();
    }
}
```

### Storing in JSON Column

```php
$form = FormBuilder::make()
    // ... form definition
    ->build();

$input = request()->all();

// Normalize for JSON storage
$normalized = IOForm::forStore($form, $input);

// Store in JSON column
$model->form_data = $normalized;
$model->save();
```

### Excluding Hidden Fields

```php
$form = FormBuilder::make()
    ->hiddenCustomField(function ($field) {
        $field->hidden()
            ->name('user_id')
            ->value(auth()->id())
            ->build();
    })
    // ... other fields
    ->build();

$input = request()->all();

// Normalize excluding hidden fields
$normalized = IOForm::normalize($form, $input, false);
```

## When to Use IOForm

Use `IOForm` when you need to:

- **Data Sanitization**: Filter out unwanted keys from input data
- **Data Integrity**: Ensure only form-defined fields are processed
- **Security**: Prevent malicious or unwanted data from being stored
- **Consistency**: Maintain consistent data structure based on form definitions
- **Storage**: Prepare data for storage in JSON columns or other formats

## Related Documentation

- <Link to="/packages/laravel-form/deep-diving/form">Form</Link>
- <Link to="/packages/laravel-form/deep-diving/form-builder">FormBuilder</Link>
- <Link to="/packages/laravel-form/deep-diving/requests/form-builder-request">FormBuilderRequest</Link>

