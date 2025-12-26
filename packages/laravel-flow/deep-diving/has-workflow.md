---
sidebar_position: 1
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

Make sure you have created flows with the correct `subject_type` matching your model class. You can create multiple flows for different scenarios:

```php
use JobMetric\Flow\Facades\Flow;

// Production flow
$prodFlow = Flow::store([
    'subject_type' => Order::class,
    'subject_scope' => null,
    'subject_collection' => null,
    'environment' => 'production',
    'channel' => 'web',
    'version' => 1,
    'status' => true,
    'is_default' => true,
]);

// Staging flow
$stagingFlow = Flow::store([
    'subject_type' => Order::class,
    'subject_scope' => null,
    'subject_collection' => null,
    'environment' => 'staging',
    'channel' => 'web',
    'version' => 1,
    'status' => true,
    'is_default' => true,
]);

// Premium collection flow
$premiumFlow = Flow::store([
    'subject_type' => Order::class,
    'subject_scope' => null,
    'subject_collection' => 'premium',
    'environment' => 'production',
    'channel' => 'web',
    'version' => 1,
    'status' => true,
    'is_default' => true,
]);
```

### Database Migration Example

Here's a complete migration example for a model using `HasWorkflow`:

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
            $table->string('collection')->nullable(); // For subject_collection
            $table->string('status')->nullable(); // Required for HasWorkflow
            $table->decimal('total', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
```

**Required columns:**
- `status`: Required for workflow state management

**Optional columns:**
- `collection`: If you use `flowSubjectCollection()`
- Any other columns your model needs

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

You can customize how flows are selected by overriding the `buildFlowPicker()` method. This method receives a `FlowPickerBuilder` instance that you can configure with various options:

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

### FlowPickerBuilder Options

The `FlowPickerBuilder` provides extensive configuration options for flow selection:

#### Subject Scope

Use `subjectScope()` to partition flows by tenant, organization, or any logical grouping:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);

    // Partition flows by user/tenant
    $builder->subjectScope($this->user_id ? (string)$this->user_id : null);

    // Or by organization
    $builder->subjectScope($this->organization_id ? (string)$this->organization_id : null);
}
```

**Use case:** Multi-tenant applications where each tenant has different workflows.

#### Environment

Filter flows by environment (production, staging, development):

```php
$builder->environment(config('app.env'));

// Or based on request
$builder->environment(request()->header('X-Environment', 'production'));
```

**Use case:** Different workflows for different deployment environments.

#### Channel

Filter flows by channel (web, api, mobile, etc.):

```php
$builder->channel(request()->header('X-Channel', 'web'));

// Or based on route
$builder->channel(request()->is('api/*') ? 'api' : 'web');
```

**Use case:** Different workflows for web vs API requests.

#### Preferred Environments and Channels

Use `preferEnvironments()` and `preferChannels()` for ordering (not filtering). Earlier items rank higher:

```php
$builder
    ->preferEnvironments(['production', 'staging', 'development'])
    ->preferChannels(['web', 'api', 'mobile']);
```

This means if multiple flows match, the one with the preferred environment/channel will be selected first.

#### Rollout Configuration

Configure rollout (canary deployment) for gradual feature rollouts:

```php
$builder
    ->evaluateRollout(true)
    ->rolloutNamespace('order') // Isolate rollout buckets
    ->rolloutSalt('v2') // Additional salt for stability
    ->rolloutKeyResolver(function ($model) {
        // Return a stable key (e.g., user_id, order_id)
        return (string)$model->getKey();
    });
```

**Rollout Namespace:** Isolates rollout buckets across different features/domains. This ensures that rollout percentages are independent for different features.

**Rollout Salt:** Additional salt for hashing to further stabilize or segregate rollout buckets.

**Rollout Key Resolver:** Returns a stable key (like user_id or order_id) that determines which bucket the model falls into. The same key will always fall into the same bucket.

**Example:** If a flow has `rollout_pct: 50`, only 50% of models (based on the rollout key) will be assigned to this flow.

#### Fallback Cascade

Define fallback steps to progressively relax constraints if no flow matches:

```php
use JobMetric\Flow\Support\FlowPickerBuilder;

$builder->fallbackCascade([
    FlowPickerBuilder::FB_DROP_CHANNEL,        // Remove channel filter
    FlowPickerBuilder::FB_DROP_ENVIRONMENT,    // Remove environment filter
    FlowPickerBuilder::FB_IGNORE_TIMEWINDOW,   // Ignore active window
    FlowPickerBuilder::FB_DISABLE_ROLLOUT,      // Disable rollout checks
    FlowPickerBuilder::FB_DROP_REQUIRE_DEFAULT, // Don't require is_default
]);
```

The system will try each step in order until a flow is found.

#### Active Window

Control time-based flow activation:

```php
$builder
    ->onlyActive(true)           // Require status=true and active window
    ->ignoreTimeWindow(false)    // Enforce active_from/active_to
    ->timeNow(Carbon::now('UTC')); // Reference time for evaluation
```

**Use case:** Schedule workflows to activate/deactivate at specific times.

#### Custom Where Clauses

Add custom query constraints to filter flows:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);

    $builder->where(function ($query, $model) {
        // Filter flows based on model attributes
        $query->where('custom_field', $model->some_attribute);
        
        // Or complex conditions
        if ($model->is_premium) {
            $query->where('is_premium_flow', true);
        }
    });
}
```

**Use case:** Custom business logic that doesn't fit standard criteria.

#### Version Constraints

Control which flow versions are eligible:

```php
$builder
    ->versionEquals(2)        // Exact version
    // OR
    ->versionMin(1)           // Minimum version
    ->versionMax(3);          // Maximum version
