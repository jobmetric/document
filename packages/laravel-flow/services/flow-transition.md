---
sidebar_position: 4
sidebar_label: FlowTransition Service
---

# FlowTransition Service

The FlowTransition service provides CRUD operations for managing transitions between workflow states and executing transitions. Transitions define how work moves from one state to another in your workflow.

## Namespace

```php
JobMetric\Flow\Services\FlowTransition
```

## Facade

For convenience, you can use the FlowTransition Facade:

```php
use JobMetric\Flow\Facades\FlowTransition;
```

## Transition Types

Transitions can be categorized into different types:

- **Specific Transition**: Both `from` and `to` states are set (normal transition between two states)
- **Self-Loop Transition**: `from` and `to` are the same state (transition that returns to the same state)
- **Generic Input Transition**: `from` is `null` (can enter a state from anywhere)
- **Generic Output Transition**: `to` is `null` (can exit a state to anywhere)

## Basic CRUD Operations

### Store

Create a new transition between states.

```php
use JobMetric\Flow\Facades\FlowTransition;

// Specific transition (from one state to another)
$transition = FlowTransition::store($flowId, [
    'from' => $pendingStateId,
    'to' => $processingStateId,
    'slug' => 'start_processing',
]);
```

**Parameters:**

- `$flowId` (int): The ID of the flow
- `$data` (array): Transition configuration

**Transition Configuration:**

- `from` (int|null): Source state ID. Set to `null` for generic input transitions
- `to` (int|null): Destination state ID. Set to `null` for generic output transitions
- `slug` (string|null): Optional unique identifier for the transition within the flow

**Examples:**

```php
// Specific transition: from Pending to Processing
$transition = FlowTransition::store($flowId, [
    'from' => $pendingStateId,
    'to' => $processingStateId,
    'slug' => 'approve_order',
]);

// Self-loop transition: from Processing back to Processing
$transition = FlowTransition::store($flowId, [
    'from' => $processingStateId,
    'to' => $processingStateId,
    'slug' => 'retry_processing',
]);

// Generic input transition: can enter Processing from anywhere
$transition = FlowTransition::store($flowId, [
    'from' => null,
    'to' => $processingStateId,
    'slug' => 'force_to_processing',
]);

// Generic output transition: can exit Processing to anywhere
$transition = FlowTransition::store($flowId, [
    'from' => $processingStateId,
    'to' => null,
    'slug' => 'exit_processing',
]);
```

### Show

Retrieve a specific transition by ID.

```php
$transition = FlowTransition::show($transitionId);

// With relations
$transition = FlowTransition::show($transitionId, ['fromState', 'toState', 'tasks']);
```

### Update

Update an existing transition.

```php
$transition = FlowTransition::update($transitionId, [
    'slug' => 'updated_slug',
    'to' => $newStateId,
]);
```

### Delete

Delete a transition. **Note:** The last transition from a START state cannot be deleted.

```php
$transition = FlowTransition::delete($transitionId);
```

**Important:** Attempting to delete the last transition from a START state will result in an error:

```php
try {
    FlowTransition::delete($lastStartTransitionId);
} catch (\RuntimeException $e) {
    // Cannot delete the last transition from START state
}
```

## Executing Transitions

### Runner

Execute a transition by its ID or slug. This method runs all associated tasks (restriction, validation, and action) in the correct order and updates the model status.

```php
use JobMetric\Flow\Facades\FlowTransition;
use App\Models\Order;

$order = Order::find(1);

// Execute by transition ID
$result = FlowTransition::runner($transitionId, $order);

// Execute by slug
$result = FlowTransition::runner('start_processing', $order);

// With payload data
$result = FlowTransition::runner($transitionId, $order, [
    'reason' => 'Payment received',
    'amount' => 100.00,
]);

// With user context
$result = FlowTransition::runner($transitionId, $order, [], auth()->user());
```

**Parameters:**

- `$key` (int|string): Transition ID or slug
- `$subject` (Model|null): The subject model instance. If `null`, will be resolved from FlowInstance
- `$payload` (array): Optional data payload for validation tasks
- `$user` (Authenticatable|null): Optional user context for the transition

**Return Value:**

Returns a `TransitionResult` object:

```php
$result = FlowTransition::runner($transitionId, $order);

if ($result->isSuccess()) {
    $messages = $result->getMessages();
    $data = $result->getData();
} else {
    $errors = $result->getErrors();
    $code = $result->getCode();
}
```

**Execution Flow:**

When a transition is executed, tasks run in the following order:

1. **Restriction Tasks**: Check if the transition is allowed
   - If any restriction fails, a `TaskRestrictionException` is thrown
   
2. **Validation Tasks**: Validate the payload data
   - If validation fails, a `ValidationException` is thrown
   
3. **Action Tasks**: Execute actions (notifications, updates, etc.)
   - These run after restrictions and validations pass

