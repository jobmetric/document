---
sidebar_position: 9
sidebar_label: UpdateFlowTaskRequest
---

# UpdateFlowTaskRequest

Form request class for validating FlowTask update data. This request handles partial updates with dynamic validation based on the task's driver, including driver-specific configuration validation.

## Namespace

`JobMetric\Flow\Http\Requests\FlowTask\UpdateFlowTaskRequest`

## Overview

The `UpdateFlowTaskRequest` validates incoming data when updating an existing FlowTask entity. Unlike `StoreFlowTaskRequest`, all fields are optional (`sometimes`), allowing partial updates while maintaining data integrity.

## Key Features

- **Partial Updates**: All fields are optional, allowing selective updates
- **Dynamic Validation**: Rules generated based on current or new driver
- **Driver Detection**: Automatically detects driver from existing task if not provided
- **Context Support**: Supports external context injection
- **Form Builder Integration**: Uses driver's form definition for config validation

## Validation Rules

### Optional Fields

All fields use `sometimes` rule:

| Field | Rule | Description |
|-------|------|-------------|
| `driver` | `sometimes\|string` | Fully qualified driver class name |
| `driver` (custom) | Class exists, extends AbstractTaskDriver, registered | Driver validation checks |
| `config` | `sometimes\|array` | Driver-specific configuration |
| `config.*` | Dynamic rules from driver's form | Validated based on driver's form definition |
| `ordering` | `sometimes\|nullable\|integer\|min:0` | Task execution order |
| `status` | `sometimes\|boolean` | Active/inactive status |

## Driver Detection

If `driver` is not provided in the update, the request automatically detects it from the existing task:

```php
// If updating task ID 5
// And task 5 has driver 'App\FlowTasks\SendEmailTask'
// Then config validation uses SendEmailTask's form definition
```

## Dynamic Config Validation

The `config` field is validated based on the driver's form definition (from input or existing task):

```php
// If driver (current or new) defines form:
public function form(): array
{
    return [
        'recipient' => ['required', 'email'],
        'subject' => ['required', 'string'],
    ];
}

// Then config is validated as:
'config.recipient' => 'required|email',
'config.subject' => 'required|string',
```

## Context Management

The request supports external context injection:

```php
$request = new UpdateFlowTaskRequest();
$request->setContext(['flow_task_id' => 123]);
```

## Static Rules Method

### rulesFor()

Provides programmatic validation:

```php
$input = [
    'driver' => 'App\FlowTasks\SendEmailTask',
    'config' => [
        'recipient' => 'user@example.com',
    ],
];

$context = ['flow_task_id' => 5];

$rules = UpdateFlowTaskRequest::rulesFor($input, $context);
```

## Usage Examples

### Basic Update

```php
use JobMetric\Flow\Http\Requests\FlowTask\UpdateFlowTaskRequest;
use JobMetric\Flow\Facades\FlowTask;

public function update(UpdateFlowTaskRequest $request, $id)
{
    $validated = $request->validated();
    
    $task = FlowTask::update($id, $validated);
    
    return response()->json($task);
}
```

### Partial Update - Status Only

```php
$requestData = [
    'status' => false, // Deactivate task
];
```

### Partial Update - Config Only

```php
$requestData = [
    'config' => [
        'recipient' => 'new-email@example.com',
    ],
];
```

### Update Driver and Config

```php
$requestData = [
    'driver' => 'App\FlowTasks\SendSmsTask',
    'config' => [
        'phone' => '+1234567890',
        'message' => 'Order confirmed',
    ],
];
```

### Update Ordering

```php
$requestData = [
    'ordering' => 5, // Change execution order
];
```

### Complete Update

```php
$requestData = [
    'driver' => 'App\FlowTasks\SendEmailTask',
    'config' => [
        'recipient' => 'user@example.com',
        'subject' => 'Updated Subject',
        'template' => 'updated-template',
    ],
    'ordering' => 2,
    'status' => true,
];
```

## Driver Change Handling

When changing the driver, the config validation switches to the new driver's form:

```php
// Original task uses SendEmailTask
// Update to SendSmsTask
$requestData = [
    'driver' => 'App\FlowTasks\SendSmsTask',
    'config' => [
        'phone' => '+1234567890', // New driver's config
    ],
];
```

## Error Handling

### Validation Errors

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "driver": [
            "The driver is not registered in FlowTaskRegistry."
        ],
        "config.recipient": [
            "The config.recipient field is required."
        ]
    }
}
```

## Differences from StoreFlowTaskRequest

| Feature | StoreFlowTaskRequest | UpdateFlowTaskRequest |
|---------|---------------------|----------------------|
| Field Rules | `required` for driver and transition | `sometimes` for all fields |
| Transition ID | Required | Not needed (task already has it) |
| Driver Detection | Must be provided | Can be detected from existing task |
| Context Support | `flow_id` | `flow_task_id` |
| Use Case | Creating new tasks | Updating existing tasks |

## Best Practices

1. **Update Only Changed Fields**: Only send fields that need updating
   ```php
   // ✅ Good
   ['status' => false]
   
   // ❌ Bad
   ['driver' => '...', 'config' => [...], 'ordering' => 0, 'status' => false]
   ```

2. **Handle Driver Changes**: When changing driver, provide new driver's config
   ```php
   // ✅ Good
   [
       'driver' => 'App\FlowTasks\SendSmsTask',
       'config' => ['phone' => '...'], // New driver's config
   ]
   ```

3. **Validate Config Structure**: Match config to driver's form definition
   ```php
   // ✅ Good - Matches form
   'config' => [
       'recipient' => 'user@example.com',
   ]
   ```

4. **Use Context for Driver Detection**: Provide flow_task_id in context
   ```php
   $request->setContext(['flow_task_id' => $id]);
   ```

## Related Documentation

- [FlowTask Service](/packages/laravel-flow/deep-diving/services/flow-task) - Learn about task management
- [StoreFlowTaskRequest](/packages/laravel-flow/deep-diving/requests/store-flow-task-request) - Task creation validation
- [FlowTaskRegistry](/packages/laravel-flow/deep-diving/support/flow-task-registry) - Driver registration

