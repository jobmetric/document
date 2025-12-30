---
sidebar_position: 7
sidebar_label: Hidden Field
---

import Link from "@docusaurus/Link";

# Hidden Field

The `hidden` field provides a hidden input element for storing data that should not be visible to users but needs to be submitted with the form. It's commonly used for tokens, IDs, and other server-side data.

## Namespace

```php
JobMetric\CustomField\CustomFields\Hidden\Hidden
```

## Overview

The hidden field renders as an HTML `<input type="hidden">` element. It's invisible to users but included in form submissions, making it perfect for CSRF tokens, record IDs, and other data that needs to be passed with the form.

## When to Use

**Use the hidden field when you need:**

- **CSRF tokens** - Security tokens for form protection
- **Record IDs** - Model IDs for updates
- **Session data** - User session information
- **State management** - Form state or workflow data
- **Server-side data** - Any data that should be submitted but not visible

**Example scenarios:**
- CSRF token protection
- Edit forms (model ID)
- Multi-step forms (step tracking)
- Workflow state
- User ID in forms

## Builder Method

```php
CustomFieldBuilder::hidden()
```

## Available Methods

### Common Attributes

- `name(string $name, ?string $uniq = null)` - Set field name
- `id(?string $id)` - Set field ID (optional for hidden fields)
- `value(mixed $value)` - Set field value (required)

### Field Labels

Hidden fields typically don't use labels or info text since they're not visible.

## Basic Example

```php
use JobMetric\CustomField\Facades\CustomFieldBuilder;

$hidden = CustomFieldBuilder::hidden()
    ->name('token')
    ->value('abc123')
    ->build();

$result = $hidden->toHtml();
echo $result['body'];
```

## Advanced Examples

### CSRF Token

```php
$hidden = CustomFieldBuilder::hidden()
    ->name('_token')
    ->value(csrf_token())
    ->build();
```

### Model ID for Updates

```php
$hidden = CustomFieldBuilder::hidden()
    ->name('id')
    ->value($product->id)
    ->build();
```

### Multi-Step Form State

```php
$hidden = CustomFieldBuilder::hidden()
    ->name('step')
    ->value(2)
    ->build();

$hidden = CustomFieldBuilder::hidden()
    ->name('form_id')
    ->value($formId)
    ->build();
```

### User ID

```php
$hidden = CustomFieldBuilder::hidden()
    ->name('user_id')
    ->value(auth()->id())
    ->build();
```

### Workflow State

```php
$hidden = CustomFieldBuilder::hidden()
    ->name('status')
    ->value('draft')
    ->build();
```

## Rendering

### HTML Output

```php
$result = $hidden->toHtml();

// $result contains:
// [
//     'body' => '<input type="hidden" ...>',
//     'scripts' => [],
//     'styles' => []
// ]

echo $result['body'];
```

### Array Output

```php
$array = $hidden->toArray();

// Returns complete field configuration
```

## HTML Output

The hidden field renders as:

```html
<input type="hidden" name="token" value="abc123" />
```

## Security Considerations

- Never store sensitive data in hidden fields that users can modify
- Always validate hidden field values on the server
- Use CSRF tokens for form protection
- Don't rely on hidden fields for security

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Field Attributes</Link> - All available attributes
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Builder API reference

