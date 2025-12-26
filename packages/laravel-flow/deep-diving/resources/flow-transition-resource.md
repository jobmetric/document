---
sidebar_position: 4
sidebar_label: FlowTransitionResource
---

# FlowTransitionResource

JSON resource class for transforming FlowTransition models into structured API responses. This resource provides a consistent format for transition data with conditional relation loading.

## Namespace

`JobMetric\Flow\Http\Resources\FlowTransitionResource`

## Overview

The `FlowTransitionResource` transforms FlowTransition model instances into structured JSON responses. It includes:

- Core transition properties
- Multi-language translations
- State relationships (from/to)
- Transition type indicators
- ISO 8601 formatted timestamps
- Conditional relation loading

## Base Properties

The resource always includes these properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | Transition ID |
| `flow_id` | `int` | Parent flow ID |
| `from` | `int\|null` | Source state ID (null for generic input) |
| `to` | `int\|null` | Target state ID (null for generic output) |
| `slug` | `string\|null` | URL-friendly identifier |
| `is_start_edge` | `bool` | Whether this is a generic input transition (from=null) |
| `is_end_edge` | `bool` | Whether this is a generic output transition (to=null) |
| `created_at` | `string` | ISO 8601 formatted creation date |
| `updated_at` | `string` | ISO 8601 formatted update date |

## Transition Type Detection

The resource automatically detects transition types:

### is_start_edge

True when `from` is null and `to` is not null (generic input):

```php
'is_start_edge' => (bool)(is_null($this->from) && !is_null($this->to))
```

### is_end_edge

True when `from` is not null and `to` is null (generic output):

```php
'is_end_edge' => (bool)(!is_null($this->from) && is_null($this->to))
```

## Conditional Properties

These properties are only included when their relations are loaded:

| Property | Relation | Type | Description |
|----------|----------|------|-------------|
| `translations` | `translations` | `object` | Multi-language translations |
| `flow` | `flow` | `object` | FlowResource for parent flow |
| `from_state` | `fromState` | `object\|null` | FlowStateResource for source state |
| `to_state` | `toState` | `object\|null` | FlowStateResource for target state |
| `tasks` | `tasks` | `array` | Collection of FlowTaskResource |
| `instances` | `instances` | `array` | Collection of FlowInstanceResource |

## Usage Examples

### Basic Usage

```php
use JobMetric\Flow\Http\Resources\FlowTransitionResource;
use JobMetric\Flow\Models\FlowTransition;

$transition = FlowTransition::find(1);

return FlowTransitionResource::make($transition);
```

### With Relations

```php
$transition = FlowTransition::with([
    'flow',
    'fromState',
    'toState',
    'tasks',
])->find(1);

return FlowTransitionResource::make($transition);
```

### In Collections

```php
$transitions = FlowTransition::with(['fromState', 'toState'])->get();

return FlowTransitionResource::collection($transitions);
```

### In API Responses

```php
use JobMetric\Flow\Facades\FlowTransition;

public function show($id)
{
    $transition = FlowTransition::query()
        ->with(['flow', 'fromState', 'toState', 'tasks'])
        ->findOrFail($id);

    return new FlowTransitionResource($transition);
}
```

## Response Examples

### Basic Response

```json
{
    "id": 1,
    "flow_id": 1,
    "from": 1,
    "to": 2,
    "slug": "approve-order",
    "is_start_edge": false,
    "is_end_edge": false,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

### Generic Input Transition

```json
{
    "id": 2,
    "flow_id": 1,
    "from": null,
    "to": 1,
    "slug": "enter-processing",
    "is_start_edge": true,
    "is_end_edge": false,
    // ... other fields
}
```

### Generic Output Transition

```json
{
    "id": 3,
    "flow_id": 1,
    "from": 5,
    "to": null,
    "slug": "cancel-order",
    "is_start_edge": false,
    "is_end_edge": true,
    // ... other fields
}
```

### With Translations

```json
{
    "id": 1,
    "translations": {
        "en": {
            "name": "Approve Order"
        },
        "fa": {
            "name": "تایید سفارش"
        }
    },
    "flow_id": 1,
    "from": 1,
    "to": 2,
    // ... other fields
}
```

### With Relations

```json
{
    "id": 1,
    "flow_id": 1,
    "from": 1,
    "to": 2,
    "flow": {
        "id": 1,
        "subject_type": "App\\Models\\Order",
        // ... FlowResource fields
    },
    "from_state": {
        "id": 1,
        "flow_id": 1,
        "type": "middle",
        "status": "pending",
        // ... FlowStateResource fields
    },
    "to_state": {
        "id": 2,
        "flow_id": 1,
        "type": "middle",
        "status": "approved",
        // ... FlowStateResource fields
    },
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

## Relation Loading

### Eager Loading Relations

```php
// Load all relations
$transition = FlowTransition::with([
    'translations',
    'flow',
    'fromState',
    'toState',
    'tasks',
    'instances',
])->find(1);
```

### Selective Loading

```php
// Load only needed relations
$transition = FlowTransition::with(['fromState', 'toState'])->find(1);
```

### Nested Relations

```php
// Load deeply nested relations
$transition = FlowTransition::with([
    'fromState',
    'toState',
    'tasks.transition',
    'flow.states',
])->find(1);
```

## Transition Types

### Specific Transition

Both `from` and `to` are specified:

```json
{
    "from": 1,
    "to": 2,
    "is_start_edge": false,
    "is_end_edge": false
}
```

### Generic Input Transition

`from` is null, `to` is specified:

```json
{
    "from": null,
    "to": 1,
    "is_start_edge": true,
    "is_end_edge": false
}
```

### Generic Output Transition

`from` is specified, `to` is null:

```json
{
    "from": 5,
    "to": null,
    "is_start_edge": false,
    "is_end_edge": true
}
```

## Best Practices

1. **Load Relations Efficiently**: Only load relations you need
   ```php
   // ✅ Good
   FlowTransition::with(['fromState', 'toState'])->get();
   
   // ❌ Bad
   FlowTransition::with(['flow', 'fromState', 'toState', 'tasks', 'instances'])->get();
   ```

2. **Handle Null States**: from/to can be null for generic transitions
   ```php
   if ($transition->from_state) {
       // Handle source state
   }
   
   if ($transition->to_state) {
       // Handle target state
   }
   ```

3. **Use Type Indicators**: Use is_start_edge and is_end_edge for type detection
   ```php
   if ($transition->is_start_edge) {
       // Generic input transition
   }
   
   if ($transition->is_end_edge) {
       // Generic output transition
   }
   ```

## Related Documentation

- [FlowTransition Service](/packages/laravel-flow/deep-diving/services/flow-transition) - Learn about transition management
- [FlowStateResource](/packages/laravel-flow/deep-diving/resources/flow-state-resource) - State resource
- [FlowTaskResource](/packages/laravel-flow/deep-diving/resources/flow-task-resource) - Task resource

