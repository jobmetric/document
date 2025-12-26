---
sidebar_position: 1
sidebar_label: Flow Service
---

# Flow Service

The Flow service provides comprehensive CRUD operations and workflow management functionality for Laravel Flow. You can use it directly via the service class or through the convenient Facade.

## Namespace

```php
JobMetric\Flow\Services\Flow
```

## Facade

For convenience, you can use the Flow Facade:

```php
use JobMetric\Flow\Facades\Flow;
```

## Basic CRUD Operations

### Store

Create a new workflow flow.

```php
use JobMetric\Flow\Facades\Flow;

$response = Flow::store([
    'subject_type' => 'App\Models\Order',
    'subject_scope' => null,
    'subject_collection' => null,
    'version' => 1,
    'channel' => 'web',
    'environment' => 'production',
]);
```

### Show

Retrieve a specific flow by ID.

```php
$response = Flow::show($flowId);

// With relations
$response = Flow::show($flowId, ['states', 'transitions']);
```

### Update

Update an existing flow.

```php
$response = Flow::update($flowId, [
    'channel' => 'api',
    'environment' => 'staging',
]);
```

### Delete

Soft delete a flow.

```php
$response = Flow::delete($flowId);
```

### Restore

Restore a soft-deleted flow.

```php
$response = Flow::restore($flowId);
```

### Force Delete

Permanently delete a flow.

```php
$response = Flow::forceDelete($flowId);
```

## Workflow Management

### Toggle Status

Enable or disable a flow.

```php
$response = Flow::toggleStatus($flowId);
```

### Get Start State

Retrieve the START state of a flow.

```php
$startState = Flow::getStartState($flowId);
```

### Get End States

Retrieve all END states of a flow.

```php
$endStates = Flow::getEndState($flowId);
```

### Set Default

Mark a flow as the default within its scope (subject_type + subject_scope + version). This will automatically unset other defaults in the same scope.

```php
$response = Flow::setDefault($flowId);
```

### Set Active Window

Define the active time window for a flow. Set dates to `null` to clear the window.

```php
use Illuminate\Support\Carbon;

$response = Flow::setActiveWindow(
    $flowId,
    Carbon::parse('2024-01-01'),
    Carbon::parse('2024-12-31')
);

// Clear active window
$response = Flow::setActiveWindow($flowId, null, null);
```

### Set Rollout

Configure the rollout percentage for canary deployments (0-100). Set to `null` to reset to 100% (no canary).

```php
// Set 50% rollout
$response = Flow::setRollout($flowId, 50);

// Reset to 100%
$response = Flow::setRollout($flowId, null);
```

### Reorder

Reorder multiple flows by providing an array of flow IDs in the desired order.

```php
$response = Flow::reorder([3, 1, 2, 5, 4]);
```

### Duplicate

Create a copy of an existing flow, optionally including its states and transitions.

```php
// Duplicate with full graph
$response = Flow::duplicate($flowId, [], true);

// Duplicate without graph
$response = Flow::duplicate($flowId, [], false);

// Duplicate with overrides
$response = Flow::duplicate($flowId, [
    'channel' => 'mobile',
    'version' => 2,
], true);
```

## State Management

### Get States

Retrieve all states for a flow, ordered by ID.

```php
$states = Flow::getStates($flowId);
```

### Get States by Status Map

Get states keyed by their status value for quick lookup.

```php
$statesMap = Flow::getStatesByStatusMap($flowId);
// Returns: ['pending' => FlowState, 'processing' => FlowState, ...]
```

## Validation

### Validate Consistency

Validate the structural consistency of a flow definition. This checks:
- Exactly one START state exists
- START state has no incoming transitions

```php
$response = Flow::validateConsistency($flowId);
```

## Flow Picking

### Preview Pick

Preview which flow would be selected for a given subject model.

```php
use App\Models\Order;

$order = Order::find(1);
$flow = Flow::previewPick($order);

// With custom tuner
$flow = Flow::previewPick($order, function ($builder) {
    $builder->onlyActive(false)
            ->orderByDefault(false);
});
```

## Import & Export

### Export

Export a flow to an array structure, optionally including the complete graph (states and transitions).

```php
// Export with graph
$data = Flow::export($flowId, true);

// Export without graph
$data = Flow::export($flowId, false);
```

### Import

Import a flow from an exported payload.

```php
$payload = [
    'flow' => [
        'subject_type' => 'App\Models\Order',
        'version' => 1,
        // ... other flow fields
    ],
    'states' => [
        // ... state definitions
    ],
    'transitions' => [
        // ... transition definitions
    ],
];

$flow = Flow::import($payload);

// With overrides
$flow = Flow::import($payload, [
    'channel' => 'api',
    'environment' => 'production',
]);
```

## Response Format

All methods that return a `Response` object follow this structure:

```php
Response::make(
    bool $success,
    string $message,
    mixed $data = null
)
```

Example:

```php
$response = Flow::store([...]);

if ($response->isSuccess()) {
    $flow = $response->getData();
    // Work with the flow resource
}
```

## Direct Service Usage

If you prefer dependency injection over the Facade:

```php
use JobMetric\Flow\Services\Flow as FlowService;

class YourController
{
    public function __construct(
        protected FlowService $flowService
    ) {}

    public function index()
    {
        $response = $this->flowService->store([...]);
    }
}
```

