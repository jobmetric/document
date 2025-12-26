---
sidebar_position: 6
sidebar_label: FlowUseResource
---

# FlowUseResource

JSON resource class for transforming FlowUse models into structured API responses. This resource provides a consistent format for flow usage tracking data with conditional relation loading.

## Namespace

`JobMetric\Flow\Http\Resources\FlowUseResource`

## Overview

The `FlowUseResource` transforms FlowUse model instances into structured JSON responses. It includes:

- Core usage properties
- Flow information
- Flowable entity information
- ISO 8601 formatted timestamps
- Conditional relation loading

## Base Properties

The resource always includes these properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | FlowUse ID |
| `flow_id` | `int` | Flow ID that was used |
| `flowable_type` | `string` | Model class name of the entity that used the flow |
| `flowable_id` | `int` | ID of the entity that used the flow |
| `used_at` | `string` | ISO 8601 formatted usage date |

## Conditional Properties

These properties are only included when their relations are loaded:

| Property | Relation | Type | Description |
|----------|----------|------|-------------|
| `flow` | `flow` | `object` | FlowResource for the flow that was used |
| `flowable` | `flowable` | `mixed` | Flowable entity resource or default context |

## Usage Examples

### Basic Usage

```php
use JobMetric\Flow\Http\Resources\FlowUseResource;
use JobMetric\Flow\Models\FlowUse;

$flowUse = FlowUse::find(1);

return FlowUseResource::make($flowUse);
```

### With Relations

```php
$flowUse = FlowUse::with([
    'flow',
    'flowable',
])->find(1);

return FlowUseResource::make($flowUse);
```

### In Collections

```php
$flowUses = FlowUse::with('flow')->get();

return FlowUseResource::collection($flowUses);
```

### In API Responses

```php
public function show($id)
{
    $flowUse = FlowUse::query()
        ->with(['flow', 'flowable'])
        ->findOrFail($id);

    return new FlowUseResource($flowUse);
}
```

## Response Examples

### Basic Response

```json
{
    "id": 1,
    "flow_id": 1,
    "flowable_type": "App\\Models\\Order",
    "flowable_id": 123,
    "used_at": "2024-01-01T00:00:00.000000Z"
}
```

### With Relations

```json
{
    "id": 1,
    "flow_id": 1,
    "flowable_type": "App\\Models\\Order",
    "flowable_id": 123,
    "used_at": "2024-01-01T00:00:00.000000Z",
    "flow": {
        "id": 1,
        "subject_type": "App\\Models\\Order",
        "version": 1,
        "is_default": true,
        // ... FlowResource fields
    },
    "flowable": {
        "id": 123,
        "order_number": "ORD-001",
        "status": "processing",
        // ... Order resource fields
    }
}
```

## Relation Loading

### Eager Loading Relations

```php
// Load all relations
$flowUse = FlowUse::with([
    'flow',
    'flowable',
])->find(1);
```

### Selective Loading

```php
// Load only flow
$flowUse = FlowUse::with('flow')->find(1);
```

### Nested Relations

```php
// Load nested relations
$flowUse = FlowUse::with([
    'flow.states',
    'flowable',
])->find(1);
```

## Morph Relations

The `flowable` property uses a morph relation. The resource will:

1. Use `flowable_resource` if available
2. Otherwise, use `resource_morph_default_context`

This allows custom resource transformation for different morph types.

## Use Cases

### Tracking Flow Usage

Track which entities have used which flows:

```php
// Get all flows used by an order
$flowUses = FlowUse::where('flowable_type', Order::class)
    ->where('flowable_id', $orderId)
    ->with('flow')
    ->get();

return FlowUseResource::collection($flowUses);
```

### Flow Analytics

Analyze flow usage patterns:

```php
// Get all uses of a specific flow
$flowUses = FlowUse::where('flow_id', $flowId)
    ->with('flowable')
    ->get();

return FlowUseResource::collection($flowUses);
```

### Usage History

Track usage history for entities:

```php
// Get usage history for an order
$history = FlowUse::where('flowable_type', Order::class)
    ->where('flowable_id', $orderId)
    ->with(['flow', 'flowable'])
    ->orderBy('used_at', 'desc')
    ->get();

return FlowUseResource::collection($history);
```

## Best Practices

1. **Load Relations When Needed**: Only load relations you need
   ```php
   // ✅ Good
   FlowUse::with('flow')->get();
   
   // ❌ Bad - Load unnecessary relations
   FlowUse::with(['flow', 'flow.states', 'flow.transitions', 'flowable'])->get();
   ```

2. **Handle Morph Types**: Flowable type can vary
   ```php
   if ($flowUse->flowable_type === Order::class) {
       // Handle order-specific logic
   }
   ```

3. **Use for Analytics**: Track flow usage for analytics
   ```php
   $usageCount = FlowUse::where('flow_id', $flowId)
       ->where('used_at', '>=', now()->subDays(30))
       ->count();
   ```

## Related Documentation

- [FlowResource](/packages/laravel-flow/deep-diving/resources/flow-resource) - Flow resource
- [Flow Service](/packages/laravel-flow/deep-diving/services/flow) - Flow management
- [HasWorkflow](/packages/laravel-flow/deep-diving/has-workflow) - Workflow integration
- [HasFlow](/packages/laravel-flow/deep-diving/has-flow) - Simple flow binding

