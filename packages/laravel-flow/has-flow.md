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

## How HasFlow Works

`HasFlow` is built on top of `HasWorkflow` and simplifies flow selection by using a direct Flow ID resolver instead of complex picker logic. Here's how it works:

1. **Uses HasWorkflow internally**: All `HasWorkflow` functionality is available
2. **Overrides `buildFlowPicker()`**: Uses `forceFlowIdResolver()` to directly resolve Flow by ID
3. **Disables complex features**: Sets `onlyActive(false)` and `evaluateRollout(false)` since we're binding by ID directly
4. **Simplifies selection**: No need for subject scope, environment, channel, or rollout logic

### Internal Implementation

When you use `HasFlow`, it:

```php
// Internally, HasFlow does this:
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    // Set basic configuration
    $builder->subjectType(static::class)
        ->subjectCollection($this->flowSubjectCollection())
        ->onlyActive(false)        // Disabled - we bind by ID directly
        ->evaluateRollout(false)    // Disabled - no rollout needed
        ->timeNow(Carbon::now('UTC'))
        ->orderByDefault();

    // Use forceFlowIdResolver to directly get Flow by ID
    $builder->forceFlowIdResolver(function ($model) {
        return $model->resolveFlow()?->getKey();
    });
}
```

The `forceFlowIdResolver` bypasses all the complex selection logic and directly returns the Flow ID from your `flowId()` method.

## Automatic Flow Binding

When a model using `HasFlow` is created, the trait automatically:

1. Calls `flowId()` to get the Flow ID
2. Resolves the Flow model from the database
3. Uses `forceFlowIdResolver` to bypass complex picker logic
4. Binds the flow to the model via the `flow_uses` table
5. Sets the initial status if the flow has a START state

```php
$order = Order::create([
    'user_id' => 1,
    'status' => null, // Will be set automatically if flow has START state
]);

// Flow is automatically bound
$boundFlow = $order->boundFlow();
```

### Lifecycle Events

`HasFlow` uses the same lifecycle events as `HasWorkflow`:

- **creating**: 
  1. Calls `flowId()` to get Flow ID
  2. Calls `resolveFlow()` to find Flow model
  3. Uses `forceFlowIdResolver` to bypass picker logic
  4. Stores Flow ID in `selectedFlowIdForBinding`
  
- **created**: 
  1. Uses stored `selectedFlowIdForBinding` or calls `resolveFlow()` again
  2. Creates FlowUse record if Flow was found

The difference is that `HasFlow` uses `forceFlowIdResolver` instead of the complex FlowPicker logic.

### Understanding resolveFlow()

The `resolveFlow()` method is called internally to convert Flow ID to Flow model:

```php
// Inside HasFlow
protected function resolveFlow(): ?Flow
{
    $flowId = $this->flowId(); // Get ID from your method
    if ($flowId !== null) {
        return Flow::query()->find($flowId); // Find Flow model
    }
    return null;
}
```

This method:
- Calls your `flowId()` method
- Queries the database for the Flow
- Returns `null` if Flow ID is null or Flow doesn't exist

**Important:** If `resolveFlow()` returns `null`, no binding will be created (no error thrown).

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

Re-pick and rebind a flow. This will call `flowId()` again and rebind:

```php
// Rebind will use the flowId() method again
$flow = $order->rebindFlow();

// With custom tuner (though less useful in HasFlow)
$flow = $order->rebindFlow(function ($builder) {
    // Note: forceFlowIdResolver will still bypass most of this
    $builder->environment('staging');
});
```

**How it works:**

1. Creates a new `FlowPickerBuilder` with your `buildFlowPicker()` configuration
2. Applies the tuner callback if provided
3. Uses `forceFlowIdResolver` to get Flow ID from `flowId()`
4. Finds and binds the Flow

**Note:** Since `HasFlow` uses `forceFlowIdResolver`, the tuner callback has limited effect. Most builder options are bypassed. If you need to customize rebinding logic, consider using `HasWorkflow` instead.

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

## Real-World Scenarios