```

**Use case:** Gradual migration between flow versions.

#### Flow ID Whitelist/Blacklist

Include or exclude specific flows:

```php
$builder
    ->includeFlowIds([1, 2, 3])  // Only these flows
    ->excludeFlowIds([4, 5])     // Exclude these flows
    ->preferFlowIds([1, 2]);     // Prefer these (for ordering)
```

**Use case:** Testing specific flows or excluding deprecated flows.

#### Custom Ordering

Override default ordering:

```php
$builder->orderBy(function ($query) {
    $query->orderBy('priority', 'desc')
          ->orderBy('created_at', 'asc');
});
```

Default ordering is: `version DESC, is_default DESC, ordering DESC, id DESC`.

#### Match Strategy

Control how flows are selected when multiple matches exist:

```php
// STRATEGY_BEST: Returns the best candidate based on ordering rules (default)
$builder->matchStrategy(FlowPickerBuilder::STRATEGY_BEST);

// STRATEGY_FIRST: Returns the first matching record (minimal ordering)
$builder->matchStrategy(FlowPickerBuilder::STRATEGY_FIRST);
```

**STRATEGY_BEST** (default):
- Applies full ordering (version, is_default, ordering, id)
- Returns the highest-ranked flow
- Best for production use

**STRATEGY_FIRST**:
- Minimal ordering (just enough to get first match)
- Faster but less predictable
- Useful for testing or when order doesn't matter

#### Require Default

Only select flows marked as default:

```php
$builder->requireDefault(true);
```

This ensures only flows with `is_default = true` are selected. Useful when you want to enforce a single default flow per scope.

#### Request Caching

Enable per-request caching for better performance:

```php
$builder->cacheInRequest(true);
```

**Warning:** Only enable if your builder doesn't use dynamic callbacks that depend on request state. If callbacks access `$request`, `auth()`, or other request-specific data, caching may return incorrect results.

### Subject Collection

If your model has a collection field, you can use it for flow selection. Collections allow you to have different workflows for the same model type:

```php
class Order extends Model
{
    use HasWorkflow;

