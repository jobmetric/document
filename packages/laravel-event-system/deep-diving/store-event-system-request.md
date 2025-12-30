---
sidebar_position: 6
sidebar_label: StoreEventSystemRequest
---

import Link from "@docusaurus/Link";

# StoreEventSystemRequest

The `StoreEventSystemRequest` is a form request class that validates and normalizes input data when creating or storing event-listener bindings in the Event System. It ensures data integrity by validating event and listener class names, priority values, and other required fields before storing them in the database.

## Namespace

```php
JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest
```

## Overview

`StoreEventSystemRequest` provides comprehensive validation and data normalization for event system bindings. It:

- **Validates all required fields** before storing event-listener bindings
- **Checks class existence** for event and listener classes using `ClassExistRule`
- **Normalizes input data** with default values and type conversions
- **Provides translated attributes** for better error messages
- **Supports DTO conversion** for programmatic usage outside HTTP requests
- **Ensures uniqueness** of event binding names

## Available Methods

### `authorize()`

Determines if the user is authorized to make this request.

```php
public function authorize(): bool
{
    return true; // Default: allows all requests
}
```

**Override for authorization:**

```php
namespace App\Http\Requests;

use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest as BaseRequest;

class StoreEventSystemRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \JobMetric\EventSystem\Models\Event::class);
    }
}
```

### `rules()`

Get the validation rules that apply to the request.

```php
public function rules(): array
{
    return [
        'name' => 'required|string|max:255|unique:events,name',
        'description' => 'string|nullable',
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
        'priority' => 'integer|nullable',
        'status' => 'boolean'
    ];
}
```

### `normalize()`

Normalize raw input when validating outside Laravel's FormRequest pipeline.

```php
public static function normalize(array $data): array
{
    $data['priority'] = $data['priority'] ?? 0;

    if (($data['description'] ?? null) === '') {
        $data['description'] = null;
    }

    return $data;
}
```

**Usage:**

```php
// Normalize data before validation
$normalized = StoreEventSystemRequest::normalize($input);
$dto = dto($normalized, StoreEventSystemRequest::class);
```

### `prepareForValidation()`

Laravel's native pipeline calls this when using the FormRequest normally.

```php
protected function prepareForValidation(): void
{
    $this->merge(static::normalize($this->all()));
}
```

This method automatically normalizes data when the request is used in controllers.

### `attributes()`

Get custom attributes for validator errors.

```php
public function attributes(): array
{
    return [
        'name' => trans('event-system::base.fields.name'),
        'description' => trans('event-system::base.fields.description'),
        'event' => trans('event-system::base.fields.event'),
        'listener' => trans('event-system::base.fields.listener'),
        'priority' => trans('event-system::base.fields.priority'),
        'status' => trans('event-system::base.fields.status'),
    ];
}
```

## Validation Rules

### Field Details

| Field | Type | Required | Rules | Default | Description |
|-------|------|----------|-------|---------|-------------|
| `name` | string | Yes | `required\|string\|max:255\|unique:events,name` | - | Unique identifier for the event-listener binding |
| `description` | string | No | `string\|nullable` | `null` | Optional description for the binding |
| `event` | string | Yes | `required\|string\|ClassExistRule` | - | Fully qualified event class name |
| `listener` | string | Yes | `required\|string\|ClassExistRule` | - | Fully qualified listener class name |
| `priority` | integer | No | `integer\|nullable` | `0` | Execution priority (lower = earlier) |
| `status` | boolean | No | `boolean` | `true` | Active status of the binding |

### `name` Field

Unique name identifier for the event-listener binding.

**Rules:**
- `required`: Must be provided
- `string`: Must be a string
- `max:255`: Maximum 255 characters
- `unique:events,name`: Must be unique in the events table

**Examples:**

```php
'name' => 'user.created'
'name' => 'order.completed'
'name' => 'notification.send'
```

**Validation Errors:**

```json
{
    "name": [
        "The name field is required.",
        "The name has already been taken."
    ]
}
```

### `description` Field

Optional description for the event binding.

**Rules:**
- `string`: Must be a string if provided
- `nullable`: Can be null or omitted

**Examples:**

```php
'description' => 'Send welcome email when user registers'
'description' => null
'description' => '' // Normalized to null
```

### `event` Field

Fully qualified class name of the event.

**Rules:**
- `required`: Must be provided
- `string`: Must be a string
- `ClassExistRule`: Class must exist and be loadable

**Examples:**

```php
'event' => 'App\Events\UserCreated'
'event' => App\Events\OrderCompleted::class
'event' => 'JobMetric\EventSystem\Events\EventSystemStoredEvent'
```

**Validation Errors:**

```json
{
    "event": [
        "The event field is required.",
        "The event class does not exist."
    ]
}
```

### `listener` Field

Fully qualified class name of the listener.

**Rules:**
- `required`: Must be provided
- `string`: Must be a string
- `ClassExistRule`: Class must exist and be loadable

**Examples:**

```php
'listener' => 'App\Listeners\SendWelcomeEmail'
'listener' => App\Listeners\ProcessOrder::class
'listener' => 'App\Listeners\NotifyAdmin'
```

