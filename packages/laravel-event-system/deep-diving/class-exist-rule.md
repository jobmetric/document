---
sidebar_position: 8
sidebar_label: ClassExistRule
---

import Link from "@docusaurus/Link";

# ClassExistRule

The `ClassExistRule` is a custom validation rule that ensures a given string value is a valid, existing PHP class that can be loaded by PHP's autoloader. It's used to validate event and listener class names when registering event-listener bindings in the Event System, preventing errors from non-existent classes.

## Namespace

```php
JobMetric\EventSystem\Rules\ClassExistRule
```

## Overview

`ClassExistRule` validates that:

- The value is a string
- The string represents an existing PHP class
- The class can be loaded by PHP's autoloader (PSR-4)
- The class is accessible in the current context

This rule is essential for:
- **Type Safety**: Ensuring only valid class names are accepted
- **Error Prevention**: Preventing runtime errors from non-existent classes
- **Dynamic Loading**: Safely validating classes before dynamic instantiation
- **API Validation**: Validating class names in API requests

## Basic Usage

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
        ];
    }
}
```

### In Controller Validation

```php
use Illuminate\Support\Facades\Validator;
use JobMetric\EventSystem\Rules\ClassExistRule;

$validator = Validator::make($data, [
    'event' => ['required', 'string', new ClassExistRule],
    'listener' => ['required', 'string', new ClassExistRule],
]);

if ($validator->fails()) {
    return response()->json($validator->errors(), 422);
}
```

### Direct Validation

```php
use Illuminate\Support\Facades\Validator;
use JobMetric\EventSystem\Rules\ClassExistRule;

$data = [
    'event' => 'App\Events\UserCreated',
];

$validator = Validator::make($data, [
    'event' => new ClassExistRule,
]);

if ($validator->fails()) {
    // Handle validation failure
}
```

## How It Works

### Internal Implementation

The rule uses PHP's `class_exists()` function to check if a class exists:

```php
class ClassExistRule implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!class_exists($value)) {
            $fail(trans('event-system::base.validation.class_exist', [
                'class' => $value
            ]));
        }
    }
}
```

### Validation Process

1. **Receives the value** from the validation attribute
2. **Checks if value is string** (handled by Laravel's `string` rule)
3. **Calls `class_exists($value)`** to verify class existence
4. **Triggers autoloader** if class hasn't been loaded yet
5. **Returns success** if class exists, **fails** if it doesn't

### `class_exists()` Behavior

The `class_exists()` function:

- **Triggers autoloader**: Attempts to load the class via PSR-4 autoloading
- **Case-sensitive**: Class names are case-sensitive
- **Namespace-aware**: Requires full namespace path
- **Returns boolean**: `true` if class exists, `false` otherwise

**Important Notes:**
- Works with PSR-4 autoloaded classes
- Requires full namespace (e.g., `App\Events\UserCreated`)
- Case-sensitive matching
- Triggers autoloader if class not yet loaded

## Complete Examples

### Example 1: Basic Form Request

Validate event and listener classes:

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

### Example 2: With StoreEventSystemRequest

The `StoreEventSystemRequest` already uses this rule:

```php
use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest;

// Automatically validates classes
$dto = dto([
    'name' => 'user.created',
    'event' => 'App\Events\UserCreated',      // Validated with ClassExistRule
    'listener' => 'App\Listeners\SendWelcomeEmail', // Validated with ClassExistRule
], StoreEventSystemRequest::class);
```

### Example 3: Custom Validation with Error Handling

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
    
    foreach ($errors->all() as $error) {
        // Handle each error
        Log::error('Validation failed', ['error' => $error]);
    }
    
    return response()->json([
        'success' => false,
        'errors' => $errors,
    ], 422);
}
```

### Example 4: Conditional Validation

Apply rule conditionally:

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use JobMetric\EventSystem\Rules\ClassExistRule;

class StoreEventRequest extends FormRequest
{
    public function rules(): array
    {
        $rules = [
            'name' => 'required|string',
        ];

        // Only validate class if type is 'custom'
        if ($this->input('type') === 'custom') {
            $rules['event'] = ['required', 'string', new ClassExistRule];
            $rules['listener'] = ['required', 'string', new ClassExistRule];
        }

        return $rules;
    }
}
```

### Example 5: Multiple Class Validation

Validate multiple class fields:

```php
use Illuminate\Support\Facades\Validator;
use JobMetric\EventSystem\Rules\ClassExistRule;

