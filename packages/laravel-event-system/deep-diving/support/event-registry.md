---
sidebar_position: 7
sidebar_label: EventRegistry
---

# EventRegistry

The `EventRegistry` is responsible for managing domain events and their metadata definitions. It keeps a mapping between stable event keys and their corresponding event classes, as well as full `DomainEventDefinition` instances for use in UI, automation, and logging.

## When to Use EventRegistry

**Use `EventRegistry` when you need:**

- **Event registration**: Register domain events for key-based lookup
- **Key resolution**: Resolve event keys to their corresponding classes
- **Metadata lookup**: Get rich metadata (title, description, icon, tags) for events
- **Event listing**: Get all registered events for UI/automation
- **Key lookup**: Find the stable key for an event class or instance
- **Event validation**: Check if an event is registered

**Example scenarios:**
- Registering domain events in service providers
- Building event selection UIs
- Event logging and audit systems
- Workflow automation builders
- Rule engine configuration
- API documentation generation

## Overview

`EventRegistry` maintains two internal mappings:

- **Class Map**: Maps stable keys to event class names
- **Definition Map**: Maps stable keys to `DomainEventDefinition` instances

## Namespace

```php
JobMetric\EventSystem\Support\EventRegistry
```

## Quick Start

Inject the registry or resolve it from the container:

```php
use JobMetric\EventSystem\Support\EventRegistry;
use App\Events\UserRegistered;

$registry = app(EventRegistry::class);

// Register an event
$registry->register(UserRegistered::class);

// Check if event exists
if ($registry->has('user.registered')) {
    // Event is registered
}

// Get event class by key
$eventClass = $registry->forKey('user.registered');

// Get metadata definition
$definition = $registry->definitionForKey('user.registered');

// Get all definitions
$allDefinitions = $registry->allDefinitions();
```

## Available Methods

### `register(string $eventClass): void`

Register a domain event with a given key and event class.

**Parameters:**
- `$eventClass` (`class-string<DomainEvent>`): The concrete domain event class to register

**Returns:** `void`

**Throws:** `InvalidArgumentException` if the class doesn't implement `DomainEvent`

**Behavior:**
- The key is resolved from the `DomainEvent` implementation via its static `key()` method
- Both the class mapping and the `DomainEventDefinition` are stored
- If the event is already registered, it will be overwritten

**Example:**

```php
use JobMetric\EventSystem\Support\EventRegistry;
use App\Events\UserRegistered;
use App\Events\ProductCreated;

$registry = app(EventRegistry::class);

// Register events
$registry->register(UserRegistered::class);
$registry->register(ProductCreated::class);
```

### `forKey(string $key): ?string`

Get the event class for the given key.

**Parameters:**
- `$key` (string): The stable event key to look up

**Returns:** `` `class-string<DomainEvent>`|null ``

**Example:**

```php
$registry = app(EventRegistry::class);

// Get event class
$eventClass = $registry->forKey('user.registered');
// Returns: 'App\Events\UserRegistered' or null if not found

if ($eventClass) {
    // Event is registered
}
```

### `definitionForKey(string $key): ?DomainEventDefinition`

Get the metadata definition for a given key.

**Parameters:**
- `$key` (string): The stable event key to look up

**Returns:** `DomainEventDefinition|null`

**Example:**

```php
$registry = app(EventRegistry::class);

$definition = $registry->definitionForKey('user.registered');

if ($definition) {
    echo $definition->title;        // Translation key
    echo $definition->description;  // Translation key
    echo $definition->icon;         // Icon class
    echo implode(', ', $definition->tags); // Tags array
}
```

### `allDefinitions(): array`

Get all registered metadata definitions keyed by their event keys.

**Returns:** `` array<string, DomainEventDefinition> ``

**Example:**

```php
$registry = app(EventRegistry::class);

$definitions = $registry->allDefinitions();

foreach ($definitions as $key => $definition) {
    echo "Event: {$key}\n";
    echo "Title: " . trans($definition->title) . "\n";
    echo "Group: " . trans($definition->group) . "\n";
    echo "Tags: " . implode(', ', $definition->tags ?? []) . "\n\n";
}
```

