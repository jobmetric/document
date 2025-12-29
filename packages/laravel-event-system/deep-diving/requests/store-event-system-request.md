---
sidebar_position: 4
sidebar_label: StoreEventSystemRequest
---

# StoreEventSystemRequest

The `StoreEventSystemRequest` is a form request class that validates input data when creating or storing event-listener bindings in the Event System. It ensures data integrity by validating event and listener class names, priority values, and other required fields.

## When to Use StoreEventSystemRequest

**Use `StoreEventSystemRequest` when you need:**

- **Input validation**: Validate event system data before storing
- **Class existence checks**: Ensure event and listener classes exist
- **Data normalization**: Normalize input data (e.g., default values)
- **Form request handling**: Use in controllers for HTTP requests
- **DTO creation**: Convert arrays to validated DTOs

**Example scenarios:**
- API endpoints for creating event bindings
- Admin forms for registering events
- Programmatic event registration with validation
- Import/export functionality with validation

## Overview

`StoreEventSystemRequest` provides:

- **Field validation**: Validates all required and optional fields
- **Class validation**: Ensures event and listener classes exist
- **Data normalization**: Sets default values and normalizes data
- **Custom attributes**: Provides translated field names for error messages

## Namespace

```php
JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest
```

## Quick Start

Use in controllers or convert arrays to DTOs:

```php
use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest;

// In controller
public function store(StoreEventSystemRequest $request)
{
    $validated = $request->validated();
    // Use validated data
}

// Convert array to DTO
$dto = dto($input, StoreEventSystemRequest::class);
```

## Validation Rules

### `name` (string, required)

Unique name identifier for the event-listener binding.

**Rules:**
- `required`
- `string`
- `max:255`
- `unique:events,name`

**Example:**

```php
'name' => 'user.created'
```

### `description` (string, nullable)

Optional description for the event binding.

**Rules:**
- `string`
- `nullable`

**Example:**

```php
'description' => 'Send welcome email when user registers'
```

### `event` (string, required)

Fully qualified class name of the event.

**Rules:**
- `required`
- `string`
- `ClassExistRule` - Validates that the class exists

**Example:**

```php
'event' => 'App\Events\UserCreated'
```

### `listener` (string, required)

Fully qualified class name of the listener.

**Rules:**
- `required`
- `string`
- `ClassExistRule` - Validates that the class exists

**Example:**

```php
'listener' => 'App\Listeners\SendWelcomeEmail'
```

### `priority` (integer, nullable)

Execution priority of the listener. Lower values execute earlier.

**Rules:**
- `integer`
- `nullable`

**Default:** `0`

**Example:**

```php
'priority' => 10
```

### `status` (boolean)

Active status of the event binding.

**Rules:**
- `boolean`

**Default:** `true`

**Example:**

```php
'status' => true
```

## Data Normalization

The request automatically normalizes data:

```php
public static function normalize(array $data): array
{
    // Set default priority if not provided
    $data['priority'] = $data['priority'] ?? 0;

    // Convert empty string to null for description
    if (($data['description'] ?? null) === '') {
        $data['description'] = null;
    }

    return $data;
}
```

## Custom Attributes

The request provides translated field names for error messages:

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

## Complete Example

### In Controller

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
            return redirect()->route('admin.events.index')
                ->with('success', $response->getMessage());
        }

        return back()->withErrors($response->getErrors());
    }
}
```

### Programmatic Usage

```php
use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest;
use JobMetric\EventSystem\Facades\EventSystem;

// Convert array to validated DTO
$input = [
    'name' => 'user.created',
    'description' => 'Send welcome email',
    'event' => App\Events\UserCreated::class,
    'listener' => App\Listeners\SendWelcomeEmail::class,
    'priority' => 10,
    'status' => true,
];

$dto = dto($input, StoreEventSystemRequest::class);

// Use validated data
$response = EventSystem::store($dto);
```

## Validation Errors

When validation fails, the request returns errors with translated field names:

```json
{
    "errors": {
        "name": ["The name field is required."],
        "event": ["The event class does not exist."],
        "listener": ["The listener class does not exist."]
    }
}
```

## Related Documentation

- [ClassExistRule](/packages/laravel-event-system/deep-diving/rules/class-exist-rule) - Validation rule for class existence
- [EventSystem](/packages/laravel-event-system/deep-diving/event-system) - Service for managing event bindings

