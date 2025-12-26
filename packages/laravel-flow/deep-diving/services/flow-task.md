---
sidebar_position: 3
sidebar_label: FlowTask
---

# FlowTask Service

The FlowTask service provides CRUD operations for managing tasks within workflow transitions. Tasks are executed when a transition occurs and can be of three types: **Restriction**, **Validation**, or **Action**.

## Namespace

```php
JobMetric\Flow\Services\FlowTask
```

## Facade

For convenience, you can use the FlowTask Facade:

```php
use JobMetric\Flow\Facades\FlowTask;
```

## Task Types

Tasks are categorized into three types based on when they execute:

- **Restriction**: Check if the transition is allowed (permissions, conditions)
- **Validation**: Validate data before transitioning
- **Action**: Execute actions when transitioning (notifications, updates, etc.)

## Basic CRUD Operations

### Store

Create a new task for a transition. The task driver class determines the task type automatically.

```php
use JobMetric\Flow\Facades\FlowTask;

$task = FlowTask::store($flowId, $transitionId, [
    'driver' => 'App\Flows\Tasks\SendEmailNotification',
    'config' => [
        'to' => 'user@example.com',
        'subject' => 'Order Status Updated',
        'template' => 'order-status',
    ],
    'ordering' => 1,
    'status' => true,
]);
```

**Parameters:**

- `$flowId` (int): The ID of the flow
- `$transitionId` (int): The ID of the transition this task belongs to
- `$data` (array): Task configuration

**Task Configuration:**

- `driver` (string): The fully qualified class name of the task driver
- `config` (array): Configuration specific to the task driver (validated via IOForm)
- `ordering` (int): Execution order within the transition (lower numbers execute first)
- `status` (bool): Whether the task is enabled (`true`) or disabled (`false`)

**Example with Different Task Types:**

```php
// Restriction Task - Check user permission
$restrictionTask = FlowTask::store($flowId, $transitionId, [
    'driver' => 'App\Flows\Tasks\CheckUserPermission',
    'config' => [
        'permission' => 'approve-orders',
        'role' => 'manager',
    ],
    'ordering' => 1,
    'status' => true,
]);

// Validation Task - Validate order amount
$validationTask = FlowTask::store($flowId, $transitionId, [
    'driver' => 'App\Flows\Tasks\ValidateOrderAmount',
    'config' => [
        'min_amount' => 100,
        'max_amount' => 10000,
    ],
    'ordering' => 2,
    'status' => true,
]);

// Action Task - Send notification
$actionTask = FlowTask::store($flowId, $transitionId, [
    'driver' => 'App\Flows\Tasks\SendEmailNotification',
    'config' => [
        'to' => 'customer@example.com',
        'subject' => 'Your order has been processed',
    ],
    'ordering' => 3,
    'status' => true,
]);
```

### Show

Retrieve a specific task by ID.

```php
$task = FlowTask::show($taskId);
```

### Update

Update an existing task.

```php
$task = FlowTask::update($taskId, [
    'config' => [
        'to' => 'newemail@example.com',
        'subject' => 'Updated Subject',
    ],
    'ordering' => 2,
    'status' => false, // Disable the task
]);
```

**Updating Driver:**

You can change the task driver, but the config will be re-validated:

```php
$task = FlowTask::update($taskId, [
    'driver' => 'App\Flows\Tasks\SendSMSNotification',
    'config' => [
        'phone' => '+1234567890',
        'message' => 'Your order status has changed',
    ],
]);
```

### Delete

Delete a task.

```php
$task = FlowTask::delete($taskId);
```

## Task Drivers

### Get Available Drivers

Retrieve all registered task drivers, optionally filtered by subject model and task type.

```php
// Get all drivers
$drivers = FlowTask::drivers();

// Get drivers for a specific subject model
$drivers = FlowTask::drivers('App\Models\Order');

// Get only action tasks
$actionTasks = FlowTask::drivers('', 'action');

// Get validation and restriction tasks for Order model
$tasks = FlowTask::drivers('App\Models\Order', ['validation', 'restriction']);
```

**Response Format:**

```php
[
    [
        'subject' => 'App\Models\Order',
        'title' => 'Order',
        'tasks' => [
            [
                'key' => 'SendEmailNotification',
                'title' => 'Send Email Notification',
                'type' => 'action',
                'class' => 'App\Flows\Tasks\SendEmailNotification',
                'description' => 'Sends an email notification to the user',
            ],
            // ... more tasks
        ],
    ],
    // ... more subjects
]
```

### Get Driver Details

Get detailed information about a specific task driver.

```php
$details = FlowTask::details('App\Models\Order', 'SendEmailNotification');

// Returns:
// [
//     'key' => 'SendEmailNotification',
//     'title' => 'Send Email Notification',
//     'type' => 'action',
//     'class' => 'App\Flows\Tasks\SendEmailNotification',
//     'description' => 'Sends an email notification...',
// ]
```

