---
sidebar_position: 4
sidebar_label: MakeTask Command
---

# MakeTask Command

The `flow:make-task` artisan command is a powerful tool for generating Flow Task classes. It automatically creates properly structured task classes for Action, Restriction, and Validation tasks, saving you time and ensuring consistency across your workflow implementations.

## Namespace

```php
JobMetric\Flow\Commands\MakeTask
```

## Command Signature

```bash
php artisan flow:make-task
    {type? : The type of the task (e.g. validation, restriction, action) default: action}
    {name? : The name of the task (e.g. RestrictOrderCancellation)}
    {model? : Driver name (e.g. Order)}
    {title? : The title of the task (e.g. translation key flow::base.task.restrict_order_cancellation.title)}
    {--f|force : Overwrite if file already exists}
```

## Basic Usage

### Interactive Mode

Run the command without arguments to enter interactive mode:

```bash
php artisan flow:make-task
```

The command will prompt you for:
1. **Task Type**: Choose from Validation, Restriction, or Action (default: Action)
2. **Task Name**: Enter a descriptive name (e.g., `RestrictOrderCancellation`)
3. **Model**: Select from available models that use `HasWorkflow` trait
4. **Title**: Enter a title or translation key for the task

### Non-Interactive Mode

Provide all arguments directly:

```bash
php artisan flow:make-task Action SendEmailNotification Order "flow::base.task.send_email_notification.title"
```

## Command Arguments

### Type

The type of task to create. Must be one of:
- `Action`: Executes actions during transitions
- `Restriction`: Checks if a transition is allowed
- `Validation`: Validates data before transitions

**Default:** `Action`

**Example:**
```bash
php artisan flow:make-task Action MyTask Order "My Task Title"
```

### Name

The name of the task class. This will be converted to StudlyCase automatically.

**Examples:**
- `send-email` → `SendEmail`
- `restrict_order_cancellation` → `RestrictOrderCancellation`
- `validatePayment` → `ValidatePayment`

**Note:** The final class name will be `{Name}{Type}Task` (e.g., `SendEmailActionTask`).

### Model

The fully qualified class name of the Eloquent model that uses the `HasWorkflow` trait.

**Important:** The model must:
- Extend `Illuminate\Database\Eloquent\Model`
- Use the `HasWorkflow` trait
- Be discoverable by `FilesystemHasWorkflowInModelLocator`

**Example:**
```bash
php artisan flow:make-task Action SendEmail App\Models\Order "Send Email"
```

### Title

The title or translation key for the task. This is used in the `FlowTaskDefinition`.

**Examples:**
- Simple string: `"Send Email Notification"`
- Translation key: `"flow::base.task.send_email_notification.title"`

## Command Options

### Force (`--force` or `-f`)

Overwrite existing files without prompting.

```bash
php artisan flow:make-task Action MyTask Order "Title" --force
```

**Without force:** If the file exists, you'll be prompted to confirm overwrite.

## Generated File Structure

### Directory Structure

Tasks are generated in the following structure:

```
app/
└── Flows/
    └── {ModelName}/
        └── {Name}{Type}Task.php
```

**Example:**
```
app/
└── Flows/
    └── Order/
        ├── SendEmailActionTask.php
        ├── RestrictCancellationRestrictionTask.php
        └── ValidatePaymentValidationTask.php
```

### Namespace

The generated class will use the namespace:

```php
App\Flows\{ModelName}
```

**Example:**
```php
namespace App\Flows\Order;
```

## Task Types

### Action Task

Action tasks execute operations during workflow transitions.

**Generated Class:**
```php
<?php

namespace App\Flows\Order;

use JobMetric\Flow\Contracts\AbstractActionTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\FlowTaskDefinition;
use JobMetric\Form\FormBuilder;

class SendEmailActionTask extends AbstractActionTask
{
    // use \JobMetric\Flow\Concerns\RunInBackground;

    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.send_email_notification.title',
            description: null,
            icon: null,
            tags: null,
        );
    }

    public function form(): FormBuilder
    {
        return (new FormBuilder)
            // Define configuration fields for this task here
            ;
    }

    protected function handle(FlowTaskContext $context): void
    {
        // Implement the task logic here using:
        // $context->subject();   // The main model
        // $context->user();      // The authenticated user
        // $context->transition(); // The transition key
        // $context->config();    // The stored configuration for this task
    }
}
```

**Key Methods:**
- `subject()`: Returns the model class this task operates on
- `definition()`: Returns metadata for the task
- `form()`: Returns form builder for task configuration
- `handle()`: Executes the main action logic

**Background Execution:**

To run the task in the background, uncomment the trait:

```php
use \JobMetric\Flow\Concerns\RunInBackground;
```

### Restriction Task

Restriction tasks determine if a transition is allowed.

