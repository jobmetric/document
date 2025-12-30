---
sidebar_position: 3
sidebar_label: Radio Field
---

import Link from "@docusaurus/Link";

# Radio Field

The `radio` field provides radio button inputs for selecting a single option from a group. Unlike select fields, radio buttons display all options at once, making them ideal for small sets of choices where visibility is important.

## Namespace

```php
JobMetric\CustomField\CustomFields\Radio\Radio
```

## Overview

The radio field renders as a group of HTML `<input type="radio">` elements. All radio buttons in a group share the same name attribute, ensuring only one can be selected at a time. The package supports both standard and "pro" rendering modes for enhanced UI.

## When to Use

**Use the radio field when you need:**

- **Single choice from visible options** - Payment methods, subscription plans
- **Small option sets** - 2-5 options that should be visible
- **Immediate visibility** - When users should see all choices at once
- **Form selections** - Gender, status, priority levels
- **User preferences** - Theme selection, notification preferences

**Example scenarios:**
- Payment method selection (credit card, PayPal, bank transfer)
- Subscription plan selection (basic, pro, enterprise)
- Gender selection (male, female, other)
- Priority levels (low, medium, high, urgent)
- Theme selection (light, dark, auto)

## Builder Method

```php
CustomFieldBuilder::radio()
```

## Available Methods

### Common Attributes

- `name(string $name, ?string $uniq = null)` - Set field name (shared by all radio buttons)
- `id(?string $id)` - Set base ID (individual IDs are auto-generated)
- `class(?string $class)` - Set CSS class
- `value(mixed $value)` - Set selected value

### Common Properties

- `required()` - Make field required
- `disabled()` - Disable all radio buttons
- `readonly()` - Make field readonly
- `autofocus()` - Auto-focus on first option

### Field Labels

- `label(?string $label)` - Set field group label
- `info(?string $info)` - Set help/info text

### Options

- `options(Closure $options)` - Define radio button options

### Validation

- `validation(array|string $rules)` - Set validation rules

## Basic Example

```php
use JobMetric\CustomField\Facades\CustomFieldBuilder;

$radio = CustomFieldBuilder::radio()
    ->name('plan')
    ->label('Subscription Plan')
    ->info('Choose your subscription plan')
    ->required()
    ->options(function ($opt) {
        $opt->mode('pro')
            ->type('radio')
            ->name('plan')
            ->label('Basic Plan')
            ->value('basic')
            ->info('$9/month')
            ->build();
            
        $opt->mode('pro')
            ->type('radio')
            ->name('plan')
            ->label('Pro Plan')
            ->value('pro')
            ->info('$29/month')
            ->selected()
            ->build();
            
        $opt->mode('pro')
            ->type('radio')
            ->name('plan')
            ->label('Enterprise Plan')
            ->value('enterprise')
            ->info('$99/month')
            ->build();
    })
    ->build();

$result = $radio->toHtml();
echo $result['body'];
```

## Advanced Examples

### Simple Radio Buttons

```php
$radio = CustomFieldBuilder::radio()
    ->name('gender')
    ->label('Gender')
    ->required()
    ->options(function ($opt) {
        $opt->mode('pro')
            ->type('radio')
            ->name('gender')
            ->label('Male')
            ->value('male')
            ->build();
            
        $opt->mode('pro')
            ->type('radio')
            ->name('gender')
            ->label('Female')
            ->value('female')
            ->build();
            
        $opt->mode('pro')
            ->type('radio')
            ->name('gender')
            ->label('Other')
            ->value('other')
            ->build();
    })
    ->build();
```

### With Pre-selected Value

```php
$radio = CustomFieldBuilder::radio()
    ->name('status')
    ->label('Status')
    ->value('active') // Pre-select active
    ->options(function ($opt) {
        $opt->mode('pro')
            ->type('radio')
            ->name('status')
            ->label('Active')
            ->value('active')
            ->build();
            
        $opt->mode('pro')
            ->type('radio')
            ->name('status')
            ->label('Inactive')
            ->value('inactive')
            ->build();
    })
    ->build();
```

### With Validation

```php
$radio = CustomFieldBuilder::radio()
    ->name('priority')
    ->label('Priority')
    ->required()
    ->validation(['required', 'in:low,medium,high,urgent'])
    ->options(function ($opt) {
        $opt->mode('pro')->type('radio')->name('priority')->label('Low')->value('low')->build();
        $opt->mode('pro')->type('radio')->name('priority')->label('Medium')->value('medium')->build();
        $opt->mode('pro')->type('radio')->name('priority')->label('High')->value('high')->build();
        $opt->mode('pro')->type('radio')->name('priority')->label('Urgent')->value('urgent')->build();
    })
    ->build();
```

### Payment Method Selection

```php
$radio = CustomFieldBuilder::radio()
    ->name('payment_method')
    ->label('Payment Method')
    ->required()
    ->options(function ($opt) {
        $opt->mode('pro')
            ->type('radio')
            ->name('payment_method')
            ->label('Credit Card')
            ->value('credit_card')
            ->info('Visa, Mastercard, Amex')
            ->build();
            
        $opt->mode('pro')
            ->type('radio')
            ->name('payment_method')
            ->label('PayPal')
            ->value('paypal')
            ->info('Pay with PayPal account')
            ->build();
            
        $opt->mode('pro')
            ->type('radio')
            ->name('payment_method')
            ->label('Bank Transfer')
            ->value('bank_transfer')
            ->info('Direct bank transfer')
            ->build();
    })
    ->build();
```

## Rendering

### HTML Output

```php
$result = $radio->toHtml();

// $result contains:
// [
//     'body' => '<div>...radio buttons...</div>',
//     'scripts' => [],
//     'styles' => []
// ]

echo $result['body'];
```

### Array Output

```php
$array = $radio->toArray();

// Returns complete field configuration including all options
```

## HTML Output

The radio field renders as:

```html
<div class="radio-group">
    <div class="radio-option">
        <input type="radio" name="plan" id="plan_basic" value="basic" />
        <label for="plan_basic">Basic Plan</label>
        <span class="info">$9/month</span>
    </div>
    <div class="radio-option">
        <input type="radio" name="plan" id="plan_pro" value="pro" checked />
        <label for="plan_pro">Pro Plan</label>
        <span class="info">$29/month</span>
    </div>
</div>
```

## Pro Mode

The "pro" mode provides enhanced rendering with:
- Better visual styling
- Info text support for each option
- Improved accessibility
- Customizable layouts

Use `mode('pro')` when building options for enhanced UI.

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/options/option-builder">Option Builder</Link> - Learn how to build radio options
- <Link to="/packages/laravel-custom-field/deep-diving/options/option">Option</Link> - Understanding option structure
- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Field Properties</Link> - Field properties
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Builder API reference

