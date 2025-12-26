---
sidebar_position: 11
sidebar_label: UpdateFlowTransitionRequest
---

# UpdateFlowTransitionRequest

Form request class for validating FlowTransition update data. This request handles partial updates with complex validation including state relationships, transition types, and uniqueness constraints while excluding the current transition.

## Namespace

`JobMetric\Flow\Http\Requests\FlowTransition\UpdateFlowTransitionRequest`

## Overview

The `UpdateFlowTransitionRequest` validates incoming data when updating an existing FlowTransition entity. Unlike `StoreFlowTransitionRequest`, all fields are optional (`sometimes`), allowing partial updates while maintaining data integrity and business rules.

## Key Features

- **Partial Updates**: All fields are optional, allowing selective updates
- **Context-Aware Validation**: Uses `flow_id` and `flow_transition_id` from context
- **Static Rules Method**: Provides `rulesFor()` for programmatic validation
- **Current Record Exclusion**: Uniqueness checks exclude current transition
- **Business Rules**: Enforces START state rules, terminal state rules, etc.

## Validation Rules

### Optional Fields

All fields use `sometimes` rule:

| Field | Rule | Description |
|-------|------|-------------|
| `translation` | `sometimes\|array` | Multi-language translation data |
| `translation.{locale}` | `sometimes\|array` | Translation data for specific locale |
| `translation.{locale}.name` | `required\|string` | Transition name (validated if locale provided) |
| `from` | `sometimes\|nullable\|integer\|exists:flow_states,id` | Source state ID |
| `to` | `sometimes\|nullable\|integer\|exists:flow_states,id` | Target state ID |
| `slug` | `sometimes\|nullable\|string\|max:255\|regex:/^[a-z0-9-]+$/\|unique:flow_transitions,slug` | URL-friendly identifier |

## Cross-Field Validation

The request includes extensive custom validation in `withValidator()`:

### Effective Values

When updating, if a field is not provided, it uses the current value:

```php
// Current transition: from=1, to=2
// Update: from=3 (to not provided)
// Effective: from=3, to=2 (keeps current to)
```

### At Least One Required

After update, at least one of `from` or `to` must be set:

```php
// ✅ Valid
'from' => 1, 'to' => 2,
'from' => null, 'to' => 2,
'from' => 1, 'to' => null,

// ❌ Invalid
'from' => null, 'to' => null,
```

### START State Rules

Same rules as `StoreFlowTransitionRequest`:

1. **Cannot Self-Loop**: START state cannot have self-loop transitions
2. **Cannot Point To**: No transition can point to START state
3. **Only One Exit**: Only one transition can exit from START state
4. **First Transition**: If this is the only transition, from must remain START

### Terminal State Rules

Terminal states cannot have generic output transitions:

```php
// ❌ Invalid if from is terminal state
'from' => $terminalStateId,
'to' => null,
```

### Uniqueness Rules

The combination `(flow_id, from, to)` must be unique, excluding the current transition:

```php
// Current transition: ID=5, from=1, to=2
// Update to: from=3, to=4
// Valid if no other transition has from=3, to=4
// Invalid if another transition (ID≠5) has from=3, to=4
```

## Context Management

The request supports external context injection:

```php
$request = new UpdateFlowTransitionRequest();
$request->setContext([
    'flow_id' => 123,
    'flow_transition_id' => 456,
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
    'from' => 3,
    'to' => 4,
];

$context = [
    'flow_id' => 1,
    'flow_transition_id' => 5,
];

$rules = UpdateFlowTransitionRequest::rulesFor($input, $context);
```

## Usage Examples

### Basic Update

```php
use JobMetric\Flow\Http\Requests\FlowTransition\UpdateFlowTransitionRequest;
use JobMetric\Flow\Facades\FlowTransition;

public function update(UpdateFlowTransitionRequest $request, $id)
{
    $validated = $request->validated();
    
    $transition = FlowTransition::update($id, $validated);
    
    return response()->json($transition);
}
```

### Partial Update - Translation Only

```php
$requestData = [
    'translation' => [
        'en' => [
            'name' => 'Updated Transition Name',
        ],
    ],
];
```

### Partial Update - States Only

```php
$requestData = [
    'from' => 3, // Change source state
    'to' => 4,   // Change target state
];
```

### Update Slug

```php
$requestData = [
    'slug' => 'updated-slug',
];
```

### Change Transition Type

```php
// From specific to generic output
$requestData = [
    'from' => 1,
    'to' => null, // Change to generic output
];
```

### Complete Update

```php
$requestData = [
    'translation' => [
        'en' => ['name' => 'Updated Name'],
    ],
    'from' => 3,
    'to' => 4,
    'slug' => 'updated-slug',
];
```

## Error Handling

### Validation Errors

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "from": [
            "The first transition must start from START state."
        ],
        "to": [
            "Terminal states cannot have generic output transitions."
        ],
        "slug": [
            "The slug has already been taken."
        ]
    }
}
```

## Differences from StoreFlowTransitionRequest

| Feature | StoreFlowTransitionRequest | UpdateFlowTransitionRequest |
|---------|---------------------------|----------------------------|
| Field Rules | `required` for translations | `sometimes` for all fields |
| Context Support | `flow_id` only | `flow_id` and `flow_transition_id` |
| Uniqueness Check | Checks all transitions | Excludes current transition |
| Current Record | Not applicable | Loads and uses current transition |
| Effective Values | Uses input directly | Merges input with current values |
| Flow ID | Required field | Optional (from context) |

## Best Practices

1. **Use Context for Uniqueness**: Always provide `flow_id` and `flow_transition_id` in context
   ```php
   $request->setContext([
       'flow_id' => $flowId,
       'flow_transition_id' => $transitionId,
   ]);
   ```

2. **Update Only Changed Fields**: Only send fields that need updating
   ```php
   // ✅ Good
   ['from' => 3, 'to' => 4]
   
   // ❌ Bad
   ['translation' => [...], 'from' => 3, 'to' => 4, 'slug' => '...']
   ```

3. **Respect Business Rules**: Follow START and terminal state rules
   ```php
   // ✅ Good - Valid transition
   'from' => 2, 'to' => 3,
   
   // ❌ Bad - Violates rules
   'from' => $startId, 'to' => $startId, // START self-loop
   ```

4. **Handle Effective Values**: Consider current values when updating
   ```php
   // Current: from=1, to=2
   // Update: from=3
   // Result: from=3, to=2 (to unchanged)
   ```

## Related Documentation

- [FlowTransition Service](/packages/laravel-flow/deep-diving/services/flow-transition) - Learn about transition management
- [StoreFlowTransitionRequest](/packages/laravel-flow/deep-diving/requests/store-flow-transition-request) - Transition creation validation
- [FlowState Service](/packages/laravel-flow/deep-diving/services/flow-state) - Learn about states

