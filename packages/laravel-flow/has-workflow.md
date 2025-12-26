---
sidebar_position: 5
sidebar_label: HasWorkflow
---

# HasWorkflow Trait

The `HasWorkflow` trait binds an Eloquent model to a workflow flow, automatically selecting and binding the appropriate flow when a model is created. This trait provides a seamless way to integrate workflow management into your models.

## When to Use HasWorkflow

**Use `HasWorkflow` when you need:**

- **Complex flow selection logic**: Multiple flows for the same model type based on different criteria
- **Dynamic flow selection**: Flows selected based on subject scope, collection, environment, channel, or rollout percentage
- **Multiple workflow variants**: Different workflows for the same model based on business rules
- **Advanced features**: Active time windows, canary deployments, environment-specific flows
- **Flexible configuration**: Need to customize flow picking based on runtime conditions

**Example scenarios:**
- E-commerce orders with different workflows for premium vs standard customers
- Content approval workflows that vary by department or region
- Multi-tenant applications where each tenant has different workflows
- A/B testing workflows with rollout percentages
- Environment-specific workflows (development, staging, production)

## HasWorkflow vs HasFlow

**Choose `HasWorkflow` if:**
- You have multiple flows for the same model type
- Flow selection depends on dynamic criteria (user, collection, environment, etc.)
- You need advanced features like rollout percentages or active windows
- Your workflow requirements are complex and may change over time

**Choose `HasFlow` if:**
- You have a single, fixed flow per model type
- Flow selection is simple and doesn't change
- You prefer explicit flow ID assignment
- Your project is straightforward with minimal workflow complexity

For most simple projects (90% of use cases), `HasFlow` is recommended. For complex scenarios with multiple flows and dynamic selection, use `HasWorkflow`.

## Namespace

```php
JobMetric\Flow\HasWorkflow
```

## Basic Usage

To use the HasWorkflow trait, simply add it to your model:

```php
use Illuminate\Database\Eloquent\Model;
use JobMetric\Flow\HasWorkflow;

class Order extends Model
{
    use HasWorkflow;

    protected $fillable = [
        'user_id',
        'status',
    ];
}
```

## Requirements

### Status Column

Your model **must** have a `status` column in the database table. The trait will automatically check for this column when the model is created.

```php
// Migration example
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->string('status')->nullable();
    // ... other columns
});
```

If you need to use a different column name, override the `flowStatusColumn()` method:

```php
class Order extends Model
{
    use HasWorkflow;

    protected function flowStatusColumn(): string
    {
        return 'order_status'; // Custom column name
    }
}
```

### Flow Configuration

Make sure you have created a flow with the correct `subject_type` matching your model class:

```php
use JobMetric\Flow\Facades\Flow;

$flow = Flow::store([
    'subject_type' => Order::class,
    'version' => 1,
]);
```

## Automatic Flow Binding

When a model using `HasWorkflow` is created, the trait automatically:

1. Picks the appropriate flow based on the model's configuration
2. Binds the flow to the model via the `flow_uses` table
3. Sets the initial status if the flow has a START state

```php
$order = Order::create([
    'user_id' => 1,
    'status' => null, // Will be set automatically if flow has START state
]);

// Flow is automatically bound
$boundFlow = $order->boundFlow();
```

## Customizing Flow Selection

### Override buildFlowPicker

You can customize how flows are selected by overriding the `buildFlowPicker()` method:

```php
use JobMetric\Flow\Support\FlowPickerBuilder;

class Order extends Model
{
    use HasWorkflow;

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        // Call parent to set defaults
        parent::buildFlowPicker($builder);

        // Customize the builder
        $builder
            ->subjectScope($this->user_id ? (string)$this->user_id : null)
            ->environment('production')
            ->channel('web')
            ->preferEnvironments(['production', 'staging'])
            ->preferChannels(['web', 'api'])
            ->rolloutNamespace('order')
            ->rolloutKeyResolver(function ($model) {
                return (string)$model->getKey();
            });
    }
}
```

### Subject Collection

If your model has a collection field, you can use it for flow selection:

```php
class Order extends Model
{
    use HasWorkflow;

    protected $fillable = [
        'collection', // e.g., 'premium', 'standard'
        'status',
    ];

    protected function flowSubjectCollection(): ?string
    {
        return $this->getAttribute('collection');
    }
}
```

## Working with Bound Flows

### Get Bound Flow

Retrieve the currently bound flow for a model:

```php
$order = Order::find(1);

// Get bound flow (lazy loading)
$flow = $order->boundFlow();

// Eager load for better performance
$order = Order::withFlow()->find(1);
$flow = $order->boundFlow();
```

### Flow Use Relation

Access the `FlowUse` relationship directly:

```php
$order = Order::find(1);

// Get the FlowUse record
$flowUse = $order->flowUse;

// Access the flow through the relation
$flow = $order->flowUse->flow;
```

### Eager Loading

Use the `withFlow()` scope to efficiently load flows:

```php
// Single model
$order = Order::withFlow()->find(1);

// Multiple models
$orders = Order::withFlow()->get();

// In queries
$orders = Order::withFlow()
    ->where('status', 'pending')
    ->get();
```

