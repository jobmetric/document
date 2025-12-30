---
sidebar_position: 5
sidebar_label: Events
---

import Link from "@docusaurus/Link";

# Events

Laravel Event System provides a comprehensive event system that fires domain events for all CRUD operations on event-listener bindings. These events allow you to hook into the event system lifecycle and perform additional actions when bindings are created or deleted.

## Overview

The event system in Laravel Event System:

- **Fires automatically** during CRUD operations
- **Provides model instances** in event payloads
- **Uses DomainEvent interface** for consistency
- **Supports event listeners** for custom logic
- **Enables event-driven architecture** for event binding management

## Event Structure

All events in Laravel Event System:

- Implement `JobMetric\EventSystem\Contracts\DomainEvent`
- Are `readonly` classes for immutability
- Contain the affected Event model instance
- Provide a stable `key()` method
- Include metadata via `definition()` method

### Base Event Structure

```php
readonly class EventSystemStoredEvent implements DomainEvent
{
    public function __construct(
        public Event $event,
        public array $data
    ) {}

    public static function key(): string
    {
        return 'event_system.stored';
    }

    public static function definition(): DomainEventDefinition
    {
        return new DomainEventDefinition(
            self::key(),
            'event-system::base.events.event_system_stored.group',
            'event-system::base.events.event_system_stored.title',
            'event-system::base.events.event_system_stored.description',
            'fas fa-save',
            ['event system', 'storage', 'management']
        );
    }
}
```

## Available Events

### Event System Events

Events fired for Event System CRUD operations.

| Event Class | Event Key | Description | Payload | Triggered When |
|------------|-----------|-------------|---------|----------------|
| `EventSystemStoredEvent` | `event_system.stored` | Fired when a new event-listener binding is created | `Event $event, array $data` | `EventSystem::store()` |
| `EventSystemDeletingEvent` | `event_system.deleting` | Fired before an event-listener binding is deleted | `Event $event` | Before `EventSystem::delete()` |
| `EventSystemDeletedEvent` | `event_system.deleted` | Fired after an event-listener binding is deleted | `Event $event` | After `EventSystem::delete()` |

**Namespace:** `JobMetric\EventSystem\Events\*`

## Listening to Events

### Method 1: Event Listeners in Service Provider

Register event listeners in a service provider:

```php
namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\EventSystem\Events\EventSystemStoredEvent;
use JobMetric\EventSystem\Events\EventSystemDeletedEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        EventSystemStoredEvent::class => [
            \App\Listeners\EventSystem\LogEventSystemStored::class,
            \App\Listeners\EventSystem\InvalidateEventSystemCache::class,
            \App\Listeners\EventSystem\NotifyEventSystemStored::class,
        ],
        EventSystemDeletedEvent::class => [
            \App\Listeners\EventSystem\LogEventSystemDeleted::class,
            \App\Listeners\EventSystem\InvalidateEventSystemCache::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
```

### Method 2: Using Event Facade

Listen to events using the Event facade:

```php
use Illuminate\Support\Facades\Event;
use JobMetric\EventSystem\Events\EventSystemStoredEvent;

Event::listen(EventSystemStoredEvent::class, function (EventSystemStoredEvent $event) {
    $eventModel = $event->event;
    $data = $event->data;
    
    // Perform actions
    Log::info('Event system entry created', [
        'name' => $eventModel->name,
        'event' => $eventModel->event,
        'listener' => $eventModel->listener,
        'priority' => $eventModel->priority,
    ]);
    
    Cache::forget('events');
});
```

### Method 3: Using Event Subscribers

Create event subscribers for multiple events:

```php
namespace App\Listeners;

use Illuminate\Events\Dispatcher;
use JobMetric\EventSystem\Events\EventSystemStoredEvent;
use JobMetric\EventSystem\Events\EventSystemDeletedEvent;

class EventSystemEventSubscriber
{
    public function handleEventSystemStored(EventSystemStoredEvent $event): void
    {
        $eventModel = $event->event;
        
        Log::info('Event system entry created', [
            'name' => $eventModel->name,
            'event' => $eventModel->event,
            'listener' => $eventModel->listener,
        ]);
    }

    public function handleEventSystemDeleted(EventSystemDeletedEvent $event): void
    {
        $eventModel = $event->event;
        
        Log::warning('Event system entry deleted', [
            'name' => $eventModel->name,
            'id' => $eventModel->id,
        ]);
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            EventSystemStoredEvent::class,
            [EventSystemEventSubscriber::class, 'handleEventSystemStored']
        );

        $events->listen(
            EventSystemDeletedEvent::class,
            [EventSystemEventSubscriber::class, 'handleEventSystemDeleted']
        );
    }
}
```

