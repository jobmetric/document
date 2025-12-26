---
sidebar_position: 3
sidebar_label: FlowPickerBuilder
---

# FlowPickerBuilder

The `FlowPickerBuilder` defines the constraints and selection strategy used by the `FlowPicker` to choose a Flow. It centralizes all filters, ordering preferences, match strategy, fallback cascade steps, and performance hints.

## Namespace

```php
JobMetric\Flow\Support\FlowPickerBuilder
```

## Where and When to Use FlowPickerBuilder

### Primary Use Cases

**FlowPickerBuilder is used in the following scenarios:**

1. **HasWorkflow Trait Integration**
   - When models use `HasWorkflow` trait, they override `buildFlowPicker()` method
   - This method receives a `FlowPickerBuilder` instance to configure flow selection
   - Used automatically during model creation to select the appropriate flow

2. **HasFlow Trait Integration**
   - When models use `HasFlow` trait, they also use `buildFlowPicker()` internally
   - Uses `forceFlowIdResolver` to bypass complex selection logic
   - Directly binds flows by ID while still using the builder pattern

3. **Flow Service Preview**
   - When using `Flow::previewPick()` to preview which flow would be selected
   - Allows testing flow selection logic without actually binding flows
   - Useful for debugging and validation

4. **Manual Flow Selection**
   - When manually selecting flows outside of automatic binding
   - When building custom flow selection logic
   - When implementing advanced flow routing scenarios

### Key Scenarios

#### Scenario 1: Multi-Tenant Applications

**When:** Different tenants need different workflows for the same model type.

**How:** Use `subjectScope()` to partition flows by tenant:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);
    $builder->subjectScope((string)$this->tenant_id);
}
```

#### Scenario 2: Environment-Specific Workflows

**When:** Different workflows for production, staging, and development.

**How:** Use `environment()` filter:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);
    $builder->environment(config('app.env'));
}
```

#### Scenario 3: Channel-Based Workflows

**When:** Different workflows for web, API, and mobile channels.

**How:** Use `channel()` filter:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);
    $builder->channel(request()->header('X-Channel', 'web'));
}
```

#### Scenario 4: A/B Testing and Gradual Rollouts

**When:** Gradually rolling out new workflows to a percentage of users.

**How:** Use rollout configuration:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);
    $builder->evaluateRollout(true)
        ->rolloutNamespace('order_v2')
        ->rolloutKeyResolver(function ($model) {
            return (string)$model->user_id;
        });
}
```

#### Scenario 5: Collection-Based Workflows

**When:** Different workflows based on model attributes (e.g., premium vs standard orders).

**How:** Use `subjectCollection()`:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);
    $builder->subjectCollection($this->order_type);
}
```

#### Scenario 6: Scheduled Workflow Activation

**When:** Workflows that activate/deactivate at specific times.

**How:** Use active window constraints:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);
    $builder->onlyActive(true)
        ->ignoreTimeWindow(false)
        ->timeNow(Carbon::now('UTC'));
}
```

#### Scenario 7: Version Management

**When:** Managing multiple versions of workflows and migrating between them.

**How:** Use version constraints:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);
    $builder->versionAtLeast(1)
        ->versionAtMost(3);
}
```

#### Scenario 8: Fallback Strategies

**When:** Need graceful degradation when exact flow match is not found.

**How:** Use fallback cascade:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);
    $builder->fallbackCascade([
        FlowPickerBuilder::FB_DROP_CHANNEL,
        FlowPickerBuilder::FB_DROP_ENVIRONMENT,
    ]);
}
```

### When NOT to Use FlowPickerBuilder

**You typically don't need to use FlowPickerBuilder directly when:**