### Resolve Driver

Resolve a task driver instance from the registry by class name.

```php
$driver = FlowTask::resolveDriver('App\Flows\Tasks\SendEmailNotification');

if ($driver) {
    // Use the driver instance
    $form = $driver->form();
}
```

## Task Execution Order

Tasks are executed in the order specified by the `ordering` field. Lower numbers execute first.

```php
// Task 1: Check permission (runs first)
$task1 = FlowTask::store($flowId, $transitionId, [
    'driver' => 'App\Flows\Tasks\CheckPermission',
    'ordering' => 1,
    'status' => true,
]);

// Task 2: Validate data (runs second)
$task2 = FlowTask::store($flowId, $transitionId, [
    'driver' => 'App\Flows\Tasks\ValidateData',
    'ordering' => 2,
    'status' => true,
]);

// Task 3: Send notification (runs third)
$task3 = FlowTask::store($flowId, $transitionId, [
    'driver' => 'App\Flows\Tasks\SendNotification',
    'ordering' => 3,
    'status' => true,
]);
```

## Task Status

Tasks can be enabled or disabled using the `status` field:

```php
// Enable a task
$task = FlowTask::update($taskId, [
    'status' => true,
]);

// Disable a task (it won't execute but remains in the database)
$task = FlowTask::update($taskId, [
    'status' => false,
]);
```

## Complete Example

Here's a complete example of creating a transition with multiple tasks:

```php
use JobMetric\Flow\Facades\FlowTransition;
use JobMetric\Flow\Facades\FlowTask;

// Create a transition
$transition = FlowTransition::store($flowId, [
    'from' => $pendingStateId,
    'to' => $processingStateId,
    'slug' => 'start_processing',
]);

// Add restriction task - check if user can process orders
$restrictionTask = FlowTask::store($flowId, $transition->id, [
    'driver' => 'App\Flows\Tasks\CheckCanProcessOrder',
    'config' => [
        'required_role' => 'processor',
    ],
    'ordering' => 1,
    'status' => true,
]);

// Add validation task - validate order data
$validationTask = FlowTask::store($flowId, $transition->id, [
    'driver' => 'App\Flows\Tasks\ValidateOrderData',
    'config' => [
        'check_inventory' => true,
        'check_payment' => true,
    ],
    'ordering' => 2,
    'status' => true,
]);

// Add action task - send email notification
$actionTask = FlowTask::store($flowId, $transition->id, [
    'driver' => 'App\Flows\Tasks\SendEmailNotification',
    'config' => [
        'to' => 'customer@example.com',
        'subject' => 'Your order is being processed',
        'template' => 'order-processing',
    ],
    'ordering' => 3,
    'status' => true,
]);

// Add another action task - update inventory
$inventoryTask = FlowTask::store($flowId, $transition->id, [
    'driver' => 'App\Flows\Tasks\UpdateInventory',
    'config' => [
        'decrease_stock' => true,
    ],
    'ordering' => 4,
    'status' => true,
]);
```

## Creating Custom Task Drivers

To create a custom task driver, extend one of the abstract task classes:

```php
namespace App\Flows\Tasks;

use JobMetric\Flow\Contracts\AbstractActionTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\FlowTaskDefinition;

class SendEmailNotification extends AbstractActionTask
{
    public static function definition(): FlowTaskDefinition
    {
        return FlowTaskDefinition::make()
            ->title('workflow::tasks.send_email.title')
            ->description('workflow::tasks.send_email.description')
            ->form(function ($form) {
                $form->string('to')->required();
                $form->string('subject')->required();
                $form->string('template')->default('default');
            });
    }

    public function handle(FlowTaskContext $context): void
    {
        $config = $this->getConfig();
        
        // Send email logic here
        Mail::to($config['to'])
            ->send(new OrderStatusMail($config['subject'], $config['template']));
    }
}
```

## Direct Service Usage

If you prefer dependency injection over the Facade:

```php
use JobMetric\Flow\Services\FlowTask as FlowTaskService;

class YourController
{
    public function __construct(
        protected FlowTaskService $flowTaskService
    ) {}

    public function store($flowId, $transitionId)
    {
        $task = $this->flowTaskService->store($flowId, $transitionId, [
            'driver' => 'App\Flows\Tasks\SendEmailNotification',
            'config' => [...],
        ]);
    }
}
```

## Response Format

The service methods return the FlowTask model directly:

```php
$task = FlowTask::store($flowId, $transitionId, [...]);

// Access task properties
$taskId = $task->id;
$driver = $task->driver;
$config = $task->config;
$ordering = $task->ordering;
$status = $task->status;
```

