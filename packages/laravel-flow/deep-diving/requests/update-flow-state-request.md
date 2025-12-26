---
sidebar_position: 7
sidebar_label: UpdateFlowStateRequest
---

# UpdateFlowStateRequest

Form request class for validating FlowState update data. This request handles partial updates with context-aware validation, ensuring translation uniqueness while allowing selective field updates.

## Namespace

`JobMetric\Flow\Http\Requests\FlowState\UpdateFlowStateRequest`

## Overview

The `UpdateFlowStateRequest` validates incoming data when updating an existing FlowState entity. Unlike `StoreFlowStateRequest`, all fields are optional (`sometimes`), allowing partial updates while maintaining data integrity.

## Key Features

- **Partial Updates**: All fields are optional, allowing selective updates
- **Context-Aware Validation**: Uses `flow_id` and `state_id` from context
- **Static Rules Method**: Provides `rulesFor()` for programmatic validation
- **Status Validation**: Validates status against flow's driver
- **Translation Uniqueness**: Validates translation names excluding current state

## Validation Rules

### Optional Fields

All fields use `sometimes` rule:

| Field | Rule | Description |
|-------|------|-------------|
| `translation` | `sometimes\|array` | Multi-language translation data |
| `translation.{locale}` | `sometimes\|array` | Translation data for specific locale |
| `translation.{locale}.name` | `required\|string` | State name (validated if locale provided) |
| `status` | `sometimes\|nullable\|CheckStatusInDriverRule` | Status value (validated against flow's driver) |
| `config` | `sometimes\|array` | Custom configuration array |
| `color` | `sometimes\|nullable\|hex_color` | Hex color code |
| `icon` | `sometimes\|nullable\|string` | Icon identifier |
| `position` | `sometimes\|array\|required_array_keys:x,y` | Position coordinates |
| `position.x` | `numeric` | X coordinate |
| `position.y` | `numeric` | Y coordinate |
| `is_terminal` | `sometimes\|boolean` | Terminal state flag |
| `translation.{locale}.description` | `nullable\|string` | Optional description |

## Context Management

The request supports external context injection:

```php
$request = new UpdateFlowStateRequest();
$request->setContext([
    'flow_id' => 123,
    'state_id' => 456,
]);
```

## Static Rules Method

### rulesFor()

Provides programmatic validation:

```php
$input = [
    'translation' => [
        'en' => ['name' => 'Updated Name'],
    ],
    'status' => 'completed',
];

$context = [
    'flow_id' => 1,
    'state_id' => 5,
];

$rules = UpdateFlowStateRequest::rulesFor($input, $context);
```

## Status Validation

The `status` field uses `CheckStatusInDriverRule` to validate against the flow's driver:

```php
// If flow uses OrderStatus enum
'status' => 'completed', // ✅ Valid if in enum
'status' => 'invalid',   // ❌ Invalid if not in enum
```

## Usage Examples

### Basic Update

```php
use JobMetric\Flow\Http\Requests\FlowState\UpdateFlowStateRequest;
use JobMetric\Flow\Facades\FlowState;

public function update(UpdateFlowStateRequest $request, $id)
{
    $validated = $request->validated();
    
    $state = FlowState::update($id, $validated);
    
    return response()->json($state);
}
```

### Partial Update - Status Only

```php
$requestData = [
    'status' => 'completed',
];
```

### Partial Update - Translation Only

```php
$requestData = [
    'translation' => [
        'en' => [
            'name' => 'Updated State Name',
            'description' => 'New description',
        ],
    ],
];
```

### Update Visual Configuration

```php
$requestData = [
    'color' => '#10B981',
    'icon' => 'fas fa-check-circle',
    'position' => [
        'x' => 300,
        'y' => 400,
    ],
];
```

### Update Multiple Fields

```php
$requestData = [
    'translation' => [
        'en' => ['name' => 'Updated Name'],
    ],
    'status' => 'completed',
    'is_terminal' => true,
    'color' => '#10B981',
];
```

## Error Handling

### Validation Errors

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "translation.en.name": [
            "A state with this name already exists in this flow."
        ],
        "status": [
            "The status value is not valid for this flow's driver."
        ]
    }
}
```

## Differences from StoreFlowStateRequest

| Feature | StoreFlowStateRequest | UpdateFlowStateRequest |
|---------|----------------------|----------------------|
| Field Rules | `required` for translations | `sometimes` for all fields |
| Context Support | `flow_id` only | `flow_id` and `state_id` |
| Static Method | `normalize()` and `rulesFor()` | `rulesFor()` only |
| Uniqueness Check | Checks all states in flow | Excludes current state |
| Flow ID | Required field | Optional (from context) |

## Best Practices

1. **Use Context for Uniqueness**: Always provide `flow_id` and `state_id` in context
   ```php
   $request->setContext([
       'flow_id' => $flowId,
       'state_id' => $stateId,
   ]);
   ```

2. **Validate Only Changed Fields**: Only send fields that need updating
   ```php
   // ✅ Good
   ['status' => 'completed']
   
   // ❌ Bad
   ['translation' => [...], 'status' => 'completed', 'color' => '#...', ...]
   ```

3. **Handle Status Changes Carefully**: Ensure status is valid for flow's driver
   ```php
   // ✅ Good - Validate first
   $validStatuses = OrderStatus::values();
   if (in_array($newStatus, $validStatuses)) {
       'status' => $newStatus,
   }
   ```

## Related Documentation

- [FlowState Service](/packages/laravel-flow/deep-diving/services/flow-state) - Learn about state management
- [StoreFlowStateRequest](/packages/laravel-flow/deep-diving/requests/store-flow-state-request) - State creation validation
- [CheckStatusInDriverRule](/packages/laravel-flow/deep-diving/rules/check-status-in-driver-rule) - Status validation rule

