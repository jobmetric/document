---
sidebar_position: 2
sidebar_label: FormTypeObjectRequest
---

import Link from "@docusaurus/Link";

# FormTypeObjectRequest

The `FormTypeObjectRequest` trait provides helper methods to populate validation rules and attribute names based on form custom fields. It can be used in any `FormRequest` class that works with forms.

## Namespace

```php
JobMetric\Form\Http\Requests\FormTypeObjectRequest
```

## Overview

The `FormTypeObjectRequest` trait provides two methods that can be called from within your `FormRequest` classes to automatically populate validation rules and attribute names from a form instance. This is useful when you want to use form-based validation in custom request classes.

## Available Methods

### Render Form Field

Populate validation rules based on form custom fields:

```php
public function renderFormFiled(array &$rules, Form|null $form): void
```

**Parameters:**
- `$rules` (`array`): Reference to the rules array to be filled
- `$form` (`Form|null`): The form instance

**Returns:** `void`

**Note:** If `$form` is `null`, the method returns early without modifying rules.

### Render Form Attribute

Populate attribute names based on form custom fields:

```php
public function renderFormAttribute(array &$params, Form|null $form): void
```

**Parameters:**
- `$params` (`array`): Reference to the attributes map to be filled
- `$form` (`Form|null`): The form instance

**Returns:** `void`

**Note:** If `$form` is `null`, the method returns early without modifying attributes.

## Basic Usage

### In FormRequest

```php
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Form\Form;
use JobMetric\Form\Http\Requests\FormTypeObjectRequest;

class StoreUserRequest extends FormRequest
{
    use FormTypeObjectRequest;

    public function rules(): array
    {
        $rules = [];
        
        // Get form instance (from service, cache, etc.)
        $form = $this->getFormInstance();
        
        // Populate rules from form
        $this->renderFormFiled($rules, $form);
        
        // Add custom rules if needed
        $rules['password_confirmation'] = 'required|same:password';
        
        return $rules;
    }

    public function attributes(): array
    {
        $attributes = [];
        
        $form = $this->getFormInstance();
        
        // Populate attributes from form
        $this->renderFormAttribute($attributes, $form);
        
        return $attributes;
    }

    protected function getFormInstance(): Form
    {
        // Get form from service, cache, or build it
        return app(FormService::class)->getUserForm();
    }
}
```

## Complete Examples

### Custom Request with Form Integration

```php
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Form\Form;
use JobMetric\Form\FormBuilder;
use JobMetric\Form\Http\Requests\FormTypeObjectRequest;

class UpdateProductRequest extends FormRequest
{
    use FormTypeObjectRequest;

    public function authorize(): bool
    {
        return $this->user()->can('update', Product::find($this->route('product')));
    }

    public function rules(): array
    {
        $rules = [];
        
        $form = $this->buildForm();
        
        // Populate rules from form
        $this->renderFormFiled($rules, $form);
        
        // Override or add custom rules
        $rules['slug'] = 'required|string|unique:products,slug,' . $this->route('product');
        
        return $rules;
    }

    public function attributes(): array
    {
        $attributes = [];
        
        $form = $this->buildForm();
        
        // Populate attributes from form
        $this->renderFormAttribute($attributes, $form);
        
        return $attributes;
    }

    protected function buildForm(): Form
    {
        return FormBuilder::make()
            ->action(route('products.update', $this->route('product')))
            ->method('PUT')
            ->tab(function ($tab) {
                $tab->id('basic')
                    ->label('Basic Information')
                    ->group(function ($group) {
                        $group->label('Details')
                            ->customField(function ($field) {
                                $field->text()
                                    ->name('name')
                                    ->label('Product Name')
                                    ->validation('required|string|max:255')
                                    ->build();
                            })
                            ->customField(function ($field) {
                                $field->text()
                                    ->name('slug')
                                    ->label('Slug')
                                    ->validation('required|string|max:255')
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

## When to Use FormTypeObjectRequest

Use the `FormTypeObjectRequest` trait when you need to:

- **Custom Request Classes**: Use form-based validation in custom request classes
- **Additional Logic**: Add custom validation logic alongside form-based rules
- **Authorization**: Implement custom authorization logic
- **Flexibility**: Have more control over validation than `FormBuilderRequest` provides
- **Mixed Validation**: Combine form-based and custom validation rules

## Related Documentation

- <Link to="/packages/laravel-form/deep-diving/requests/form-builder-request">FormBuilderRequest</Link>
- <Link to="/packages/laravel-form/deep-diving/form">Form</Link>
- <Link to="/packages/laravel-form/deep-diving/form-builder">FormBuilder</Link>