Register the subscriber:

```php
namespace App\Providers;

use App\Listeners\EventSystemEventSubscriber;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $subscribe = [
        EventSystemEventSubscriber::class,
    ];
}
```

## Complete Examples

### Example 1: Cache Invalidation on Event System Changes

Invalidate cache when event bindings are modified:

```php
namespace App\Listeners\EventSystem;

use Illuminate\Support\Facades\Cache;
use JobMetric\EventSystem\Events\EventSystemStoredEvent;
use JobMetric\EventSystem\Events\EventSystemDeletedEvent;

class InvalidateEventSystemCache
{
    public function handle(EventSystemStoredEvent|EventSystemDeletedEvent $event): void
    {
        $eventModel = $event->event;

        // Invalidate specific event cache
        Cache::forget("event_system_{$eventModel->id}");
        Cache::forget("event_system_name_{$eventModel->name}");
        
        // Invalidate all events cache
        Cache::forget('events');
        Cache::forget('event_system_all');

        // Clear tagged cache
        Cache::tags(['event_system'])->flush();
    }
}
```

### Example 2: Audit Logging

Log all event system operations for audit trail:

```php
namespace App\Listeners\EventSystem;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use JobMetric\EventSystem\Events\EventSystemStoredEvent;
use JobMetric\EventSystem\Events\EventSystemDeletedEvent;

class AuditEventSystemOperations
{
    public function handleEventSystemStored(EventSystemStoredEvent $event): void
    {
        $this->logAudit('stored', $event->event, $event->data);
    }

    public function handleEventSystemDeleted(EventSystemDeletedEvent $event): void
    {
        $this->logAudit('deleted', $event->event);
    }

    protected function logAudit(string $action, $eventModel, ?array $data = null): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => "event_system.{$action}",
            'model_type' => get_class($eventModel),
            'model_id' => $eventModel->id,
            'data' => [
                'name' => $eventModel->name,
                'event' => $eventModel->event,
                'listener' => $eventModel->listener,
                'priority' => $eventModel->priority,
                'status' => $eventModel->status,
                'input_data' => $data,
            ],
            'ip_address' => request()->ip(),
        ]);
    }
}
```

### Example 3: Notification System

Send notifications when critical event bindings are registered:

```php
namespace App\Listeners\EventSystem;

use App\Notifications\CriticalEventBindingRegistered;
use Illuminate\Support\Facades\Notification;
use JobMetric\EventSystem\Events\EventSystemStoredEvent;

class NotifyEventSystemChanges
{
    protected array $criticalEvents = ['user.created', 'order.completed', 'payment.processed'];

    public function handle(EventSystemStoredEvent $event): void
    {
        $eventModel = $event->event;

        // Notify for critical events
        if (in_array($eventModel->name, $this->criticalEvents)) {
            $admins = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })->get();

            Notification::send($admins, new CriticalEventBindingRegistered($eventModel));
        }

        // Notify via Slack
        if (config('services.slack.webhook')) {
            Notification::route('slack', config('services.slack.webhook'))
                ->notify(new CriticalEventBindingRegistered($eventModel));
        }
    }
}
```

### Example 4: Analytics Tracking

Track event system changes for analytics:

```php
namespace App\Listeners\EventSystem;

use App\Services\AnalyticsService;
use JobMetric\EventSystem\Events\EventSystemStoredEvent;
use JobMetric\EventSystem\Events\EventSystemDeletedEvent;

class TrackEventSystemAnalytics
{
    public function __construct(
        protected AnalyticsService $analytics
    ) {}

    public function handleEventSystemStored(EventSystemStoredEvent $event): void
    {
        $eventModel = $event->event;
        
        $this->analytics->track('event_system.stored', [
            'event_id' => $eventModel->id,
            'name' => $eventModel->name,
            'event_class' => $eventModel->event,
            'listener_class' => $eventModel->listener,
            'priority' => $eventModel->priority,
            'status' => $eventModel->status,
        ]);
    }

    public function handleEventSystemDeleted(EventSystemDeletedEvent $event): void
    {
        $eventModel = $event->event;
        
        $this->analytics->track('event_system.deleted', [
            'event_id' => $eventModel->id,
            'name' => $eventModel->name,
            'deleted_at' => now(),
        ]);
    }
}
```