- Using `HasFlow` trait with simple flow ID resolution (it's handled internally)
- Working with single, fixed flows per model type
- Flow selection logic is straightforward and doesn't change

**In these cases, use `HasFlow` instead of `HasWorkflow`.**

## Overview

The builder provides a fluent interface to configure:
- **Subject filters**: Type, scope, collection
- **Environment/Channel filters**: Production, staging, web, API, etc.
- **Active constraints**: Status and time windows
- **Rollout gating**: Gradual feature rollouts
- **Version constraints**: Exact version or version ranges
- **Include/Exclude lists**: Whitelist and blacklist flows
- **Preferential ordering**: Boost certain flows in ordering
- **Match strategy**: BEST (default) or FIRST
- **Fallback cascade**: Progressive constraint relaxation
- **Request caching**: Performance optimization

## Constants

### Match Strategy

```php
FlowPickerBuilder::STRATEGY_BEST  // Best candidate based on ordering (default)
FlowPickerBuilder::STRATEGY_FIRST // First matching record
```

### Fallback Steps

```php
FlowPickerBuilder::FB_DROP_CHANNEL         // Remove channel filter
FlowPickerBuilder::FB_DROP_ENVIRONMENT     // Remove environment filter
FlowPickerBuilder::FB_IGNORE_TIMEWINDOW    // Ignore active window
FlowPickerBuilder::FB_DISABLE_ROLLOUT      // Disable rollout checks
FlowPickerBuilder::FB_DROP_REQUIRE_DEFAULT // Don't require is_default
```

## Subject Configuration

### subjectType()

Set the model class that flows are being selected for. This is the primary filter and is **required** for flow selection.

```php
$builder->subjectType(Order::class);
```

**Parameters:**
- `class-string<Model> $class`: Fully qualified model class name

**Returns:** `$this` (fluent interface)

**Behavior:**
- Filters flows where `subject_type` column matches the provided class
- Must be set before flow selection can work
- Used internally by `HasWorkflow` and `HasFlow` traits

**Example:**
```php
$builder->subjectType(\App\Models\Order::class);
// Matches flows with subject_type = 'App\Models\Order'
```

### subjectScope()

Set optional subject scope to partition flows by domain (tenant, organization, etc.). This allows multiple flows for the same model type based on scope.

```php
$builder->subjectScope((string)$order->tenant_id);
$builder->subjectScope(null); // Clear scope filter
```

**Parameters:**
- `?string $scope`: Scope identifier (e.g., tenant ID, org ID) or null to clear

**Returns:** `$this` (fluent interface)

**Behavior:**
- Filters flows where `subject_scope` column matches the provided value
- When `null`, no scope filtering is applied
- Useful for multi-tenant applications

**Example:**
```php
// Tenant-specific flows
$builder->subjectScope((string)$order->tenant_id);
// Matches flows with subject_scope = '123' (tenant ID)

// Clear scope to match any scope
$builder->subjectScope(null);
```

**Use Cases:**
- Multi-tenant SaaS applications
- Organization-based workflows
- Department-specific processes

### subjectCollection()

Set optional subject collection to further partition flows. Collections allow different workflows for the same model type based on attributes.

```php
$builder->subjectCollection($order->collection);
$builder->subjectCollection(null); // Clear collection filter
```

**Parameters:**
- `?string $collection`: Collection identifier (e.g., 'premium', 'standard', 'enterprise') or null to clear

**Returns:** `$this` (fluent interface)

**Behavior:**
- Filters flows where `subject_collection` column matches the provided value
- When `null`, no collection filtering is applied
- Can be combined with `subjectScope()` for fine-grained control

**Example:**
```php
// Premium order workflow
$builder->subjectCollection('premium');
// Matches flows with subject_collection = 'premium'

// Standard order workflow
$builder->subjectCollection('standard');
// Matches flows with subject_collection = 'standard'
```

**Use Cases:**
- Different workflows for premium vs standard customers
- Collection-based business rules
- Attribute-driven workflow selection

## Environment and Channel

### environment()

Filter flows by environment. This restricts flows to a specific deployment environment.

```php
$builder->environment('production');
$builder->environment(config('app.env'));
$builder->environment(null); // Clear filter
```

**Parameters:**
- `?string $environment`: Environment name (e.g., 'production', 'staging', 'development') or null to clear

**Returns:** `$this` (fluent interface)

**Behavior:**
- Filters flows where `environment` column matches the provided value
- When `null`, no environment filtering is applied
- Common values: 'production', 'staging', 'development', 'testing'

**Example:**
```php
// Production-only flows
$builder->environment('production');

// Environment from config
$builder->environment(config('app.env'));

// Clear to match any environment
$builder->environment(null);
```

**Use Cases:**
- Different workflows per deployment environment
- Testing workflows in staging
- Production-specific business rules

### channel()

Filter flows by channel. This restricts flows based on the request channel (web, API, mobile, etc.).

```php
$builder->channel('web');
$builder->channel(request()->header('X-Channel', 'web'));
$builder->channel(null); // Clear filter
```

**Parameters:**
- `?string $channel`: Channel name (e.g., 'web', 'api', 'mobile', 'admin') or null to clear

**Returns:** `$this` (fluent interface)

**Behavior:**
- Filters flows where `channel` column matches the provided value
- When `null`, no channel filtering is applied
- Can be determined from request headers, routes, or user context

**Example:**
```php
// Web-only flows
$builder->channel('web');

// API-only flows
$builder->channel('api');

// From request header
$builder->channel(request()->header('X-Channel', 'web'));

// From route
$builder->channel(request()->is('api/*') ? 'api' : 'web');
```

**Use Cases:**
- Different workflows for web vs API requests
- Mobile-specific workflows
- Admin panel workflows

### preferEnvironments()

Set preferred environments for ordering (not filtering). This boosts certain environments in the ordering without filtering them out.

```php
$builder->preferEnvironments(['production', 'staging', 'development']);
```

**Parameters:**
- `array<int,string> $envs`: Array of preferred environment names

**Returns:** `$this` (fluent interface)

**Behavior:**
- **Not a filter** - doesn't exclude other environments
- Earlier items in the array rank higher in ordering
- Uses CASE-based SQL ordering to boost preferred values
- Empty strings and null values are filtered out
- Values are converted to strings

**Example:**
```php
// Prefer production, then staging, then development
$builder->preferEnvironments(['production', 'staging', 'development']);

// If multiple flows match, production will be selected first
// But development flows are still eligible if production doesn't match
```

**Use Cases:**
- Prefer production flows but allow staging as fallback
- Environment priority ordering
- Graceful degradation

### preferChannels()

Set preferred channels for ordering (not filtering). This boosts certain channels in the ordering without filtering them out.

```php
$builder->preferChannels(['web', 'api', 'mobile']);
```

**Parameters:**
- `array<int,string> $channels`: Array of preferred channel names

**Returns:** `$this` (fluent interface)

**Behavior:**
- **Not a filter** - doesn't exclude other channels
- Earlier items in the array rank higher in ordering
- Uses CASE-based SQL ordering to boost preferred values
- Empty strings and null values are filtered out
- Values are converted to strings

**Example:**
```php
// Prefer web, then API, then mobile
$builder->preferChannels(['web', 'api', 'mobile']);
```

**Use Cases:**
- Prefer web flows but allow API as fallback
- Channel priority ordering
- Multi-channel support with preferences

## Active Constraints

### onlyActive()

Require active flows. When enabled, only flows with `status=true` are eligible, and optionally time window checks are applied.

```php
$builder->onlyActive(true);  // Enforce active constraints
$builder->onlyActive(false); // Disable active checks
```

**Parameters:**
- `bool $onlyActive`: Whether to enforce active constraints

**Returns:** `$this` (fluent interface)

**Default:** `true`

**Behavior:**
- When `true`: Requires `status = true` and optionally checks `active_from`/`active_to` time windows
- When `false`: No active status or time window checks are applied
- Time window checks can be disabled separately with `ignoreTimeWindow(true)`

**Example:**
```php
// Only active flows
$builder->onlyActive(true);

// Include inactive flows (for testing or admin)
$builder->onlyActive(false);
```

**Use Cases:**
- Production workflows (only active)
- Testing scenarios (include inactive)
- Admin interfaces (show all flows)

### ignoreTimeWindow()

Ignore `active_from`/`active_to` time window checks while keeping `status=true` requirement (if `onlyActive` is true).

```php
$builder->ignoreTimeWindow(true);  // Ignore time window
$builder->ignoreTimeWindow(false); // Enforce time window
```

**Parameters:**
- `bool $ignore = true`: Whether to ignore time window checks

**Returns:** `$this` (fluent interface)

**Default:** `false`

**Behavior:**
- When `true`: Only checks `status = true`, ignores `active_from` and `active_to`
- When `false`: Checks both `status = true` and time window constraints
- Only has effect when `onlyActive(true)` is set
- Useful for testing or when time windows are not needed

**Example:**
```php
// Check status only, ignore time windows
$builder->onlyActive(true)
    ->ignoreTimeWindow(true);

// Check both status and time windows
$builder->onlyActive(true)
    ->ignoreTimeWindow(false);
```

**Use Cases:**
- Testing without time constraints
- Workflows without scheduled activation
- Simplified active checks

### timeNow()

Set the reference "now" time in UTC for deterministic time window evaluation. This allows testing with specific times and ensures consistent evaluation.

```php
$builder->timeNow(Carbon::now('UTC'));
```

**Parameters:**
- `DateTimeInterface $now`: UTC instant for time comparisons

**Returns:** `$this` (fluent interface)

**Behavior:**
- Sets the reference time used to evaluate `active_from` and `active_to` constraints
- Must be in UTC timezone
- When not set, `Carbon::now('UTC')` is used by FlowPicker
- Useful for testing and deterministic evaluation

**Example:**
```php
// Use current time
$builder->timeNow(Carbon::now('UTC'));

// Use specific time for testing
$builder->timeNow(Carbon::parse('2024-01-01 12:00:00', 'UTC'));

// Use time from model
$builder->timeNow($order->created_at->utc());
```

**Use Cases:**
- Testing with specific times
- Deterministic evaluation in tests
- Time-based flow activation/deactivation
- Scheduled workflow scenarios

## Rollout Configuration

### evaluateRollout()

Enable or disable rollout gating. Rollout allows gradual feature deployment by assigning flows to a percentage of users based on a stable key.

```php
$builder->evaluateRollout(true);  // Enable rollout
$builder->evaluateRollout(false); // Disable rollout
```

**Parameters:**
- `bool $enabled`: Whether rollout should be applied

**Returns:** `$this` (fluent interface)

**Default:** `true`

**Behavior:**
- When `true`: Applies rollout percentage checks using stable bucket hashing
- When `false`: Ignores `rollout_pct` column, all flows are eligible
- Requires `rolloutKeyResolver` to be set for proper operation
- If no rollout key is available, only flows with `rollout_pct IS NULL` are eligible

**Example:**
```php
// Enable gradual rollout
$builder->evaluateRollout(true);

// Disable for testing
$builder->evaluateRollout(false);
```

**Use Cases:**
- A/B testing new workflows
- Gradual feature rollouts
- Canary deployments
- Percentage-based user segmentation

### rolloutNamespace()

Set namespace to isolate rollout bucket spaces across different domains or features. This ensures that rollout percentages are independent for different features.

```php
$builder->rolloutNamespace('order_v2');
```

**Parameters:**
- `?string $ns`: Namespace string or null to clear

**Returns:** `$this` (fluent interface)

**Behavior:**
- Used in hash calculation to isolate buckets
- Different namespaces create independent bucket spaces
- When `null`, no namespace is used in hashing
- Combined with salt and key to compute stable bucket

**Example:**
```php
// Isolate order workflow rollout
$builder->rolloutNamespace('order_v2');

// Isolate payment workflow rollout (independent)
$builder->rolloutNamespace('payment_v3');
```

**Use Cases:**
- Multiple feature rollouts running simultaneously
- Independent A/B tests
- Domain-specific rollouts

### rolloutSalt()

Set salt to further stabilize or segregate rollout hashing. Salt allows version-specific or context-specific bucket assignment.

```php
$builder->rolloutSalt('2024-01');
```

**Parameters:**
- `?string $salt`: Salt string or null to clear

**Returns:** `$this` (fluent interface)

**Behavior:**
- Used in hash calculation for additional stability/segregation
- Changing salt redistributes buckets (users get different flows)
- When `null`, no salt is used in hashing
- Combined with namespace and key to compute stable bucket

**Example:**
```php
// Version-specific salt
$builder->rolloutSalt('2024-01');

// Date-based salt for monthly redistribution
$builder->rolloutSalt(now()->format('Y-m'));

// Clear salt
$builder->rolloutSalt(null);
```

**Use Cases:**
- Version-specific rollouts
- Time-based bucket redistribution
- Further segregation of rollout spaces

### rolloutKeyResolver()

Set resolver callback that returns a stable rollout key per model instance. The same key will always fall into the same bucket, ensuring consistent assignment.

```php
$builder->rolloutKeyResolver(function (Model $model): ?string {
    return (string)$model->user_id;
});
```

**Parameters:**
- `callable(Model):(?string) $resolver`: Callback that returns a stable key or null

**Returns:** `$this` (fluent interface)

**Behavior:**
- Called with the model instance to get a stable key
- Key is used to compute bucket (0-99) via hash
- Same key always produces same bucket (stable assignment)
- When `null` or empty string, only flows with `rollout_pct IS NULL` are eligible
- Common keys: `user_id`, `order_id`, `customer_id`

**Example:**
```php
// Use user ID for consistent assignment
$builder->rolloutKeyResolver(function ($model) {
    return (string)$model->user_id;
});

// Use order ID
$builder->rolloutKeyResolver(function ($model) {
    return (string)$model->getKey();
});

// Use combination
$builder->rolloutKeyResolver(function ($model) {
    return $model->user_id . '_' . $model->tenant_id;
});
```

**Bucket Calculation:**
```
bucket = crc32(namespace + '|' + salt + '|' + key) % 100
```

**Use Cases:**
- Consistent user assignment (same user always gets same flow)
- Order-based assignment
- Customer-based segmentation

## Version Constraints

### versionEquals()

Pin selection to an exact version. When set, `versionMin` and `versionMax` are ignored.

```php
$builder->versionEquals(2); // Only version 2
```

**Parameters:**
- `int $version`: Exact version number

**Returns:** `$this` (fluent interface)

**Behavior:**
- Filters flows where `version` column equals the provided value
- **Disables** `versionMin` and `versionMax` if they were set
- Most restrictive version constraint
- Useful for testing specific versions or pinning to a known good version

**Example:**
```php
// Only version 2 flows
$builder->versionEquals(2);

// This will ignore versionMin/versionMax
$builder->versionEquals(2)
    ->versionAtLeast(1)  // Ignored
    ->versionAtMost(3);  // Ignored
```

**Use Cases:**
- Testing specific workflow versions
- Pinning to stable versions
- Version-specific deployments

### versionAtLeast()

Set minimum allowed version (inclusive). Ignored when `versionEquals` is set.

```php
$builder->versionAtLeast(1); // Version >= 1
```

**Parameters:**
- `int $min`: Minimum version number (inclusive)

**Returns:** `$this` (fluent interface)

**Behavior:**
- Filters flows where `version >= $min`
- Ignored if `versionEquals` is set
- Can be combined with `versionAtMost` for range
- Useful for excluding older versions

**Example:**
```php
// Versions 1 and above
$builder->versionAtLeast(1);

// Combined with maximum
$builder->versionAtLeast(1)
    ->versionAtMost(3); // Versions 1-3
```

**Use Cases:**
- Excluding deprecated versions
- Minimum version requirements
- Version migration scenarios

### versionAtMost()

Set maximum allowed version (inclusive). Ignored when `versionEquals` is set.

```php
$builder->versionAtMost(3); // Version <= 3
```

**Parameters:**
- `int $max`: Maximum version number (inclusive)

**Returns:** `$this` (fluent interface)

**Behavior:**
- Filters flows where `version <= $max`
- Ignored if `versionEquals` is set
- Can be combined with `versionAtLeast` for range
- Useful for excluding newer versions

**Example:**
```php
// Versions 3 and below
$builder->versionAtMost(3);

// Combined with minimum
$builder->versionAtLeast(1)
    ->versionAtMost(3); // Versions 1-3
```

**Use Cases:**
- Excluding beta versions
- Maximum version limits
- Gradual version migration

### versionMin() / versionMax()

Alternative method names for `versionAtLeast()` and `versionAtMost()`. Functionally identical.

```php
$builder->versionMin(1)->versionMax(3); // Versions 1-3
```

**Parameters:**
- `versionMin(int $min)`: Minimum version (same as `versionAtLeast`)
- `versionMax(int $max)`: Maximum version (same as `versionAtMost`)

**Returns:** `$this` (fluent interface)

**Note:** These are aliases for `versionAtLeast()` and `versionAtMost()`. Use whichever naming you prefer.

## Include/Exclude/Prefer

### includeFlows()

Restrict selection to only these flow IDs (whitelist). Only flows with IDs in this list are eligible.

```php
$builder->includeFlows([1, 2, 3]); // Only these flows
```

**Parameters:**
- `array<int,int> $ids`: Array of allowed flow IDs

**Returns:** `$this` (fluent interface)

**Behavior:**
- Filters flows where `id IN ($ids)`
- Empty array means no whitelist (all flows eligible)
- Duplicate IDs are removed
- Non-integer values are converted to integers
- Array is re-indexed

**Example:**
```php
// Only flows 1, 2, 3
$builder->includeFlows([1, 2, 3]);

// Single flow
$builder->includeFlows([1]);

// Clear whitelist
$builder->includeFlows([]);
```

**Use Cases:**
- Testing specific flows
- Limited flow selection
- Flow subset scenarios

### excludeFlows()

Exclude these flow IDs from selection (blacklist). Flows with IDs in this list are not eligible.

```php
$builder->excludeFlows([4, 5]); // Exclude these flows
```

**Parameters:**
- `array<int,int> $ids`: Array of disallowed flow IDs

**Returns:** `$this` (fluent interface)

**Behavior:**
- Filters flows where `id NOT IN ($ids)`
- Empty array means no blacklist
- Duplicate IDs are removed
- Non-integer values are converted to integers
- Array is re-indexed

**Example:**
```php
// Exclude flows 4, 5
$builder->excludeFlows([4, 5]);

// Exclude deprecated flows
$builder->excludeFlows([10, 11, 12]);

// Clear blacklist
$builder->excludeFlows([]);
```

**Use Cases:**
- Excluding deprecated flows
- Removing problematic flows
- Testing without specific flows

### preferFlows()

Prefer these flow IDs in ordering (not filtering). This boosts certain flows in the ordering without excluding others.

```php
$builder->preferFlows([1, 2]); // Boost these in ordering
```

**Parameters:**
- `array<int,int> $ids`: Array of preferred flow IDs

**Returns:** `$this` (fluent interface)

**Behavior:**
- **Not a filter** - doesn't exclude other flows
- Earlier IDs in the array rank higher in ordering
- Uses CASE-based SQL ordering to boost preferred IDs
- Duplicate IDs are removed
- Non-integer values are converted to integers
- Array is re-indexed

**Example:**
```php
// Prefer flows 1, 2, then 3
$builder->preferFlows([1, 2, 3]);

// If multiple flows match, flow 1 will be selected first
// But other flows are still eligible if 1, 2, 3 don't match
```

**Use Cases:**
- Preferring specific flows but allowing fallbacks
- Priority-based flow selection
- Testing flows with fallback options

## Ordering

### orderByDefault()

Apply the default ordering strategy. This is the standard ordering used when no custom ordering is specified.

```php
$builder->orderByDefault();
```

**Returns:** `$this` (fluent interface)

**Default Ordering (applied in order):**
1. `version DESC` - Higher versions preferred
2. `is_default DESC` - Default flows preferred
3. `ordering DESC` - Higher ordering value preferred
4. `id DESC` - Higher ID as tiebreaker

**Behavior:**
- Sets the `orderingCallback` to default implementation
- Used automatically if no custom `orderBy()` is set
- Only applies when `matchStrategy` is `STRATEGY_BEST`
- When `STRATEGY_FIRST`, minimal ordering is used instead

**Example:**
```php
// Use default ordering
$builder->orderByDefault();

// This is equivalent to:
$builder->orderBy(function ($query) {
    $query->orderByDesc('version')
        ->orderByDesc('is_default')
        ->orderByDesc('ordering')
        ->orderByDesc('id');
});
```

**Use Cases:**
- Standard flow selection
- Most common use case
- When no special ordering is needed

### orderBy()

Provide a custom ORDER BY callback to override default ordering. This allows complete control over how flows are sorted.

```php
$builder->orderBy(function (Builder $query): void {
    $query->orderBy('priority', 'desc')
          ->orderBy('created_at', 'asc');
});
```

**Parameters:**
- `Closure(Builder):void $callback`: Ordering callback that receives the query builder

**Returns:** `$this` (fluent interface)

**Behavior:**
- Replaces default ordering with custom callback
- Callback receives `Builder $query` parameter
- Can apply any ordering logic
- Only used when `matchStrategy` is `STRATEGY_BEST`
- When `STRATEGY_FIRST`, this is ignored

**Example:**
```php
// Custom priority-based ordering
$builder->orderBy(function ($query) {
    $query->orderByDesc('priority')
        ->orderByAsc('created_at');
});

// Complex ordering with conditions
$builder->orderBy(function ($query) {
    $query->orderByRaw('CASE WHEN is_default = 1 THEN 0 ELSE 1 END')
        ->orderByDesc('version');
});
```

**Use Cases:**
- Custom business logic ordering
- Priority-based selection
- Complex sorting requirements

### matchStrategy()

Set the selection strategy for choosing flows when multiple candidates match.

```php
$builder->matchStrategy(FlowPickerBuilder::STRATEGY_BEST);  // Best candidate
$builder->matchStrategy(FlowPickerBuilder::STRATEGY_FIRST); // First match
```

**Parameters:**
- `string $strategy`: Strategy constant (`STRATEGY_BEST` or `STRATEGY_FIRST`)

**Returns:** `$this` (fluent interface)

**Default:** `STRATEGY_BEST`

**STRATEGY_BEST:**
- Returns the best candidate based on ordering rules
- Applies full ordering (version, is_default, ordering, id)
- Uses custom `orderBy()` if provided
- Most predictable and recommended

**STRATEGY_FIRST:**
- Returns the very first matching record
- Minimal ordering (just `id ASC`)
- Ignores custom `orderBy()` callback
- Faster but less predictable
- Useful for testing or when order doesn't matter

**Example:**
```php
// Best candidate (default)
$builder->matchStrategy(FlowPickerBuilder::STRATEGY_BEST);

// First match (faster)
$builder->matchStrategy(FlowPickerBuilder::STRATEGY_FIRST);
```

**Use Cases:**
- **STRATEGY_BEST**: Production use, predictable selection
- **STRATEGY_FIRST**: Testing, performance-critical scenarios

### pickFirstMatch()

Convenience method to switch between first match and best match strategies.

```php
$builder->pickFirstMatch(true);  // STRATEGY_FIRST
$builder->pickFirstMatch(false); // STRATEGY_BEST
```

**Parameters:**
- `bool $enabled = true`: Whether to pick first match

**Returns:** `$this` (fluent interface)

**Behavior:**
- When `true`: Sets strategy to `STRATEGY_FIRST`
- When `false`: Sets strategy to `STRATEGY_BEST`
- Convenience wrapper around `matchStrategy()`

**Example:**
```php
// Use first match
$builder->pickFirstMatch(true);

// Use best match
$builder->pickFirstMatch(false);
```

## Custom Filters

### where()

Attach a custom WHERE callback to extend query constraints. This allows adding any custom filtering logic beyond the standard filters.

```php
$builder->where(function (Builder $query, Model $model): void {
    $query->where('custom_field', $model->some_attribute);
});
```

**Parameters:**
- `Closure(Builder,Model):void $callback`: Callback receiving the query builder and model instance

**Returns:** `$this` (fluent interface)

**Behavior:**
- Callback is called after all standard filters are applied
- Receives both `Builder $query` and `Model $model` parameters
- Can add any WHERE conditions
- Multiple callbacks can be chained
- **Disables request caching** (dynamic callbacks prevent safe caching)

**Example:**
```php
// Single custom filter
$builder->where(function ($query, $model) {
    $query->where('custom_field', $model->some_attribute);
});

// Multiple filters
$builder->where(function ($query, $model) {
    $query->where('field1', $model->attr1);
})
->where(function ($query, $model) {
    $query->where('field2', $model->attr2);
});

// Complex conditions
$builder->where(function ($query, $model) {
    if ($model->is_premium) {
        $query->where('is_premium_flow', true);
    } else {
        $query->where('is_premium_flow', false);
    }
});
```

**Use Cases:**
- Custom business logic filtering
- Complex conditional filters
- Model-specific requirements
- Dynamic filtering based on model state

**Important:** Using `where()` disables request caching because callbacks are dynamic and may depend on model state.

## Fallback Cascade

### fallbackCascade()

Define an ordered list of fallback steps to progressively relax constraints when no flow matches initially. Steps are tried in order until a match is found.

```php
$builder->fallbackCascade([
    FlowPickerBuilder::FB_DROP_CHANNEL,
    FlowPickerBuilder::FB_DROP_ENVIRONMENT,
    FlowPickerBuilder::FB_IGNORE_TIMEWINDOW,
]);
```

**Parameters:**
- `array<int,string> $steps`: Ordered array of fallback step constants

**Returns:** `$this` (fluent interface)

**Behavior:**
- Steps are tried **in order** until a match is found
- First step that produces candidates wins (selection stops)
- Invalid step constants are automatically filtered out
- Only recognized `FB_*` constants are kept
- Empty array means no fallback (returns null if no match)

**Available Fallback Steps:**

1. **`FB_DROP_CHANNEL`**: Remove the channel filter
   - Allows flows from any channel
   - Useful when channel-specific flows aren't available

2. **`FB_DROP_ENVIRONMENT`**: Remove the environment filter
   - Allows flows from any environment
   - Useful when environment-specific flows aren't available

3. **`FB_IGNORE_TIMEWINDOW`**: Ignore `active_from`/`active_to` checks
   - Keeps `status=true` requirement
   - Useful when flows are outside active window

4. **`FB_DISABLE_ROLLOUT`**: Disable rollout gating entirely
   - Ignores `rollout_pct` column
   - Useful when rollout prevents matching

5. **`FB_DROP_REQUIRE_DEFAULT`**: Don't require `is_default=true`
   - Allows non-default flows
   - Useful when only default flows are required initially

**Example:**
```php
// Progressive fallback
$builder->fallbackCascade([
    FlowPickerBuilder::FB_DROP_CHANNEL,        // Try without channel
    FlowPickerBuilder::FB_DROP_ENVIRONMENT,    // Try without environment
    FlowPickerBuilder::FB_IGNORE_TIMEWINDOW,   // Try ignoring time window
]);

// Invalid steps are ignored
$builder->fallbackCascade([
    'invalid_step',                              // Ignored
    FlowPickerBuilder::FB_DROP_CHANNEL,         // Used
]);
```

**Use Cases:**
- Graceful degradation when exact match not found
- Flexible flow selection
- Fallback to less specific flows
- Ensuring a flow is always found when possible

## Force Flow ID

### forceFlowIdResolver()

Provide a resolver that can force a specific Flow ID from the model. When set, this bypasses all complex selection logic and directly resolves the Flow by ID.

```php
$builder->forceFlowIdResolver(function (Model $model): ?int {
    return $model->flowId(); // Direct Flow ID
});
```

**Parameters:**
- `callable(Model):(?int) $resolver`: Callback returning a Flow ID or null

**Returns:** `$this` (fluent interface)

**Behavior:**
- **Bypasses all selection logic** (subject, environment, channel, rollout, etc.)
- Directly loads Flow by ID from database
- Still validates active constraints if `onlyActive(true)` is set
- When resolver returns `null`, normal selection logic is used
- **Disables request caching** (dynamic resolver prevents safe caching)

**Used by:** `HasFlow` trait for direct ID binding

**Example:**
```php
// Direct Flow ID from model
$builder->forceFlowIdResolver(function ($model) {
    return $model->flow_id;
});

// From method
$builder->forceFlowIdResolver(function ($model) {
    return $model->resolveFlowId();
});

// From config
$builder->forceFlowIdResolver(function ($model) {
    return config('flows.order_flow_id');
});
```

**Use Cases:**
- Direct Flow ID binding (HasFlow trait)
- Simplified flow selection
- Explicit flow assignment
- Bypassing complex selection logic

**Important:** When `forceFlowIdResolver` is set, all other selection criteria are ignored. Only active constraints (if enabled) are still validated.

## Default Requirement

### requireDefault()

Require flows with `is_default=true`. When enabled, only flows marked as default are eligible for selection.

```php
$builder->requireDefault(true);  // Only default flows
$builder->requireDefault(false); // Any flow
```

**Parameters:**
- `bool $required = true`: Whether to require is_default=true

**Returns:** `$this` (fluent interface)

**Default:** `false`

**Behavior:**
- When `true`: Filters flows where `is_default = true`
- When `false`: No default requirement (any flow eligible)
- Useful for enforcing a single default flow per scope
- Can be relaxed in fallback cascade with `FB_DROP_REQUIRE_DEFAULT`

**Example:**
```php
// Only default flows
$builder->requireDefault(true);

// Any flow (default or not)
$builder->requireDefault(false);
```

**Use Cases:**
- Enforcing single default flow
- Default flow selection
- Fallback to default when specific flows unavailable

## Candidates Configuration

### returnCandidates()

Hint that the consumer intends to fetch candidates (for diagnostics or insight). This is a hint only; `pick()` still returns a single Flow.

```php
$builder->returnCandidates(true);
```

**Parameters:**
- `bool $on = true`: Whether to enable the hint

**Returns:** `$this` (fluent interface)

**Behavior:**
- **Hint only** - doesn't change `pick()` behavior
- `pick()` still returns single Flow (first match)
- Use `FlowPicker::candidates()` to get full list
- Useful for debugging and diagnostics

**Example:**
```php
// Hint for candidate fetching
$builder->returnCandidates(true);

// Get candidates
$candidates = $picker->candidates($model, $builder);
```

**Use Cases:**
- Debugging flow selection
- Displaying available flows
- Diagnostics and insight

### candidatesLimit()

Limit the number of candidates returned by `FlowPicker::candidates()`. This helps with performance when fetching candidate lists.

```php
$builder->candidatesLimit(10); // Max 10 candidates
$builder->candidatesLimit(null); // No limit
```

**Parameters:**
- `?int $limit`: Positive integer for limit or null for no limit

**Returns:** `$this` (fluent interface)

**Behavior:**
- Applies `LIMIT` clause to candidate query
- Only affects `FlowPicker::candidates()`, not `pick()`
- When `null`, no limit is applied
- When `0` or negative, limit is ignored

**Example:**
```php
// Limit to 10 candidates
$builder->candidatesLimit(10);

// No limit
$builder->candidatesLimit(null);

// Get top 5 candidates
$builder->candidatesLimit(5);
$candidates = $picker->candidates($model, $builder);
```

**Use Cases:**
- Performance optimization
- Limiting candidate lists
- Top N flow selection

## Performance

### cacheInRequest()

Enable simple per-request memoization when no dynamic callbacks are present. This caches flow selection results within a single request for better performance.

```php
$builder->cacheInRequest(true);
```

**Parameters:**
- `bool $on = true`: Whether to enable memoization

**Returns:** `$this` (fluent interface)

**Default:** `false`

**Behavior:**
- Caches flow selection results per request
- Cache key is computed from builder configuration and model
- **Automatically disabled** if unsafe conditions detected:
  - Custom WHERE callbacks exist
  - Custom ordering callback exists
  - `forceFlowIdResolver` is set
- Cache is cleared at end of request

**When Safe to Enable:**
- ✅ No custom WHERE callbacks
- ✅ No custom ordering callback
- ✅ No forceFlowIdResolver
- ✅ Static configuration only

**When NOT Safe (automatically disabled):**
- ❌ Custom WHERE callbacks (dynamic)
- ❌ Custom ordering callback (dynamic)
- ❌ forceFlowIdResolver (dynamic)
- ❌ Request-dependent logic

**Example:**
```php
// Safe: Static configuration
$builder->subjectType(Order::class)
    ->environment('production')
    ->cacheInRequest(true); // ✅ Safe

// Unsafe: Dynamic callback
$builder->where(function ($query, $model) {
    $query->where('field', $model->attr);
})
->cacheInRequest(true); // ❌ Automatically disabled
```

**Use Cases:**
- Performance optimization
- Repeated flow selection in same request
- Reducing database queries

## Complete Examples

### Example 1: Basic Configuration

```php
use JobMetric\Flow\Support\FlowPickerBuilder;

$builder = new FlowPickerBuilder();
$builder->subjectType(Order::class)
    ->subjectScope((string)$order->tenant_id)
    ->environment(config('app.env'))
    ->channel('web')
    ->onlyActive(true)
    ->orderByDefault();
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
```

### Example 3: With Fallback

```php
$builder->subjectType(Order::class)
    ->environment('production')
    ->channel('web')
    ->fallbackCascade([
        FlowPickerBuilder::FB_DROP_CHANNEL,
        FlowPickerBuilder::FB_DROP_ENVIRONMENT,
    ]);
```

### Example 4: Version Constraints

```php
$builder->subjectType(Order::class)
    ->versionAtLeast(1)
    ->versionAtMost(3); // Versions 1-3
```

### Example 5: Include/Exclude

```php
$builder->subjectType(Order::class)
    ->includeFlows([1, 2, 3])
    ->excludeFlows([4, 5])
    ->preferFlows([1, 2]);
```

### Example 6: Custom Ordering

```php
$builder->subjectType(Order::class)
    ->orderBy(function ($query) {
        $query->orderBy('priority', 'desc')
              ->orderBy('created_at', 'asc');
    });
```

### Example 7: Custom Filters

```php
$builder->subjectType(Order::class)
    ->where(function ($query, $model) {
        if ($model->is_premium) {
            $query->where('is_premium_flow', true);
        }
    });
```

### Example 8: Complex Configuration

```php
$builder->subjectType(Order::class)
    ->subjectScope((string)$order->tenant_id)
    ->subjectCollection($order->collection)
    ->environment(config('app.env'))
    ->channel(request()->header('X-Channel', 'web'))
    ->preferEnvironments(['production', 'staging'])
    ->preferChannels(['web', 'api'])
    ->onlyActive(true)
    ->ignoreTimeWindow(false)
    ->timeNow(Carbon::now('UTC'))
    ->evaluateRollout(true)
    ->rolloutNamespace('order')
    ->rolloutKeyResolver(function ($model) {
        return (string)$model->user_id;
    })
    ->versionAtLeast(1)
    ->versionAtMost(3)
    ->includeFlows([1, 2, 3])
    ->excludeFlows([4, 5])
    ->preferFlows([1, 2])
    ->orderByDefault()
    ->matchStrategy(FlowPickerBuilder::STRATEGY_BEST)
    ->requireDefault(false)
    ->fallbackCascade([
        FlowPickerBuilder::FB_DROP_CHANNEL,
        FlowPickerBuilder::FB_DROP_ENVIRONMENT,
        FlowPickerBuilder::FB_IGNORE_TIMEWINDOW,
    ])
    ->cacheInRequest(true);
```

## Getter Methods

All configuration values can be retrieved:

```php
$builder->getSubjectType();
$builder->getSubjectScope();
$builder->getSubjectCollection();
$builder->getEnvironment();
$builder->getChannel();
$builder->getPreferEnvironments();
$builder->getPreferChannels();
$builder->isOnlyActive();
$builder->shouldIgnoreTimeWindow();
$builder->getNowUtc();
$builder->shouldEvaluateRollout();
$builder->getRolloutNamespace();
$builder->getRolloutSalt();
$builder->getRolloutKeyResolver();
$builder->getVersionEquals();
$builder->getVersionMin();
$builder->getVersionMax();
$builder->getIncludeFlowIds();
$builder->getExcludeFlowIds();
$builder->getPreferFlowIds();
$builder->getMatchStrategy();
$builder->isRequireDefault();
$builder->getFallbackCascade();
$builder->getForceFlowIdResolver();
$builder->shouldReturnCandidates();
$builder->getCandidatesLimit();
$builder->shouldCacheInRequest();
$builder->getWhereCallbacks();
$builder->getOrderingCallback();
```

## Integration with HasWorkflow

The `HasWorkflow` trait uses `FlowPickerBuilder`:

```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    $builder->subjectType(static::class)
        ->subjectCollection($this->flowSubjectCollection())
        ->onlyActive(true)
        ->timeNow(Carbon::now('UTC'))
        ->orderByDefault()
        ->evaluateRollout(true)
        ->rolloutKeyResolver(function (Model $model): ?string {
            return $model->getKey() ? (string)$model->getKey() : null;
        });
}
```

## Real-World System Implementation Examples

### Example 1: Complete E-Commerce Order Management System

A comprehensive order management system with multiple workflows based on order type, customer tier, and environment.

**Model:**
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use JobMetric\Flow\HasWorkflow;
use JobMetric\Flow\Support\FlowPickerBuilder;

class Order extends Model
{
    use HasWorkflow;

    protected $fillable = [
        'user_id',
        'tenant_id',
        'order_type',      // 'premium', 'standard', 'express'
        'customer_tier',   // 'vip', 'regular', 'new'
        'total',
        'status',
    ];

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        // Multi-tenant support
        $builder->subjectScope((string)$this->tenant_id);

        // Collection-based workflows (order type)
        $builder->subjectCollection($this->order_type);

        // Environment-specific workflows
        $builder->environment(config('app.env'));

        // Channel-based workflows
        $channel = request()->header('X-Channel', 'web');
        $builder->channel($channel);

        // Prefer production, then staging
        $builder->preferEnvironments(['production', 'staging', 'development']);

        // Prefer web, then API
        $builder->preferChannels(['web', 'api', 'mobile']);

        // Rollout for new workflow (A/B testing)
        $builder->evaluateRollout(true)
            ->rolloutNamespace('order_processing_v2')
            ->rolloutSalt('2024-01')
            ->rolloutKeyResolver(function ($model) {
                return (string)$model->user_id;
            });

        // Version constraints (only versions 1-3)
        $builder->versionAtLeast(1)
            ->versionAtMost(3);

        // Fallback cascade for graceful degradation
        $builder->fallbackCascade([
            FlowPickerBuilder::FB_DROP_CHANNEL,
            FlowPickerBuilder::FB_DROP_ENVIRONMENT,
            FlowPickerBuilder::FB_IGNORE_TIMEWINDOW,
            FlowPickerBuilder::FB_DISABLE_ROLLOUT,
        ]);

        // Custom filter for customer tier
        $builder->where(function ($query, $model) {
            $customerTier = $model->customer_tier;
            
            if ($customerTier === 'vip') {
                $query->where('is_vip_flow', true);
            } elseif ($customerTier === 'new') {
                $query->where('is_new_customer_flow', true);
            }
        });

        // Request caching for performance
        $builder->cacheInRequest(true);
    }

    protected function flowSubjectCollection(): ?string
    {
        return $this->getAttribute('order_type');
    }
}
```

**Flow Setup:**
```php
use JobMetric\Flow\Facades\Flow;