4. **Update Model Status**: Update the subject model's status field to match the `toState` status

5. **Create/Update FlowInstance**: Record the transition execution

**Related Transitions:**

For specific transitions (not self-loop or generic), the system also executes related transitions in order:

1. Generic output transitions (from the `fromState` with `to = null`)
2. The specific transition itself
3. Generic input transitions (to the `fromState` with `from = null`)

This allows for complex workflow scenarios where multiple transitions can be triggered simultaneously.

## Complete Example

Here's a complete example of creating a workflow with transitions:

```php
use JobMetric\Flow\Facades\Flow;
use JobMetric\Flow\Facades\FlowState;
use JobMetric\Flow\Facades\FlowTransition;
use JobMetric\Flow\Facades\FlowTask;
use App\Models\Order;

// Create the flow
$flow = Flow::store([
    'subject_type' => Order::class,
    'version' => 1,
])->getData();

$flowId = $flow->id;

// Get the automatically created START state
$startState = Flow::getStartState($flowId);

// Create states
$pendingState = FlowState::store($flowId, [
    'translation' => [
        'en' => ['name' => 'Pending', 'description' => 'Order is pending'],
    ],
    'status' => 'pending',
]);

$processingState = FlowState::store($flowId, [
    'translation' => [
        'en' => ['name' => 'Processing', 'description' => 'Order is being processed'],
    ],
    'status' => 'processing',
]);

$shippedState = FlowState::store($flowId, [
    'translation' => [
        'en' => ['name' => 'Shipped', 'description' => 'Order has been shipped'],
    ],
    'status' => 'shipped',
]);

$deliveredState = FlowState::store($flowId, [
    'translation' => [
        'en' => ['name' => 'Delivered', 'description' => 'Order has been delivered'],
    ],
    'status' => 'delivered',
    'is_terminal' => true,
]);

// Create transitions
$transition1 = FlowTransition::store($flowId, [
    'from' => $startState->id,
    'to' => $pendingState->id,
    'slug' => 'create_order',
]);

$transition2 = FlowTransition::store($flowId, [
    'from' => $pendingState->id,
    'to' => $processingState->id,
    'slug' => 'start_processing',
]);

$transition3 = FlowTransition::store($flowId, [
    'from' => $processingState->id,
    'to' => $shippedState->id,
    'slug' => 'ship_order',
]);

$transition4 = FlowTransition::store($flowId, [
    'from' => $shippedState->id,
    'to' => $deliveredState->id,
    'slug' => 'deliver_order',
]);

// Add tasks to transitions
FlowTask::store($flowId, $transition2->id, [
    'driver' => 'App\Flows\Tasks\CheckPermission',
    'config' => ['permission' => 'process-orders'],
    'ordering' => 1,
    'status' => true,
]);

FlowTask::store($flowId, $transition2->id, [
    'driver' => 'App\Flows\Tasks\SendEmailNotification',
    'config' => [
        'to' => 'customer@example.com',
        'subject' => 'Your order is being processed',
    ],
    'ordering' => 2,
    'status' => true,
]);

// Execute a transition
$order = Order::create([...]);

$result = FlowTransition::runner('start_processing', $order, [
    'processor_id' => auth()->id(),
]);

if ($result->isSuccess()) {
    // Transition executed successfully
    // Order status is now 'processing'
}
```

## Transition Execution Errors

The runner method can throw several exceptions:

**TaskRestrictionException:**

Thrown when a restriction task denies the transition:

```php
try {
    FlowTransition::runner($transitionId, $order);
} catch (\JobMetric\Flow\Exceptions\TaskRestrictionException $e) {
    // Transition was denied by a restriction task
    $message = $e->getMessage();
    $code = $e->getCode();
}
```

**ValidationException:**

Thrown when validation tasks fail:

```php
try {
    FlowTransition::runner($transitionId, $order, [
        'amount' => -100, // Invalid amount
    ]);
} catch (\Illuminate\Validation\ValidationException $e) {
    $errors = $e->errors();
}
```

**LogicException:**

Thrown when the subject model is required but not provided, or when subject type doesn't match:

```php
try {
    FlowTransition::runner($transitionId, null);
} catch (\LogicException $e) {
    // Subject model is required
}
```

## Direct Service Usage

If you prefer dependency injection over the Facade:

```php
use JobMetric\Flow\Services\FlowTransition as FlowTransitionService;

class YourController
{
    public function __construct(
        protected FlowTransitionService $flowTransitionService
    ) {}

    public function execute($transitionId, Order $order)
    {
        $result = $this->flowTransitionService->runner($transitionId, $order);
    }
}
```

## Response Format

The service methods return the FlowTransition model directly (except `runner` which returns `TransitionResult`):

```php
$transition = FlowTransition::store($flowId, [...]);

// Access transition properties
$transitionId = $transition->id;
$fromStateId = $transition->from;
$toStateId = $transition->to;
$slug = $transition->slug;
```

