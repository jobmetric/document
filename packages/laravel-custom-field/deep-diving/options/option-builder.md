---
sidebar_position: 1
sidebar_label: OptionBuilder
---

import Link from "@docusaurus/Link";

# OptionBuilder

The `OptionBuilder` class provides a fluent API for building options for select, radio, and checkbox fields. It supports both normal and pro modes, allowing you to build simple or complex option structures.

## Namespace

```php
JobMetric\CustomField\Option\OptionBuilder
```

## Overview

Options are used in select, radio, and checkbox fields to provide choices to users. The `OptionBuilder` allows you to build options through a closure, making it easy to create multiple options with different configurations.

## Available Methods

### Mode

Set the mode for the option (normal or pro):

```php
$opt->mode('pro')
```

### Type

Set the type of the option (selectBox, radio, checkbox):

```php
$opt->type('radio')
```

### Name

Set the name of the option input:

```php
$opt->name('plan')
```

### Label

Set the label of the option:

```php
$opt->label('Basic Plan')
```

### Value

Set the value of the option:

```php
$opt->value('basic')
```

### Selected

Mark the option as selected:

```php
$opt->selected()
```

### Description

Set a description for the option:

```php
$opt->description('Perfect for individuals')
```

### Meta Info

Set meta information for the option:

```php
$opt->metaInfo('$9.99/month')
```

### Extra Content

Set extra content for the option:

```php
$opt->extraContent('<span class="badge">Popular</span>')
```

### Tag

Set a tag for the option:

```php
$opt->tag('featured')
```

### Build

Build the option and add it to the collection:

```php
$opt->build()
```

## Basic Usage

### Simple Select Options

```php
$select = CustomFieldBuilder::select()
    ->name('country')
    ->label('Country')
    ->options(function ($opt) {
        $opt->label('Select Country')->value('')->build();
        $opt->label('Iran')->value('IR')->build();
        $opt->label('Germany')->value('DE')->build();
        $opt->label('USA')->value('US')->build();
    })
    ->build();
```

### Radio Options (Normal Mode)

```php
$radio = CustomFieldBuilder::radio()
    ->name('plan')
    ->options(function ($opt) {
        $opt->label('Basic')->value('basic')->build();
        $opt->label('Pro')->value('pro')->selected()->build();
        $opt->label('Enterprise')->value('enterprise')->build();
    })
    ->build();
```

### Radio Options (Pro Mode)

```php
$radio = CustomFieldBuilder::radio()
    ->name('plan')
    ->options(function ($opt) {
        $opt->mode('pro')
            ->type('radio')
            ->name('plan')
            ->label('Basic Plan')
            ->value('basic')
            ->description('Perfect for individuals')
            ->metaInfo('$9.99/month')
            ->build();
        
        $opt->mode('pro')
            ->type('radio')
            ->name('plan')
            ->label('Pro Plan')
            ->value('pro')
            ->description('Best for teams')
            ->metaInfo('$29.99/month')
            ->selected()
            ->extraContent('<span class="badge">Popular</span>')
            ->build();
    })
    ->build();
```

## Complete Examples

### Dynamic Options from Database

```php
$select = CustomFieldBuilder::select()
    ->name('category')
    ->label('Category')
    ->options(function ($opt) use ($categories) {
        $opt->label('Select Category')->value('')->build();
        
        foreach ($categories as $category) {
            $opt->label($category->name)
                ->value($category->id);
            
            if ($category->id === $selectedCategoryId) {
                $opt->selected();
            }
            
            $opt->build();
        }
    })
    ->build();
```

### Complex Radio Options with Metadata

```php
$radio = CustomFieldBuilder::radio()
    ->name('payment_method')
    ->label('Payment Method')
    ->options(function ($opt) {
        $opt->mode('pro')
            ->type('radio')
            ->name('payment_method')
            ->label('Credit Card')
            ->value('credit_card')
            ->description('Pay securely with your credit card')
            ->metaInfo('Visa, Mastercard, Amex')
            ->extraContent('<i class="icon-credit-card"></i>')
            ->build();
        
        $opt->mode('pro')
            ->type('radio')
            ->name('payment_method')
            ->label('PayPal')
            ->value('paypal')
            ->description('Pay with your PayPal account')
            ->metaInfo('Fast and secure')
            ->extraContent('<i class="icon-paypal"></i>')
            ->selected()
            ->build();
    })
    ->build();
```

## When to Use OptionBuilder

Use the option builder when you need to:

- **Select Fields**: Build dropdown options
- **Radio Buttons**: Create radio button groups
- **Checkboxes**: Create checkbox groups
- **Dynamic Options**: Build options from database or API data
- **Complex Options**: Create options with descriptions, metadata, and extra content

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/options/option">Option</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link>