// Premium order flow - Production
Flow::store([
    'subject_type' => Order::class,
    'subject_scope' => '1', // Tenant 1
    'subject_collection' => 'premium',
    'environment' => 'production',
    'channel' => 'web',
    'version' => 2,
    'rollout_pct' => 50, // 50% rollout
    'is_default' => true,
    'status' => true,
]);

// Standard order flow - Production
Flow::store([
    'subject_type' => Order::class,
    'subject_scope' => '1',
    'subject_collection' => 'standard',
    'environment' => 'production',
    'channel' => 'web',
    'version' => 2,
    'is_default' => true,
    'status' => true,
]);

// Express order flow - Production
Flow::store([
    'subject_type' => Order::class,
    'subject_scope' => '1',
    'subject_collection' => 'express',
    'environment' => 'production',
    'channel' => 'web',
    'version' => 2,
    'is_default' => true,
    'status' => true,
]);
```

**Usage:**
```php
// Create order - flow automatically selected
$order = Order::create([
    'user_id' => 123,
    'tenant_id' => 1,
    'order_type' => 'premium',
    'customer_tier' => 'vip',
    'total' => 1000.00,
]);

// Flow is automatically bound based on:
// - Tenant ID (subject_scope)
// - Order type (subject_collection)
// - Environment (production)
// - Channel (web)
// - Customer tier (custom filter)
// - Rollout percentage (user_id bucket)
```

### Example 2: Multi-Tenant SaaS Document Management System

A document management system where each tenant has different approval workflows, with environment-specific and time-based activation.

**Model:**
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use JobMetric\Flow\HasWorkflow;
use JobMetric\Flow\Support\FlowPickerBuilder;
use Illuminate\Support\Carbon;

class Document extends Model
{
    use HasWorkflow;

    protected $fillable = [
        'tenant_id',
        'document_type',  // 'contract', 'invoice', 'report'
        'department',     // 'legal', 'finance', 'hr'
        'priority',        // 'high', 'normal', 'low'
        'status',
    ];

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        // Tenant isolation
        $builder->subjectScope((string)$this->tenant_id);

        // Document type as collection
        $builder->subjectCollection($this->document_type);

        // Environment-specific
        $builder->environment(config('app.env'));

        // Active window enforcement
        $builder->onlyActive(true)
            ->ignoreTimeWindow(false)
            ->timeNow(Carbon::now('UTC'));

        // Prefer production, allow staging fallback
        $builder->preferEnvironments(['production', 'staging']);

        // Version management (only current versions)
        $builder->versionAtLeast(1);

        // Exclude deprecated flows
        $builder->excludeFlows([10, 11, 12]); // Old flow IDs

        // Custom filter for department
        $builder->where(function ($query, $model) {
            $department = $model->department;
            
            // Department-specific flows
            if ($department === 'legal') {
                $query->where('is_legal_flow', true);
            } elseif ($department === 'finance') {
                $query->where('is_finance_flow', true);
            }
        });

        // Fallback: drop environment, then ignore time window
        $builder->fallbackCascade([
            FlowPickerBuilder::FB_DROP_ENVIRONMENT,
            FlowPickerBuilder::FB_IGNORE_TIMEWINDOW,
        ]);
    }

    protected function flowSubjectCollection(): ?string
    {
        return $this->getAttribute('document_type');
    }
}
```

