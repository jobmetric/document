---
sidebar_position: 4
sidebar_label: HasFlow
---

# HasFlow Trait

The `HasFlow` trait is a simplified version of `HasWorkflow` that directly binds a model to a specific flow by ID. This trait is perfect for projects where a model has only one flow and you don't need complex flow selection logic.

## When to Use HasFlow

**Use `HasFlow` when you have:**

- **Single flow per model**: One workflow for each model type
- **Fixed flow assignment**: Flow ID is known and doesn't change dynamically
- **Simple requirements**: No need for complex selection logic based on scope, collection, or rollout
- **Straightforward projects**: 90% of typical use cases fit this pattern

**Example scenarios:**
- Simple order processing with one workflow
- Basic content approval with a single workflow
- Standard document workflows
- Projects where workflow complexity is minimal

## HasFlow vs HasWorkflow

**Choose `HasFlow` if:**
- You have a single, fixed flow per model type
- Flow selection is simple and doesn't change
- You prefer explicit flow ID assignment
- Your project is straightforward with minimal workflow complexity

**Choose `HasWorkflow` if:**
- You have multiple flows for the same model type
- Flow selection depends on dynamic criteria (user, collection, environment, etc.)
- You need advanced features like rollout percentages or active windows
- Your workflow requirements are complex and may change over time

For most simple projects (90% of use cases), `HasFlow` is recommended. For complex scenarios with multiple flows and dynamic selection, use `HasWorkflow`.

## Namespace

```php
JobMetric\Flow\HasFlow
```

## Basic Usage

To use the HasFlow trait, simply add it to your model:

```php
use Illuminate\Database\Eloquent\Model;
use JobMetric\Flow\HasFlow;

class Order extends Model
{
    use HasFlow;

    protected $fillable = [
        'user_id',
        'status',
    ];
}
```

## Requirements

### Status Column

Your model **must** have a `status` column in the database table, just like `HasWorkflow`.

```php
// Migration example
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->string('status')->nullable();
    // ... other columns
});
```

### Flow ID Resolution

You need to provide a way for the trait to get the Flow ID. There are several options:

1. **Override `flowId()` method** (recommended)
2. **Use `flow_id` attribute** (if your table has this column)
3. **Use configuration** (for global flows)

## Flow ID Resolution Methods

### Method 1: Override flowId()

The recommended approach is to override the `flowId()` method:

```php
class Order extends Model
{
    use HasFlow;

    protected function flowId(): ?int
    {
        // Return a fixed flow ID
        return 1;
        
        // Or from config
        return config('flows.order_flow_id');
        
        // Or based on model attribute
        return $this->getAttribute('workflow_id');
    }
}
```

### Method 2: Use flow_id Attribute

If your model has a `flow_id` attribute, it will be used automatically:

```php
// Migration
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('flow_id')->nullable();
    $table->string('status')->nullable();
});

// Model
class Order extends Model
{
    use HasFlow;
    
    // flowId() will automatically use the flow_id attribute
}
```

**Note:** If you use `flow_id` as an attribute but don't want it saved to the database, you can handle it in model events:

```php
class Order extends Model
{
    use HasFlow;

    private ?int $flowIdTemp = null;

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $model): void {
            $flowId = $model->getAttribute('flow_id');
            if ($flowId !== null) {
                $model->flowIdTemp = (int) $flowId;
                unset($model->attributes['flow_id']);
            }
        });

        static::saved(function (self $model): void {
            if ($model->flowIdTemp !== null) {
                $model->setAttribute('flow_id', $model->flowIdTemp);
                $model->flowIdTemp = null;
            }
        });
    }

    protected function flowId(): ?int
    {
        if ($this->flowIdTemp !== null) {
            return $this->flowIdTemp;
        }

        return $this->getAttribute('flow_id');
    }
}
```

### Method 3: Use Configuration

You can also use Laravel's configuration system:

```php
// config/flows.php
return [
    'order_flow_id' => 1,
];

// Model
class Order extends Model
{
    use HasFlow;

    protected function flowId(): ?int
    {
        return config('flows.order_flow_id');
    }
}
```

## Automatic Flow Binding