### `has(string $key): bool`

Determine whether an event with the given key is registered.

**Parameters:**
- `$key` (string): The stable event key to check existence for

**Returns:** `bool`

**Example:**

```php
$registry = app(EventRegistry::class);

if ($registry->has('user.registered')) {
    // Event is registered
}
```

### `keyFor(object|string $event): ?string`

Get the stable key for the given event instance or event class.

**Parameters:**
- `$event` (object|string): The event instance or event class name to resolve a key for

**Returns:** `string|null`

**Example:**

```php
$registry = app(EventRegistry::class);

// From instance
$event = new UserRegistered(123, 'user@example.com', 'John');
$key = $registry->keyFor($event);
// Returns: 'user.registered'

// From class name
$key = $registry->keyFor(UserRegistered::class);
// Returns: 'user.registered'
```

## Complete Example

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use JobMetric\EventSystem\Support\EventRegistry;
use App\Events\UserRegistered;
use App\Events\UserUpdated;
use App\Events\ProductCreated;
use App\Events\ProductUpdated;
use App\Events\OrderCompleted;

class EventSystemServiceProvider extends ServiceProvider
{
    public function boot(EventRegistry $registry): void
    {
        // Register user events
        $registry->register(UserRegistered::class);
        $registry->register(UserUpdated::class);

        // Register product events
        $registry->register(ProductCreated::class);
        $registry->register(ProductUpdated::class);

        // Register order events
        $registry->register(OrderCompleted::class);
    }
}
```

## Use Cases

### Event Selection UI

```php
class EventSelectorComponent
{
    public function getAvailableEvents(): array
    {
        $registry = app(EventRegistry::class);
        $definitions = $registry->allDefinitions();

        return collect($definitions)
            ->map(function ($definition, $key) {
                return [
                    'key' => $key,
                    'title' => trans($definition->title),
                    'description' => trans($definition->description),
                    'icon' => $definition->icon,
                    'tags' => $definition->tags ?? [],
                    'group' => trans($definition->group),
                ];
            })
            ->groupBy('group')
            ->toArray();
    }
}
```

### Event Logging

```php
class EventLogger
{
    public function logEvent(object $event): void
    {
        $registry = app(EventRegistry::class);
        $key = $registry->keyFor($event);

        if ($key) {
            $definition = $registry->definitionForKey($key);

            Log::info('Domain event fired', [
                'key' => $key,
                'title' => trans($definition->title),
                'description' => trans($definition->description),
                'tags' => $definition->tags,
            ]);
        }
    }
}
```

### API Documentation

```php
class EventDocumentationController extends Controller
{
    public function index()
    {
        $registry = app(EventRegistry::class);
        $definitions = $registry->allDefinitions();

        $events = collect($definitions)->map(function ($definition, $key) {
            return [
                'key' => $key,
                'class' => $registry->forKey($key),
                'title' => trans($definition->title),
                'description' => trans($definition->description),
                'icon' => $definition->icon,
                'tags' => $definition->tags ?? [],
                'group' => trans($definition->group),
            ];
        })->values();

        return response()->json($events);
    }
}
```

## Best Practices

1. **Register in Service Providers**: Register all domain events in service providers during boot
2. **Check Before Use**: Always check if an event exists before using it
3. **Use Keys Consistently**: Use the same key format across your application
4. **Provide Rich Metadata**: Include complete metadata for UI/automation
5. **Group Related Events**: Use consistent group names for related events

## Related Documentation

- [DomainEvent](/packages/laravel-event-system/deep-diving/domain-event) - Domain event contract
- [DomainEventDefinition](/packages/laravel-event-system/deep-diving/support/domain-event-definition) - Metadata definition class
- [EventBus](/packages/laravel-event-system/deep-diving/support/event-bus) - Event bus for dispatching events