**Flow Setup:**
```php
// Contract approval flow - Tenant 1, Production, Active Jan 2024
Flow::store([
    'subject_type' => Document::class,
    'subject_scope' => '1',
    'subject_collection' => 'contract',
    'environment' => 'production',
    'version' => 1,
    'status' => true,
    'active_from' => '2024-01-01 00:00:00',
    'active_to' => '2024-12-31 23:59:59',
    'is_default' => true,
]);

// Invoice approval flow - Tenant 1, Production
Flow::store([
    'subject_type' => Document::class,
    'subject_scope' => '1',
    'subject_collection' => 'invoice',
    'environment' => 'production',
    'version' => 1,
    'status' => true,
    'is_default' => true,
]);
```

### Example 3: Content Management System with A/B Testing

A CMS with gradual rollout of new content approval workflows, supporting multiple content types and channels.

**Model:**
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use JobMetric\Flow\HasWorkflow;
use JobMetric\Flow\Support\FlowPickerBuilder;

class Article extends Model
{
    use HasWorkflow;

    protected $fillable = [
        'author_id',
        'content_type',  // 'news', 'blog', 'press-release'
        'category',      // 'tech', 'business', 'lifestyle'
        'status',
    ];

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        // Content type as collection
        $builder->subjectCollection($this->content_type);