### Example 5: Validation and Business Rules

Validate event bindings before deletion:

```php
namespace App\Listeners\EventSystem;

use Illuminate\Validation\ValidationException;
use JobMetric\EventSystem\Events\EventSystemDeletingEvent;

class ValidateEventSystemDeletion
{
    protected array $protectedEvents = ['critical.event.1', 'critical.event.2', 'system.event'];

    public function handle(EventSystemDeletingEvent $event): void
    {
        $eventModel = $event->event;

        // Prevent deletion of protected events
        if (in_array($eventModel->name, $this->protectedEvents)) {
            throw ValidationException::withMessages([
                'event' => 'Cannot delete protected event bindings.',
            ]);
        }

        // Check if event is in use
        if ($this->isEventInUse($eventModel)) {
            throw ValidationException::withMessages([
                'event' => 'Cannot delete event binding that is currently in use.',
            ]);
        }
    }

    protected function isEventInUse($eventModel): bool
    {
        // Check if event is being used in active workflows
        // Implement your business logic here
        return false;
    }
}
```

### Example 6: Synchronization with External Systems

Synchronize event bindings with external systems:

```php
namespace App\Listeners\EventSystem;

use App\Services\ExternalApiService;
use JobMetric\EventSystem\Events\EventSystemStoredEvent;
use JobMetric\EventSystem\Events\EventSystemDeletedEvent;

class SynchronizeEventSystem
{
    public function __construct(
        protected ExternalApiService $externalApi
    ) {}

    public function handleEventSystemStored(EventSystemStoredEvent $event): void
    {
        $eventModel = $event->event;
        
        $this->externalApi->syncEventBinding([
            'name' => $eventModel->name,
            'event' => $eventModel->event,
            'listener' => $eventModel->listener,
            'priority' => $eventModel->priority,
            'status' => $eventModel->status,
        ]);
    }

    public function handleEventSystemDeleted(EventSystemDeletedEvent $event): void
    {
        $eventModel = $event->event;
        
        $this->externalApi->deleteEventBinding($eventModel->name);
    }
}
```

### Example 7: Real-time Updates

Send real-time updates via WebSockets or broadcasting:

```php
namespace App\Listeners\EventSystem;

use Illuminate\Support\Facades\Broadcast;
use JobMetric\EventSystem\Events\EventSystemStoredEvent;
use JobMetric\EventSystem\Events\EventSystemDeletedEvent;

class BroadcastEventSystemChanges
{
    public function handleEventSystemStored(EventSystemStoredEvent $event): void
    {
        $eventModel = $event->event;
        
        Broadcast::channel('event-system', function () {
            return true;
        })->toOthers();
        
        event(new EventSystemChanged([
            'type' => 'stored',
            'event' => $eventModel,
        ]));
    }

    public function handleEventSystemDeleted(EventSystemDeletedEvent $event): void
    {
        $eventModel = $event->event;
        
        event(new EventSystemChanged([
            'type' => 'deleted',
            'event' => $eventModel,
        ]));
    }
}
```

### Example 8: Complete Event Listener Setup

Complete setup for all event system events:

```php
namespace App\Providers;

use App\Listeners\EventSystem\AuditEventSystemOperations;
use App\Listeners\EventSystem\BroadcastEventSystemChanges;
use App\Listeners\EventSystem\InvalidateEventSystemCache;
use App\Listeners\EventSystem\NotifyEventSystemChanges;
use App\Listeners\EventSystem\TrackEventSystemAnalytics;
use App\Listeners\EventSystem\ValidateEventSystemDeletion;
use App\Listeners\EventSystem\SynchronizeEventSystem;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\EventSystem\Events\EventSystemStoredEvent;
use JobMetric\EventSystem\Events\EventSystemDeletingEvent;
use JobMetric\EventSystem\Events\EventSystemDeletedEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // After storing
        EventSystemStoredEvent::class => [
            AuditEventSystemOperations::class,
            InvalidateEventSystemCache::class,
            NotifyEventSystemChanges::class,
            TrackEventSystemAnalytics::class,
            BroadcastEventSystemChanges::class,
            SynchronizeEventSystem::class,
        ],

        // Before deleting
        EventSystemDeletingEvent::class => [
            ValidateEventSystemDeletion::class,
        ],

        // After deleting
        EventSystemDeletedEvent::class => [
            AuditEventSystemOperations::class,
            InvalidateEventSystemCache::class,
            TrackEventSystemAnalytics::class,
            BroadcastEventSystemChanges::class,
            SynchronizeEventSystem::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
```