$validator = Validator::make($data, [
    'event' => ['required', 'string', new ClassExistRule],
    'listener' => ['required', 'string', new ClassExistRule],
    'middleware' => ['nullable', 'string', new ClassExistRule],
    'handler' => ['nullable', 'string', new ClassExistRule],
]);
```

### Example 6: With Custom Error Messages

Provide custom error messages:

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use JobMetric\EventSystem\Rules\ClassExistRule;

class StoreEventRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'event' => ['required', 'string', new ClassExistRule],
            'listener' => ['required', 'string', new ClassExistRule],
        ];
    }

    public function messages(): array
    {
        return [
            'event' => 'The event class does not exist or cannot be loaded.',
            'listener' => 'The listener class does not exist or cannot be loaded.',
        ];
    }
}
```

### Example 7: API Endpoint Validation

Validate in API controller:

```php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use JobMetric\EventSystem\Rules\ClassExistRule;

class EventController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'event' => ['required', 'string', new ClassExistRule],
            'listener' => ['required', 'string', new ClassExistRule],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Process validated data
        return response()->json(['success' => true], 201);
    }
}
```

### Example 8: Programmatic Validation

Validate before dynamic class instantiation:

```php
use JobMetric\EventSystem\Rules\ClassExistRule;
use Illuminate\Support\Facades\Validator;

$className = 'App\Events\UserCreated';

// Validate before using
$validator = Validator::make(
    ['class' => $className],
    ['class' => new ClassExistRule]
);

if ($validator->passes()) {
    // Safe to instantiate
    $event = new $className();
} else {
    // Handle error
    throw new \InvalidArgumentException("Class {$className} does not exist");
}
```

## Valid Class Names

### Valid Examples

The rule accepts valid PHP class names:

```php
// Fully qualified class names
'App\Events\UserCreated'
'App\Listeners\SendWelcomeEmail'
'JobMetric\EventSystem\Events\EventSystemStoredEvent'

// Using class constants (converted to string)
App\Events\UserCreated::class  // Returns 'App\Events\UserCreated'
```

### Invalid Examples

The rule rejects invalid class names:

```php
// Non-existent classes
'App\Events\NonExistentEvent'  // ❌ Class doesn't exist
'App\Listeners\InvalidListener' // ❌ Class doesn't exist

// Invalid syntax
'App Events UserCreated'        // ❌ Invalid namespace separator
'App\Events\User Created'      // ❌ Space in class name
'App\Events\UserCreated!'      // ❌ Invalid character

// Missing namespace
'UserCreated'                   // ❌ Missing namespace (unless in global namespace)
```

## Error Messages

### Default Error Message

The rule uses a translation key for error messages:

```php
trans('event-system::base.validation.class_exist', [
    'class' => $value
])
```

**Translation Key:** `event-system::base.validation.class_exist`

**Default Message:** `"The class :class does not exist."`

### Error Response Format

When validation fails:

```json
{
    "errors": {
        "event": [
            "The class App\\Events\\NonExistentEvent does not exist."
        ],
        "listener": [
            "The class App\\Listeners\\InvalidListener does not exist."
        ]
    }
}
```

### Custom Error Messages

Override error messages in form requests:

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use JobMetric\EventSystem\Rules\ClassExistRule;

class StoreEventRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'event' => ['required', 'string', new ClassExistRule],
            'listener' => ['required', 'string', new ClassExistRule],
        ];
    }

    public function messages(): array
    {
        return [
            'event' => 'The event class :input does not exist or cannot be loaded.',
            'listener' => 'The listener class :input does not exist or cannot be loaded.',
        ];
    }
}
```

## When to Use

Use `ClassExistRule` when you need to:

- **Validate Class Names**: Ensure class names exist before using them
- **Event Validation**: Validate event class names in form requests
- **Listener Validation**: Validate listener class names in form requests
- **Dynamic Loading**: Prevent errors when loading classes dynamically
- **Type Safety**: Ensure only valid class names are accepted
- **API Validation**: Validate class names in API requests
- **Import/Export**: Validate class names during import/export operations

## When NOT to Use

Avoid using this rule when:

- **Interface Validation**: Use interface validation for interfaces
- **Trait Validation**: Use trait validation for traits
- **Already Validated**: If classes are already validated elsewhere
- **Performance Critical**: For high-frequency validations, consider caching

## Best Practices

### 1. Always Combine with String Validation

```php
// Good: Combined with string validation
'event' => ['required', 'string', new ClassExistRule]