        // Environment
        $builder->environment(config('app.env'));

        // Channel (web vs admin)
        $channel = request()->is('admin/*') ? 'admin' : 'web';
        $builder->channel($channel);

        // A/B Testing: Rollout new workflow to 30% of authors
        $builder->evaluateRollout(true)
            ->rolloutNamespace('content_approval_v2')
            ->rolloutSalt('2024-Q1')
            ->rolloutKeyResolver(function ($model) {
                // Consistent assignment by author
                return (string)$model->author_id;
            });

        // Prefer new version, but allow old version
        $builder->preferFlows([5, 6]); // New flow IDs
        $builder->versionAtLeast(1);

        // Fallback: disable rollout if new workflow not available
        $builder->fallbackCascade([
            FlowPickerBuilder::FB_DISABLE_ROLLOUT,
            FlowPickerBuilder::FB_DROP_CHANNEL,
        ]);

        // Custom filter for category
        $builder->where(function ($query, $model) {
            $category = $model->category;
            
            // Category-specific workflows
            if (in_array($category, ['tech', 'business'])) {
                $query->where('requires_technical_review', true);
            }
        });
    }

    protected function flowSubjectCollection(): ?string
    {
        return $this->getAttribute('content_type');
    }
}
```

**Flow Setup:**
```php
// New approval workflow (30% rollout)
Flow::store([
    'subject_type' => Article::class,
    'subject_collection' => 'news',
    'environment' => 'production',
    'channel' => 'web',
    'version' => 2,
    'rollout_pct' => 30, // 30% of authors
    'status' => true,
    'is_default' => false,
]);