### Scenario 1: Simple Order Processing

Single workflow for all orders:

```php
class Order extends Model
{
    use HasFlow;

    protected function flowId(): ?int
    {
        return config('flows.order_flow_id', 1);
    }
}
```

**Setup:**
```php
// Create the flow once
$flow = Flow::store([
    'subject_type' => Order::class,
    'version' => 1,
])->getData();

// Store in config
config(['flows.order_flow_id' => $flow->id]);
```

### Scenario 2: Content Approval

Single workflow for content approval:

```php
class Article extends Model
{
    use HasFlow;

    protected function flowId(): ?int
    {
        // All articles use the same approval workflow
        return 1; // Hardcoded flow ID
    }
}
```

### Scenario 3: Dynamic Flow Based on Model Attribute

Select flow based on a simple attribute:

```php
class Order extends Model
{
    use HasFlow;

    protected $fillable = [
        'order_type', // 'premium' or 'standard'
        'status',
    ];

    protected function flowId(): ?int
    {
        $orderType = $this->getAttribute('order_type');
        
        return match($orderType) {
            'premium' => config('flows.premium_order_flow_id'),
            'standard' => config('flows.standard_order_flow_id'),
            default => config('flows.default_order_flow_id'),
        };
    }
}
```

**When to switch to HasWorkflow:**

If you need to add:
- Environment-based selection
- Channel-based selection
- Rollout percentages
- Active time windows
- Subject scope partitioning

Then switch to `HasWorkflow` instead.

### Scenario 4: Configuration-Based Flow

Flow ID from configuration file:

```php
// config/flows.php
return [
    'order_flow_id' => env('ORDER_FLOW_ID', 1),
    'invoice_flow_id' => env('INVOICE_FLOW_ID', 2),
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

This allows easy flow management via environment variables.

## Testing and Debugging

### Testing Flow ID Resolution

Test that `flowId()` returns the correct value:

```php
$order = Order::make(['user_id' => 1]);

// Test flowId() method
$flowId = $order->flowId();
assert($flowId === 1, 'Flow ID should be 1');

// Test resolveFlow()
$flow = $order->resolveFlow();
assert($flow !== null, 'Flow should be found');
assert($flow->id === 1, 'Flow ID should match');
```

### Debugging Flow Binding

Check if flow binding is working:

```php
$order = Order::create([...]);

// Check if flow was bound
if ($order->boundFlow()) {
    logger()->info('Flow bound', [
        'flow_id' => $order->boundFlow()->id,
    ]);
} else {
    logger()->warning('No flow bound', [
        'order_id' => $order->id,
        'flow_id_from_method' => $order->flowId(),
    ]);
}
```

### Testing bindFlow with ID

Test that `bindFlow()` accepts Flow ID:

```php
$order = Order::create([...]);

// Test binding by ID
try {
    $order->bindFlow(1);
    assert($order->boundFlow()->id === 1, 'Flow should be bound');
} catch (LogicException $e) {
    // Flow ID doesn't exist
    logger()->error('Flow not found', ['flow_id' => 1]);
}
```

### Verifying Flow Exists

Before using a Flow ID, verify it exists:

```php
use JobMetric\Flow\Facades\Flow;

$flowId = config('flows.order_flow_id');
$flow = Flow::show($flowId);

if (!$flow->isSuccess()) {
    throw new \Exception("Flow with ID {$flowId} does not exist");
}
```

### Common Issues

**Issue: flowId() returns null**

```php
// Check your flowId() implementation
protected function flowId(): ?int
{
    $id = config('flows.order_flow_id');
    
    // Add logging for debugging
    if (config('app.debug')) {
        logger()->debug('Flow ID resolution', [
            'config_value' => $id,
            'model_id' => $this->id,
        ]);
    }
    
    return $id;
}
```

**Issue: Flow not found**

```php
// Verify flow exists in database
$flowId = $order->flowId();
$flow = Flow::query()->find($flowId);

