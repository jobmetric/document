---
sidebar_position: 1
sidebar_label: EventSystem
---

import Link from "@docusaurus/Link";

# EventSystem Service

The EventSystem service provides comprehensive CRUD operations and dynamic event management functionality for Laravel Event System. You can use it directly via the service class or through the convenient Facade.

## Namespace

```php
JobMetric\EventSystem\EventSystem
```

## Facade

For convenience, you can use the EventSystem Facade:

```php
use JobMetric\EventSystem\Facades\EventSystem;
```

## Basic CRUD Operations

### Store

Create a new event-listener binding.

```php
use JobMetric\EventSystem\Facades\EventSystem;

$response = EventSystem::store([
    'name' => 'user.created',
    'description' => 'Send welcome email when user registers',
    'event' => App\Events\UserCreated::class,
    'listener' => App\Listeners\SendWelcomeEmail::class,
    'priority' => 10,
    'status' => true,
]);
```

**Available Fields:**

- `name` (string, required): Unique name identifier for the event binding
- `description` (string, nullable): Optional description
- `event` (string, required): Fully qualified event class name
- `listener` (string, required): Fully qualified listener class name
- `priority` (int, nullable): Execution priority (default: 0)
- `status` (bool): Active status (default: true)

**Minimal Example:**

```php
$response = EventSystem::store([
    'name' => 'order.completed',
    'event' => App\Events\OrderCompleted::class,
    'listener' => App\Listeners\SendOrderConfirmation::class,
]);
```

### Query

Build a query builder instance with filtering, sorting, and selected fields.

```php
$query = EventSystem::query(['status' => true])
    ->where('priority', '>', 5)
    ->orderBy('priority', 'desc');

$events = $query->get();
```

**Available Filters:**

All fields can be filtered: `id`, `name`, `description`, `event`, `listener`, `priority`, `status`, `created_at`, `updated_at`

**Example:**

```php
// Filter by status
$activeEvents = EventSystem::query(['status' => true])->get();

// Filter by event class
$userEvents = EventSystem::query(['event' => App\Events\UserCreated::class])->get();

// Complex filtering
$events = EventSystem::query()
    ->where('status', true)
    ->where('priority', '>', 5)
    ->orderBy('priority', 'desc')
    ->get();
```

### All

Return all event system records without pagination.

```php
$events = EventSystem::all();

// With filters
$activeEvents = EventSystem::all(['status' => true]);
```

### Paginate

Return a paginated collection of event system records.

```php
$events = EventSystem::paginate();

// With filters and custom page limit
$events = EventSystem::paginate(['status' => true], 20);
```

**Returns:** `LengthAwarePaginator`

### Delete

Delete an event system record by its unique name.

```php
$response = EventSystem::delete('user.created');
```

**Events Fired:**
- `EventSystemDeletingEvent` - Before deletion
- `EventSystemDeletedEvent` - After deletion

### Toggle Status

Toggle the boolean 'status' field of a given event system record.

```php
$response = EventSystem::toggleStatus($eventId);
```

**Example:**

```php
// Disable an event
$response = EventSystem::toggleStatus($eventId);

// Re-enable it later
$response = EventSystem::toggleStatus($eventId);
```

## Response Format

All methods return a `Response` object with the following structure:

```php
Response::make(
    bool $success,
    string $message,
    mixed $data = null,
    int $code = 200
)
```

**Example Response:**

```php
[
    'success' => true,
    'message' => 'Event system entry created successfully',
    'data' => [
        'id' => 1,
        'name' => 'user.created',
        'description' => 'Send welcome email',
        'event' => 'App\\Events\\UserCreated',
        'listener' => 'App\\Listeners\\SendWelcomeEmail',
        'priority' => 10,
        'status' => true,
        'created_at' => '2024-01-01 12:00:00',
        'updated_at' => '2024-01-01 12:00:00',
    ],
    'code' => 201
]
```

## Events

The service fires the following events:

### EventSystemStoredEvent

Fired after successfully storing a new event system entry.

**Payload:**
- `$event` (Event): The created event model
- `$data` (array): The validated input data

### EventSystemDeletingEvent

Fired before deleting an event system entry.

**Payload:**
- `$event` (Event): The event model being deleted

### EventSystemDeletedEvent

Fired after successfully deleting an event system entry.

**Payload:**
- `$event` (Event): The deleted event model

## Cache Management

The service automatically clears the cache after create, update, and delete operations:

```php
cache()->forget('events');
```

## Complete Examples

### Register Multiple Events

```php
use JobMetric\EventSystem\Facades\EventSystem;

$events = [
    [
        'name' => 'user.created',
        'description' => 'Send welcome email',
        'event' => App\Events\UserCreated::class,
        'listener' => App\Listeners\SendWelcomeEmail::class,
        'priority' => 10,
    ],
    [
        'name' => 'order.completed',
        'description' => 'Send order confirmation',
        'event' => App\Events\OrderCompleted::class,
        'listener' => App\Listeners\SendOrderConfirmation::class,
        'priority' => 5,
    ],
];

foreach ($events as $eventData) {
    $response = EventSystem::store($eventData);
    
    if (!$response->isSuccess()) {
        Log::error('Failed to register event', [
            'event' => $eventData['name'],
            'errors' => $response->getErrors(),
        ]);
    }
}
```

### Admin Interface

```php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use JobMetric\EventSystem\Facades\EventSystem;
use Illuminate\Http\Request;

class EventSystemController extends Controller
{
    public function index(Request $request)
    {
        $events = EventSystem::paginate(
            filter: $request->only(['status', 'event', 'listener']),
            page_limit: $request->get('per_page', 15)
        );

        return view('admin.events.index', compact('events'));
    }

    public function store(Request $request)
    {
        $response = EventSystem::store($request->all());
        
        if ($response->isSuccess()) {
            return redirect()->route('admin.events.index')
                ->with('success', $response->getMessage());
        }

        return back()->withErrors($response->getErrors());
    }

    public function toggleStatus(int $id)
    {
        $response = EventSystem::toggleStatus($id);

        return response()->json($response->toArray());
    }

    public function destroy(string $name)
    {
        $response = EventSystem::delete($name);

        if ($response->isSuccess()) {
            return redirect()->route('admin.events.index')
                ->with('success', $response->getMessage());
        }

        return back()->withErrors($response->getErrors());
    }
}
```

### Plugin System

```php
class EmailPlugin
{
    public function install(): void
    {
        EventSystem::store([
            'name' => 'plugin.email.user.created',
            'event' => App\Events\UserCreated::class,
            'listener' => EmailPlugin\Listeners\SendWelcomeEmail::class,
            'priority' => 10,
            'status' => true,
        ]);
    }

    public function uninstall(): void
    {
        EventSystem::delete('plugin.email.user.created');
    }
}
```

## Related Documentation

- [DomainEvent](/packages/laravel-event-system/deep-diving/domain-event) - Domain event contract
- [EventBus](/packages/laravel-event-system/deep-diving/support/event-bus) - Event bus for dispatching events
- [EventRegistry](/packages/laravel-event-system/deep-diving/support/event-registry) - Registry for managing domain events
- <Link to="/packages/laravel-event-system/deep-diving/store-event-system-request">StoreEventSystemRequest</Link> - Form request for validation
- <Link to="/packages/laravel-event-system/deep-diving/event-system-resource">EventSystemResource</Link> - JSON resource for API responses
