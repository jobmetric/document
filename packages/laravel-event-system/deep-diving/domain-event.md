---
sidebar_position: 2
sidebar_label: DomainEvent
---

# DomainEvent Contract

The `DomainEvent` contract is the foundation for implementing domain events in Laravel Event System. It provides a standardized interface for events with stable keys and rich metadata, enabling event-driven architecture with consistent structure across your application.

## When to Use DomainEvent

**Use `DomainEvent` when you need:**

- **Stable event keys**: Use string keys instead of hard-coded class names
- **Rich metadata**: Include title, description, icon, and tags for UI/automation
- **Event registry**: Register events for lookup by key
- **Domain-driven design**: Implement DDD patterns with domain events
- **Decoupled architecture**: Dispatch events without knowing concrete classes
- **UI integration**: Build event selection interfaces with metadata

**Example scenarios:**
- Domain events in a domain-driven design architecture
- Event-driven microservices communication
- Workflow automation systems
- Rule engines that trigger on events
- Admin panels for event configuration
- Event logging and audit systems

## Overview

`DomainEvent` is a contract that defines the structure for domain events:

- **Stable Key**: Each event has a unique, stable string key (e.g., `'user.registered'`)
- **Metadata Definition**: Rich metadata including title, description, icon, and tags
- **Consistent Structure**: All domain events follow the same pattern
- **Registry Support**: Events can be registered in the `EventRegistry` for key-based lookup

## Namespace

```php
JobMetric\EventSystem\Contracts\DomainEvent
```

## Interface Definition

```php
interface DomainEvent
{
    public static function key(): string;
    public static function definition(): DomainEventDefinition;
}
```

## Quick Start

Implement the contract in your event class:

```php
use JobMetric\EventSystem\Contracts\DomainEvent;
use JobMetric\EventSystem\Support\DomainEventDefinition;

class UserRegistered implements DomainEvent
{
    public function __construct(
        public int $userId,
        public string $email,
        public string $name
    ) {}

    public static function key(): string
    {
        return 'user.registered';
    }

    public static function definition(): DomainEventDefinition
    {
        return new DomainEventDefinition(
            self::key(),
            'user::events.group',
            'user::events.registered.title',
            'user::events.registered.description',
            'fas fa-user-plus',
            ['user', 'registration', 'authentication']
        );
    }
}
```

## Required Methods

### `key(): string`

Returns the stable technical key for the domain event.

**Returns:** `string`

**Example:**

```php
public static function key(): string
{
    return 'product.created';
}
```

**Best Practices:**
- Use dot notation: `'entity.action'` (e.g., `'user.registered'`, `'order.completed'`)
- Keep keys stable - don't change them after initial release
- Use lowercase with dots as separators
- Make keys descriptive and unique

### `definition(): DomainEventDefinition`

Returns the full metadata definition for this domain event.

**Returns:** `DomainEventDefinition`

**Example:**

```php
public static function definition(): DomainEventDefinition
{
    return new DomainEventDefinition(
        self::key(),                                    // key
        'product::events.group',                       // group (translation key)
        'product::events.created.title',               // title (translation key)
        'product::events.created.description',         // description (translation key)
        'fas fa-box',                                   // icon (Font Awesome class)
        ['product', 'inventory', 'catalog']            // tags
    );
}
```

## DomainEventDefinition Parameters

### `key` (string)

The stable event key (should match `key()` return value).

### `group` (string)

Translation key for the event group/category. Used for grouping events in UI.

**Example:** `'product::events.group'`

### `title` (string)

Translation key for the event title. Human-readable name for the event.

**Example:** `'product::events.created.title'`

### `description` (string, nullable)

Translation key for the event description. Detailed explanation of what the event represents.

**Example:** `'product::events.created.description'`

### `icon` (string, nullable)

Icon class (e.g., Font Awesome). Used for visual representation in UI.

**Example:** `'fas fa-box'`, `'fas fa-user-plus'`

### `tags` (array, nullable)

Array of tags for categorization and filtering.

**Example:** `['product', 'inventory', 'catalog']`

## Complete Example