if (!$flow) {
    // Flow doesn't exist - create it or update flowId()
    logger()->error('Flow not found', ['flow_id' => $flowId]);
}
```

## Understanding the Internal Mechanism

### Relationship with HasWorkflow

`HasFlow` is essentially a simplified wrapper around `HasWorkflow`. It:

1. **Uses HasWorkflow trait**: All `HasWorkflow` methods are available
2. **Overrides buildFlowPicker()**: Replaces complex picker logic with direct ID resolution
3. **Uses forceFlowIdResolver**: Bypasses all selection criteria and directly returns Flow ID

### How forceFlowIdResolver Works

The `forceFlowIdResolver` is a special callback that, when set, bypasses all FlowPicker logic:

```php
// Inside HasFlow::buildFlowPicker()
$builder->forceFlowIdResolver(function (Model $model): ?int {
    $flow = $model->resolveFlow(); // Calls flowId() and finds Flow
    return $flow?->getKey(); // Returns Flow ID directly
});
```

When `forceFlowIdResolver` is set:
- All other selection criteria (environment, channel, rollout, etc.) are ignored
- The FlowPicker directly uses the returned Flow ID
- No complex querying or filtering happens

### Why onlyActive and evaluateRollout are Disabled

In `HasFlow::buildFlowPicker()`, you'll notice:

```php
->onlyActive(false)        // Disabled
->evaluateRollout(false)   // Disabled
```

These are disabled because:
- **Direct ID binding**: You're explicitly choosing a Flow by ID, so active status checks aren't needed
- **Simplified logic**: No need to check rollout percentages when you know the exact Flow ID
- **Performance**: Faster resolution without additional checks

If you need these features, you should use `HasWorkflow` instead.

### Overriding buildFlowPicker in HasFlow

While `HasFlow` provides a simplified `buildFlowPicker()`, you can still override it if needed:

```php
class Order extends Model
{
    use HasFlow;

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        // Call parent to set up forceFlowIdResolver
        parent::buildFlowPicker($builder);

        // You can still add custom logic if needed
        // But remember: forceFlowIdResolver will bypass most of it
    }
}
```

**Note:** Since `forceFlowIdResolver` bypasses most selection logic, customizing `buildFlowPicker()` in `HasFlow` is rarely needed. If you find yourself needing to customize it extensively, consider using `HasWorkflow` instead.

### flowSubjectCollection Support

`HasFlow` includes `flowSubjectCollection()` for compatibility with `HasWorkflow`, but it's not used in flow selection (since we bind by ID directly):

```php
class Order extends Model
{
    use HasFlow;

    protected $fillable = [
        'collection',
        'status',
    ];

    // This is available but not used for flow selection
    protected function flowSubjectCollection(): ?string
    {
        return $this->getAttribute('collection');
    }
}
```

**Note:** While `flowSubjectCollection()` is available, it doesn't affect flow selection in `HasFlow` because `forceFlowIdResolver` bypasses collection-based filtering. If you need collection-based flow selection, use `HasWorkflow` instead.

## Differences from HasWorkflow

| Feature | HasFlow | HasWorkflow |
|---------|---------|-------------|
| Flow Selection | Direct by ID via `forceFlowIdResolver` | Complex picker with multiple criteria |
| Subject Scope | Not used | Supported |
| Subject Collection | Supported (for compatibility) | Supported |
| Environment | Not used | Supported |
| Channel | Not used | Supported |
| Rollout Percentage | Disabled (`evaluateRollout(false)`) | Supported |
| Active Window | Disabled (`onlyActive(false)`) | Supported |
| Flow Picker | Uses `forceFlowIdResolver` | Uses full FlowPicker logic |
| Complexity | Simple | Advanced |
| Use Case | Single flow per model | Multiple flows per model |
| Base Trait | Built on HasWorkflow | Standalone |

### Why HasFlow Disables Some Features

`HasFlow` sets `onlyActive(false)` and `evaluateRollout(false)` because:

1. **Direct ID binding**: When you specify a Flow ID directly, you don't need active window checks
2. **Simplified logic**: No need for rollout percentages when binding by ID
3. **Performance**: Faster flow resolution without complex picker logic
4. **Explicit control**: You control which flow to use via `flowId()` method

If you need these features, use `HasWorkflow` instead.

## Performance Considerations

### Eager Loading

Since `HasFlow` uses `HasWorkflow` internally, you can use the same eager loading:

```php
// ✅ Good: Eager load flows
$orders = Order::withFlow()->get();

