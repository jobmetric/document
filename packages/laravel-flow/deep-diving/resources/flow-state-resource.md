---
sidebar_position: 2
sidebar_label: FlowStateResource
---

# FlowStateResource

JSON resource class for transforming FlowState models into structured API responses. This resource provides a consistent format for state data with conditional relation loading.

## Namespace

`JobMetric\Flow\Http\Resources\FlowStateResource`

## Overview

The `FlowStateResource` transforms FlowState model instances into structured JSON responses. It includes:

- Core state properties
- Multi-language translations
- Type and status information
- Terminal state indicators
- ISO 8601 formatted timestamps
- Conditional relation loading

## Base Properties

The resource always includes these properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | State ID |
| `flow_id` | `int` | Parent flow ID |
| `type` | `string` | State type (start, middle, end) |
| `status` | `string\|null` | Status value (from flow's driver enum) |
| `config` | `object\|null` | Custom configuration object |
| `is_start` | `bool` | Whether this is a START state |
| `is_end` | `bool` | Whether this is a terminal/END state |
| `created_at` | `string` | ISO 8601 formatted creation date |
| `updated_at` | `string` | ISO 8601 formatted update date |

## Conditional Properties

These properties are only included when their relations are loaded:

| Property | Relation | Type | Description |
|----------|----------|------|-------------|
| `translations` | `translations` | `object` | Multi-language translations |
| `flow` | `flow` | `object` | FlowResource for parent flow |
| `outgoing` | `outgoing` | `array` | Collection of FlowTransitionResource (transitions from this state) |
| `incoming` | `incoming` | `array` | Collection of FlowTransitionResource (transitions to this state) |
| `tasks` | `tasks` | `array` | Collection of FlowTaskResource |

## Type Handling

The `type` property is normalized to handle enum objects:

```php
// If type is an enum object
$type = $this->type->value; // Extract value

// If type is a string
$type = $this->type; // Use directly
```

## Terminal State Detection

The `is_end` property is determined by:

1. Checking the `is_end` attribute if available
2. Otherwise, checking `config.is_terminal === true`

```php
'is_end' => (bool)($this->is_end ?? ($this->config?->is_terminal === true))
```

## Usage Examples

### Basic Usage

```php
use JobMetric\Flow\Http\Resources\FlowStateResource;
use JobMetric\Flow\Models\FlowState;

$state = FlowState::find(1);

return FlowStateResource::make($state);
```

### With Relations

```php
$state = FlowState::with([
    'flow',
    'outgoing',
    'incoming',
    'tasks',
])->find(1);

return FlowStateResource::make($state);
```

### In Collections

```php
$states = FlowState::with('flow')->get();

return FlowStateResource::collection($states);
```

### In API Responses

```php
use JobMetric\Flow\Facades\FlowState;

public function show($id)
{
    $state = FlowState::query()
        ->with(['flow', 'outgoing', 'incoming'])
        ->findOrFail($id);

    return new FlowStateResource($state);
}
```

## Response Examples

### Basic Response

```json
{
    "id": 1,
    "flow_id": 1,
    "type": "start",
    "status": null,
    "config": null,
    "is_start": true,
    "is_end": false,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

### With Translations

```json
{
    "id": 1,
    "translations": {
        "en": {
            "name": "Pending Review",
            "description": "Order is pending review"
        },
        "fa": {
            "name": "در انتظار بررسی",
            "description": "سفارش در انتظار بررسی است"
        }
    },
    "flow_id": 1,
    "type": "middle",
    "status": "pending",
    // ... other fields
}
```

### With Relations

```json
{
    "id": 1,
    "flow_id": 1,
    "type": "middle",
    "status": "pending",
    "flow": {
        "id": 1,
        "subject_type": "App\\Models\\Order",
        // ... FlowResource fields
    },
    "outgoing": [
        {
            "id": 1,
            "flow_id": 1,
            "from": 1,
            "to": 2,
            // ... FlowTransitionResource fields
        }
    ],
    "incoming": [
        {
            "id": 2,
            "flow_id": 1,
            "from": 0,
            "to": 1,
            // ... FlowTransitionResource fields
        }
    ],
    "tasks": [
        {
            "id": 1,
            "flow_transition_id": 1,
            "driver": "App\\FlowTasks\\SendEmailTask",
            // ... FlowTaskResource fields
        }
    ]
}
```

### Terminal State

```json
{
    "id": 5,
    "flow_id": 1,
    "type": "middle",
    "status": "completed",
    "config": {
        "is_terminal": true,
        "color": "#10B981",
        "icon": "fas fa-check-circle"
    },
    "is_start": false,
    "is_end": true,
    // ... other fields
}
```

## Relation Loading

### Eager Loading Relations

```php
// Load all relations
$state = FlowState::with([
    'translations',
    'flow',
    'outgoing',
    'incoming',
    'tasks',
])->find(1);
```

### Selective Loading

```php
// Load only needed relations
$state = FlowState::with(['flow', 'outgoing'])->find(1);
```

### Nested Relations

```php
// Load nested relations
$state = FlowState::with([
    'outgoing.toState',
    'incoming.fromState',
    'tasks.transition',
])->find(1);
```

## Best Practices

1. **Load Relations Efficiently**: Only load relations you need
   ```php
   // ✅ Good
   FlowState::with(['flow', 'outgoing'])->get();
   
   // ❌ Bad
   FlowState::with(['flow', 'outgoing', 'incoming', 'tasks'])->get();
   ```

2. **Handle Status Values**: Status can be null or enum value
   ```php
   if ($state->status) {
       // Handle status
   }
   ```

3. **Check Terminal States**: Use is_end for terminal state detection
   ```php
   if ($state->is_end) {
       // Handle terminal state
   }
   ```

## Related Documentation

- [FlowState Service](/packages/laravel-flow/deep-diving/services/flow-state) - State management
- [FlowResource](/packages/laravel-flow/deep-diving/resources/flow-resource) - Flow resource
- [FlowTransitionResource](/packages/laravel-flow/deep-diving/resources/flow-transition-resource) - Transition resource
- [FlowTaskResource](/packages/laravel-flow/deep-diving/resources/flow-task-resource) - Task resource

