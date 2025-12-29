---
sidebar_position: 9
sidebar_label: Events
---

# Events

Laravel Event System provides a comprehensive event system that fires events when event-listener bindings are created, updated, or deleted. These events allow you to hook into the event system lifecycle and perform additional actions when bindings change.

## When to Use Events

**Use event system events when you need:**

- **Audit logging**: Track changes to event bindings for compliance
- **Cache invalidation**: Clear caches when event configurations change
- **Notification systems**: Notify administrators of event binding changes
- **Integration hooks**: Sync event configurations with external systems
- **Analytics tracking**: Monitor event system activity and usage
- **Validation**: Perform additional validation before deletion

**Example scenarios:**
- Logging all event binding changes for audit purposes
- Invalidating caches when event configurations are modified
- Sending notifications when critical events are registered
- Syncing event configurations with external systems
- Tracking event system usage metrics

## Available Events

| Event                        | When                                                    |
|-----------------------------|----------------------------------------------------------|
| `EventSystemStoredEvent`    | After storing a new event-listener binding              |
| `EventSystemDeletingEvent`  | Before deleting an event-listener binding               |
| `EventSystemDeletedEvent`   | After deleting an event-listener binding                |

## EventSystemStoredEvent

Fired after successfully storing a new event-listener binding.

**Namespace:** `JobMetric\EventSystem\Events\EventSystemStoredEvent`

**Payload:**
- `$event` (Event): The created event model
- `$validated` (array): The validated input data

**Example:**

```php
namespace App\Listeners;

use JobMetric\EventSystem\Events\EventSystemStoredEvent;
use Illuminate\Support\Facades\Log;

class LogEventSystemStored
{
    public function handle(EventSystemStoredEvent $event): void
    {
        Log::info('Event system entry created', [
            'name' => $event->event->name,
            'event' => $event->event->event,
            'listener' => $event->event->listener,
            'priority' => $event->event->priority,
        ]);
    }
}
```

## EventSystemDeletingEvent

Fired before deleting an event-listener binding. Use this to perform validation or cleanup before deletion.

**Namespace:** `JobMetric\EventSystem\Events\EventSystemDeletingEvent`

**Payload:**
- `$event` (Event): The event model being deleted

**Example:**

```php
namespace App\Listeners;

use JobMetric\EventSystem\Events\EventSystemDeletingEvent;
use Illuminate\Support\Facades\Log;

class ValidateEventSystemDeletion
{
    public function handle(EventSystemDeletingEvent $event): void
    {
        // Prevent deletion of critical events
        if (in_array($event->event->name, ['critical.event.1', 'critical.event.2'])) {
            throw new \Exception('Cannot delete critical events');
        }

        Log::info('Event system entry being deleted', [
            'name' => $event->event->name,
        ]);
    }
}
```

## EventSystemDeletedEvent

Fired after successfully deleting an event-listener binding.

**Namespace:** `JobMetric\EventSystem\Events\EventSystemDeletedEvent`

**Payload:**
- `$event` (Event): The deleted event model

**Example:**

```php
namespace App\Listeners;

use JobMetric\EventSystem\Events\EventSystemDeletedEvent;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class CleanupAfterEventSystemDeletion
{
    public function handle(EventSystemDeletedEvent $event): void
    {
        // Clear related caches
        Cache::forget("event_system_{$event->event->id}");
        Cache::forget('events');

        Log::info('Event system entry deleted', [
            'name' => $event->event->name,
        ]);
    }
}
```

## Registering Event Listeners

### Method 1: Event Listeners in Service Provider

Register event listeners in a service provider:

```php
namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\EventSystem\Events\EventSystemStoredEvent;
use JobMetric\EventSystem\Events\EventSystemDeletedEvent;
use App\Listeners\LogEventSystemStored;
use App\Listeners\CleanupAfterEventSystemDeletion;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        EventSystemStoredEvent::class => [
            LogEventSystemStored::class,
        ],
        EventSystemDeletedEvent::class => [
            CleanupAfterEventSystemDeletion::class,
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
    
    Log::info('Event system entry created', [
        'name' => $eventModel->name,
        'event' => $eventModel->event,
        'listener' => $eventModel->listener,
    ]);
});
```

## Complete Examples

### Example 1: Audit Logging

Log all event system operations for audit trail:

```php
namespace App\Listeners;

use JobMetric\EventSystem\Events\EventSystemStoredEvent;
use JobMetric\EventSystem\Events\EventSystemDeletedEvent;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AuditEventSystemOperations
{
    public function handleStored(EventSystemStoredEvent $event): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'event_system.created',
            'model_type' => 'event_system',
            'model_id' => $event->event->id,
            'data' => [
                'name' => $event->event->name,
                'event' => $event->event->event,
                'listener' => $event->event->listener,
            ],
        ]);
    }

    public function handleDeleted(EventSystemDeletedEvent $event): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'event_system.deleted',
            'model_type' => 'event_system',
            'model_id' => $event->event->id,
            'data' => [
                'name' => $event->event->name,
            ],
        ]);
    }
}
```

### Example 2: Cache Invalidation

Invalidate caches when event configurations change:

```php
namespace App\Listeners;

use JobMetric\EventSystem\Events\EventSystemStoredEvent;
use JobMetric\EventSystem\Events\EventSystemDeletedEvent;
use Illuminate\Support\Facades\Cache;

class InvalidateEventSystemCache
{
    public function handleStored(EventSystemStoredEvent $event): void
    {
        Cache::forget('events');
        Cache::forget("event_system_{$event->event->id}");
    }

    public function handleDeleted(EventSystemDeletedEvent $event): void
    {
        Cache::forget('events');
        Cache::forget("event_system_{$event->event->id}");
    }
}
```

### Example 3: Notification System

Send notifications when critical events are registered:

```php
namespace App\Listeners;

use JobMetric\EventSystem\Events\EventSystemStoredEvent;
use Illuminate\Support\Facades\Notification;
use App\Notifications\CriticalEventRegistered;

class NotifyCriticalEventRegistration
{
    public function handle(EventSystemStoredEvent $event): void
    {
        $criticalEvents = ['user.created', 'order.completed', 'payment.processed'];

        if (in_array($event->event->name, $criticalEvents)) {
            Notification::route('slack', config('services.slack.webhook'))
                ->notify(new CriticalEventRegistered($event->event));
        }
    }
}
```

## Related Documentation

- [EventSystem](/packages/laravel-event-system/deep-diving/event-system) - Service for managing event bindings
- [DomainEvent](/packages/laravel-event-system/deep-diving/domain-event) - Domain event contract

