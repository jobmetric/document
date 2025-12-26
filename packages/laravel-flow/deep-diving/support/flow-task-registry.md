---
sidebar_position: 1
sidebar_label: FlowTaskRegistry
---

# FlowTaskRegistry

The `FlowTaskRegistry` is a central registry for all flow task drivers. It provides a predictable lookup mechanism, prevents duplicate registrations, and enables efficient retrieval of tasks per subject and per type.

## Namespace

```php
JobMetric\Flow\Support\FlowTaskRegistry
```

## Overview

The registry indexes tasks by:
- **Subject**: The model class name (FQCN) that the task operates on
- **Type**: The task type (action, validation, restriction)
- **Class**: The concrete task driver class name

This three-level indexing structure (`subject -> type -> class`) allows for efficient lookups and prevents duplicate registrations.

## Registration

### Register a Task

Register a new flow task driver instance:

```php
use JobMetric\Flow\Support\FlowTaskRegistry;
use App\Flows\Order\SendEmailActionTask;

$registry = app('FlowTaskRegistry');
$registry->register(new SendEmailActionTask);
```

**Requirements:**
- Task must implement `AbstractTaskDriver`
- Task must have a non-empty subject (returned by `subject()` method)
- Task type is automatically determined from the task class

**Throws `InvalidArgumentException` if:**
- Task subject is empty
- Same task class is already registered for the same subject and type

### Registration in Service Provider

Typically, tasks are registered in a service provider:

```php
use App\Flows\Order\SendEmailActionTask;
use App\Flows\Order\ValidatePaymentValidationTask;
use App\Flows\Order\RestrictCancellationRestrictionTask;
use JobMetric\Flow\Support\FlowTaskRegistry;

public function boot(): void
{
    $registry = app('FlowTaskRegistry');
    
    $registry->register(new SendEmailActionTask)
        ->register(new ValidatePaymentValidationTask)
        ->register(new RestrictCancellationRestrictionTask);
}
```

Or using the FlowTask facade:

```php
use JobMetric\Flow\Facades\FlowTask;

public function boot(): void
{
    FlowTask::register(new SendEmailActionTask);
    FlowTask::register(new ValidatePaymentValidationTask);
    FlowTask::register(new RestrictCancellationRestrictionTask);
}
```

## Querying Tasks

### Get All Tasks

Get all registered tasks grouped by subject, type, and class name:

```php
$registry = app('FlowTaskRegistry');
$allTasks = $registry->all();
```

**Returns:**
```php
[
    'App\Models\Order' => [
        'action' => [
            'App\Flows\Order\SendEmailActionTask' => $taskInstance,
            'App\Flows\Order\UpdateStatusActionTask' => $taskInstance,
        ],
        'validation' => [
            'App\Flows\Order\ValidatePaymentValidationTask' => $taskInstance,
        ],
        'restriction' => [
            'App\Flows\Order\RestrictCancellationRestrictionTask' => $taskInstance,
        ],
    ],
    'App\Models\Invoice' => [
        // ...
    ],
]
```

### Get Tasks for Subject

Get all registered tasks for a specific subject (model class):

```php
$registry = app('FlowTaskRegistry');
$orderTasks = $registry->forSubject('App\Models\Order');
```

**Returns:**
```php
[
    'action' => [
        'App\Flows\Order\SendEmailActionTask' => $taskInstance,
    ],
    'validation' => [
        'App\Flows\Order\ValidatePaymentValidationTask' => $taskInstance,
    ],
    'restriction' => [
        'App\Flows\Order\RestrictCancellationRestrictionTask' => $taskInstance,
    ],
]
```

### Get Tasks for Subject and Type

Get all registered tasks for a specific subject and type:

```php
$registry = app('FlowTaskRegistry');
$actionTasks = $registry->forSubjectAndType('App\Models\Order', 'action');
```

**Returns:**
```php
[
    'App\Flows\Order\SendEmailActionTask' => $taskInstance,
    'App\Flows\Order\UpdateStatusActionTask' => $taskInstance,
]
```

**Throws exception if:** Invalid task type is provided (must be 'action', 'validation', or 'restriction')

### Check Task Existence

Check if a task is registered for a specific subject, type, and class:

```php
$registry = app('FlowTaskRegistry');
$exists = $registry->has(
    'App\Models\Order',
    'action',
    'App\Flows\Order\SendEmailActionTask'
);
```

**Returns:** `bool`

### Check Class Existence

Check if a task class is registered (regardless of subject/type):

```php
$registry = app('FlowTaskRegistry');
$exists = $registry->hasClass('App\Flows\Order\SendEmailActionTask');
```

**Returns:** `bool`

**Note:** Class name is normalized (forward slashes converted to backslashes, trimmed)

### Get Task by Class

Get a registered task driver instance by class name:

```php
$registry = app('FlowTaskRegistry');
$task = $registry->get('App\Flows\Order\SendEmailActionTask');
```

**Returns:** `AbstractTaskDriver|null`