**Validation Errors:**

```json
{
    "listener": [
        "The listener field is required.",
        "The listener class does not exist."
    ]
}
```

### `priority` Field

Execution priority of the listener. Lower values execute earlier.

**Rules:**
- `integer`: Must be an integer if provided
- `nullable`: Can be null or omitted
- **Default:** `0` (set by `normalize()`)

**Examples:**

```php
'priority' => 10  // Executes after priority 0-9
'priority' => 0   // Executes first
'priority' => null // Normalized to 0
```

**Priority Behavior:**

- Lower priority values execute **earlier**
- Higher priority values execute **later**
- Default priority is `0`

### `status` Field

Active status of the event binding.

**Rules:**
- `boolean`: Must be true or false
- **Default:** `true` (if not provided, Laravel may set to false)

**Examples:**

```php
'status' => true  // Active
'status' => false // Disabled
```

## Data Normalization

The request automatically normalizes data through the `normalize()` method:

### Priority Normalization

```php
// If priority is not provided, defaults to 0
$data['priority'] = $data['priority'] ?? 0;

// Examples:
['priority' => null] → ['priority' => 0]
['priority' => 10] → ['priority' => 10]
[] → ['priority' => 0] // Added
```

### Description Normalization

```php
// Empty strings are converted to null
if (($data['description'] ?? null) === '') {
    $data['description'] = null;
}

// Examples:
['description' => ''] → ['description' => null]
['description' => 'Text'] → ['description' => 'Text']
['description' => null] → ['description' => null]
```

## Usage Examples

### Example 1: Basic Controller Usage

Use in a controller method:

```php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest;
use JobMetric\EventSystem\Facades\EventSystem;

class EventSystemController extends Controller
{
    public function store(StoreEventSystemRequest $request)
    {
        $response = EventSystem::store($request->validated());

        if ($response->isSuccess()) {
            return redirect()
                ->route('admin.events.index')
                ->with('success', $response->getMessage());
        }

        return back()
            ->withErrors($response->getErrors())
            ->withInput();
    }
}
```

### Example 2: API Controller

Return JSON responses for API:

```php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest;
use JobMetric\EventSystem\Facades\EventSystem;

class EventSystemController extends Controller
{
    public function store(StoreEventSystemRequest $request)
    {
        $response = EventSystem::store($request->validated());

        if ($response->isSuccess()) {
            return response()->json([
                'success' => true,
                'message' => $response->getMessage(),
                'data' => $response->getData(),
            ], 201);
        }

        return response()->json([
            'success' => false,
            'message' => $response->getMessage(),
            'errors' => $response->getErrors(),
        ], 422);
    }
}
```

### Example 3: Programmatic Usage with DTO

Convert array to validated DTO:

```php
use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest;
use JobMetric\EventSystem\Facades\EventSystem;

// Prepare input data
$input = [
    'name' => 'user.created',
    'description' => 'Send welcome email when user registers',
    'event' => App\Events\UserCreated::class,
    'listener' => App\Listeners\SendWelcomeEmail::class,
    'priority' => 10,
    'status' => true,
];

// Convert to validated DTO
$dto = dto($input, StoreEventSystemRequest::class);

// Use validated data
$response = EventSystem::store($dto);
```

### Example 4: Batch Creation

Create multiple event bindings:

```php
use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest;
use JobMetric\EventSystem\Facades\EventSystem;

$bindings = [
    [
        'name' => 'user.created',
        'event' => App\Events\UserCreated::class,
        'listener' => App\Listeners\SendWelcomeEmail::class,
    ],
    [
        'name' => 'order.completed',
        'event' => App\Events\OrderCompleted::class,
        'listener' => App\Listeners\SendOrderConfirmation::class,
        'priority' => 5,
    ],
];

foreach ($bindings as $binding) {
    $dto = dto($binding, StoreEventSystemRequest::class);
    EventSystem::store($dto);
}
```

### Example 5: Custom Authorization

Override authorization:

```php
namespace App\Http\Requests;

use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest as BaseRequest;

class StoreEventSystemRequest extends BaseRequest
{
    public function authorize(): bool
    {
        // Only admins can create event bindings
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        $rules = parent::rules();

        // Add custom validation
        $rules['name'] = array_merge(
            explode('|', $rules['name']),
            ['regex:/^[a-z0-9._-]+$/']
        );

        return $rules;
    }
}
```

### Example 6: Conditional Validation

Add conditional rules:

```php
namespace App\Http\Requests;

use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest as BaseRequest;
use Illuminate\Validation\Rule;

class StoreEventSystemRequest extends BaseRequest
{
    public function rules(): array
    {
        $rules = parent::rules();

        // Add conditional validation based on user role
        if ($this->user()->hasRole('admin')) {
            $rules['priority'] = array_merge(
                explode('|', $rules['priority']),
                ['max:100']
            );
        }

        return $rules;
    }
}
```

### Example 7: Custom Error Messages

Override error messages:

