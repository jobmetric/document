---
sidebar_position: 5
sidebar_label: FlowInstanceResource
---

# FlowInstanceResource

JSON resource class for transforming FlowInstance models into structured API responses. This resource provides a consistent format for flow instance data with conditional relation loading.

## Namespace

`JobMetric\Flow\Http\Resources\FlowInstanceResource`

## Overview

The `FlowInstanceResource` transforms FlowInstance model instances into structured JSON responses. It includes:

- Core instance properties
- Instanceable and actor information
- Transition and state information
- Active status and duration
- ISO 8601 formatted timestamps
- Conditional relation loading

## Base Properties

The resource always includes these properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | Instance ID |
| `instanceable_type` | `string` | Model class name of the instanceable entity |
| `instanceable_id` | `int` | ID of the instanceable entity |
| `flow_transition_id` | `int` | Transition ID that created this instance |
| `actor_type` | `string\|null` | Model class name of the actor |
| `actor_id` | `int\|null` | ID of the actor |
| `started_at` | `string` | ISO 8601 formatted start date |
| `completed_at` | `string\|null` | ISO 8601 formatted completion date |
| `is_active` | `bool` | Whether the instance is currently active |
| `duration_seconds` | `int\|null` | Duration in seconds (if completed) |

## Conditional Properties

These properties are only included when their relations are loaded:

| Property | Relation | Type | Description |
|----------|----------|------|-------------|
| `flow` | `transition.flow` | `object` | FlowResource (requires transition and flow loaded) |
| `current_state` | `transition.toState\|fromState` | `object\|null` | FlowStateResource for current state |
| `current_status` | `transition.toState\|fromState` | `string\|null` | Current status value |
| `instanceable` | `instanceable` | `mixed` | Instanceable entity resource or default context |
| `actor` | `actor` | `mixed` | Actor entity resource or default context |
| `transition` | `transition` | `object` | FlowTransitionResource for the transition |

## Active Status Detection

The `is_active` property is determined by:

```php
'is_active' => (bool)(is_null($this->completed_at))
```

If `completed_at` is null, the instance is active.

## Duration Calculation

The `duration_seconds` property is calculated when the instance is completed:

```php
'duration_seconds' => $this->duration_seconds ?? null
```

This is typically calculated as the difference between `started_at` and `completed_at`.

## Current State Detection

The `current_state` and `current_status` properties require:

1. `transition` relation loaded
2. Either `transition.toState` or `transition.fromState` loaded

The resource uses `toState` if available, otherwise falls back to `fromState`:

```php
$currentState = $this->transition->toState ?? $this->transition->fromState;
```

## Usage Examples

### Basic Usage

```php
use JobMetric\Flow\Http\Resources\FlowInstanceResource;
use JobMetric\Flow\Models\FlowInstance;

$instance = FlowInstance::find(1);

return FlowInstanceResource::make($instance);
```

### With Relations

```php
$instance = FlowInstance::with([
    'instanceable',
    'actor',
    'transition',
    'transition.flow',
    'transition.toState',
    'transition.fromState',
])->find(1);

return FlowInstanceResource::make($instance);
```

### In Collections

```php
$instances = FlowInstance::with(['transition', 'instanceable'])->get();

return FlowInstanceResource::collection($instances);
```

### In API Responses

```php
public function show($id)
{
    $instance = FlowInstance::query()
        ->with([
            'instanceable',
            'actor',
            'transition.flow',
            'transition.toState',
        ])
        ->findOrFail($id);

    return new FlowInstanceResource($instance);
}
```

## Response Examples

### Basic Response

```json
{
    "id": 1,
    "instanceable_type": "App\\Models\\Order",
    "instanceable_id": 123,
    "flow_transition_id": 1,
    "actor_type": "App\\Models\\User",
    "actor_id": 5,
    "started_at": "2024-01-01T00:00:00.000000Z",
    "completed_at": null,
    "is_active": true,
    "duration_seconds": null
}
```