## Event Timing

### EventSystemStoredEvent

Fired **after** the event binding is saved to database:

```php
// Execution order:
// 1. Validate input data
// 2. Create event binding record
// 3. Save to database
// 4. Clear cache
// 5. Fire EventSystemStoredEvent ← Event fired here
// 6. Return response
```

### EventSystemDeletingEvent / EventSystemDeletedEvent

- `EventSystemDeletingEvent`: Fired **before** the deletion operation
- `EventSystemDeletedEvent`: Fired **after** the deletion operation completes

```php
// Execution order:
// 1. Find event binding by name
// 2. Fire EventSystemDeletingEvent ← Before deletion
// 3. Delete event binding record
// 4. Fire EventSystemDeletedEvent ← After deletion
// 5. Clear cache
// 6. Return response
```

**Important Notes**:
- The event binding is **saved** to database before `EventSystemStoredEvent` fires
- You can access **fresh model data** in listeners
- Database transaction is **committed** before events fire
- Events are **synchronous** by default (can be queued)
- `EventSystemDeletingEvent` allows you to **prevent** deletion if needed
- Cache is cleared **before** events fire

## Queued Events

You can queue events for asynchronous processing:

```php
namespace App\Listeners\EventSystem;

use Illuminate\Contracts\Queue\ShouldQueue;
use JobMetric\EventSystem\Events\EventSystemStoredEvent;

class ProcessEventSystemAsync implements ShouldQueue
{
    public function handle(EventSystemStoredEvent $event): void
    {
        $eventModel = $event->event;
        
        // Heavy processing that doesn't block the request
        $this->syncWithExternalService($eventModel);
        $this->generateAnalyticsReport($eventModel);
        $this->sendWelcomeNotifications($eventModel);
    }

    protected function syncWithExternalService($eventModel): void
    {
        // Sync with external API
    }

    protected function generateAnalyticsReport($eventModel): void
    {
        // Generate analytics
    }

    protected function sendWelcomeNotifications($eventModel): void
    {
        // Send notifications
    }
}
```

## Event Payload Details

### EventSystemStoredEvent

```php
readonly class EventSystemStoredEvent implements DomainEvent
{
    public function __construct(
        public Event $event,    // Event model instance (saved to database)
        public array $data       // Validated input data
    ) {}
}
```

**Available Properties on `$event`**:
- `id`: Event binding ID
- `name`: Unique name identifier
- `description`: Optional description
- `event`: Fully qualified event class name
- `listener`: Fully qualified listener class name
- `priority`: Execution priority
- `status`: Active status (boolean)
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

**Available Properties on `$data`**:
- All validated input fields from `StoreEventSystemRequest`
- Normalized values (priority defaults, etc.)

### EventSystemDeletingEvent / EventSystemDeletedEvent

```php
readonly class EventSystemDeletedEvent implements DomainEvent
{
    public function __construct(
        public Event $event  // Event model instance (deleted)
    ) {}
}
```

**Available Properties**:
- `$event`: Event model instance with all properties (still accessible after deletion)
- All properties from `EventSystemStoredEvent` are available
- Model is deleted but instance remains accessible

## When to Use Events

Use events when you need to:

- **Cache Management**: Invalidate or update cached event bindings
- **Notifications**: Send notifications when event bindings change
- **Analytics**: Track event system operations for analytics
- **Audit Logging**: Log event binding changes for compliance
- **Validation**: Validate event bindings before deletion
- **Synchronization**: Sync event bindings with external systems
- **Real-time Updates**: Broadcast event binding changes to clients
- **Business Rules**: Enforce business rules on event operations
- **Integration**: Integrate with external services
- **Side Effects**: Perform side effects without coupling

## Related Documentation

- <Link to="/packages/laravel-event-system/deep-diving/event-system">EventSystem</Link>
- <Link to="/packages/laravel-event-system/deep-diving/domain-event">DomainEvent</Link>
- <Link to="/packages/laravel-event-system/deep-diving/store-event-system-request">StoreEventSystemRequest</Link>
