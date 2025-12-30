---
sidebar_position: 1
sidebar_label: FormBuilderRequest
---

import Link from "@docusaurus/Link";

# FormBuilderRequest

The `FormBuilderRequest` class is a generic `FormRequest` that automatically builds validation rules and attributes from a `FormBuilder` or `Form` definition using `CustomField` instances. It allows you to drive validation directly from your form builder configuration instead of manually writing rules in each request.

## Namespace

```php
JobMetric\Form\Http\Requests\FormBuilderRequest
```

## Overview

`FormBuilderRequest` eliminates the need to manually write validation rules by automatically generating them from form field configurations. When a form field has validation rules defined, they are automatically included in the request validation.

## Constructor

```php
public function __construct(FormBuilder $formBuilder, bool $includeHiddenFields = true)
```

**Parameters:**
- `$formBuilder` (`FormBuilder`): The form builder instance used to define the form
- `$includeHiddenFields` (`bool`): Whether to include hidden fields in validation (default: `true`)

## Available Methods

### Set Form Builder

Set or update the form builder instance:

```php
$request->setFormBuilder($formBuilder);
```

**Parameters:**
- `$formBuilder` (`FormBuilder`): The form builder instance

**Returns:** `static` - Returns the request instance for method chaining

### Include Hidden Fields

Configure whether hidden fields should be included in validation:

```php
$request->includeHiddenFields(false);
```

**Parameters:**
- `$include` (`bool`): Whether to include hidden fields (default: `true`)

**Returns:** `static` - Returns the request instance for method chaining

### Rules

Automatically generates validation rules from form field configurations:

```php
public function rules(): array
{
    // Automatically generated from form fields
}
```

**Returns:** `array` - Validation rules array

**Note:** This method is automatically called by Laravel during request validation.

### Attributes

Automatically generates attribute names from form field labels:

```php
public function attributes(): array
{
    // Automatically generated from form field labels
}
```

**Returns:** `array` - Attribute names array

**Note:** This method is automatically called by Laravel during request validation.

## Basic Usage

### In Controller

```php
use JobMetric\Form\FormBuilder;
use JobMetric\Form\Http\Requests\FormBuilderRequest;

class UserController extends Controller
{
    public function store(FormBuilderRequest $request)
    {
        // Validation is automatically handled
        $validated = $request->validated();
        
        // Create user
        User::create($validated);
    }
}
```

### Setting Form Builder

```php
use JobMetric\Form\FormBuilder;
use JobMetric\Form\Http\Requests\FormBuilderRequest;

class UserController extends Controller
{
    public function create()
    {
        $formBuilder = FormBuilder::make()
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
                                    ->label('Full Name')
                                    ->validation('required|string|max:255')
                                    ->build();
                            })
                            ->customField(function ($field) {
                                $field->email()
                                    ->name('email')
                                    ->label('Email')
                                    ->validation('required|email|unique:users,email')
                                    ->build();
                            })
                            ->build();
                    })
                    ->build();
            });
        
        $request = new FormBuilderRequest($formBuilder);
        
        return view('users.create', [
            'form' => $formBuilder->build(),
            'request' => $request,
        ]);
    }
    
    public function store(FormBuilderRequest $request)
    {
        $validated = $request->validated();
        User::create($validated);
    }
}
```

## Complete Examples

### Form with Validation Rules

```php
$formBuilder = FormBuilder::make()
    ->action('/products')
    ->method('POST')
    ->tab(function ($tab) {
        $tab->id('details')
            ->label('Product Details')
            ->group(function ($group) {
                $group->label('Basic Information')
                    ->customField(function ($field) {
                        $field->text()
                            ->name('name')
                            ->label('Product Name')
                            ->validation('required|string|max:255')
                            ->build();
                    })
                    ->customField(function ($field) {
                        $field->number()
                            ->name('price')
                            ->label('Price')
                            ->validation('required|numeric|min:0')
                            ->build();
                    })
                    ->customField(function ($field) {
                        $field->select()
                            ->name('category_id')
                            ->label('Category')
                            ->validation('required|exists:categories,id')
                            ->build();
                    })
                    ->build();
            })
            ->build();
    });

$request = new FormBuilderRequest($formBuilder);
```

### Excluding Hidden Fields

```php
$formBuilder = FormBuilder::make()
    ->action('/orders')
    ->method('POST')
    ->hiddenCustomField(function ($field) {
        $field->hidden()
            ->name('user_id')
            ->value(auth()->id())
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
                            ->validation('nullable|string|max:1000')
                            ->build();
                    })
                    ->build();
            })
            ->build();
    });

// Exclude hidden fields from validation
$request = new FormBuilderRequest($formBuilder, false);
```

## When to Use FormBuilderRequest

Use `FormBuilderRequest` when you need to:

- **Automatic Validation**: Generate validation rules from form definitions
- **DRY Principle**: Avoid duplicating validation rules in requests
- **Consistency**: Ensure validation matches form structure
- **Maintainability**: Update validation by updating form definitions
- **Form-Driven Validation**: Keep validation logic close to form definitions

## Related Documentation

- <Link to="/packages/laravel-form/deep-diving/requests/form-type-object-request">FormTypeObjectRequest</Link>
- <Link to="/packages/laravel-form/deep-diving/form-builder">FormBuilder</Link>
- <Link to="/packages/laravel-form/deep-diving/form">Form</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field">CustomField</Link>

