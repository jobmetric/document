---
sidebar_position: 2
sidebar_label: HasFormType
---

import Link from "@docusaurus/Link";

# HasFormType

The `HasFormType` trait provides a way to associate forms with type-based objects. It allows you to define forms per type and retrieve them, making it useful for building type-based form systems where different types have different form structures.

## Namespace

```php
JobMetric\Form\Typeify\HasFormType
```

## Overview

The `HasFormType` trait is designed to work with objects that have a `type` property. It allows you to define forms for each type and retrieve them later. This is particularly useful for polymorphic relationships or type-based systems where different types require different form structures.

## Requirements

The trait expects the class using it to have:

- A `$type` property that identifies the type
- A `setTypeParam()` method to store type parameters
- A `getTypeParam()` method to retrieve type parameters

## Available Methods

### Form

Set a form for the current type:

```php
public function form(Closure|array $callable): static
```

**Parameters:**
- `$callable` (`Closure|array`): A closure that receives a `FormBuilder` instance, or an array of form configurations

**Returns:** `static` - Returns the instance for method chaining

**Throws:** `InvalidArgumentException` - If a form already exists for this type

### Get Form

Get the form for the current type:

```php
public function getForm(): ?Form
```

**Returns:** `Form|null` - The form instance for the current type, or null if not set

### Get Form Custom Fields

Get all custom fields from the form for the current type:

```php
public function getFormCustomFields(): Collection
```

**Returns:** `Collection<int, CustomField>` - Collection of custom field instances

## Basic Usage

### Setting Form with Closure

```php
use JobMetric\Form\Typeify\HasFormType;

class ProductType
{
    use HasFormType;

    public string $type = 'physical';

    public function __construct()
    {
        $this->form(function ($formBuilder) {
            $formBuilder->action('/products')
                ->method('POST')
                ->tab(function ($tab) {
                    $tab->id('details')
                        ->label('Product Details')
                        ->group(function ($group) {
                            $group->label('Basic Info')
                                ->customField(function ($field) {
                                    $field->text()
                                        ->name('name')
                                        ->label('Product Name')
                                        ->build();
                                })
                                ->build();
                        })
                        ->build();
                })
                ->build();
        });
    }
}
```

### Getting Form

```php
$productType = new ProductType();
$form = $productType->getForm();

if ($form) {
    $html = $form->toHtml();
}
```

### Getting Form Fields

```php
$productType = new ProductType();
$fields = $productType->getFormCustomFields();

foreach ($fields as $field) {
    echo $field->label . "\n";
}
```

## Complete Examples

### Type-Based Form System

```php
use JobMetric\Form\Typeify\HasFormType;

abstract class ContentType
{
    use HasFormType;

    public string $type;

    abstract public function defineForm(): void;
}

class ArticleType extends ContentType
{
    public string $type = 'article';

    public function __construct()
    {
        $this->defineForm();
    }

    public function defineForm(): void
    {
        $this->form(function ($formBuilder) {
            $formBuilder->action('/content')
                ->method('POST')
                ->tab(function ($tab) {
                    $tab->id('content')
                        ->label('Article Content')
                        ->group(function ($group) {
                            $group->label('Article Details')
                                ->customField(function ($field) {
                                    $field->text()
                                        ->name('title')
                                        ->label('Title')
                                        ->required()
                                        ->build();
                                })
                                ->customField(function ($field) {
                                    $field->text()
                                        ->name('author')
                                        ->label('Author')
                                        ->build();
                                })
                                ->build();
                        })
                        ->build();
                })
                ->build();
        });
    }
}

class VideoType extends ContentType
{
    public string $type = 'video';

    public function __construct()
    {
        $this->defineForm();
    }

    public function defineForm(): void
    {
        $this->form(function ($formBuilder) {
            $formBuilder->action('/content')
                ->method('POST')
                ->enctype('multipart/form-data')
                ->tab(function ($tab) {
                    $tab->id('media')
                        ->label('Video Media')
                        ->group(function ($group) {
                            $group->label('Video Details')
                                ->customField(function ($field) {
                                    $field->text()
                                        ->name('title')
                                        ->label('Video Title')
                                        ->required()
                                        ->build();
                                })
                                ->customField(function ($field) {
                                    $field->image()
                                        ->name('video_file')
                                        ->label('Video File')
                                        ->required()
                                        ->build();
                                })
                                ->build();
                        })
                        ->build();
                })
                ->build();
        });
    }
}
```

### Using with Polymorphic Models

```php
use JobMetric\Form\Typeify\HasFormType;

class FormTemplate
{
    use HasFormType;

    public string $type;

    public function __construct(string $type)
    {
        $this->type = $type;
        $this->defineForm();
    }

    protected function defineForm(): void
    {
        $formConfig = $this->getFormConfigForType($this->type);
        
        $this->form(function ($formBuilder) use ($formConfig) {
            $formBuilder->action($formConfig['action'])
                ->method($formConfig['method'])
                ->tab(function ($tab) use ($formConfig) {
                    foreach ($formConfig['tabs'] as $tabConfig) {
                        $tab->id($tabConfig['id'])
                            ->label($tabConfig['label'])
                            ->group(function ($group) use ($tabConfig) {
                                foreach ($tabConfig['groups'] as $groupConfig) {
                                    $group->label($groupConfig['label'])
                                        ->customField(function ($field) use ($groupConfig) {
                                            // Build fields from config
                                        })
                                        ->build();
                                }
                            })
                            ->build();
                    }
                })
                ->build();
        });
    }

    protected function getFormConfigForType(string $type): array
    {
        // Return form configuration based on type
        return [];
    }
}
```

## When to Use HasFormType

Use the `HasFormType` trait when you need to:

- **Type-Based Forms**: Associate different forms with different types
- **Polymorphic Forms**: Handle forms for polymorphic relationships
- **Dynamic Form Selection**: Select forms based on object type
- **Type-Specific Validation**: Use different validation rules per type
- **Form Templates**: Create reusable form templates for different types

## Related Documentation

- <Link to="/packages/laravel-form/deep-diving/form-builder">FormBuilder</Link>
- <Link to="/packages/laravel-form/deep-diving/form">Form</Link>
- <Link to="/packages/laravel-form/deep-diving/support/io-form">IOForm</Link>