// Old approval workflow (70% of authors, or 100% if rollout disabled)
Flow::store([
    'subject_type' => Article::class,
    'subject_collection' => 'news',
    'environment' => 'production',
    'channel' => 'web',
    'version' => 1,
    'rollout_pct' => null, // No rollout gate
    'status' => true,
    'is_default' => true,
]);
```

### Example 4: Financial Transaction Processing System

A financial system with strict version control, environment isolation, and scheduled workflow activation.

**Model:**
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use JobMetric\Flow\HasWorkflow;
use JobMetric\Flow\Support\FlowPickerBuilder;
use Illuminate\Support\Carbon;

class Transaction extends Model
{
    use HasWorkflow;

    protected $fillable = [
        'account_id',
        'transaction_type', // 'payment', 'refund', 'transfer'
        'amount',
        'currency',
        'status',
    ];

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        // Transaction type as collection
        $builder->subjectCollection($this->transaction_type);

        // Strict environment isolation (no fallback)
        $builder->environment(config('app.env'));

        // Active window enforcement (scheduled workflows)
        $builder->onlyActive(true)
            ->ignoreTimeWindow(false)
            ->timeNow(Carbon::now('UTC'));

        // Version pinning (exact version required)
        $currentVersion = config('flows.transaction_version', 2);
        $builder->versionEquals($currentVersion);

        // Require default flows only
        $builder->requireDefault(true);

        // No rollout (all transactions use same workflow)
        $builder->evaluateRollout(false);

        // Custom filter for currency
        $builder->where(function ($query, $model) {
            $currency = $model->currency;
            
            // Currency-specific workflows
            if ($currency === 'USD') {
                $query->where('supports_usd', true);
            } elseif ($currency === 'EUR') {
                $query->where('supports_eur', true);
            }
        });

        // No fallback (strict matching required)
        $builder->fallbackCascade([]);
    }

    protected function flowSubjectCollection(): ?string
    {
        return $this->getAttribute('transaction_type');
    }
}
```