// Avoid: Missing string validation
'event' => [new ClassExistRule]  // May fail if value is not string
```

### 2. Use in Form Requests

```php
// Good: Use in form requests
class StoreEventRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'event' => ['required', 'string', new ClassExistRule],
        ];
    }
}

// Avoid: Manual validation in controllers
public function store(Request $request)
{
    $validator = Validator::make(...); // Use form requests instead
}
```

### 3. Provide Clear Error Messages

```php
// Good: Custom error messages
public function messages(): array
{
    return [
        'event' => 'The event class does not exist or cannot be loaded.',
    ];
}

// Avoid: Generic error messages
// Let default message be used
```

### 4. Use Class Constants When Possible

```php
// Good: Use class constants
'event' => App\Events\UserCreated::class

// Avoid: String literals (prone to typos)
'event' => 'App\Events\UserCreated'
```

### 5. Validate Before Dynamic Instantiation

```php
// Good: Validate before using
$validator = Validator::make(['class' => $className], [
    'class' => new ClassExistRule
]);

if ($validator->passes()) {
    $instance = new $className();
}

// Avoid: Direct instantiation without validation
$instance = new $className(); // May throw error
```

## Common Mistakes

### Mistake 1: Not Combining with String Validation

```php
// Bad: Missing string validation
'event' => [new ClassExistRule]

// Good: Combined with string validation
'event' => ['required', 'string', new ClassExistRule]
```

### Mistake 2: Using Wrong Namespace Format

```php
// Bad: Wrong namespace separator
'event' => 'App/Events/UserCreated'  // ❌ Uses / instead of \

// Good: Correct namespace format
'event' => 'App\Events\UserCreated'   // ✅ Uses \
```

### Mistake 3: Missing Full Namespace

```php
// Bad: Missing namespace
'event' => 'UserCreated'  // ❌ May not work if not in global namespace

// Good: Full namespace
'event' => 'App\Events\UserCreated'  // ✅ Complete namespace
```

### Mistake 4: Case Sensitivity Issues

```php
// Bad: Wrong case
'event' => 'App\Events\usercreated'  // ❌ Wrong case

// Good: Correct case
'event' => 'App\Events\UserCreated'  // ✅ Correct case
```

### Mistake 5: Not Handling Validation Failures

```php
// Bad: No error handling
$validator = Validator::make($data, [
    'event' => new ClassExistRule,
]);
// No check for failures

// Good: Handle failures
$validator = Validator::make($data, [
    'event' => new ClassExistRule,
]);

if ($validator->fails()) {
    return response()->json($validator->errors(), 422);
}
```

## Performance Considerations

### Autoloader Impact

The `class_exists()` function triggers PHP's autoloader:

- **First Check**: May be slower if class file needs to be loaded
- **Subsequent Checks**: Faster if class is already loaded
- **PSR-4**: Works efficiently with PSR-4 autoloading

### Optimization Tips

1. **Cache Validation Results**: For frequently validated classes
2. **Pre-load Classes**: Load classes before validation if possible
3. **Use Composer Autoloader**: Ensure PSR-4 autoloading is optimized

## Integration with StoreEventSystemRequest

The `StoreEventSystemRequest` automatically uses this rule:

```php
namespace JobMetric\EventSystem\Http\Requests;

class StoreEventSystemRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'event' => [
                'required',
                'string',
                new ClassExistRule  // ← Used here
            ],
            'listener' => [
                'required',
                'string',
                new ClassExistRule  // ← Used here
            ],
        ];
    }
}
```

**Usage:**

```php
use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest;

// Automatically validates classes
$dto = dto([
    'name' => 'user.created',
    'event' => 'App\Events\UserCreated',      // Validated
    'listener' => 'App\Listeners\SendWelcomeEmail', // Validated
], StoreEventSystemRequest::class);
```

## Related Documentation

- <Link to="/packages/laravel-event-system/deep-diving/store-event-system-request">StoreEventSystemRequest</Link> - Form request using this rule
- <Link to="/packages/laravel-event-system/deep-diving/event-system">EventSystem</Link> - Service for managing event bindings
- <Link to="/packages/laravel-event-system/deep-diving/domain-event">DomainEvent</Link> - Domain event contract

