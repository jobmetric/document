---
sidebar_position: 5
sidebar_label: ClassExistRule
---

# ClassExistRule

The `ClassExistRule` is a custom validation rule that ensures a given string value is a valid, existing PHP class. It's used to validate event and listener class names when registering event-listener bindings in the Event System.

## When to Use ClassExistRule

**Use `ClassExistRule` when you need:**

- **Class validation**: Ensure class names exist before using them
- **Event validation**: Validate event class names in form requests
- **Listener validation**: Validate listener class names in form requests
- **Dynamic class loading**: Prevent errors when loading classes dynamically
- **Type safety**: Ensure only valid class names are accepted

**Example scenarios:**
- Validating event class names in API requests
- Validating listener class names in admin forms
- Import/export functionality with class validation
- Dynamic event registration with validation

## Overview

`ClassExistRule` validates that:

- The value is a string
- The string represents an existing PHP class
- The class can be loaded by PHP's autoloader

## Namespace

```php
JobMetric\EventSystem\Rules\ClassExistRule
```

## Quick Start

Use in form requests or validation:

```php
use JobMetric\EventSystem\Rules\ClassExistRule;

// In form request
public function rules(): array
{
    return [
        'event' => ['required', 'string', new ClassExistRule],
        'listener' => ['required', 'string', new ClassExistRule],
    ];
}

// In validation
$validator = Validator::make($data, [
    'event' => ['required', 'string', new ClassExistRule],
]);
```

## Validation Behavior

The rule:

1. Checks if the value is a string
2. Uses `class_exists()` to verify the class exists
3. Returns a translated error message if validation fails

**Error Message:**

```php
trans('event-system::base.validation.class_exist', [
    'class' => $value
])
```

**Translation Key:** `event-system::base.validation.class_exist`

**Default Message:** `"The class :class does not exist."`

## Complete Example

### In Form Request

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use JobMetric\EventSystem\Rules\ClassExistRule;

class StoreEventRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:events,name',
            'description' => 'nullable|string',
            'event' => [
                'required',
                'string',
                new ClassExistRule
            ],
            'listener' => [
                'required',
                'string',
                new ClassExistRule
            ],
            'priority' => 'nullable|integer',
            'status' => 'boolean',
        ];
    }
}
```

### Custom Validation

```php
use Illuminate\Support\Facades\Validator;
use JobMetric\EventSystem\Rules\ClassExistRule;

$data = [
    'event' => 'App\Events\UserCreated',
    'listener' => 'App\Listeners\SendWelcomeEmail',
];

$validator = Validator::make($data, [
    'event' => ['required', 'string', new ClassExistRule],
    'listener' => ['required', 'string', new ClassExistRule],
]);

if ($validator->fails()) {
    $errors = $validator->errors();
    // Handle validation errors
}
```

### With StoreEventSystemRequest

The `StoreEventSystemRequest` already uses this rule:

```php
use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest;

// The request automatically validates classes
$dto = dto([
    'name' => 'user.created',
    'event' => 'App\Events\UserCreated',      // Validated
    'listener' => 'App\Listeners\SendWelcomeEmail', // Validated
], StoreEventSystemRequest::class);
```

## Error Handling

When validation fails, the rule returns a translated error:

```json
{
    "errors": {
        "event": ["The class App\\Events\\NonExistentEvent does not exist."]
    }
}
```

## Best Practices

1. **Use in Form Requests**: Always use in form requests for HTTP validation
2. **Validate Before Use**: Validate class names before dynamically loading them
3. **Provide Clear Errors**: Ensure error messages are user-friendly
4. **Check Autoloading**: Make sure classes are autoloadable (PSR-4)

## Related Documentation

- [StoreEventSystemRequest](/packages/laravel-event-system/deep-diving/requests/store-event-system-request) - Form request using this rule
- [EventSystem](/packages/laravel-event-system/deep-diving/event-system) - Service for managing event bindings

