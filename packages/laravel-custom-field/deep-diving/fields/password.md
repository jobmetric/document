---
sidebar_position: 6
sidebar_label: Password Field
---

import Link from "@docusaurus/Link";

# Password Field

The `password` field provides a secure input for password entry. It masks the input characters for security and includes enhanced UI features for password visibility toggling.

## Namespace

```php
JobMetric\CustomField\CustomFields\Password\Password
```

## Overview

The password field renders as an HTML `<input type="password">` element. The package provides enhanced password UI with optional visibility toggle functionality, making it easier for users to verify their password while maintaining security.

## When to Use

**Use the password field when you need:**

- **Password input** - User passwords, authentication
- **Secure data entry** - Any sensitive information that should be masked
- **Login forms** - User authentication
- **Registration forms** - New user password creation
- **Password change forms** - Password update functionality

**Example scenarios:**
- User login forms
- Registration forms
- Password reset forms
- Account settings (password change)
- Admin authentication

## Builder Method

```php
CustomFieldBuilder::password()
```

## Available Methods

### Common Attributes

- `name(string $name, ?string $uniq = null)` - Set field name
- `id(?string $id)` - Set field ID
- `class(?string $class)` - Set CSS class
- `placeholder(?string $placeholder)` - Set placeholder text
- `value(mixed $value)` - Set field value (usually not used for security)

### Common Properties

- `required()` - Make field required
- `disabled()` - Disable the field
- `readonly()` - Make field readonly
- `autofocus()` - Auto-focus on page load

### Field Labels

- `label(?string $label)` - Set field label
- `info(?string $info)` - Set help/info text

### Validation

- `validation(array|string $rules)` - Set validation rules

## Basic Example

```php
use JobMetric\CustomField\Facades\CustomFieldBuilder;

$password = CustomFieldBuilder::password()
    ->name('password')
    ->label('Password')
    ->info('Enter your password')
    ->required()
    ->placeholder('Enter password')
    ->build();

$result = $password->toHtml();
echo $result['body'];
```

## Advanced Examples

### Login Form Password

```php
$password = CustomFieldBuilder::password()
    ->name('password')
    ->label('Password')
    ->required()
    ->placeholder('Enter your password')
    ->autofocus()
    ->build();
```

### Registration Form with Validation

```php
$password = CustomFieldBuilder::password()
    ->name('password')
    ->label('Password')
    ->info('Minimum 8 characters, including uppercase, lowercase, and number')
    ->required()
    ->validation(['required', 'string', 'min:8', 'regex:/[A-Z]/', 'regex:/[a-z]/', 'regex:/[0-9]/'])
    ->placeholder('Create a strong password')
    ->build();
```

### Password Confirmation

```php
$password = CustomFieldBuilder::password()
    ->name('password')
    ->label('Password')
    ->required()
    ->build();

$confirmPassword = CustomFieldBuilder::password()
    ->name('password_confirmation')
    ->label('Confirm Password')
    ->required()
    ->validation(['required', 'same:password'])
    ->build();
```

### Password Change Form

```php
$currentPassword = CustomFieldBuilder::password()
    ->name('current_password')
    ->label('Current Password')
    ->required()
    ->build();

$newPassword = CustomFieldBuilder::password()
    ->name('new_password')
    ->label('New Password')
    ->required()
    ->validation(['required', 'string', 'min:8', 'different:current_password'])
    ->build();
```

## Rendering

### HTML Output

```php
$result = $password->toHtml();

// $result contains:
// [
//     'body' => '<input type="password" ...>',
//     'scripts' => [],
//     'styles' => []
// ]

echo $result['body'];
```

### Array Output

```php
$array = $password->toArray();

// Returns complete field configuration
```

## HTML Output

The password field renders as:

```html
<input 
    type="password" 
    name="password" 
    id="password" 
    class="form-control" 
    placeholder="Enter password" 
    required
/>
```

Enhanced UI may include:

```html
<div class="password-field">
    <input type="password" name="password" id="password" />
    <button type="button" class="toggle-visibility">Show</button>
</div>
```

## Security Considerations

- Never pre-fill password fields with values
- Always use HTTPS for password transmission
- Implement server-side validation
- Use strong password requirements
- Consider password strength indicators

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Field Attributes</Link> - All available attributes
- <Link to="/packages/laravel-custom-field/deep-diving/properties/field-properties">Field Properties</Link> - Field properties
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Builder API reference

