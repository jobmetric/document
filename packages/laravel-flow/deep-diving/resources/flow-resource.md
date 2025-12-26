---
sidebar_position: 1
sidebar_label: FlowResource
---

# FlowResource

JSON resource class for transforming Flow models into structured API responses. This resource provides a consistent format for flow data with conditional relation loading.

## Namespace

`JobMetric\Flow\Http\Resources\FlowResource`

## Overview

The `FlowResource` transforms Flow model instances into structured JSON responses. It includes:

- Core flow properties
- Multi-language translations
- ISO 8601 formatted timestamps
- Conditional relation loading
- Nested resource transformations

## Base Properties

The resource always includes these properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | Flow ID |
| `subject_type` | `string` | Model class name that uses this flow |
| `subject_scope` | `string\|null` | Optional scope identifier |
| `subject_collection` | `string\|null` | Optional collection identifier |
| `version` | `int` | Flow version number |
| `is_default` | `bool` | Whether this is the default flow |
| `status` | `bool` | Active/inactive status |
| `channel` | `string\|null` | Channel identifier |
| `ordering` | `int` | Display order |
| `rollout_pct` | `int\|null` | Rollout percentage (0-100) |
| `environment` | `string\|null` | Environment identifier |
| `active_from` | `string\|null` | ISO 8601 formatted start date |
| `active_to` | `string\|null` | ISO 8601 formatted end date |
| `deleted_at` | `string\|null` | ISO 8601 formatted deletion date |
| `created_at` | `string` | ISO 8601 formatted creation date |
| `updated_at` | `string` | ISO 8601 formatted update date |

## Conditional Properties

These properties are only included when their relations are loaded:

| Property | Relation | Type | Description |
|----------|----------|------|-------------|
| `translations` | `translations` | `object` | Multi-language translations |
| `states` | `states` | `array` | Collection of FlowStateResource |
| `transitions` | `transitions` | `array` | Collection of FlowTransitionResource |
| `tasks` | `tasks` | `array` | Collection of FlowTaskResource |
| `flow_instances` | `flowInstances` | `array` | Collection of FlowInstanceResource |
| `uses` | `uses` | `array` | Collection of FlowUseResource |
| `start_state` | `startState` | `object\|null` | FlowStateResource for START state |
| `end_state` | `endState` | `object\|null` | FlowStateResource for END state |

## Usage Examples

### Basic Usage

```php
use JobMetric\Flow\Http\Resources\FlowResource;
use JobMetric\Flow\Models\Flow;

$flow = Flow::find(1);

return FlowResource::make($flow);
```

### With Relations

```php
$flow = Flow::with([
    'states',
    'transitions',
    'startState',
    'endState',
])->find(1);

return FlowResource::make($flow);
```

### In Collections

```php
$flows = Flow::with('states')->get();

return FlowResource::collection($flows);
```

### In API Responses

```php
use JobMetric\Flow\Facades\Flow;

public function show($id)
{
    $flow = Flow::query()
        ->with(['states', 'transitions', 'startState'])
        ->findOrFail($id);

    return new FlowResource($flow);
}
```

## Response Examples

### Basic Response

```json
{
    "id": 1,
    "subject_type": "App\\Models\\Order",
    "subject_scope": null,
    "subject_collection": null,
    "version": 1,
    "is_default": true,
    "status": true,
    "channel": "web",
    "ordering": 0,
    "rollout_pct": 100,
    "environment": "production",
    "active_from": "2024-01-01T00:00:00.000000Z",
    "active_to": "2024-12-31T23:59:59.000000Z",
    "deleted_at": null,
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
            "name": "Order Processing Workflow",
            "description": "Handles order processing"
        },
        "fa": {
            "name": "گردش کار پردازش سفارش",
            "description": "پردازش سفارش"
        }
    },
    "subject_type": "App\\Models\\Order",
    // ... other fields
}
```

### With Relations

```json
{
    "id": 1,
    "subject_type": "App\\Models\\Order",
    "states": [
        {
            "id": 1,
            "flow_id": 1,
            "type": "start",
            "status": null,
            // ... FlowStateResource fields
        }
    ],
    "transitions": [
        {
            "id": 1,
            "flow_id": 1,
            "from": 1,
            "to": 2,
            // ... FlowTransitionResource fields
        }
    ],
    "start_state": {
        "id": 1,
        "flow_id": 1,
        "type": "start",
        // ... FlowStateResource fields
    },
    "end_state": {
        "id": 5,
        "flow_id": 1,
        "type": "middle",
        "is_end": true,
        // ... FlowStateResource fields
    }
}
```

## Relation Loading

### Eager Loading Relations

```php
// Load all relations
$flow = Flow::with([
    'translations',
    'states',
    'transitions',
    'tasks',
    'flowInstances',
    'uses',
    'startState',
    'endState',
])->find(1);
```

### Selective Loading

```php
// Load only needed relations
$flow = Flow::with(['states', 'transitions'])->find(1);
```

### Nested Relations

```php
// Load nested relations
$flow = Flow::with([
    'states',
    'transitions.tasks',
    'transitions.fromState',
    'transitions.toState',
])->find(1);
```

## Timestamp Format

All timestamps are formatted as ISO 8601 strings:

```php
// Database: 2024-01-01 00:00:00
// Resource: "2024-01-01T00:00:00.000000Z"
```

This ensures interoperability across different clients and timezones.

## Best Practices

1. **Load Relations Efficiently**: Only load relations you need
   ```php
   // ✅ Good - Load only needed
   Flow::with(['states', 'transitions'])->get();
   
   // ❌ Bad - Load everything
   Flow::with(['states', 'transitions', 'tasks', 'flowInstances', 'uses'])->get();
   ```

2. **Use Resource Collections**: Use collection for multiple items
   ```php
   // ✅ Good
   FlowResource::collection($flows);
   
   // ❌ Bad
   foreach ($flows as $flow) {
       new FlowResource($flow);
   }
   ```

3. **Handle Null Values**: Timestamps can be null
   ```php
   // active_from, active_to, deleted_at can be null
   if ($flow->active_from) {
       // Handle active window
   }
   ```

## Related Documentation

- [Flow Service](/packages/laravel-flow/deep-diving/services/flow) - Learn about flow management
- [FlowStateResource](/packages/laravel-flow/deep-diving/resources/flow-state-resource) - State resource
- [FlowTransitionResource](/packages/laravel-flow/deep-diving/resources/flow-transition-resource) - Transition resource

