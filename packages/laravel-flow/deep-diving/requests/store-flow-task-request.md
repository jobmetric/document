---
sidebar_position: 8
sidebar_label: StoreFlowTaskRequest
---

# StoreFlowTaskRequest

Form request class for validating FlowTask creation data. This request handles dynamic validation based on the selected task driver, including driver-specific configuration validation.

## Namespace

`JobMetric\Flow\Http\Requests\FlowTask\StoreFlowTaskRequest`

## Overview

The `StoreFlowTaskRequest` validates incoming data when creating a new FlowTask entity. It ensures:

- Required fields are present
- Flow transition ID exists and is valid
- Driver class exists and is registered
- Driver-specific configuration is valid
- Dynamic form validation from driver's form definition

## Key Features

- **Dynamic Validation**: Rules are generated based on the selected driver
- **Driver Registration Check**: Validates that driver is registered in FlowTaskRegistry
- **Form Builder Integration**: Uses driver's form definition for config validation
- **Context Support**: Supports external context injection

## Validation Rules

### Required Fields

| Field | Rule | Description |
|-------|------|-------------|
| `flow_transition_id` | `required\|integer\|exists:flow_transitions,id` | ID of the parent transition |
| `driver` | `required\|string` | Fully qualified driver class name |
| `driver` (custom) | Class exists, extends AbstractTaskDriver, registered | Driver validation checks |

### Optional Fields

| Field | Rule | Description |
|-------|------|-------------|
| `config` | `sometimes\|array` | Driver-specific configuration |
| `config.*` | Dynamic rules from driver's form | Validated based on driver's form definition |
| `ordering` | `sometimes\|nullable\|integer\|min:0` | Task execution order |
| `status` | `sometimes\|boolean` | Active/inactive status |

## Driver Validation

The `driver` field is validated with custom rules:

1. **Class Exists**: The class must exist
   ```php
   // ✅ Valid
   'driver' => 'App\FlowTasks\SendEmailTask'
   
   // ❌ Invalid
   'driver' => 'App\FlowTasks\NonExistentTask'
   ```

2. **Extends AbstractTaskDriver**: Must extend the base driver class
   ```php
   // ✅ Valid
   class SendEmailTask extends AbstractTaskDriver { }
   
   // ❌ Invalid
   class SendEmailTask { }
   ```

3. **Registered in Registry**: Must be registered in FlowTaskRegistry
   ```php
   // ✅ Valid - Registered
   FlowTaskRegistry::register(SendEmailTask::class);
   
   // ❌ Invalid - Not registered
   // Driver not registered
   ```

## Dynamic Config Validation

The `config` field is validated based on the driver's form definition:

```php
// If driver defines form:
public function form(): array
{
    return [
        'recipient' => ['required', 'email'],
        'subject' => ['required', 'string', 'max:255'],
        'template' => ['required', 'string'],
    ];
}

// Then config is validated as:
'config.recipient' => 'required|email',
'config.subject' => 'required|string|max:255',
'config.template' => 'required|string',
```

## Context Management

The request supports external context injection:

```php
$request = new StoreFlowTaskRequest();
$request->setContext(['flow_id' => 123]);
```

The `flow_id` is automatically extracted from the transition and stored in context.

## Static Rules Method

### rulesFor()

Provides programmatic validation:

```php
$input = [
    'flow_transition_id' => 1,
    'driver' => 'App\FlowTasks\SendEmailTask',
    'config' => [
        'recipient' => 'user@example.com',
    ],
];

$context = [];

$rules = StoreFlowTaskRequest::rulesFor($input, $context);
```

## Usage Examples

### Basic Task Creation

```php
use JobMetric\Flow\Http\Requests\FlowTask\StoreFlowTaskRequest;
use JobMetric\Flow\Facades\FlowTask;

public function store(StoreFlowTaskRequest $request)
{
    $validated = $request->validated();
    
    $task = FlowTask::store(
        $validated['flow_transition_id'],
        $validated
    );
    
    return response()->json($task, 201);
}
```

### Complete Request Data

```php
$requestData = [
    'flow_transition_id' => 1,
    'driver' => 'App\FlowTasks\SendEmailTask',
    'config' => [
        'recipient' => 'user@example.com',
        'subject' => 'Order Confirmation',
        'template' => 'order-confirmation',
    ],
    'ordering' => 1,
    'status' => true,
];
```

### Minimal Request Data

```php
$requestData = [
    'flow_transition_id' => 1,
    'driver' => 'App\FlowTasks\LogTask',
    // config is optional if driver doesn't require it
];
```

### With Driver-Specific Config

```php
// For a validation task
$requestData = [
    'flow_transition_id' => 1,
    'driver' => 'App\FlowTasks\ValidateOrderTask',
    'config' => [
        'min_amount' => 100,
        'required_fields' => ['customer_name', 'address'],
    ],
];
```

## Cross-Field Validation

The request includes custom validation in `withValidator()`:

### Transition Validation

- Verifies transition exists
- Extracts `flow_id` from transition and stores in context
- Ensures transition belongs to a valid flow

```php
// Automatically validates:
// - Transition exists
// - Flow exists
// - Stores flow_id in context
```

## Error Handling

### Validation Errors

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "flow_transition_id": [
            "The selected flow transition id is invalid."
        ],
        "driver": [
            "The driver class does not exist."
        ],
        "config.recipient": [
            "The config.recipient field is required."
        ]
    }
}
```

### Driver-Specific Errors

```json
{
    "errors": {
        "driver": [
            "The driver is not registered in FlowTaskRegistry."
        ],
        "config.email": [
            "The config.email must be a valid email address."
        ]
    }
}
```

## Best Practices

1. **Register Drivers First**: Ensure drivers are registered before creating tasks
   ```php
   // ✅ Good - Register in service provider
   FlowTaskRegistry::register(SendEmailTask::class);
   ```

2. **Use Fully Qualified Class Names**: Always use complete namespace
   ```php
   // ✅ Good
   'driver' => 'App\FlowTasks\SendEmailTask'
   
   // ❌ Bad
   'driver' => 'SendEmailTask'
   ```

3. **Validate Config Structure**: Match config to driver's form definition
   ```php
   // ✅ Good - Matches form
   'config' => [
       'recipient' => 'user@example.com',
       'subject' => 'Test',
   ]
   ```

4. **Set Appropriate Ordering**: Use ordering to control execution sequence
   ```php
   // ✅ Good
   'ordering' => 1, // First task
   'ordering' => 2, // Second task
   ```

## Related Documentation

- [FlowTask Service](/packages/laravel-flow/deep-diving/services/flow-task) - Task management
- [UpdateFlowTaskRequest](/packages/laravel-flow/deep-diving/requests/update-flow-task-request) - Task update validation
- [FlowTaskResource](/packages/laravel-flow/deep-diving/resources/flow-task-resource) - Task JSON resource
- [FlowTaskRegistry](/packages/laravel-flow/deep-diving/support/flow-task-registry) - Driver registration
- [MakeTask Command](/packages/laravel-flow/deep-diving/make-task) - Creating task drivers
- [Events](/packages/laravel-flow/deep-diving/events) - Task lifecycle events