When a model using `HasFlow` is created, the trait automatically:

1. Resolves the Flow ID using the `flowId()` method
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

## Working with Bound Flows

All methods from `HasWorkflow` are available in `HasFlow` since it uses `HasWorkflow` internally:

### Get Bound Flow

```php
$order = Order::find(1);

// Get bound flow (lazy loading)
$flow = $order->boundFlow();

// Eager load for better performance
$order = Order::withFlow()->find(1);
$flow = $order->boundFlow();
```

### Bind Flow

Manually bind a specific flow (accepts Flow instance or ID):

```php
use JobMetric\Flow\Facades\Flow;

$order = Order::find(1);

// Bind by Flow instance
$flow = Flow::show($flowId)->getData();
$order->bindFlow($flow);

// Bind by Flow ID (HasFlow specific feature)
$order->bindFlow(1);

// With custom timestamp
$order->bindFlow(1, Carbon::now()->subDays(1));
```

### Rebind Flow

Re-pick and rebind a flow:

```php
// Rebind will use the flowId() method again
$flow = $order->rebindFlow();
```

### Unbind Flow

Remove the flow binding:

```php
$order->unbindFlow();
```

## Complete Example

Here's a complete example of using HasFlow:

```php
use Illuminate\Database\Eloquent\Model;
use JobMetric\Flow\HasFlow;
use App\Enums\OrderStatus;

class Order extends Model
{
    use HasFlow;

    protected $fillable = [
        'user_id',
        'status',
        'total',
    ];

    protected $casts = [
        'status' => OrderStatus::class,
        'total' => 'decimal:2',
    ];

    protected function flowId(): ?int
    {
        // Return the flow ID for orders
        // This could come from config, database, or be hardcoded
        return config('flows.order_flow_id', 1);
    }
}

// Usage
$order = Order::create([
    'user_id' => 1,
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

## Advanced Example with Dynamic Flow ID

If you need to select flow based on model attributes but still want simplicity:

```php
class Order extends Model
{
    use HasFlow;

    protected $fillable = [
        'user_id',
        'order_type', // 'premium' or 'standard'
        'status',
    ];

    protected function flowId(): ?int
    {
        // Select flow based on order type
        $orderType = $this->getAttribute('order_type');
        
        return match($orderType) {
            'premium' => config('flows.premium_order_flow_id'),
            'standard' => config('flows.standard_order_flow_id'),
            default => config('flows.default_order_flow_id'),
        };
    }
}
```

**Note:** If your flow selection logic becomes more complex (involving environment, channel, rollout, etc.), consider switching to `HasWorkflow` instead.

## Differences from HasWorkflow

| Feature | HasFlow | HasWorkflow |
|---------|---------|-------------|
| Flow Selection | Direct by ID | Complex picker with multiple criteria |
| Subject Scope | Not used | Supported |
| Subject Collection | Not used | Supported |
| Environment | Not used | Supported |
| Channel | Not used | Supported |
| Rollout Percentage | Not used | Supported |
| Active Window | Not used | Supported |
| Complexity | Simple | Advanced |
| Use Case | Single flow per model | Multiple flows per model |

## Best Practices

1. **Use `flowId()` method** for clean, maintainable code
2. **Store flow IDs in configuration** for easy management
3. **Use `withFlow()` scope** when loading multiple models
4. **Override `flowId()`** rather than using attributes when possible
5. **Consider `HasWorkflow`** if your requirements become complex

## Troubleshooting

### Flow Not Binding

If a flow is not being bound:

1. Check that `flowId()` returns a valid Flow ID
2. Verify the flow exists in the database
3. Ensure the flow's `subject_type` matches your model class

### Flow ID Not Found

If you get an error about flow not found:

```php
// Error: Flow with ID 1 not found.

// Solution: Ensure the flow exists
use JobMetric\Flow\Facades\Flow;

$flow = Flow::show(1);
if (!$flow->isSuccess()) {
    // Flow doesn't exist, create it or use a different ID
}
```

### Status Column Missing

Same as `HasWorkflow` - ensure your model has a `status` column:

```php
Schema::table('orders', function (Blueprint $table) {
    $table->string('status')->nullable();
});
```