    protected $fillable = [
        'collection', // e.g., 'premium', 'standard', 'enterprise'
        'status',
    ];

    protected function flowSubjectCollection(): ?string
    {
        return $this->getAttribute('collection');
    }
}
```

**How it works:**

When you create flows, set the `subject_collection` field:

```php
// Premium order flow
$premiumFlow = Flow::store([
    'subject_type' => Order::class,
    'subject_collection' => 'premium',
    'version' => 1,
]);

// Standard order flow
$standardFlow = Flow::store([
    'subject_type' => Order::class,
    'subject_collection' => 'standard',
    'version' => 1,
]);
```

When creating orders:

```php
// Premium order - gets premium flow
$premiumOrder = Order::create([
    'collection' => 'premium',
    'user_id' => 1,
]);

// Standard order - gets standard flow
$standardOrder = Order::create([
    'collection' => 'standard',
    'user_id' => 1,
]);
```

**Advanced Collection Scenarios:**

You can combine collections with other criteria:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);

    $builder
        ->subjectCollection($this->collection)
        ->subjectScope((string)$this->tenant_id)
        ->environment(config('app.env'));
}
```

This allows you to have:
- Different flows per collection (premium vs standard)
- Different flows per tenant
- Different flows per environment

All combined for maximum flexibility.

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

Use the `withFlow()` scope to efficiently load flows. This prevents N+1 query problems:

```php
// Single model
$order = Order::withFlow()->find(1);

// Multiple models (prevents N+1 queries)
$orders = Order::withFlow()->get();

// In queries
$orders = Order::withFlow()
    ->where('status', 'pending')
    ->get();

// Combined with other relations
$orders = Order::withFlow()
    ->with('user', 'items')
    ->get();
```

**What `withFlow()` does:**

```php
// Internally, it does:
$query->with(['flowUse.flow']);

// This eager loads:
// 1. FlowUse records (polymorphic relation)
// 2. Flow models (through FlowUse)
```

**Performance Tip:**

Always use `withFlow()` when loading multiple models:

```php
// ❌ Bad: N+1 queries
$orders = Order::all();
foreach ($orders as $order) {
    $flow = $order->boundFlow(); // Query for each order
}

// ✅ Good: Single query
$orders = Order::withFlow()->get();
foreach ($orders as $order) {
    $flow = $order->boundFlow(); // Already loaded
}
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

Manually pick a flow without binding it. This uses the configured `buildFlowPicker()` logic:

```php
$order = Order::find(1);

// Pick with default configuration (uses buildFlowPicker())
$flow = $order->pickFlow();

// The flow is not automatically bound
// You can manually bind it if needed:
if ($flow) {
    $order->bindFlow($flow);
}
```

**How it works:**

1. Creates a new `FlowPickerBuilder` instance
2. Calls `buildFlowPicker()` to configure it
3. Uses `FlowPicker` to select the best matching flow
4. Returns the selected Flow or `null`

### Understanding makeFlowPicker()

The `makeFlowPicker()` method creates and configures a `FlowPickerBuilder`:

```php
// Internal implementation
protected function makeFlowPicker(): FlowPickerBuilder
{
    $builder = new FlowPickerBuilder();
    $this->buildFlowPicker($builder); // Your custom configuration
    return $builder;
}
```

You can use this in custom scenarios:

```php
$order = Order::find(1);

// Get the configured builder
$builder = $order->makeFlowPicker();

// Modify it further
$builder->environment('staging');

// Use it with FlowPicker
$flow = (new FlowPicker())->pick($order, $builder);
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

### Enum Detection Priority

The `flowStatusEnumValues()` method uses this priority:

1. **Custom `values()` method**: If your enum defines `static values()`, it's used first
2. **Backed Enum values**: If it's a `BackedEnum`, returns scalar values from cases
3. **Pure Enum names**: Otherwise, returns case names