**Flow Setup:**
```php
// Payment processing flow - Version 2, Production, Active Q1 2024
Flow::store([
    'subject_type' => Transaction::class,
    'subject_collection' => 'payment',
    'environment' => 'production',
    'version' => 2,
    'status' => true,
    'active_from' => '2024-01-01 00:00:00',
    'active_to' => '2024-03-31 23:59:59',
    'is_default' => true,
    'supports_usd' => true,
    'supports_eur' => true,
]);
```

### Example 5: Support Ticket System with Priority-Based Workflows

A support ticket system with different workflows based on ticket priority, customer tier, and channel.

**Model:**
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use JobMetric\Flow\HasWorkflow;
use JobMetric\Flow\Support\FlowPickerBuilder;

class Ticket extends Model
{
    use HasWorkflow;

    protected $fillable = [
        'customer_id',
        'priority',        // 'critical', 'high', 'normal', 'low'
        'category',        // 'technical', 'billing', 'general'
        'channel',         // 'email', 'chat', 'phone'
        'customer_tier',   // 'enterprise', 'business', 'standard'
        'status',
    ];

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        // Priority as collection
        $builder->subjectCollection($this->priority);

        // Channel-based workflows
        $builder->channel($this->channel);

        // Environment
        $builder->environment(config('app.env'));

        // Prefer critical priority flows
        $builder->preferFlows([1, 2, 3]); // Critical flow IDs

        // Version constraints
        $builder->versionAtLeast(1)
            ->versionAtMost(2);

        // Custom filters
        $builder->where(function ($query, $model) {
            // Category-specific
            if ($model->category === 'technical') {
                $query->where('requires_technical_team', true);
            }

            // Customer tier
            if ($model->customer_tier === 'enterprise') {
                $query->where('is_enterprise_flow', true);
            }
        });

        // Fallback: drop channel, then environment
        $builder->fallbackCascade([
            FlowPickerBuilder::FB_DROP_CHANNEL,
            FlowPickerBuilder::FB_DROP_ENVIRONMENT,
        ]);
    }

    protected function flowSubjectCollection(): ?string
    {
        return $this->getAttribute('priority');
    }
}
```

**Flow Setup:**
```php
// Critical priority - Email channel
Flow::store([
    'subject_type' => Ticket::class,
    'subject_collection' => 'critical',
    'channel' => 'email',
    'environment' => 'production',
    'version' => 1,
    'requires_technical_team' => true,
    'status' => true,
    'is_default' => true,
]);

// High priority - Chat channel
Flow::store([
    'subject_type' => Ticket::class,
    'subject_collection' => 'high',
    'channel' => 'chat',
    'environment' => 'production',
    'version' => 1,
    'status' => true,
    'is_default' => true,
]);
```

### Example 6: Invoice Processing with Time-Based Activation

An invoice processing system with workflows that activate/deactivate at specific times, supporting multiple currencies and regions.

**Model:**
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use JobMetric\Flow\HasWorkflow;
use JobMetric\Flow\Support\FlowPickerBuilder;
use Illuminate\Support\Carbon;

class Invoice extends Model
{
    use HasWorkflow;

    protected $fillable = [
        'tenant_id',
        'region',          // 'us', 'eu', 'asia'
        'currency',
        'invoice_type',    // 'recurring', 'one-time'
        'status',
    ];

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        // Tenant isolation
        $builder->subjectScope((string)$this->tenant_id);

        // Invoice type as collection
        $builder->subjectCollection($this->invoice_type);

        // Environment
        $builder->environment(config('app.env'));

        // Strict time window enforcement
        $builder->onlyActive(true)
            ->ignoreTimeWindow(false)
            ->timeNow(Carbon::now('UTC'));

        // Prefer current region
        $builder->preferEnvironments(['production', 'staging']);

        // Version management
        $builder->versionAtLeast(1);

        // Custom filters
        $builder->where(function ($query, $model) {
            // Region-specific
            $query->where('supported_regions', 'LIKE', "%{$model->region}%");

            // Currency support
            if ($model->currency === 'USD') {
                $query->where('supports_usd', true);
            }
        });

        // Fallback: ignore time window if outside active period
        $builder->fallbackCascade([
            FlowPickerBuilder::FB_IGNORE_TIMEWINDOW,
            FlowPickerBuilder::FB_DROP_ENVIRONMENT,
        ]);
    }

    protected function flowSubjectCollection(): ?string
    {
        return $this->getAttribute('invoice_type');
    }
}
```