// ❌ Bad: N+1 queries
$orders = Order::all();
foreach ($orders as $order) {
    $flow = $order->boundFlow(); // Query for each order
}
```

### Flow ID Resolution

The `flowId()` method is called during model creation. Make sure it's efficient:

```php
// ✅ Good: Simple, fast
protected function flowId(): ?int
{
    return config('flows.order_flow_id');
}

// ⚠️ Acceptable: Database lookup (cache if possible)
protected function flowId(): ?int
{
    return Cache::remember('order_flow_id', 3600, function () {
        return Flow::where('subject_type', static::class)
            ->where('is_default', true)
            ->value('id');
    });
}

// ❌ Bad: Complex logic in flowId()
protected function flowId(): ?int
{
    // Avoid heavy computations here
    // This runs during every model creation
}
```

## Best Practices

1. **Use `flowId()` method** for clean, maintainable code
2. **Store flow IDs in configuration** for easy management
3. **Use `withFlow()` scope** when loading multiple models
4. **Override `flowId()`** rather than using attributes when possible
5. **Keep `flowId()` simple** - avoid heavy computations
6. **Consider `HasWorkflow`** if your requirements become complex
7. **Cache flow IDs** if they come from database lookups

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

**Important:** If `flowId()` returns `null` or the Flow doesn't exist, no error is thrown. The model will be created without a flow binding. This is by design to allow models to exist without workflows.

### Flow ID Returns Null

If `flowId()` returns `null`, no binding is created:

```php
protected function flowId(): ?int
{
    // If this returns null, no flow binding is created
    // No error is thrown - this is intentional
    return null;
}
```

This is useful when:
- Flow hasn't been created yet
- You want to bind flows manually later
- Some models shouldn't have workflows

### Binding Flow Manually After Creation

If a model was created without a flow binding, you can bind it later:

```php
$order = Order::create([...]); // No flow binding

// Bind flow later
$order->bindFlow(1); // Or $order->bindFlow($flow)
```

### Error Handling in bindFlow()

The `bindFlow()` method throws exceptions for invalid inputs:

```php
try {
    // Invalid Flow ID
    $order->bindFlow(999); // Throws LogicException if Flow doesn't exist
    
    // Invalid type
    $order->bindFlow('invalid'); // Throws LogicException
} catch (LogicException $e) {
    // Handle error
    logger()->error('Failed to bind flow', ['error' => $e->getMessage()]);
}
```

### Status Column Missing

Same as `HasWorkflow` - ensure your model has a `status` column:

```php
Schema::table('orders', function (Blueprint $table) {
    $table->string('status')->nullable();
});
```

## Status Management

Since `HasFlow` uses `HasWorkflow` internally, all status management methods are available:

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
    use HasFlow;

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

See the `HasWorkflow` documentation for detailed enum handling information.

## Database Setup

### Migration Example

Here's a complete migration example for a model using `HasFlow`:

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('status')->nullable(); // Required for HasFlow
            $table->decimal('total', 10, 2);
            $table->timestamps();
            
            // Optional: If you want to store flow_id in the table
            // (though not recommended - use flowId() method instead)
            // $table->unsignedBigInteger('flow_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
```

**Important:** The `status` column is required. The `flow_id` column is optional and only needed if you want to use the attribute-based flow ID resolution.

### Flow Setup

Before using `HasFlow`, create the flow:

```php
use JobMetric\Flow\Facades\Flow;

$flow = Flow::store([
    'subject_type' => Order::class,
    'version' => 1,
    'status' => true,
])->getData();

// Use this flow ID in your flowId() method
// Or store it in config: config(['flows.order_flow_id' => $flow->id]);
```