```php
// Backed Enum
enum OrderStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
}

$values = $order->flowStatusEnumValues();
// Returns: ['pending', 'processing']

// Pure Enum
enum OrderStatus
{
    case PENDING;
    case PROCESSING;
}

$values = $order->flowStatusEnumValues();
// Returns: ['PENDING', 'PROCESSING']

// Custom values() method (highest priority)
enum OrderStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';

    public static function values(): array
    {
        return ['custom', 'values']; // This will be used
    }
}
```

### Getting Current Status

The `flowCurrentStatusValue()` method handles enum conversion:

```php
$order = Order::find(1);

// If status is a Backed Enum
$order->status = OrderStatus::PENDING; // OrderStatus enum
$value = $order->flowCurrentStatusValue();
// Returns: 'pending' (scalar value)

// If status is a Pure Enum
$order->status = OrderStatus::PENDING; // OrderStatus enum
$value = $order->flowCurrentStatusValue();
// Returns: 'PENDING' (case name)

// If status is a string
$order->status = 'pending';
$value = $order->flowCurrentStatusValue();
// Returns: 'pending' (raw value)
```

## Advanced FlowPickerBuilder Examples

### Multi-Tenant Application

For a multi-tenant application where each tenant has different workflows:

```php
class Order extends Model
{
    use HasWorkflow;

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        $builder
            ->subjectScope((string)$this->tenant_id) // Partition by tenant
            ->environment(config('app.env'))
            ->channel('web')
            ->fallbackCascade([
                FlowPickerBuilder::FB_DROP_CHANNEL,
                FlowPickerBuilder::FB_DROP_ENVIRONMENT,
            ]);
    }
}
```

### A/B Testing with Rollout

For gradual rollout of new workflows:

```php
class Order extends Model
{
    use HasWorkflow;

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        $builder
            ->environment('production')
            ->channel('web')
            ->evaluateRollout(true)
            ->rolloutNamespace('order_v2') // Isolate from other features
            ->rolloutSalt('2024') // Version salt
            ->rolloutKeyResolver(function ($model) {
                // Use user_id for consistent bucket assignment
                return (string)$model->user_id;
            })
            ->fallbackCascade([
                FlowPickerBuilder::FB_DISABLE_ROLLOUT, // Fallback to 100% if needed
            ]);
    }
}
```

**How Rollout Works:**

If you have two flows:
- Flow A: `rollout_pct: 50` (old workflow)
- Flow B: `rollout_pct: 50` (new workflow)

The system will:
1. Hash the rollout key (user_id) with namespace and salt
2. Determine which bucket (0-100) the user falls into
3. Assign Flow A to users in bucket 0-50
4. Assign Flow B to users in bucket 51-100

The same user will always get the same flow (consistent bucket assignment).

### Environment-Specific Workflows

For different workflows per environment:

```php
class Order extends Model
{
    use HasWorkflow;

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        $env = config('app.env');
        
        $builder
            ->environment($env)
            ->preferEnvironments(['production', 'staging', 'development'])
            ->fallbackCascade([
                FlowPickerBuilder::FB_DROP_ENVIRONMENT, // Fallback to any environment
            ]);
    }
}
```

### Channel-Based Workflows

For different workflows based on request channel:

```php
class Order extends Model
{
    use HasWorkflow;

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        $channel = request()->is('api/*') ? 'api' : 'web';
        
        $builder
            ->channel($channel)
            ->preferChannels(['web', 'api', 'mobile'])
            ->fallbackCascade([
                FlowPickerBuilder::FB_DROP_CHANNEL, // Fallback to any channel
            ]);
    }
}
```

### Collection-Based Workflows

For different workflows based on model collection:

```php
class Order extends Model
{
    use HasWorkflow;

    protected $fillable = [
        'collection', // 'premium', 'standard', 'enterprise'
        'status',
    ];

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        $builder
            ->subjectCollection($this->collection)
            ->environment(config('app.env'));
    }

    protected function flowSubjectCollection(): ?string
    {
        return $this->getAttribute('collection');
    }
}
```