**Generated Class:**
```php
<?php

namespace App\Flows\Order;

use JobMetric\Flow\Contracts\AbstractRestrictionTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\FlowTaskDefinition;
use JobMetric\Flow\Support\RestrictionResult;
use JobMetric\Form\FormBuilder;

class RestrictCancellationRestrictionTask extends AbstractRestrictionTask
{
    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.restrict_cancellation.title',
            description: null,
            icon: null,
            tags: null,
        );
    }

    public function form(): FormBuilder
    {
        return (new FormBuilder)
            // Define configuration fields for this restriction task here
            ;
    }

    public function restriction(FlowTaskContext $context): RestrictionResult
    {
        // Use $context->subject(), $context->user(), $context->payload(), $context->config()
        // to implement your restriction logic.

        return RestrictionResult::allow();
    }
}
```

**Key Methods:**
- `restriction()`: Returns `RestrictionResult` to allow or deny the transition

**RestrictionResult Methods:**
- `RestrictionResult::allow()`: Allow the transition
- `RestrictionResult::deny(string $message)`: Deny with a message

### Validation Task

Validation tasks validate data before transitions.

**Generated Class:**
```php
<?php

namespace App\Flows\Order;

use JobMetric\Flow\Contracts\AbstractValidationTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\FlowTaskDefinition;
use JobMetric\Form\FormBuilder;

class ValidatePaymentValidationTask extends AbstractValidationTask
{
    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.validate_payment.title',
            description: null,
            icon: null,
            tags: null,
        );
    }

    public function form(): FormBuilder
    {
        return (new FormBuilder)
            // Define configuration fields for this validation task here
            ;
    }

    public function rules(FlowTaskContext $context): array
    {
        return [];
    }

    public function messages(FlowTaskContext $context): array
    {
        return [];
    }

    public function attributes(FlowTaskContext $context): array
    {
        return [];
    }
}
```

**Key Methods:**
- `rules()`: Returns Laravel validation rules
- `messages()`: Returns custom validation messages
- `attributes()`: Returns custom attribute names

## Complete Examples

### Example 1: Creating an Action Task

```bash
php artisan flow:make-task Action SendEmailNotification Order "flow::base.task.send_email.title"
```

**Generated File:** `app/Flows/Order/SendEmailNotificationActionTask.php`

**Implementation:**
```php
protected function handle(FlowTaskContext $context): void
{
    $order = $context->subject();
    $user = $context->user();
    $config = $context->config();

    // Send email notification
    Mail::to($user->email)->send(new OrderStatusChanged($order));
}
```

### Example 2: Creating a Restriction Task

```bash
php artisan flow:make-task Restriction PreventCancellation Order "flow::base.task.prevent_cancellation.title"
```

**Generated File:** `app/Flows/Order/PreventCancellationRestrictionTask.php`

**Implementation:**
```php
public function restriction(FlowTaskContext $context): RestrictionResult
{
    $order = $context->subject();

    // Prevent cancellation if order is already shipped
    if ($order->status === 'shipped') {
        return RestrictionResult::deny('Cannot cancel shipped orders');
    }

    return RestrictionResult::allow();
}
```

### Example 3: Creating a Validation Task

```bash
php artisan flow:make-task Validation ValidatePayment Order "flow::base.task.validate_payment.title"
```

**Generated File:** `app/Flows/Order/ValidatePaymentValidationTask.php`

**Implementation:**
```php
public function rules(FlowTaskContext $context): array
{
    return [
        'payment_method' => 'required|string|in:credit_card,paypal,bank_transfer',
        'amount' => 'required|numeric|min:0',
    ];
}

public function messages(FlowTaskContext $context): array
{
    return [
        'payment_method.required' => 'Payment method is required',
        'amount.min' => 'Amount must be greater than zero',
    ];
}
```

## Model Discovery

The command uses `FilesystemHasWorkflowInModelLocator` to discover models that use the `HasWorkflow` trait.

**Discovery Process:**
1. Scans the `app/Models` directory (and other configured paths)
2. Looks for PHP files that contain `HasWorkflow`
3. Verifies the class extends `Model`
4. Checks if the class uses the `HasWorkflow` trait
5. Returns a list of available models

**Requirements for Model Discovery:**
- Model must be in a discoverable directory
- Model must use `HasWorkflow` trait
- Model must extend `Illuminate\Database\Eloquent\Model`
- Model must not be abstract

## Task Registration

After creating a task, you must register it in a service provider:

```php
use App\Flows\Order\SendEmailNotificationActionTask;
use JobMetric\Flow\Facades\FlowTask;

public function boot(): void
{
    FlowTask::register(new SendEmailNotificationActionTask);
}
```

Or using the registry directly:

```php
use App\Flows\Order\SendEmailNotificationActionTask;

app('FlowTaskRegistry')->register(new SendEmailNotificationActionTask);
```

## Naming Conventions

### Task Name Conversion

The command automatically converts task names to StudlyCase:

- `send-email` → `SendEmail`
- `send_email` → `SendEmail`
- `sendEmail` → `SendEmail`
- `SEND_EMAIL` → `SendEmail`

### Final Class Name

