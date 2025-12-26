---
sidebar_position: 2
sidebar_label: FlowPicker
---

# FlowPicker

The `FlowPicker` class executes the flow selection process using a configured `FlowPickerBuilder`. It handles filtering, active constraints, rollout gates, version constraints, and fallback cascades to select the most appropriate flow for a model instance.

## Namespace

```php
JobMetric\Flow\Support\FlowPicker
```

## Overview

The `FlowPicker` is responsible for:
- Filtering flows by subject type/scope/collection, environment, channel
- Enforcing active/time-window constraints (configurable)
- Applying rollout gates (configurable)
- Supporting include/exclude/prefer lists and version constraints
- Honoring match strategy (BEST/FIRST) and fallback cascade
- Providing a `candidates()` helper for diagnostics/insight
- Per-request caching for performance

## Basic Usage

### Pick a Flow

Select a single flow according to the builder's strategy:

```php
use JobMetric\Flow\Support\FlowPicker;
use JobMetric\Flow\Support\FlowPickerBuilder;

$picker = new FlowPicker();
$builder = new FlowPickerBuilder();

// Configure builder
$builder->subjectType(Order::class)
    ->environment('production')
    ->channel('web')
    ->onlyActive(true);

// Pick flow
$flow = $picker->pick($order, $builder);
```

**Returns:** `Flow|null` - The selected flow or null if no match found

### Get Candidates

Get all matching flows without applying fallback cascade:

```php
$picker = new FlowPicker();
$candidates = $picker->candidates($order, $builder);
```

**Returns:** `Collection<int, Flow>` - Collection of matching flows

**Use Cases:**
- Debugging flow selection
- Displaying available flows
- Diagnostics and insight

## Selection Process

The `pick()` method follows this process:

1. **Check Forced Flow**: If `forceFlowIdResolver` is set, resolve and validate it
2. **Check Cache**: If request caching is enabled, return cached result
3. **Get Candidates**: Query flows matching builder criteria
4. **Apply Fallback**: If no candidates found, apply fallback cascade
5. **Cache Result**: Store result in request cache if enabled
6. **Return Flow**: Return the first matching flow or null

## Forced Flow Resolution

If `forceFlowIdResolver` is configured, the picker will:
1. Call the resolver to get Flow ID
2. Load the Flow from database
3. Validate active constraints (if enabled)
4. Return the Flow if valid, null otherwise

This is used by `HasFlow` trait for direct Flow ID binding.

## Request Caching

The picker supports per-request memoization for performance:

```php
$builder->cacheInRequest(true);
$flow = $picker->pick($order, $builder);
```

**Cache Key Components:**
- Model class and ID
- Subject type, scope, collection
- Environment, channel
- Active constraints
- Rollout configuration
- Version constraints
- Include/exclude IDs

**Cache Safety:**
- Only enabled when builder has no dynamic callbacks
- Automatically disabled if custom WHERE callbacks exist
- Automatically disabled if custom ordering callback exists
- Automatically disabled if `forceFlowIdResolver` is set

## Filtering

### Subject Filters

Flows are filtered by:
- **Subject Type**: Model class name (required)
- **Subject Scope**: Optional tenant/org identifier
- **Subject Collection**: Optional collection identifier (e.g., 'premium', 'standard')

### Environment and Channel

- **Environment**: Filter by environment (e.g., 'production', 'staging')
- **Channel**: Filter by channel (e.g., 'web', 'api', 'mobile')

### Active Constraints

When `onlyActive(true)`:
- Requires `status = true`
- Optionally checks `active_from` and `active_to` time windows
- Can ignore time window with `ignoreTimeWindow(true)`

### Version Constraints

- **Exact Version**: `versionEquals(2)` - Only version 2
- **Version Range**: `versionMin(1)->versionMax(3)` - Versions 1-3

### Include/Exclude Lists

- **Include IDs**: Only flows with these IDs
- **Exclude IDs**: Exclude flows with these IDs

### Default Requirement

- **Require Default**: Only flows with `is_default = true`

## Rollout Gating

When `evaluateRollout(true)`:
1. Get rollout key from `rolloutKeyResolver`
2. Compute stable bucket (0-99) using namespace, salt, and key
3. Filter flows where `rollout_pct >= bucket` or `rollout_pct IS NULL`

**Stable Bucket Algorithm:**
- Combines namespace, salt, and key
- Uses CRC32 hash
- Returns bucket in range 0-99

**Example:**
```php
// Flow with rollout_pct: 50
// User with bucket: 30 → Matches (30 < 50)
// User with bucket: 60 → Doesn't match (60 >= 50)
```

## Ordering

### Match Strategy

- **STRATEGY_BEST**: Returns best candidate based on ordering rules (default)
- **STRATEGY_FIRST**: Returns first matching record (minimal ordering)

### Default Ordering