### Scheduled Workflows

For workflows that activate/deactivate at specific times:

```php
class Order extends Model
{
    use HasWorkflow;

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        $builder
            ->onlyActive(true)
            ->ignoreTimeWindow(false) // Enforce active_from/active_to
            ->timeNow(Carbon::now('UTC'))
            ->fallbackCascade([
                FlowPickerBuilder::FB_IGNORE_TIMEWINDOW, // Fallback: ignore time window
            ]);
    }
}
```

### Complex Multi-Criteria Selection

Combining multiple criteria:

```php
class Order extends Model
{
    use HasWorkflow;

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        $builder
            ->subjectScope((string)$this->tenant_id)
            ->subjectCollection($this->order_type) // 'premium', 'standard'
            ->environment(config('app.env'))
            ->channel(request()->header('X-Channel', 'web'))
            ->preferEnvironments(['production', 'staging'])
            ->preferChannels(['web', 'api'])
            ->evaluateRollout(true)
            ->rolloutNamespace('order')
            ->rolloutKeyResolver(function ($model) {
                return (string)$model->user_id;
            })
            ->fallbackCascade([
                FlowPickerBuilder::FB_DROP_CHANNEL,
                FlowPickerBuilder::FB_DROP_ENVIRONMENT,
                FlowPickerBuilder::FB_IGNORE_TIMEWINDOW,
                FlowPickerBuilder::FB_DISABLE_ROLLOUT,
            ]);
    }
}
```

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

## Real-World Scenarios

### Scenario 1: Multi-Tenant SaaS Application

Different workflows per tenant with environment-specific variants:

```php
class Document extends Model
{
    use HasWorkflow;

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        $builder
            ->subjectScope((string)$this->tenant_id) // Partition by tenant
            ->environment(config('app.env'))
            ->channel(request()->header('X-Channel', 'web'))
            ->preferEnvironments(['production', 'staging', 'development'])
            ->fallbackCascade([
                FlowPickerBuilder::FB_DROP_CHANNEL,
                FlowPickerBuilder::FB_DROP_ENVIRONMENT,
            ]);
    }
}
```

**Flow setup:**
- Tenant 1, Production: Flow ID 1
- Tenant 1, Staging: Flow ID 2
- Tenant 2, Production: Flow ID 3
- etc.

### Scenario 2: E-Commerce with A/B Testing

Gradual rollout of new checkout workflow:

```php
class Checkout extends Model
{
    use HasWorkflow;

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        $builder
            ->environment('production')
            ->channel('web')
            ->evaluateRollout(true)
            ->rolloutNamespace('checkout_v2')
            ->rolloutSalt('2024-01')
            ->rolloutKeyResolver(function ($model) {
                // Use customer ID for consistent assignment
                return (string)$model->customer_id;
            })
            ->fallbackCascade([
                FlowPickerBuilder::FB_DISABLE_ROLLOUT, // Fallback to 100%
            ]);
    }
}
```

**Flow setup:**
- Old checkout: `rollout_pct: 50`
- New checkout: `rollout_pct: 50`

50% of customers get old workflow, 50% get new workflow, consistently assigned by customer ID.

### Scenario 3: Content Management with Collections

Different approval workflows for different content types:

```php
class Article extends Model
{
    use HasWorkflow;

    protected $fillable = [
        'collection', // 'news', 'blog', 'press-release'
        'status',
    ];

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        $builder
            ->subjectCollection($this->collection)
            ->environment(config('app.env'))
            ->channel('web');
    }

    protected function flowSubjectCollection(): ?string
    {
        return $this->getAttribute('collection');
    }
}
```

**Flow setup:**
- News articles: `subject_collection: 'news'`
- Blog posts: `subject_collection: 'blog'`
- Press releases: `subject_collection: 'press-release'`