**Flow Setup:**
```php
// Recurring invoice flow - Active during business quarter
Flow::store([
    'subject_type' => Invoice::class,
    'subject_scope' => '1',
    'subject_collection' => 'recurring',
    'environment' => 'production',
    'version' => 1,
    'status' => true,
    'active_from' => '2024-01-01 00:00:00',
    'active_to' => '2024-03-31 23:59:59',
    'supported_regions' => 'us,eu,asia',
    'supports_usd' => true,
    'is_default' => true,
]);
```

### Example 7: Complete Implementation with All Features

A comprehensive example using all FlowPickerBuilder features for a complex enterprise system.

**Model:**
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use JobMetric\Flow\HasWorkflow;
use JobMetric\Flow\Support\FlowPickerBuilder;
use Illuminate\Support\Carbon;

class EnterpriseOrder extends Model
{
    use HasWorkflow;

    protected $fillable = [
        'organization_id',
        'department_id',
        'order_category',   // 'procurement', 'it', 'hr'
        'order_type',       // 'urgent', 'standard', 'planned'
        'budget_tier',      // 'high', 'medium', 'low'
        'region',
        'status',
    ];

    protected function buildFlowPicker(FlowPickerBuilder $builder): void
    {
        parent::buildFlowPicker($builder);

        // Organization scope (multi-tenant)
        $builder->subjectScope((string)$this->organization_id);

        // Order category as collection
        $builder->subjectCollection($this->order_category);

        // Environment with preference
        $builder->environment(config('app.env'))
            ->preferEnvironments(['production', 'staging', 'development']);

        // Channel
        $channel = $this->determineChannel();
        $builder->channel($channel)
            ->preferChannels(['web', 'api', 'mobile']);

        // Active constraints with time window
        $builder->onlyActive(true)
            ->ignoreTimeWindow(false)
            ->timeNow(Carbon::now('UTC'));

        // Rollout for new workflow (25% of organizations)
        $builder->evaluateRollout(true)
            ->rolloutNamespace('enterprise_order_v3')
            ->rolloutSalt('2024-Q2')
            ->rolloutKeyResolver(function ($model) {
                return (string)$model->organization_id;
            });

        // Version constraints
        $builder->versionAtLeast(2)
            ->versionAtMost(4);

        // Include only approved flows
        $builder->includeFlows([10, 11, 12, 13]);

        // Exclude deprecated flows
        $builder->excludeFlows([1, 2, 3]);

        // Prefer newer flows
        $builder->preferFlows([13, 12, 11, 10]);

        // Require default flows
        $builder->requireDefault(true);

        // Custom ordering
        $builder->orderBy(function ($query) {
            $query->orderByDesc('priority')
                ->orderByDesc('version')
                ->orderByDesc('is_default');
        });

        // Match strategy
        $builder->matchStrategy(FlowPickerBuilder::STRATEGY_BEST);

        // Custom filters
        $builder->where(function ($query, $model) {
            // Department-specific
            if ($model->department_id === 5) { // IT Department
                $query->where('requires_it_approval', true);
            }

            // Budget tier
            if ($model->budget_tier === 'high') {
                $query->where('requires_executive_approval', true);
            }

            // Region
            $query->where('supported_regions', 'LIKE', "%{$model->region}%");
        });

        // Comprehensive fallback cascade
        $builder->fallbackCascade([
            FlowPickerBuilder::FB_DROP_CHANNEL,
            FlowPickerBuilder::FB_DROP_ENVIRONMENT,
            FlowPickerBuilder::FB_IGNORE_TIMEWINDOW,
            FlowPickerBuilder::FB_DISABLE_ROLLOUT,
            FlowPickerBuilder::FB_DROP_REQUIRE_DEFAULT,
        ]);

        // Performance optimization
        $builder->cacheInRequest(true);
    }

    protected function flowSubjectCollection(): ?string
    {
        return $this->getAttribute('order_category');
    }

    protected function determineChannel(): string
    {
        if (request()->is('api/*')) {
            return 'api';
        } elseif (request()->is('mobile/*')) {
            return 'mobile';
        }
        return 'web';
    }
}
```

**Complete Flow Setup:**
```php
use JobMetric\Flow\Facades\Flow;

// Procurement flow - Production, Version 3, 25% rollout
Flow::store([
    'subject_type' => EnterpriseOrder::class,
    'subject_scope' => '100', // Organization 100
    'subject_collection' => 'procurement',
    'environment' => 'production',
    'channel' => 'web',
    'version' => 3,
    'rollout_pct' => 25,
    'status' => true,
    'active_from' => '2024-04-01 00:00:00',
    'active_to' => '2024-06-30 23:59:59',
    'is_default' => true,
    'priority' => 10,
    'requires_it_approval' => false,
    'requires_executive_approval' => true,
    'supported_regions' => 'us,eu',
]);

// IT flow - Production, Version 3
Flow::store([
    'subject_type' => EnterpriseOrder::class,
    'subject_scope' => '100',
    'subject_collection' => 'it',
    'environment' => 'production',
    'channel' => 'web',
    'version' => 3,
    'rollout_pct' => 25,
    'status' => true,
    'active_from' => '2024-04-01 00:00:00',
    'active_to' => '2024-06-30 23:59:59',
    'is_default' => true,
    'priority' => 10,
    'requires_it_approval' => true,
    'requires_executive_approval' => false,
    'supported_regions' => 'us,eu,asia',
]);
```

**Usage in Controller:**
```php
namespace App\Http\Controllers;

use App\Models\EnterpriseOrder;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        // Create order - flow automatically selected
        $order = EnterpriseOrder::create([
            'organization_id' => $request->organization_id,
            'department_id' => $request->department_id,
            'order_category' => $request->category,
            'order_type' => $request->type,
            'budget_tier' => $request->budget_tier,
            'region' => $request->region,
        ]);

        // Flow is automatically bound with all criteria:
        // - Organization scope
        // - Order category
        // - Environment
        // - Channel
        // - Active time window
        // - Rollout percentage
        // - Version constraints
        // - Custom filters (department, budget, region)

        return response()->json([
            'order' => $order,
            'flow' => $order->boundFlow(),
        ]);
    }
}
```

### Example 8: Testing and Development Scenarios

Examples for testing and development environments.

**Test Configuration:**
```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);

    // Testing: Include specific test flows
    if (app()->environment('testing')) {
        $builder->includeFlows([999, 998, 997]) // Test flow IDs
            ->evaluateRollout(false) // Disable rollout in tests
            ->onlyActive(false) // Include inactive flows
            ->ignoreTimeWindow(true); // Ignore time windows
    } else {
        // Production configuration
        $builder->environment(config('app.env'))
            ->onlyActive(true)
            ->evaluateRollout(true);
    }
}
```

**Development Configuration:**
```php
protected function buildFlowPicker(FlowPickerBuilder $builder): void
{
    parent::buildFlowPicker($builder);

    // Development: Allow any environment, prefer development
    $builder->environment(null) // No environment filter
        ->preferEnvironments(['development', 'staging', 'production'])
        ->onlyActive(false) // Include inactive for testing
        ->fallbackCascade([
            FlowPickerBuilder::FB_DROP_ENVIRONMENT,
            FlowPickerBuilder::FB_IGNORE_TIMEWINDOW,
        ]);
}
```

## Related Documentation

- [FlowPicker](/packages/laravel-flow/deep-diving/support/flow-picker) - Learn about flow selection
- [HasWorkflow Trait](/packages/laravel-flow/deep-diving/has-workflow) - Learn about workflow integration
- [Flow Service](/packages/laravel-flow/deep-diving/services/flow) - Learn about flow management