When using `STRATEGY_BEST`:
1. `version DESC` - Higher versions preferred
2. `is_default DESC` - Default flows preferred
3. `ordering DESC` - Higher ordering preferred
4. `id DESC` - Higher ID as tiebreaker

### Preferential Ordering

Boosts (not filters) for:
- **Preferred Flow IDs**: Earlier IDs rank higher
- **Preferred Environments**: Earlier environments rank higher
- **Preferred Channels**: Earlier channels rank higher

## Fallback Cascade

If no flow matches initially, the picker applies fallback steps:

1. **FB_DROP_CHANNEL**: Remove channel filter
2. **FB_DROP_ENVIRONMENT**: Remove environment filter
3. **FB_IGNORE_TIMEWINDOW**: Ignore active window checks
4. **FB_DISABLE_ROLLOUT**: Disable rollout checks
5. **FB_DROP_REQUIRE_DEFAULT**: Don't require is_default

**Example:**
```php
$builder->fallbackCascade([
    FlowPickerBuilder::FB_DROP_CHANNEL,
    FlowPickerBuilder::FB_DROP_ENVIRONMENT,
]);
```

The picker tries each step in order until a flow is found.

## Custom Filters

You can add custom WHERE callbacks:

```php
$builder->where(function ($query, $model) {
    $query->where('custom_field', $model->some_attribute);
});
```

These are applied after all standard filters.

## Complete Examples

### Example 1: Basic Flow Selection

```php
use JobMetric\Flow\Support\FlowPicker;
use JobMetric\Flow\Support\FlowPickerBuilder;

$picker = new FlowPicker();
$builder = new FlowPickerBuilder();

$builder->subjectType(Order::class)
    ->subjectScope((string)$order->tenant_id)
    ->environment(config('app.env'))
    ->channel('web')
    ->onlyActive(true)
    ->orderByDefault();

$flow = $picker->pick($order, $builder);
```

### Example 2: With Rollout

```php
$builder->subjectType(Order::class)
    ->environment('production')
    ->evaluateRollout(true)
    ->rolloutNamespace('order_v2')
    ->rolloutSalt('2024')
    ->rolloutKeyResolver(function ($model) {
        return (string)$model->user_id;
    });

$flow = $picker->pick($order, $builder);
```

### Example 3: With Fallback Cascade

```php
$builder->subjectType(Order::class)
    ->environment('production')
    ->channel('web')
    ->fallbackCascade([
        FlowPickerBuilder::FB_DROP_CHANNEL,
        FlowPickerBuilder::FB_DROP_ENVIRONMENT,
        FlowPickerBuilder::FB_IGNORE_TIMEWINDOW,
    ]);

$flow = $picker->pick($order, $builder);
```

### Example 4: Get All Candidates

```php
$builder->subjectType(Order::class)
    ->environment('production');

$candidates = $picker->candidates($order, $builder);

// Display all matching flows
foreach ($candidates as $flow) {
    echo "Flow ID: {$flow->id}, Version: {$flow->version}\n";
}
```

### Example 5: With Version Constraints

```php
$builder->subjectType(Order::class)
    ->versionMin(1)
    ->versionMax(3); // Only versions 1-3

$flow = $picker->pick($order, $builder);
```

### Example 6: With Include/Exclude

```php
$builder->subjectType(Order::class)
    ->includeFlowIds([1, 2, 3])  // Only these flows
    ->excludeFlowIds([4, 5])      // Exclude these
    ->preferFlowIds([1, 2]);      // Prefer these

$flow = $picker->pick($order, $builder);
```

## Performance Considerations

### Request Caching

Enable caching for better performance:

```php
$builder->cacheInRequest(true);
$flow = $picker->pick($order, $builder);
```

**When Safe:**
- No custom WHERE callbacks
- No custom ordering callback
- No forceFlowIdResolver

**When Not Safe:**
- Dynamic callbacks that depend on request state
- Callbacks that access `$request`, `auth()`, etc.

### Query Optimization

The picker automatically:
- Uses indexed columns (subject_type, environment, channel)
- Applies efficient WHERE clauses
- Uses proper JOINs when needed
- Limits results when `candidatesLimit` is set

## Integration with HasWorkflow

The `HasWorkflow` trait uses `FlowPicker` internally:

```php
// Inside HasWorkflow::pickFlow()
$builder = $this->makeFlowPicker();
$flow = (new FlowPicker())->pick($this, $builder);
```

## Related Documentation

- [FlowPickerBuilder](/packages/laravel-flow/deep-diving/support/flow-picker-builder) - Configuring flow selection
- [HasWorkflow](/packages/laravel-flow/deep-diving/has-workflow) - Workflow integration trait
- [Flow Service](/packages/laravel-flow/deep-diving/services/flow) - Flow management
- [HasFlow](/packages/laravel-flow/deep-diving/has-flow) - Simple flow binding

