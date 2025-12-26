---
sidebar_position: 6
sidebar_label: StoreFlowStateRequest
---

# StoreFlowStateRequest

Form request class for validating FlowState creation data. This request handles validation for creating new workflow states with multi-language support, status validation, and visual configuration.

## Namespace

`JobMetric\Flow\Http\Requests\FlowState\StoreFlowStateRequest`

## Overview

The `StoreFlowStateRequest` validates incoming data when creating a new FlowState entity. It ensures:

- Required fields are present
- Flow ID exists and is valid
- Multi-language translations are valid
- Status value is valid for the flow's driver
- Visual configuration (color, icon, position) is correct
- Translation uniqueness within the flow

## Validation Rules

### Required Fields

| Field | Rule | Description |
|-------|------|-------------|
| `flow_id` | `required\|integer\|exists:flows,id` | ID of the parent flow |
| `translation` | `required\|array` | Multi-language translation data |
| `translation.{locale}` | `required\|array` | Translation data for each active locale |
| `translation.{locale}.name` | `required\|string` | State name in each locale (must be unique within flow) |

### Optional Fields

| Field | Rule | Description |
|-------|------|-------------|
| `status` | `present\|nullable\|CheckStatusInDriverRule` | Status value (validated against flow's driver) |
| `config` | `sometimes\|array` | Custom configuration array |
| `color` | `sometimes\|nullable\|hex_color` | Hex color code for visualization |
| `icon` | `sometimes\|nullable\|string` | Icon identifier |
| `position` | `sometimes\|array\|required_array_keys:x,y` | Position coordinates |
| `position.x` | `numeric` | X coordinate |
| `position.y` | `numeric` | Y coordinate |
| `is_terminal` | `sometimes\|boolean` | Whether this is a terminal/end state |
| `translation.{locale}.description` | `nullable\|string` | Optional description in each locale |

## Normalization

The request includes a static `normalize()` method that applies default values:

```php
$normalized = StoreFlowStateRequest::normalize($data, ['flow_id' => 1]);

// Applies defaults:
// - is_terminal: false (if not provided)
// - config: [] (if not provided or invalid)
// - color: Based on is_terminal (end/middle state default)
// - icon: Based on is_terminal (end/middle state default)
// - position: Based on is_terminal (end/middle state default)
```

## Status Validation

The `status` field uses `CheckStatusInDriverRule` to validate that the status value is valid for the flow's driver:

```php
// If flow uses OrderStatus enum
// Valid status values are checked against enum values
'status' => 'pending', // ✅ Valid if OrderStatus::PENDING exists
'status' => 'invalid', // ❌ Invalid if not in enum
```

## Translation Validation

### Name Uniqueness

The `translation.{locale}.name` field is validated for uniqueness within the same flow:

- Checks if a state with the same name already exists in the same flow and locale
- Prevents duplicate state names within a flow
- Trims whitespace before validation

## Usage Examples

### Basic State Creation

```php
use JobMetric\Flow\Http\Requests\FlowState\StoreFlowStateRequest;
use JobMetric\Flow\Facades\FlowState;

public function store(StoreFlowStateRequest $request)
{
    $validated = $request->validated();
    
    $state = FlowState::store($validated['flow_id'], $validated);
    
    return response()->json($state, 201);
}
```

### Complete Request Data

```php
$requestData = [
    'flow_id' => 1,
    'translation' => [
        'en' => [
            'name' => 'Pending Review',
            'description' => 'Order is pending review',
        ],
        'fa' => [
            'name' => 'در انتظار بررسی',
            'description' => 'سفارش در انتظار بررسی است',
        ],
    ],
    'status' => 'pending',
    'is_terminal' => false,
    'color' => '#3B82F6',
    'icon' => 'fas fa-clock',
    'position' => [
        'x' => 100,
        'y' => 200,
    ],
    'config' => [
        'notify_user' => true,
        'auto_advance' => false,
    ],
];
```

### Minimal Request Data

```php
$requestData = [
    'flow_id' => 1,
    'translation' => [
        'en' => ['name' => 'Processing'],
    ],
];
```

### Terminal State

```php
$requestData = [
    'flow_id' => 1,
    'translation' => [
        'en' => ['name' => 'Completed'],
    ],
    'is_terminal' => true,
    'status' => 'completed',
];
```

### With Status Validation

```php
// If flow uses OrderStatus enum with values: pending, processing, completed
$requestData = [
    'flow_id' => 1,
    'translation' => [
        'en' => ['name' => 'Processing'],
    ],
    'status' => 'processing', // ✅ Valid
    // 'status' => 'invalid', // ❌ Invalid
];
```

## Context Management

The request supports external context injection via `setContext()`:

```php
$request = new StoreFlowStateRequest();
$request->setContext(['flow_id' => 123]);
```

This allows validation to use the flow_id from context if not provided in input.

## Static Methods

### normalize()

Normalizes input data with safe defaults:

```php
$data = [
    'flow_id' => 1,
    'translation' => ['en' => ['name' => 'State']],
    'is_terminal' => true,
];

$context = ['flow_id' => 1];

$normalized = StoreFlowStateRequest::normalize($data, $context);

// Returns:
// [
//     'flow_id' => 1,
//     'translation' => [...],
//     'is_terminal' => true,
//     'config' => [],
//     'color' => config('workflow.state.end.color'),
//     'icon' => config('workflow.state.end.icon'),
//     'position' => ['x' => ..., 'y' => ...],
// ]
```

### rulesFor()

Provides programmatic validation:

```php
$input = [
    'flow_id' => 1,
    'translation' => ['en' => ['name' => 'State']],
];

$context = ['flow_id' => 1];

$rules = StoreFlowStateRequest::rulesFor($input, $context);
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
        "translation.en.name": [
            "A state with this name already exists in this flow."
        ],
        "status": [
            "The status value is not valid for this flow's driver."
        ]
    }
}
```

## Best Practices

1. **Always Provide Flow ID**: Ensure flow_id is valid and exists
   ```php
   // ✅ Good
   'flow_id' => 1, // Valid flow ID
   ```

2. **Use Valid Status Values**: Ensure status matches flow's driver enum
   ```php
   // ✅ Good - Check enum values first
   $validStatuses = OrderStatus::values();
   'status' => $validStatuses[0],
   ```

3. **Set Appropriate Visuals**: Use meaningful colors and icons
   ```php
   // ✅ Good
   'color' => '#3B82F6', // Blue for processing
   'icon' => 'fas fa-cog',
   ```

4. **Normalize Before Validation**: Use normalize() for consistent data
   ```php
   $normalized = StoreFlowStateRequest::normalize($data, $context);
   $request->merge($normalized);
   ```

## Related Documentation

- [FlowState Service](/packages/laravel-flow/deep-diving/services/flow-state) - Learn about state management
- [UpdateFlowStateRequest](/packages/laravel-flow/deep-diving/requests/update-flow-state-request) - State update validation
- [CheckStatusInDriverRule](/packages/laravel-flow/deep-diving/rules/check-status-in-driver-rule) - Status validation rule