## Manual Flow Binding

### Bind Flow

Manually bind a specific flow to a model:

```php
use JobMetric\Flow\Facades\Flow;

$order = Order::find(1);
$flow = Flow::show($flowId)->getData();

$order->bindFlow($flow);

// With custom timestamp
$order->bindFlow($flow, Carbon::now()->subDays(1));
```

### Rebind Flow

Re-pick and rebind a flow (useful when flow configuration changes):

```php
// Rebind with default picker
$flow = $order->rebindFlow();

// Rebind with custom tuner
$flow = $order->rebindFlow(function ($builder) {
    $builder->environment('staging');
});
```

### Unbind Flow

Remove the flow binding:

```php
$order->unbindFlow();
```

## Flow Picking

### Pick Flow

Manually pick a flow without binding it:

```php
$order = Order::find(1);

// Pick with default configuration
$flow = $order->pickFlow();

// The flow is not automatically bound
```

### Preview Flow Selection

Use the Flow service to preview which flow would be selected:

```php
use JobMetric\Flow\Facades\Flow;

$order = Order::find(1);

// Preview without binding
$flow = Flow::previewPick($order);

// Preview with custom tuner
$flow = Flow::previewPick($order, function ($builder) {
    $builder->environment('staging');
});
```

## Status Management

### Current Status Value

Get the current status as a scalar value (handles enum casting):

```php
$order = Order::find(1);

// Returns the status value (works with enums too)
$status = $order->flowCurrentStatusValue();
// Returns: 'pending', 'processing', etc.
```

### Status Enum Support

The trait automatically detects if your status column uses an enum:

```php
use App\Enums\OrderStatus;

class Order extends Model
{
    use HasWorkflow;

    protected $casts = [
        'status' => OrderStatus::class,
    ];
}

// Get enum class
$enumClass = $order->flowStatusEnumClass();
// Returns: OrderStatus::class

// Get enum values
$values = $order->flowStatusEnumValues();
// Returns: ['pending', 'processing', 'shipped', 'delivered']
```

### Custom Status Enum

If you're using a custom enum with a `values()` method:

```php
enum OrderStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case SHIPPED = 'shipped';
    case DELIVERED = 'delivered';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
```

The trait will automatically use this method to get enum values.

## Complete Example

Here's a complete example of using HasWorkflow in a real-world scenario:

```php
use Illuminate\Database\Eloquent\Model;
use JobMetric\Flow\HasWorkflow;
use JobMetric\Flow\Support\FlowPickerBuilder;
use App\Enums\OrderStatus;

class Order extends Model
{
    use HasWorkflow;

    protected $fillable = [
        'user_id',
        'collection',
        'status',
        'total',
    ];

    protected $casts = [
        'status' => OrderStatus::class,
        'total' => 'decimal:2',
    ];

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        $builder
            ->subjectScope($this->user_id ? (string)$this->user_id : null)
            ->subjectCollection($this->collection)
            ->environment(config('app.env'))
            ->channel(request()->header('X-Channel', 'web'))
            ->rolloutNamespace('order')
            ->rolloutKeyResolver(function ($model) {
                return (string)$model->getKey();
            });
    }

    protected function flowSubjectCollection(): ?string
    {
        return $this->getAttribute('collection');
    }
}

// Usage
$order = Order::create([
    'user_id' => 1,
    'collection' => 'premium',
    'total' => 100.00,
]);

// Flow is automatically bound
$flow = $order->boundFlow();

// Get current status
$status = $order->flowCurrentStatusValue();

// Execute a transition
use JobMetric\Flow\Facades\FlowTransition;

FlowTransition::runner('start_processing', $order);
```

## Lifecycle Events

The trait hooks into Eloquent's `creating` and `created` events:

- **creating**: Picks the flow and stores it temporarily
- **created**: Persists the flow binding to the database

If a flow binding already exists, the trait will skip automatic binding.

## Best Practices

1. **Always use eager loading** when working with multiple models:
   ```php
   $orders = Order::withFlow()->get();
   ```

2. **Override `buildFlowPicker()`** to customize flow selection based on your business logic

3. **Use `flowSubjectCollection()`** if you have different workflow variants for the same model type

4. **Ensure status column exists** before using the trait to avoid runtime errors

5. **Use enums for status** to get better type safety and automatic value detection

## Troubleshooting

### Flow Not Binding

If a flow is not being bound automatically:

1. Check that a flow exists with the correct `subject_type`
2. Verify the flow is active and matches your selection criteria
3. Check the `buildFlowPicker()` configuration

### Status Column Missing

If you get an error about missing status column:

```php
// Error: Model Order must have a "status" column in table "orders"

// Solution: Add the column in a migration
Schema::table('orders', function (Blueprint $table) {
    $table->string('status')->nullable();
});
```

### Enum Not Detected

If enum values are not being detected:

1. Ensure the enum class exists and is properly imported
2. Check that the `$casts` array includes the status column
3. For custom enums, implement a `values()` static method