```php
namespace App\Events;

use JobMetric\EventSystem\Contracts\DomainEvent;
use JobMetric\EventSystem\Support\DomainEventDefinition;

class ProductCreated implements DomainEvent
{
    public function __construct(
        public int $productId,
        public string $name,
        public float $price,
        public int $categoryId
    ) {}

    public static function key(): string
    {
        return 'product.created';
    }

    public static function definition(): DomainEventDefinition
    {
        return new DomainEventDefinition(
            self::key(),
            'product::events.group',
            'product::events.created.title',
            'product::events.created.description',
            'fas fa-box',
            ['product', 'inventory', 'catalog']
        );
    }
}

class ProductUpdated implements DomainEvent
{
    public function __construct(
        public int $productId,
        public array $changes
    ) {}

    public static function key(): string
    {
        return 'product.updated';
    }

    public static function definition(): DomainEventDefinition
    {
        return new DomainEventDefinition(
            self::key(),
            'product::events.group',
            'product::events.updated.title',
            'product::events.updated.description',
            'fas fa-edit',
            ['product', 'inventory']
        );
    }
}

class OrderCompleted implements DomainEvent
{
    public function __construct(
        public int $orderId,
        public float $total,
        public int $userId
    ) {}

    public static function key(): string
    {
        return 'order.completed';
    }

    public static function definition(): DomainEventDefinition
    {
        return new DomainEventDefinition(
            self::key(),
            'order::events.group',
            'order::events.completed.title',
            'order::events.completed.description',
            'fas fa-check-circle',
            ['order', 'payment', 'fulfillment']
        );
    }
}
```

## Registering Domain Events

Register domain events in a service provider:

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use JobMetric\EventSystem\Support\EventRegistry;
use App\Events\ProductCreated;
use App\Events\ProductUpdated;
use App\Events\OrderCompleted;

class EventSystemServiceProvider extends ServiceProvider
{
    public function boot(EventRegistry $registry): void
    {
        $registry->register(ProductCreated::class);
        $registry->register(ProductUpdated::class);
        $registry->register(OrderCompleted::class);
    }
}
```

## Dispatching Domain Events

### By Key

```php
use JobMetric\EventSystem\Facades\EventBus;

// Dispatch by stable key
EventBus::dispatchByKey('product.created', $productId, $name, $price, $categoryId);

// Or use helper function
eventKey('product.created', $productId, $name, $price, $categoryId);
```

### By Instance

```php
use App\Events\ProductCreated;

// Dispatch concrete event instance
$event = new ProductCreated($productId, $name, $price, $categoryId);
EventBus::dispatch($event);

// Or use Laravel's event helper
event(new ProductCreated($productId, $name, $price, $categoryId));
```

## Use Cases

### Workflow Automation

```php
class WorkflowRule
{
    public function whenProductCreated(): void
    {
        // Listen for product.created event
        Event::listen(function (ProductCreated $event) {
            // Trigger workflow
            $this->triggerWorkflow('product-approval', $event->productId);
        });
    }
}
```

### Event Logging

```php
class EventLogger
{
    public function logDomainEvent(DomainEvent $event): void
    {
        $registry = app(EventRegistry::class);
        $key = $registry->keyFor($event);
        $definition = $registry->definitionForKey($key);

        Log::info('Domain event fired', [
            'key' => $key,
            'title' => trans($definition->title),
            'tags' => $definition->tags,
        ]);
    }
}
```

### UI Event Selector

```php
class EventSelectorComponent
{
    public function getAvailableEvents(): array
    {
        $registry = app(EventRegistry::class);
        $definitions = $registry->allDefinitions();

        return collect($definitions)->map(function ($definition, $key) {
            return [
                'key' => $key,
                'title' => trans($definition->title),
                'description' => trans($definition->description),
                'icon' => $definition->icon,
                'tags' => $definition->tags,
                'group' => trans($definition->group),
            ];
        })->toArray();
    }
}
```

## Best Practices

1. **Stable Keys**: Never change event keys after initial release
2. **Descriptive Names**: Use clear, descriptive key names
3. **Consistent Structure**: Follow the same pattern for all domain events
4. **Rich Metadata**: Provide complete metadata for UI/automation
5. **Translation Keys**: Use translation keys for all user-facing text
6. **Tagging**: Use tags for categorization and filtering
7. **Icon Consistency**: Use consistent icon sets (e.g., Font Awesome)

## Related Documentation

- [DomainEventDefinition](/packages/laravel-event-system/deep-diving/support/domain-event-definition) - Metadata definition class
- [EventBus](/packages/laravel-event-system/deep-diving/support/event-bus) - Event bus for dispatching events
- [EventRegistry](/packages/laravel-event-system/deep-diving/support/event-registry) - Registry for managing domain events
- [EventSystem](/packages/laravel-event-system/deep-diving/event-system) - Service for managing event-listener bindings

