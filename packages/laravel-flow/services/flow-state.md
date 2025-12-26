---
sidebar_position: 2
sidebar_label: FlowState Service
---

# FlowState Service

The FlowState service provides CRUD operations for managing workflow states within a flow. States represent different stages in your workflow process.

## Namespace

```php
JobMetric\Flow\Services\FlowState
```

## Facade

For convenience, you can use the FlowState Facade:

```php
use JobMetric\Flow\Facades\FlowState;
```

## Basic CRUD Operations

### Store

Create a new state within a flow. The state type is automatically set to `STATE` (middle state).

```php
use JobMetric\Flow\Facades\FlowState;

$state = FlowState::store($flowId, [
    'translation' => [
        'en' => [
            'name' => 'Processing',
            'description' => 'Order is being processed',
        ],
        'fa' => [
            'name' => 'در حال پردازش',
            'description' => 'سفارش در حال پردازش است',
        ],
    ],
    'status' => 'processing',
    'is_terminal' => false,
    'color' => '#3b82f6',
    'icon' => 'cog',
    'position' => [
        'x' => 100,
        'y' => 200,
    ],
]);
```

**Available Config Options:**

- `is_terminal` (boolean): Whether this state is a terminal/end state. Default: `false`
- `color` (string): Color code for the state (e.g., `#3b82f6`). Default: configured in `workflow.state.middle.color`
- `icon` (string): Icon identifier for the state. Default: configured in `workflow.state.middle.icon`
- `position` (array): X and Y coordinates for visual representation:
  ```php
  'position' => [
      'x' => 100,
      'y' => 200,
  ]
  ```

**Minimal Example:**

```php
$state = FlowState::store($flowId, [
    'translation' => [
        'en' => ['name' => 'Pending', 'description' => 'Waiting for approval'],
    ],
    'status' => 'pending',
]);
```

### Show

Retrieve a specific state by ID.

```php
$state = FlowState::show($stateId);

// With relations
$state = FlowState::show($stateId, ['flow', 'transitions']);
```

### Update

Update an existing state.

```php
$state = FlowState::update($stateId, [
    'translation' => [
        'en' => [
            'name' => 'In Progress',
            'description' => 'Order is in progress',
        ],
    ],
    'status' => 'in_progress',
    'color' => '#10b981',
]);
```

**Updating Config:**

You can update the config separately:

```php
$state = FlowState::update($stateId, [
    'config' => [
        'is_terminal' => true,
        'color' => '#ef4444',
        'icon' => 'check-circle',
        'position' => [
            'x' => 300,
            'y' => 400,
        ],
    ],
]);
```

**Mark as Terminal:**

```php
$state = FlowState::update($stateId, [
    'is_terminal' => true,
]);
```

### Delete

Delete a state. **Note:** START states cannot be deleted and will throw a validation exception.

```php
$state = FlowState::delete($stateId);
```

**Important:** Attempting to delete a START state will result in a validation error:

```php
try {
    FlowState::delete($startStateId);
} catch (\Illuminate\Validation\ValidationException $e) {
    // Cannot delete START state
}
```

## State Types

FlowState automatically handles different state types:

- **START**: Entry point of the workflow (created automatically when creating a flow)
- **STATE**: Middle/intermediate states (default type for manually created states)
- **END**: Terminal states (marked with `is_terminal: true`)

## Translation Support

States support multi-language translations:

```php
$state = FlowState::store($flowId, [
    'translation' => [
        'en' => [
            'name' => 'Approved',
            'description' => 'Request has been approved',
        ],
        'fa' => [
            'name' => 'تایید شده',
            'description' => 'درخواست تایید شده است',
        ],
        'ar' => [
            'name' => 'موافق عليه',
            'description' => 'تم الموافقة على الطلب',
        ],
    ],
    'status' => 'approved',
]);
```

## Status Field

The `status` field is a unique identifier for the state within the flow. It's used to reference states in transitions and workflow logic.

```php
$state = FlowState::store($flowId, [
    'translation' => [
        'en' => ['name' => 'Pending Review', 'description' => ''],
    ],
    'status' => 'pending_review', // Unique identifier
]);
```

## Complete Example

Here's a complete example of creating a workflow with multiple states:

```php
use JobMetric\Flow\Facades\Flow;
use JobMetric\Flow\Facades\FlowState;

// Create the flow
$flow = Flow::store([
    'subject_type' => 'App\Models\Order',
    'version' => 1,
])->getData();

$flowId = $flow->id;

// Get the automatically created START state
$startState = Flow::getStartState($flowId);

// Create middle states
$processingState = FlowState::store($flowId, [
    'translation' => [
        'en' => ['name' => 'Processing', 'description' => 'Order is being processed'],
    ],
    'status' => 'processing',
    'color' => '#3b82f6',
    'icon' => 'cog',
]);

$shippedState = FlowState::store($flowId, [
    'translation' => [
        'en' => ['name' => 'Shipped', 'description' => 'Order has been shipped'],
    ],
    'status' => 'shipped',
    'color' => '#8b5cf6',
    'icon' => 'truck',
]);

// Create an END state
$deliveredState = FlowState::store($flowId, [
    'translation' => [
        'en' => ['name' => 'Delivered', 'description' => 'Order has been delivered'],
    ],
    'status' => 'delivered',
    'is_terminal' => true, // Mark as terminal/end state
    'color' => '#10b981',
    'icon' => 'check-circle',
]);
```

## Direct Service Usage

If you prefer dependency injection over the Facade:

```php
use JobMetric\Flow\Services\FlowState as FlowStateService;

class YourController
{
    public function __construct(
        protected FlowStateService $flowStateService
    ) {}

    public function store($flowId)
    {
        $state = $this->flowStateService->store($flowId, [
            'translation' => [...],
            'status' => 'pending',
        ]);
    }
}
```

## Response Format

The service methods return the FlowState model directly (not wrapped in Response like Flow service):

```php
$state = FlowState::store($flowId, [...]);

// Access state properties
$stateId = $state->id;
$status = $state->status;
$config = $state->config;
$translations = $state->getTranslations();
```