**Note:** Returns the first matching task instance found (since class names are unique per subject/type)

## Internal Structure

The registry maintains tasks in a three-level array structure:

```php
protected array $tasks = [
    'subject_class' => [
        'task_type' => [
            'task_class' => $taskInstance,
        ],
    ],
];
```

**Example:**
```php
[
    'App\Models\Order' => [
        'action' => [
            'App\Flows\Order\SendEmailActionTask' => $sendEmailTask,
            'App\Flows\Order\UpdateStatusActionTask' => $updateStatusTask,
        ],
        'validation' => [
            'App\Flows\Order\ValidatePaymentValidationTask' => $validatePaymentTask,
        ],
    ],
]
```

## Task Type Detection

Task types are automatically determined using `FlowTask::determineTaskType()`:

- Tasks extending `AbstractActionTask` → `'action'`
- Tasks extending `AbstractValidationTask` → `'validation'`
- Tasks extending `AbstractRestrictionTask` → `'restriction'`

## Complete Examples

### Example 1: Registering Multiple Tasks

```php
use App\Flows\Order\SendEmailActionTask;
use App\Flows\Order\ValidatePaymentValidationTask;
use App\Flows\Order\RestrictCancellationRestrictionTask;
use JobMetric\Flow\Support\FlowTaskRegistry;

public function boot(): void
{
    $registry = app('FlowTaskRegistry');
    
    // Register all tasks for Order model
    $registry->register(new SendEmailActionTask)
        ->register(new ValidatePaymentValidationTask)
        ->register(new RestrictCancellationRestrictionTask);
}
```

### Example 2: Conditional Registration

```php
use App\Flows\Order\SendEmailActionTask;
use JobMetric\Flow\Support\FlowTaskRegistry;

public function boot(): void
{
    $registry = app('FlowTaskRegistry');
    
    // Only register if not already registered
    if (!$registry->hasClass(SendEmailActionTask::class)) {
        $registry->register(new SendEmailActionTask);
    }
}
```

### Example 3: Getting Tasks for a Model

```php
use JobMetric\Flow\Support\FlowTaskRegistry;

$registry = app('FlowTaskRegistry');

// Get all tasks for Order model
$orderTasks = $registry->forSubject('App\Models\Order');

// Get only action tasks
$actionTasks = $registry->forSubjectAndType('App\Models\Order', 'action');

// Use tasks
foreach ($actionTasks as $taskClass => $taskInstance) {
    echo "Task: {$taskClass}\n";
}
```

### Example 4: Checking Task Availability

```php
use JobMetric\Flow\Support\FlowTaskRegistry;

$registry = app('FlowTaskRegistry');

// Check if specific task exists
if ($registry->has('App\Models\Order', 'action', 'App\Flows\Order\SendEmailActionTask')) {
    $task = $registry->get('App\Flows\Order\SendEmailActionTask');
    // Use task
}

// Check if any task of this class exists
if ($registry->hasClass('App\Flows\Order\SendEmailActionTask')) {
    // Task is registered somewhere
}
```

## Error Handling

### Duplicate Registration

If you try to register the same task twice:

```php
$registry = app('FlowTaskRegistry');
$task = new SendEmailActionTask;

$registry->register($task); // ✅ Success
$registry->register($task); // ❌ InvalidArgumentException
```

**Error Message:**
```
Task 'App\Flows\Order\SendEmailActionTask' is already registered for subject 'App\Models\Order' and type 'action'.
```

### Empty Subject

If a task has an empty subject:

```php
// Task with empty subject() method
$task = new InvalidTask;
$registry->register($task); // ❌ InvalidArgumentException
```

**Error Message:**
```
Task subject must not be an empty string.
```

### Invalid Task Type

If you query with an invalid task type:

```php
$registry->forSubjectAndType('App\Models\Order', 'invalid'); // ❌ Exception
```

## Best Practices

1. **Register in Service Providers**: Always register tasks in service provider `boot()` method

2. **Check Before Registering**: Check if task is already registered to avoid errors:
   ```php
   if (!$registry->hasClass(SendEmailActionTask::class)) {
       $registry->register(new SendEmailActionTask);
   }
   ```

3. **Use Facade**: Use `FlowTask` facade for cleaner code:
   ```php
   FlowTask::register(new SendEmailActionTask);
   ```

4. **Group by Model**: Organize task registration by model for better maintainability

5. **Document Task Classes**: Document which tasks are registered for each model

## Integration with FlowTransition

The registry is used by `FlowTransition` service to:
- Validate task drivers when creating/updating transitions
- Resolve task instances during transition execution
- Ensure tasks are properly registered before use

## Related Documentation

- [FlowTask Service](/packages/laravel-flow/deep-diving/services/flow-task) - Learn about task management
- [MakeTask Command](/packages/laravel-flow/deep-diving/make-task) - Learn about generating tasks
- [FlowTransition Service](/packages/laravel-flow/deep-diving/services/flow-transition) - Learn about transitions