### Completed Instance

```json
{
    "id": 1,
    "instanceable_type": "App\\Models\\Order",
    "instanceable_id": 123,
    "flow_transition_id": 1,
    "actor_type": "App\\Models\\User",
    "actor_id": 5,
    "started_at": "2024-01-01T00:00:00.000000Z",
    "completed_at": "2024-01-01T01:30:00.000000Z",
    "is_active": false,
    "duration_seconds": 5400
}
```

### With Relations

```json
{
    "id": 1,
    "instanceable_type": "App\\Models\\Order",
    "instanceable_id": 123,
    "flow_transition_id": 1,
    "actor_type": "App\\Models\\User",
    "actor_id": 5,
    "started_at": "2024-01-01T00:00:00.000000Z",
    "completed_at": null,
    "is_active": true,
    "duration_seconds": null,
    "flow": {
        "id": 1,
        "subject_type": "App\\Models\\Order",
        // ... FlowResource fields
    },
    "current_state": {
        "id": 2,
        "flow_id": 1,
        "type": "middle",
        "status": "processing",
        // ... FlowStateResource fields
    },
    "current_status": "processing",
    "instanceable": {
        "id": 123,
        "order_number": "ORD-001",
        // ... Order resource fields
    },
    "actor": {
        "id": 5,
        "name": "John Doe",
        // ... User resource fields
    },
    "transition": {
        "id": 1,
        "flow_id": 1,
        "from": 1,
        "to": 2,
        // ... FlowTransitionResource fields
    }
}
```

## Relation Loading

### Eager Loading Relations

```php
// Load all relations
$instance = FlowInstance::with([
    'instanceable',
    'actor',
    'transition',
    'transition.flow',
    'transition.toState',
    'transition.fromState',
])->find(1);
```

### Selective Loading

```php
// Load only needed relations
$instance = FlowInstance::with([
    'transition',
    'transition.toState',
])->find(1);
```

### Nested Relations

```php
// Load deeply nested relations
$instance = FlowInstance::with([
    'instanceable',
    'actor',
    'transition.flow.states',
    'transition.toState',
])->find(1);
```

## Morph Relations

The `instanceable` and `actor` properties use morph relations. The resource will:

1. Use `instanceable_resource` or `actor_resource` if available
2. Otherwise, use `resource_morph_default_context`

This allows custom resource transformation for different morph types.

## Best Practices

1. **Load Relations Efficiently**: Only load relations you need
   ```php
   // ✅ Good
   FlowInstance::with(['transition', 'transition.toState'])->get();
   
   // ❌ Bad
   FlowInstance::with(['instanceable', 'actor', 'transition', 'transition.flow', 'transition.toState'])->get();
   ```

2. **Handle Active Status**: Check is_active for active instances
   ```php
   if ($instance->is_active) {
       // Instance is still running
   }
   ```

3. **Calculate Duration**: Use duration_seconds for completed instances
   ```php
   if ($instance->duration_seconds) {
       $hours = $instance->duration_seconds / 3600;
   }
   ```

4. **Load Current State**: Load toState or fromState for current state
   ```php
   $instance = FlowInstance::with('transition.toState')->find(1);
   // current_state and current_status will be available
   ```

## Related Documentation

- [FlowTransitionResource](/packages/laravel-flow/deep-diving/resources/flow-transition-resource) - Transition resource
- [FlowStateResource](/packages/laravel-flow/deep-diving/resources/flow-state-resource) - State resource
- [FlowResource](/packages/laravel-flow/deep-diving/resources/flow-resource) - Flow resource
- [FlowTransition Service](/packages/laravel-flow/deep-diving/services/flow-transition) - Transition execution
- [HasWorkflow](/packages/laravel-flow/deep-diving/has-workflow) - Workflow integration
- [HasFlow](/packages/laravel-flow/deep-diving/has-flow) - Simple flow binding

