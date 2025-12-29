---
sidebar_position: 8
sidebar_label: DomainEventDefinition
---

# DomainEventDefinition

The `DomainEventDefinition` is an immutable definition object that holds metadata for a domain event, including technical key and UI-oriented presentation details. It provides rich information for building user interfaces, documentation, automation systems, and event logging.

## When to Use DomainEventDefinition

**Use `DomainEventDefinition` when you need:**

- **Event metadata**: Store rich metadata for domain events
- **UI building**: Build event selection interfaces with titles, descriptions, and icons
- **Documentation**: Generate API documentation for events
- **Automation**: Create rule builders and workflow automation systems
- **Logging**: Include human-readable information in event logs
- **Categorization**: Group and filter events using tags

**Example scenarios:**
- Building admin panels for event configuration
- Creating event selection dropdowns in UI
- Generating API documentation
- Building workflow automation interfaces
- Event logging and audit systems
- Event filtering and search

## Overview

`DomainEventDefinition` is a readonly class that encapsulates:

- **Technical Key**: Stable identifier for the event
- **Group**: Category/group for organizing events
- **Title**: Human-readable title
- **Description**: Detailed description
- **Icon**: Visual representation (e.g., Font Awesome class)
- **Tags**: Array of tags for categorization

## Namespace

```php
JobMetric\EventSystem\Support\DomainEventDefinition
```

## Quick Start

Create a definition in your domain event:

```php
use JobMetric\EventSystem\Contracts\DomainEvent;
use JobMetric\EventSystem\Support\DomainEventDefinition;

class UserRegistered implements DomainEvent
{
    public static function definition(): DomainEventDefinition
    {
        return new DomainEventDefinition(
            self::key(),                                    // key
            'user::events.group',                          // group
            'user::events.registered.title',              // title
            'user::events.registered.description',        // description
            'fas fa-user-plus',                            // icon
            ['user', 'registration', 'authentication']    // tags
        );
    }
}
```

## Properties

### `key` (string)

The stable technical key for the domain event. Should match the key returned by `DomainEvent::key()`.

**Example:** `'user.registered'`

### `group` (string)

Translation key for the event group/category. Used for grouping events in UI.

**Example:** `'user::events.group'`

**Translation File:**

```php
// lang/en/user.php
return [
    'events' => [
        'group' => 'User Events',
    ],
];
```

### `title` (string)

Translation key for the event title. Human-readable name for the event.

**Example:** `'user::events.registered.title'`

**Translation File:**

```php
// lang/en/user.php
return [
    'events' => [
        'registered' => [
            'title' => 'User Registered',
        ],
    ],
];
```

### `description` (string, nullable)

Translation key for the event description. Detailed explanation of what the event represents.

**Example:** `'user::events.registered.description'`

**Translation File:**

```php
// lang/en/user.php
return [
    'events' => [
        'registered' => [
            'description' => 'Fired when a new user registers in the system.',
        ],
    ],
];
```

### `icon` (string, nullable)

Icon class for visual representation. Typically a Font Awesome class.

**Example:** `'fas fa-user-plus'`, `'fas fa-box'`, `'fas fa-check-circle'`

**Common Icons:**
- `'fas fa-user-plus'` - User registration
- `'fas fa-box'` - Product events
- `'fas fa-shopping-cart'` - Order events
- `'fas fa-edit'` - Update events
- `'fas fa-trash'` - Delete events
- `'fas fa-check-circle'` - Completion events

### `tags` (array, nullable)

Array of tags for categorization and filtering.

**Example:** `['user', 'registration', 'authentication']`

**Common Tag Categories:**
- Entity types: `['user', 'product', 'order']`
- Actions: `['created', 'updated', 'deleted']`
- Features: `['authentication', 'payment', 'inventory']`
- Systems: `['email', 'sms', 'analytics']`

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
        public float $price
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

class OrderCompleted implements DomainEvent
{
    public function __construct(
        public int $orderId,
        public float $total
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

## Using Definitions

### In UI Components

```php
class EventSelectorComponent
{
    public function render(): string
    {
        $registry = app(\JobMetric\EventSystem\Support\EventRegistry::class);
        $definitions = $registry->allDefinitions();

        $html = '<select name="event">';
        
        foreach ($definitions as $key => $definition) {
            $title = trans($definition->title);
            $html .= "<option value=\"{$key}\" data-icon=\"{$definition->icon}\">{$title}</option>";
        }
        
        $html .= '</select>';
        
        return $html;
    }
}
```

### In API Responses

```php
class EventController extends Controller
{
    public function index()
    {
        $registry = app(\JobMetric\EventSystem\Support\EventRegistry::class);
        $definitions = $registry->allDefinitions();

        $events = collect($definitions)->map(function ($definition, $key) {
            return [
                'key' => $key,
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

### In Logging

```php
class EventLogger
{
    public function log(DomainEvent $event): void
    {
        $registry = app(\JobMetric\EventSystem\Support\EventRegistry::class);
        $key = $registry->keyFor($event);
        $definition = $registry->definitionForKey($key);

        Log::info('Domain event', [
            'key' => $key,
            'title' => trans($definition->title),
            'description' => trans($definition->description),
            'tags' => $definition->tags,
            'group' => trans($definition->group),
        ]);
    }
}
```

## Best Practices

1. **Use Translation Keys**: Always use translation keys for user-facing text
2. **Consistent Icons**: Use a consistent icon set (e.g., Font Awesome)
3. **Meaningful Tags**: Use descriptive tags for categorization
4. **Complete Metadata**: Provide all metadata fields for better UI/automation
5. **Group Organization**: Use consistent group names for related events

## Related Documentation

- [DomainEvent](/packages/laravel-event-system/deep-diving/domain-event) - Domain event contract
- [EventRegistry](/packages/laravel-event-system/deep-diving/support/event-registry) - Registry for managing domain events