### Scenario 4: Scheduled Workflow Activation

Workflows that activate at specific times:

```php
class Campaign extends Model
{
    use HasWorkflow;

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        $builder
            ->onlyActive(true)
            ->ignoreTimeWindow(false) // Enforce active_from/active_to
            ->timeNow(Carbon::now('UTC'))
            ->fallbackCascade([
                FlowPickerBuilder::FB_IGNORE_TIMEWINDOW, // Fallback if outside window
            ]);
    }
}
```

**Flow setup:**
- Summer campaign: `active_from: '2024-06-01'`, `active_to: '2024-08-31'`
- Winter campaign: `active_from: '2024-12-01'`, `active_to: '2024-02-28'`

### Scenario 5: Complex Multi-Criteria Selection

Combining all features for maximum flexibility:

```php
class Invoice extends Model
{
    use HasWorkflow;

    protected $fillable = [
        'tenant_id',
        'invoice_type', // 'recurring', 'one-time'
        'status',
    ];

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        $builder
            ->subjectScope((string)$this->tenant_id)
            ->subjectCollection($this->invoice_type)
            ->environment(config('app.env'))
            ->channel(request()->header('X-Channel', 'web'))
            ->preferEnvironments(['production', 'staging'])
            ->preferChannels(['web', 'api'])
            ->evaluateRollout(true)
            ->rolloutNamespace('invoice')
            ->rolloutKeyResolver(function ($model) {
                return (string)$model->customer_id;
            })
            ->onlyActive(true)
            ->ignoreTimeWindow(false)
            ->timeNow(Carbon::now('UTC'))
            ->fallbackCascade([
                FlowPickerBuilder::FB_DROP_CHANNEL,
                FlowPickerBuilder::FB_DROP_ENVIRONMENT,
                FlowPickerBuilder::FB_IGNORE_TIMEWINDOW,
                FlowPickerBuilder::FB_DISABLE_ROLLOUT,
            ]);
    }

    protected function flowSubjectCollection(): ?string
    {
        return $this->getAttribute('invoice_type');
    }
}
```

This configuration allows for:
- Different workflows per tenant
- Different workflows per invoice type
- Environment-specific workflows
- Channel-specific workflows
- Gradual rollout of new workflows
- Time-based activation
- Graceful fallbacks if no exact match

## Lifecycle Events

The trait hooks into Eloquent's `creating` and `created` events to automatically bind flows:

### Creating Event

During the `creating` event:

1. Checks if the model has a status column (throws exception if missing)
2. Checks if a flow binding already exists (skips if it does)
3. Calls `pickFlow()` to select the appropriate flow
4. Stores the selected flow ID in `selectedFlowIdForBinding` property

```php
// This happens automatically when you create a model
$order = Order::create([...]);
// Flow is picked and stored temporarily during 'creating' event
```

### Created Event

During the `created` event:

1. Checks if the model has a status column
2. Checks if a flow binding already exists (skips if it does)
3. Uses the stored `selectedFlowIdForBinding` or calls `pickFlow()` again
4. Creates a `FlowUse` record to bind the flow to the model

```php
// Flow binding is persisted to database during 'created' event
// FlowUse record is created in flow_uses table
```

**Important Notes:**

- If a `FlowUse` record already exists, the trait skips automatic binding
- If `pickFlow()` returns `null`, no binding is created (no error thrown)
- The `selectedFlowIdForBinding` property is used to avoid picking the flow twice

### Understanding selectedFlowIdForBinding

The `selectedFlowIdForBinding` property is a temporary storage mechanism:

1. **During `creating` event**: Flow is picked and ID is stored in this property
2. **During `created` event**: The stored ID is used instead of picking again
3. **Purpose**: Avoids picking the flow twice (once in creating, once in created)

This is important because:
- Flow picking can be expensive (database queries, complex logic)
- Model attributes might change between `creating` and `created` events
- Storing the ID ensures consistency