```php
namespace App\Http\Requests;

use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest as BaseRequest;

class StoreEventSystemRequest extends BaseRequest
{
    public function messages(): array
    {
        return [
            'name.required' => 'The event binding name is required.',
            'name.unique' => 'This event binding name is already in use.',
            'event.required' => 'You must specify an event class.',
            'listener.required' => 'You must specify a listener class.',
            'event' => 'The event class does not exist or cannot be loaded.',
            'listener' => 'The listener class does not exist or cannot be loaded.',
        ];
    }
}
```

### Example 8: Integration with Event System Service

Complete integration example:

```php
namespace App\Services;

use JobMetric\EventSystem\Facades\EventSystem;
use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest;

class EventBindingService
{
    public function createBinding(array $data): array
    {
        // Validate and normalize
        $dto = dto($data, StoreEventSystemRequest::class);

        // Store binding
        $response = EventSystem::store($dto);

        if ($response->isSuccess()) {
            return [
                'success' => true,
                'message' => $response->getMessage(),
                'data' => $response->getData()->toArray(),
            ];
        }

        return [
            'success' => false,
            'message' => $response->getMessage(),
            'errors' => $response->getErrors(),
        ];
    }
}
```

## Validation Flow

### HTTP Request Flow

```php
// 1. Request arrives at controller
public function store(StoreEventSystemRequest $request)

// 2. Laravel calls authorize()
$request->authorize(); // Returns true by default

// 3. Laravel calls prepareForValidation()
$request->prepareForValidation(); // Normalizes data

// 4. Laravel validates using rules()
$request->rules(); // Returns validation rules

// 5. If validation passes, returns validated data
$request->validated(); // Returns normalized, validated array

// 6. If validation fails, redirects back with errors
```

### Programmatic Flow

```php
// 1. Prepare input data
$input = ['name' => 'user.created', ...];

// 2. Normalize data (optional, but recommended)
$normalized = StoreEventSystemRequest::normalize($input);

// 3. Convert to DTO (validates automatically)
$dto = dto($normalized, StoreEventSystemRequest::class);

// 4. Use validated DTO
EventSystem::store($dto);
```

## Error Handling

### Validation Errors

When validation fails, the request returns errors:

```json
{
    "errors": {
        "name": [
            "The name field is required."
        ],
        "event": [
            "The event field is required.",
            "The event class does not exist."
        ],
        "listener": [
            "The listener class does not exist."
        ]
    }
}
```

### Handling in Controller

```php
public function store(StoreEventSystemRequest $request)
{
    // If we reach here, validation passed
    $validated = $request->validated();
    
    // Use validated data
    $response = EventSystem::store($validated);
    
    return response()->json($response);
}
```

### Handling Validation Failures

Laravel automatically handles validation failures:

```php
// If validation fails, Laravel:
// 1. Redirects back (for web requests)
// 2. Returns 422 JSON response (for API requests)
// 3. Includes validation errors in response
```

## Best Practices

### 1. Always Use Type Hints

```php
// Good
public function store(StoreEventSystemRequest $request)

// Avoid
public function store(Request $request)
```

### 2. Use DTO for Programmatic Usage

```php
// Good: Normalize and validate
$dto = dto($input, StoreEventSystemRequest::class);

// Avoid: Direct array usage
EventSystem::store($input); // May fail validation
```

### 3. Override Authorization

```php
// Good: Check permissions
public function authorize(): bool
{
    return $this->user()->can('create', Event::class);
}
```

### 4. Provide Custom Messages

```php
// Good: User-friendly messages
public function messages(): array
{
    return [
        'name.unique' => 'This event binding name is already in use.',
    ];
}
```

### 5. Use Class Constants

```php
// Good: Use class constants
'event' => App\Events\UserCreated::class

// Avoid: String literals
'event' => 'App\Events\UserCreated'
```

## Common Mistakes

### Mistake 1: Not Using DTO for Programmatic Usage

```php
// Bad: Direct array usage
EventSystem::store($input);

// Good: Validate first
$dto = dto($input, StoreEventSystemRequest::class);
EventSystem::store($dto);
```

### Mistake 2: Forgetting Authorization

```php
// Bad: No authorization check
public function authorize(): bool
{
    return true; // Allows anyone
}

// Good: Check permissions
public function authorize(): bool
{
    return $this->user()->can('create', Event::class);
}
```

### Mistake 3: Not Handling Normalization

```php
// Bad: May have empty strings
$input = ['description' => ''];

// Good: Normalize first
$normalized = StoreEventSystemRequest::normalize($input);
```

### Mistake 4: Using Wrong Class Names

```php
// Bad: Typo in class name
'event' => 'App\Events\UserCreatd' // Missing 'e'

// Good: Use class constants
'event' => App\Events\UserCreated::class
```

## Related Documentation

- <Link to="/packages/laravel-event-system/deep-diving/event-system">EventSystem</Link>
- <Link to="/packages/laravel-event-system/deep-diving/class-exist-rule">ClassExistRule</Link>
- <Link to="/packages/laravel-event-system/deep-diving/event-system-resource">EventSystemResource</Link>

