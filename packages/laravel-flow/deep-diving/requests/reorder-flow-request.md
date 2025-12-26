---
sidebar_position: 3
sidebar_label: ReorderFlowRequest
---

# ReorderFlowRequest

Form request class for validating flow reordering operations. This request ensures that flow IDs are provided in the desired order for reordering flows.

## Namespace

`JobMetric\Flow\Http\Requests\Flow\ReorderFlowRequest`

## Overview

The `ReorderFlowRequest` validates the input when reordering flows. It ensures that an array of flow IDs is provided in the desired display order.

## Validation Rules

| Field | Rule | Description |
|-------|------|-------------|
| `ordered_ids` | `required\|array\|min:1` | Array of flow IDs in desired order |
| `ordered_ids.*` | `integer` | Each element must be an integer (flow ID) |

## Usage Examples

### Basic Reordering

```php
use JobMetric\Flow\Http\Requests\Flow\ReorderFlowRequest;
use JobMetric\Flow\Facades\Flow;

public function reorder(ReorderFlowRequest $request)
{
    $validated = $request->validated();
    
    // Reorder flows based on ordered_ids
    Flow::reorder($validated['ordered_ids']);
    
    return response()->json(['message' => 'Flows reordered successfully']);
}
```

### Request Data Format

```php
$requestData = [
    'ordered_ids' => [3, 1, 5, 2, 4], // Flow IDs in desired order
];
```

### Complete Example

```php
// POST /api/flows/reorder
{
    "ordered_ids": [10, 5, 8, 3, 1]
}

// This will reorder flows so that:
// - Flow ID 10 appears first
// - Flow ID 5 appears second
// - Flow ID 8 appears third
// - etc.
```

## Integration with Flow Service

The request is typically used with the `Flow::reorder()` method:

```php
use JobMetric\Flow\Facades\Flow;

public function reorder(ReorderFlowRequest $request)
{
    $orderedIds = $request->validated()['ordered_ids'];
    
    Flow::reorder($orderedIds);
    
    return response()->json([
        'message' => 'Flows reordered successfully'
    ]);
}
```

## Error Handling

### Validation Errors

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "ordered_ids": [
            "The ordered ids field is required."
        ],
        "ordered_ids.0": [
            "The ordered ids.0 must be an integer."
        ]
    }
}
```

## Best Practices

1. **Include All Flow IDs**: When reordering, include all flow IDs that should be reordered
   ```php
   // ✅ Good - All flows included
   'ordered_ids' => [1, 2, 3, 4, 5]
   
   // ⚠️ Warning - Some flows might be excluded
   'ordered_ids' => [1, 3, 5]
   ```

2. **Validate Flow Existence**: Consider validating that all IDs exist before reordering
   ```php
   $existingIds = Flow::whereIn('id', $orderedIds)->pluck('id')->toArray();
   if (count($existingIds) !== count($orderedIds)) {
       // Handle missing flows
   }
   ```

## Related Documentation

- [Flow Service](/packages/laravel-flow/deep-diving/services/flow) - Flow management and reordering
- [FlowResource](/packages/laravel-flow/deep-diving/resources/flow-resource) - Flow JSON resource

