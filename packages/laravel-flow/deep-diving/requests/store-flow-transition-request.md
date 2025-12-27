---
sidebar_position: 10
sidebar_label: StoreFlowTransitionRequest
---

# StoreFlowTransitionRequest

Form request class for validating FlowTransition creation data. This request handles complex validation including state relationships, transition types, and uniqueness constraints.

## Namespace

`JobMetric\Flow\Http\Requests\FlowTransition\StoreFlowTransitionRequest`

## Overview

The `StoreFlowTransitionRequest` validates incoming data when creating a new FlowTransition entity. It ensures:

- Required fields are present
- Flow ID exists and is valid
- Multi-language translations are valid
- State relationships are valid (from/to states)
- Transition uniqueness within flow
- Business rules are enforced (START state rules, terminal state rules, etc.)

## Validation Rules

### Required Fields

| Field | Rule | Description |
|-------|------|-------------|
| `flow_id` | `required\|integer\|exists:flows,id` | ID of the parent flow |
| `translation` | `required\|array` | Multi-language translation data |
| `translation.{locale}` | `required\|array` | Translation data for each active locale |
| `translation.{locale}.name` | `required\|string` | Transition name in each locale (must be unique within flow) |

### Optional Fields

| Field | Rule | Description |
|-------|------|-------------|
| `from` | `nullable\|integer\|exists:flow_states,id` | Source state ID (nullable for generic input) |
| `to` | `nullable\|integer\|exists:flow_states,id` | Target state ID (nullable for generic output) |
| `slug` | `nullable\|string\|max:255\|regex:/^[a-z0-9-]+$/\|unique:flow_transitions,slug` | URL-friendly identifier |

## Transition Types

The request supports four transition types:

### 1. Specific Transition (from → to)

Both `from` and `to` are specified:

```php
'from' => 1, // State ID
'to' => 2,   // State ID
```

### 2. Self-Loop Transition (from → from)

Same state for both `from` and `to`:

```php
'from' => 1,
'to' => 1, // Same state
```

**Note:** Not allowed for START states.

### 3. Generic Input Transition (null → to)

No source state, can enter from any state:

```php
'from' => null,
'to' => 2,
```

### 4. Generic Output Transition (from → null)

No target state, can exit to any state:

```php
'from' => 1,
'to' => null,
```

**Note:** Not allowed from terminal states.

## Cross-Field Validation

The request includes extensive custom validation in `withValidator()`:

### At Least One Required

At least one of `from` or `to` must be set:

```php
// ✅ Valid
'from' => 1, 'to' => 2,
'from' => null, 'to' => 2,
'from' => 1, 'to' => null,

// ❌ Invalid
'from' => null, 'to' => null,
```

### START State Rules

1. **Cannot Self-Loop**: START state cannot have self-loop transitions
   ```php
   // ❌ Invalid if from is START state
   'from' => $startId,
   'to' => $startId,
   ```

2. **Cannot Point To**: No transition can point to START state
   ```php
   // ❌ Invalid
   'to' => $startId,
   ```

3. **Only One Exit**: Only one transition can exit from START state
   ```php
   // If START already has a transition, cannot create another
   ```

4. **First Transition**: First transition in flow must start from START
   ```php
   // If this is the first transition, from must be START
   ```

### Terminal State Rules

Terminal states cannot have generic output transitions:

```php
// ❌ Invalid if from is terminal state
'from' => $terminalStateId,
'to' => null,
```

### Uniqueness Rules

The combination `(flow_id, from, to)` must be unique:

```php
// ❌ Invalid - Duplicate transition
// If flow 1 already has: from=1, to=2
// Cannot create another: from=1, to=2
```

## Translation Validation

### Name Uniqueness

The `translation.{locale}.name` field is validated for uniqueness within the same flow:

- Checks if a transition with the same name already exists in the same flow and locale
- Prevents duplicate transition names within a flow
- Trims whitespace before validation

## Usage Examples

### Specific Transition

```php
$requestData = [
    'flow_id' => 1,
    'translation' => [
        'en' => ['name' => 'Approve Order'],
    ],
    'from' => 1, // Pending state
    'to' => 2,   // Approved state
];
```

### Generic Input Transition

```php
$requestData = [
    'flow_id' => 1,
    'translation' => [
        'en' => ['name' => 'Enter Processing'],
    ],
    'from' => null, // Can enter from any state
    'to' => 3,      // Processing state
];
```

### Generic Output Transition

```php
$requestData = [
    'flow_id' => 1,
    'translation' => [
        'en' => ['name' => 'Cancel Order'],
    ],
    'from' => 1,     // Pending state
    'to' => null,    // Can exit to any state
];
```

### Self-Loop Transition

```php
$requestData = [
    'flow_id' => 1,
    'translation' => [
        'en' => ['name' => 'Refresh Status'],
    ],
    'from' => 2, // Processing state
    'to' => 2,   // Same state (self-loop)
];
```

### With Slug

```php
$requestData = [
    'flow_id' => 1,
    'translation' => [
        'en' => ['name' => 'Approve Order'],
    ],
    'from' => 1,
    'to' => 2,
    'slug' => 'approve-order', // URL-friendly identifier
];
```

## Context Management

The request supports external context injection:

```php
$request = new StoreFlowTransitionRequest();
$request->setContext(['flow_id' => 123]);
```

## Static Rules Method

### rulesFor()

Provides programmatic validation:

```php
$input = [
    'flow_id' => 1,
    'translation' => [
        'en' => ['name' => 'Transition'],
    ],
    'from' => 1,
    'to' => 2,
];

$context = ['flow_id' => 1];

$rules = StoreFlowTransitionRequest::rulesFor($input, $context);
```

## Error Handling

### Validation Errors

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "flow_id": [
            "The selected flow id is invalid."
        ],
        "from": [
            "The first transition must start from START state."
        ],
        "to": [
            "Terminal states cannot have generic output transitions."
        ]
    }
}
```

## Best Practices

1. **Understand Transition Types**: Choose the right type for your use case
   ```php
   // Specific: Most common, explicit state changes
   'from' => 1, 'to' => 2,
   
   // Generic Input: Flexible entry point
   'from' => null, 'to' => 2,
   
   // Generic Output: Flexible exit point
   'from' => 1, 'to' => null,
   ```

2. **Follow START State Rules**: Always start from START state for first transition
   ```php
   // ✅ Good - First transition
   'from' => $startStateId, 'to' => 2,
   ```

3. **Use Meaningful Slugs**: Create URL-friendly slugs for API access
   ```php
   // ✅ Good
   'slug' => 'approve-order'
   
   // ❌ Bad
   'slug' => 'transition_1'
   ```

4. **Respect Terminal States**: Don't create generic outputs from terminal states
   ```php
   // ❌ Invalid
   'from' => $terminalStateId, 'to' => null,
   ```

## Related Documentation

- [FlowTransition Service](/packages/laravel-flow/deep-diving/services/flow-transition) - Transition management
- [UpdateFlowTransitionRequest](/packages/laravel-flow/deep-diving/requests/update-flow-transition-request) - Transition update validation
- [FlowTransitionResource](/packages/laravel-flow/deep-diving/resources/flow-transition-resource) - Transition JSON resource
- [FlowState Service](/packages/laravel-flow/deep-diving/services/flow-state) - State management
- [Events](/packages/laravel-flow/deep-diving/events) - Transition lifecycle events

