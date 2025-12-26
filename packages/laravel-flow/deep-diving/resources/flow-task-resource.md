---
sidebar_position: 3
sidebar_label: FlowTaskResource
---

# FlowTaskResource

JSON resource class for transforming FlowTask models into structured API responses. This resource provides a consistent format for task data with conditional relation loading.

## Namespace

`JobMetric\Flow\Http\Resources\FlowTaskResource`

## Overview

The `FlowTaskResource` transforms FlowTask model instances into structured JSON responses. It includes:

- Core task properties
- Driver information
- Configuration data
- Execution order
- ISO 8601 formatted timestamps
- Conditional relation loading

## Base Properties

The resource always includes these properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | Task ID |
| `flow_transition_id` | `int` | Parent transition ID |
| `driver` | `string` | Fully qualified driver class name |
| `config` | `array\|null` | Driver-specific configuration |
| `ordering` | `int` | Task execution order |
| `status` | `bool` | Active/inactive status |
| `created_at` | `string` | ISO 8601 formatted creation date |
| `updated_at` | `string` | ISO 8601 formatted update date |

## Conditional Properties

These properties are only included when their relations are loaded:

| Property | Relation | Type | Description |
|----------|----------|------|-------------|
| `transition` | `transition` | `object` | FlowTransitionResource for parent transition |
| `flow` | `transition.flow` | `object` | FlowResource (requires both transition and flow loaded) |

## Nested Relation Loading

The `flow` property requires both `transition` and `transition.flow` to be loaded:

```php
// Load flow through transition
$task = FlowTask::with('transition.flow')->find(1);

// flow property will be included in response
```

## Usage Examples

### Basic Usage

```php
use JobMetric\Flow\Http\Resources\FlowTaskResource;
use JobMetric\Flow\Models\FlowTask;

$task = FlowTask::find(1);

return FlowTaskResource::make($task);
```

### With Relations

```php
$task = FlowTask::with([
    'transition',
    'transition.flow',
])->find(1);

return FlowTaskResource::make($task);
```

### In Collections

```php
$tasks = FlowTask::with('transition')->get();

return FlowTaskResource::collection($tasks);
```

### In API Responses

```php
use JobMetric\Flow\Facades\FlowTask;

public function show($id)
{
    $task = FlowTask::query()
        ->with(['transition', 'transition.flow'])
        ->findOrFail($id);

    return new FlowTaskResource($task);
}
```

## Response Examples

### Basic Response

```json
{
    "id": 1,
    "flow_transition_id": 1,
    "driver": "App\\FlowTasks\\SendEmailTask",
    "config": {
        "recipient": "user@example.com",
        "subject": "Order Confirmation",
        "template": "order-confirmation"
    },
    "ordering": 1,
    "status": true,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

### With Transition

```json
{
    "id": 1,
    "flow_transition_id": 1,
    "driver": "App\\FlowTasks\\SendEmailTask",
    "config": {
        "recipient": "user@example.com"
    },
    "ordering": 1,
    "status": true,
    "transition": {
        "id": 1,
        "flow_id": 1,
        "from": 1,
        "to": 2,
        // ... FlowTransitionResource fields
    }
}
```

### With Flow

```json
{
    "id": 1,
    "flow_transition_id": 1,
    "driver": "App\\FlowTasks\\SendEmailTask",
    "config": {
        "recipient": "user@example.com"
    },
    "ordering": 1,
    "status": true,
    "transition": {
        "id": 1,
        "flow_id": 1,
        // ... FlowTransitionResource fields
    },
    "flow": {
        "id": 1,
        "subject_type": "App\\Models\\Order",
        // ... FlowResource fields
    }
}
```

## Relation Loading

### Eager Loading Relations

```php
// Load transition
$task = FlowTask::with('transition')->find(1);

// Load transition and flow
$task = FlowTask::with('transition.flow')->find(1);
```

### Loading Multiple Tasks

```php
// Load relations for collection
$tasks = FlowTask::with([
    'transition',
    'transition.flow',
])->get();
```

### Nested Relations

```php
// Load deeply nested relations
$task = FlowTask::with([
    'transition',
    'transition.flow',
    'transition.fromState',
    'transition.toState',
])->find(1);
```

## Config Structure

The `config` property contains driver-specific configuration:

```php
// For SendEmailTask
'config' => [
    'recipient' => 'user@example.com',
    'subject' => 'Order Confirmation',
    'template' => 'order-confirmation',
]

// For ValidateOrderTask
'config' => [
    'min_amount' => 100,
    'required_fields' => ['customer_name', 'address'],
]
```

## Best Practices

1. **Load Relations When Needed**: Only load relations you need
   ```php
   // ✅ Good
   FlowTask::with('transition')->get();
   
   // ❌ Bad - Load unnecessary relations
   FlowTask::with(['transition', 'transition.flow', 'transition.fromState'])->get();
   ```

2. **Handle Config Structure**: Config structure depends on driver
   ```php
   if ($task->config) {
       $recipient = $task->config['recipient'] ?? null;
   }
   ```

3. **Check Status**: Use status to determine if task is active
   ```php
   if ($task->status) {
       // Task is active
   }
   ```

## Related Documentation

- [FlowTask Service](/packages/laravel-flow/deep-diving/services/flow-task) - Learn about task management
- [FlowTransitionResource](/packages/laravel-flow/deep-diving/resources/flow-transition-resource) - Transition resource
- [FlowResource](/packages/laravel-flow/deep-diving/resources/flow-resource) - Flow resource

