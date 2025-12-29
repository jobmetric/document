---
sidebar_position: 6
sidebar_label: EventBus
---

# EventBus

The `EventBus` is a central event dispatcher responsible for dispatching domain events either by class instance or by a stable registry key. It decouples callers from concrete event classes, enabling you to dispatch events using stable keys instead of hard-coding class names.

## When to Use EventBus

**Use `EventBus` when you need:**

- **Key-based dispatching**: Dispatch events using stable keys instead of class names
- **Decoupled architecture**: Avoid hard-coding event class names in your code
- **Dynamic event handling**: Dispatch events whose classes may not be known at compile time
- **Event registry integration**: Leverage the event registry for key-to-class resolution
- **Consistent event dispatching**: Use a single interface for all event dispatching

**Example scenarios:**
- Dispatching events from configuration files
- Plugin systems that dispatch events by key
- Workflow engines that trigger events dynamically
- Rule engines that fire events based on conditions
- API endpoints that dispatch events based on request data

## Overview

`EventBus` provides two methods for dispatching events:

- **By Key**: Dispatch events using stable keys (resolved via `EventRegistry`)
- **By Instance**: Dispatch concrete event instances directly

## Namespace

```php
JobMetric\EventSystem\Support\EventBus
```

## Quick Start

Use the facade or inject the service:

```php
use JobMetric\EventSystem\Facades\EventBus;

// Dispatch by stable key
EventBus::dispatchByKey('user.registered', $userId, $email, $name);

// Dispatch concrete event instance
$event = new UserRegistered($userId, $email, $name);
EventBus::dispatch($event);
```

## Available Methods

### `dispatchByKey(string $key, mixed ...$payload): void`

Dispatches a domain event by its stable key using the registry to resolve the event class, constructing a new event instance from the provided payload.

**Parameters:**
- `$key` (string): The stable event key used to look up the event class in the registry
- `...$payload` (mixed): The payload passed as constructor arguments to the event class

**Returns:** `void`

**Behavior:**
- If the key is not registered in the registry, the call is silently ignored
- The event class is resolved from the registry
- A new event instance is created with the provided payload
- The event is dispatched using Laravel's event dispatcher

**Example:**

```php
use JobMetric\EventSystem\Facades\EventBus;

// Register the event first
$registry = app(\JobMetric\EventSystem\Support\EventRegistry::class);
$registry->register(UserRegistered::class);

// Dispatch by key
EventBus::dispatchByKey('user.registered', 123, 'user@example.com', 'John Doe');

// With multiple payload arguments
EventBus::dispatchByKey('product.created', $productId, $name, $price, $categoryId);
```

### `dispatch(object $event): void`

Dispatches a concrete domain event instance using the underlying Laravel dispatcher, allowing callers to work directly with event objects when the class is known.

**Parameters:**
- `$event` (object): The event instance to be dispatched

**Returns:** `void`

**Example:**

```php
use JobMetric\EventSystem\Facades\EventBus;
use App\Events\UserRegistered;

// Create and dispatch event instance
$event = new UserRegistered(123, 'user@example.com', 'John Doe');
EventBus::dispatch($event);

// Or use Laravel's event helper
event($event);
```

## Helper Function

The package provides a helper function for key-based dispatching:

```php
eventKey(string $key, mixed ...$payload): void
```

**Example:**

```php
// Instead of
EventBus::dispatchByKey('user.registered', $userId, $email, $name);

// You can use
eventKey('user.registered', $userId, $email, $name);
```

## Complete Example

```php
namespace App\Services;

use JobMetric\EventSystem\Facades\EventBus;
use JobMetric\EventSystem\Support\EventRegistry;
use App\Events\UserRegistered;
use App\Events\OrderCompleted;

class UserService
{
    public function __construct(
        private EventRegistry $registry
    ) {}

    public function registerUser(array $data): User
    {
        $user = User::create($data);

        // Register event if not already registered
        if (!$this->registry->has('user.registered')) {
            $this->registry->register(UserRegistered::class);
        }

        // Dispatch by key
        EventBus::dispatchByKey('user.registered', $user->id, $user->email, $user->name);

        return $user;
    }

    public function completeOrder(Order $order): void
    {
        $order->update(['status' => 'completed']);

        // Dispatch by instance
        $event = new OrderCompleted($order->id, $order->total, $order->user_id);
        EventBus::dispatch($event);
    }
}
```

## Use Cases

### Configuration-Based Event Dispatching

```php
class WorkflowEngine
{
    public function triggerEvent(string $eventKey, array $data): void
    {
        // Dispatch event based on configuration
        EventBus::dispatchByKey($eventKey, ...$data);
    }
}
```

### Plugin System

```php
class PluginManager
{
    public function firePluginEvent(string $pluginName, string $eventKey, ...$payload): void
    {
        $fullKey = "plugin.{$pluginName}.{$eventKey}";
        
        // Dispatch if registered
        if (app(EventRegistry::class)->has($fullKey)) {
            EventBus::dispatchByKey($fullKey, ...$payload);
        }
    }
}
```

### API Endpoint

```php
class EventController extends Controller
{
    public function dispatch(Request $request)
    {
        $key = $request->input('event_key');
        $payload = $request->input('payload', []);

        // Validate event exists
        $registry = app(EventRegistry::class);
        if (!$registry->has($key)) {
            return response()->json(['error' => 'Event not found'], 404);
        }

        // Dispatch event
        EventBus::dispatchByKey($key, ...$payload);

        return response()->json(['success' => true]);
    }
}
```

## Best Practices

1. **Register Events First**: Always register events in the registry before dispatching by key
2. **Use Keys for Dynamic Events**: Use key-based dispatching when event classes are determined at runtime
3. **Use Instances for Known Events**: Use instance-based dispatching when you know the event class
4. **Error Handling**: Check if event exists before dispatching by key
5. **Payload Structure**: Ensure payload matches event constructor parameters

## Related Documentation

- [EventRegistry](/packages/laravel-event-system/deep-diving/support/event-registry) - Registry for managing domain events
- [DomainEvent](/packages/laravel-event-system/deep-diving/domain-event) - Domain event contract
- [EventSystem](/packages/laravel-event-system/deep-diving/event-system) - Service for managing event-listener bindings