The final class name follows this pattern:

```
{Name}{Type}Task
```

**Examples:**
- Name: `SendEmail`, Type: `Action` → `SendEmailActionTask`
- Name: `RestrictCancellation`, Type: `Restriction` → `RestrictCancellationRestrictionTask`
- Name: `ValidatePayment`, Type: `Validation` → `ValidatePaymentValidationTask`

### File Naming

Files are named exactly as the class name:

```
{Name}{Type}Task.php
```

## Error Handling

### Invalid Task Type

If an invalid task type is provided:

```bash
php artisan flow:make-task InvalidType MyTask Order "Title"
```

**Error:**
```
Invalid task type: [InvalidType]. Allowed types are: Validation, Restriction, Action.
```

**Solution:** Use one of the allowed types: `Action`, `Restriction`, or `Validation`.

### Model Without HasWorkflow

If the model doesn't use `HasWorkflow` trait:

```bash
php artisan flow:make-task Action MyTask App\Models\User "Title"
```

**Error:**
```
The model [App\Models\User] does not use the HasWorkflow trait.
```

**Solution:** Ensure the model uses the `HasWorkflow` trait.

### File Already Exists

If the file already exists and `--force` is not used:

```
Flow Action Task class already exists: [App\Flows\Order\MyTaskActionTask], Use --force to overwrite.
Do you want to overwrite the existing file? (yes/no) [no]:
```

**Solution:** Use `--force` flag or confirm overwrite when prompted.

## Best Practices

1. **Use Descriptive Names**: Choose clear, descriptive task names that indicate their purpose
   ```bash
   # ✅ Good
   php artisan flow:make-task Action SendEmailNotification Order "Send Email"
   
   # ❌ Bad
   php artisan flow:make-task Action Task1 Order "Task"
   ```

2. **Use Translation Keys**: Use translation keys for titles instead of hardcoded strings
   ```bash
   # ✅ Good
   php artisan flow:make-task Action SendEmail Order "flow::base.task.send_email.title"
   
   # ⚠️ Acceptable
   php artisan flow:make-task Action SendEmail Order "Send Email"
   ```

3. **Organize by Model**: Tasks are automatically organized by model in the `app/Flows/{ModelName}/` directory

4. **Register Tasks**: Always register tasks in a service provider after creation

5. **Use Type Hints**: The generated code uses proper type hints - maintain this in your implementations

6. **Document Custom Logic**: Add PHPDoc comments for complex task logic

## Troubleshooting

### Task Not Appearing in Model List

If your model doesn't appear in the interactive model selection:

1. **Check Trait Usage**: Ensure the model uses `HasWorkflow` trait
2. **Check Directory**: Ensure the model is in a discoverable directory (default: `app/Models`)
3. **Check Class Definition**: Ensure the model extends `Model` and is not abstract
4. **Clear Cache**: Run `php artisan clear-compiled` and `composer dump-autoload`

### Generated File Has Placeholders

If the generated file still contains placeholders like `{{namespace}}`:

1. **Check Stub Files**: Ensure stub files exist in `packages/laravel-flow/src/Commands/stub/`
2. **Check Permissions**: Ensure the command has write permissions
3. **Re-run Command**: Try running the command again with `--force`

### Class Not Found After Generation

If you get "Class not found" errors:

1. **Run Composer Dump-Autoload**: `composer dump-autoload`
2. **Check Namespace**: Ensure the namespace matches your app namespace
3. **Check File Location**: Ensure the file is in the correct directory

## Advanced Usage

### Custom Model Paths

The model locator scans default paths. To add custom paths, you can extend `FilesystemHasWorkflowInModelLocator`:

```php
use JobMetric\Flow\Support\FilesystemHasWorkflowInModelLocator;

$models = FilesystemHasWorkflowInModelLocator::all([
    app_path('Models'),
    app_path('Custom/Models'),
]);
```

### Batch Task Creation

Create multiple tasks using a script:

```php
$tasks = [
    ['type' => 'Action', 'name' => 'SendEmail', 'model' => Order::class, 'title' => 'Send Email'],
    ['type' => 'Restriction', 'name' => 'PreventCancellation', 'model' => Order::class, 'title' => 'Prevent Cancellation'],
    ['type' => 'Validation', 'name' => 'ValidatePayment', 'model' => Order::class, 'title' => 'Validate Payment'],
];

foreach ($tasks as $task) {
    Artisan::call('flow:make-task', [
        'type' => $task['type'],
        'name' => $task['name'],
        'model' => $task['model'],
        'title' => $task['title'],
        '--force' => true,
    ]);
}
```

## Related Documentation

- [FlowTask Service](/packages/laravel-flow/deep-diving/services/flow-task) - Learn about managing tasks
- [HasWorkflow Trait](/packages/laravel-flow/deep-diving/has-workflow) - Learn about workflow integration
- [FlowTransition Service](/packages/laravel-flow/deep-diving/services/flow-transition) - Learn about transitions