**Manual Access:**

You generally don't need to access this property directly, but if you do:

```php
// This is set automatically during creating event
$order->selectedFlowIdForBinding; // int|null
```

### Skipping Automatic Binding

If you want to skip automatic binding and handle it manually:

```php
// Create FlowUse record before creating the model
$order = new Order([...]);
$order->flowUse()->create(['flow_id' => $flowId]);
$order->save();

// The trait will detect existing FlowUse and skip automatic binding
```

## Performance Optimization

### Caching Flow Picker Results

For models with complex flow selection logic, you can enable request-level caching:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);

    // Enable caching if builder doesn't use dynamic callbacks
    $builder->cacheInRequest(true);
}
```

**Warning:** Only enable if your callbacks don't depend on request state. If callbacks access `$request`, `auth()`, or other request-specific data, caching may return incorrect results.

### Optimizing Flow Queries

The FlowPicker automatically optimizes queries, but you can help by:

1. **Indexing database columns** used in flow selection:
   ```php
   // Migration
   Schema::table('flows', function (Blueprint $table) {
       $table->index(['subject_type', 'subject_scope', 'subject_collection']);
       $table->index(['environment', 'channel']);
       $table->index(['status', 'active_from', 'active_to']);
   });
   ```

2. **Using specific criteria** instead of broad filters:
   ```php
   // ✅ Good: Specific
   $builder->environment('production')->channel('web');
   
   // ⚠️ Less optimal: Broad
   $builder->environment(null)->channel(null);
   ```

3. **Limiting fallback cascade** to necessary steps:
   ```php
   // ✅ Good: Only necessary fallbacks
   $builder->fallbackCascade([FlowPickerBuilder::FB_DROP_CHANNEL]);
   
   // ⚠️ Less optimal: Too many fallbacks
   $builder->fallbackCascade([
       FlowPickerBuilder::FB_DROP_CHANNEL,
       FlowPickerBuilder::FB_DROP_ENVIRONMENT,
       FlowPickerBuilder::FB_IGNORE_TIMEWINDOW,
       FlowPickerBuilder::FB_DISABLE_ROLLOUT,
       FlowPickerBuilder::FB_DROP_REQUIRE_DEFAULT,
   ]);
   ```

## Best Practices

1. **Always use eager loading** when working with multiple models:
   ```php
   $orders = Order::withFlow()->get();
   ```

2. **Override `buildFlowPicker()`** to customize flow selection based on your business logic

3. **Use `flowSubjectCollection()`** if you have different workflow variants for the same model type

4. **Ensure status column exists** before using the trait to avoid runtime errors

5. **Use enums for status** to get better type safety and automatic value detection

6. **Index database columns** used in flow selection for better performance

7. **Keep `buildFlowPicker()` efficient** - avoid heavy computations in callbacks

8. **Use specific criteria** instead of broad filters when possible

9. **Limit fallback cascade** to necessary steps only

10. **Enable request caching** only if callbacks don't depend on request state

## Testing and Debugging

### Testing Flow Selection

Use `Flow::previewPick()` to test which flow would be selected:

```php
$order = Order::make(['user_id' => 1, 'collection' => 'premium']);

// Preview without creating the model
$flow = Flow::previewPick($order);

// Test with different configurations
$flow = Flow::previewPick($order, function ($builder) {
    $builder->environment('staging');
});
```

### Debugging Flow Picker Configuration

Log the builder configuration to see what's being used:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);

    // Your configuration
    $builder->subjectScope((string)$this->user_id);

    // Debug: Log configuration
    if (config('app.debug')) {
        logger()->debug('FlowPicker configuration', [
            'subject_type' => static::class,
            'subject_scope' => $this->user_id,
            'environment' => config('app.env'),
        ]);
    }
}
```

### Testing Rollout

To test rollout behavior, you can temporarily override the rollout key:

```php
$order = Order::make(['user_id' => 1]);

// Test with specific rollout key
$flow = Flow::previewPick($order, function ($builder) use ($order) {
    $builder->rolloutKeyResolver(function () {
        return 'test-key-123'; // Fixed key for testing
    });
});
```

### Verifying Flow Binding

After creating a model, verify the flow was bound:

```php
$order = Order::create([...]);

// Check if flow was bound
if ($order->boundFlow()) {
    logger()->info('Flow bound successfully', [
        'flow_id' => $order->boundFlow()->id,
    ]);
} else {
    logger()->warning('No flow bound to order', [
        'order_id' => $order->id,
    ]);
}
```

### Common Issues and Solutions

**Issue: Flow not binding automatically**

```php
// Check if flow exists
$flows = Flow::query()
    ->where('subject_type', Order::class)
    ->where('status', true)
    ->get();

// Check if flow matches criteria
$flow = Flow::previewPick($order);
if (!$flow) {
    // No flow matches - check your buildFlowPicker() configuration
}
```

**Issue: Wrong flow being selected**

```php
// Check all matching flows
$builder = $order->makeFlowPicker();
$candidates = (new FlowPicker())->pick($order, $builder->returnCandidates(true));

// See which flows match
foreach ($candidates as $candidate) {
    logger()->info('Matching flow', [
        'flow_id' => $candidate->id,
        'version' => $candidate->version,
        'is_default' => $candidate->is_default,
    ]);
}
```

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

### Flow Picking Returns Null

If `pickFlow()` returns `null`, no binding is created (no error thrown):

```php
$order = Order::create([...]);

// If pickFlow() returns null, no FlowUse record is created
// This is intentional - not all models need workflows
```

**Common reasons for null:**

1. No flows match the selection criteria
2. All matching flows are inactive
3. Rollout percentage excludes this model
4. Active window doesn't include current time
5. Fallback cascade exhausted all options

**Debugging:**

```php
// Preview which flow would be selected
$flow = Flow::previewPick($order);

if (!$flow) {
    // No flow matches - check your buildFlowPicker() configuration
    // Or check if flows exist with matching criteria
}
```

### Multiple Flows Match

When multiple flows match the criteria, the system uses ordering to select the best one:

1. **Version** (DESC): Higher versions preferred
2. **is_default** (DESC): Default flows preferred
3. **ordering** (DESC): Higher ordering preferred
4. **id** (DESC): Higher ID as tiebreaker

You can customize this with `orderBy()`:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);

    $builder->orderBy(function ($query) {
        $query->orderBy('priority', 'desc')
              ->orderBy('created_at', 'asc');
    });
}
```

### Fallback Cascade Exhausted

If all fallback steps are exhausted and no flow is found:

```php
// No flow will be bound
// No error is thrown
// Model is created successfully without workflow
```

This is intentional - workflows are optional. If you need to enforce workflow binding, check after creation:

```php
$order = Order::create([...]);

if (!$order->boundFlow()) {
    throw new \Exception('Order must have a workflow');
}
```

## Related Documentation

- [HasFlow](/packages/laravel-flow/deep-diving/has-flow) - Simple flow binding for single-flow scenarios
- [FlowPickerBuilder](/packages/laravel-flow/deep-diving/support/flow-picker-builder) - Customizing flow selection logic
- [FlowPicker](/packages/laravel-flow/deep-diving/support/flow-picker) - Understanding flow picking mechanism
- [Flow Service](/packages/laravel-flow/deep-diving/services/flow) - Managing workflows
- [FlowState Service](/packages/laravel-flow/deep-diving/services/flow-state) - Managing states
- [FlowTransition Service](/packages/laravel-flow/deep-diving/services/flow-transition) - Executing transitions
- [TransitionResult](/packages/laravel-flow/deep-diving/transition-result) - Understanding transition results
- [Installation](/packages/laravel-flow/installation) - Package installation guide

