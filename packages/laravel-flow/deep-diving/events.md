---
sidebar_position: 8
sidebar_label: Events
---

# Events

Laravel Flow provides a comprehensive event system that fires domain events for all CRUD operations on Flow entities. These events allow you to hook into the workflow lifecycle and perform additional actions when flows, states, tasks, or transitions are created, updated, or deleted.

## Overview

The event system in Laravel Flow:

- **Fires automatically** during CRUD operations
- **Provides model instances** in event payloads
- **Uses DomainEvent interface** for consistency
- **Supports event listeners** for custom logic
- **Enables event-driven architecture** for workflow management

## Event Structure

All events in Laravel Flow:

- Implement `JobMetric\EventSystem\Contracts\DomainEvent`
- Are `readonly` classes for immutability
- Contain the affected model instance
- Provide a stable `key()` method
- Include metadata via `definition()` method

### Base Event Structure

```php
readonly class FlowStoreEvent implements DomainEvent
{
    public function __construct(
        public Flow $flow
    ) {}

    public static function key(): string
    {
        return 'flow.stored';
    }

    public static function definition(): DomainEventDefinition
    {
        return new DomainEventDefinition(
            self::key(),
            'flow::base.events.flow_stored.group',
            'flow::base.events.flow_stored.title',
            'flow::base.events.flow_stored.description',
            'fas fa-save',
            ['flow', 'storage', 'management']
        );
    }
}
```

## Available Events

### Flow Events

Events fired for Flow entity CRUD operations.

| Event Class | Event Key | Description | Payload | Triggered When |
|------------|-----------|-------------|---------|----------------|
| `FlowStoreEvent` | `flow.stored` | Fired when a new Flow is created | `Flow $flow` | `Flow::store()` |
| `FlowUpdateEvent` | `flow.updated` | Fired when an existing Flow is updated | `Flow $flow` | `Flow::update()` |
| `FlowDeleteEvent` | `flow.deleted` | Fired when a Flow is soft-deleted | `Flow $flow` | `Flow::destroy()` |
| `FlowRestoreEvent` | `flow.restored` | Fired when a soft-deleted Flow is restored | `Flow $flow` | `Flow::restore()` |
| `FlowForceDeleteEvent` | `flow.force_deleted` | Fired when a Flow is permanently deleted | `Flow $flow` | `Flow::forceDelete()` |

**Namespace:** `JobMetric\Flow\Events\Flow\*`

### FlowState Events

Events fired for FlowState entity CRUD operations.

| Event Class | Event Key | Description | Payload | Triggered When |
|------------|-----------|-------------|---------|----------------|
| `FlowStateStoreEvent` | `flow_state.stored` | Fired when a new FlowState is created | `FlowState $flowState` | `FlowState::store()` |
| `FlowStateUpdateEvent` | `flow_state.updated` | Fired when an existing FlowState is updated | `FlowState $flowState` | `FlowState::update()` |
| `FlowStateDeleteEvent` | `flow_state.deleted` | Fired when a FlowState is deleted | `FlowState $flowState` | `FlowState::destroy()` |

**Namespace:** `JobMetric\Flow\Events\FlowState\*`

### FlowTask Events

Events fired for FlowTask entity CRUD operations.

| Event Class | Event Key | Description | Payload | Triggered When |
|------------|-----------|-------------|---------|----------------|
| `FlowTaskStoreEvent` | `flow_task.stored` | Fired when a new FlowTask is created | `FlowTask $flowTask` | `FlowTask::store()` |
| `FlowTaskUpdateEvent` | `flow_task.updated` | Fired when an existing FlowTask is updated | `FlowTask $flowTask` | `FlowTask::update()` |
| `FlowTaskDeleteEvent` | `flow_task.deleted` | Fired when a FlowTask is deleted | `FlowTask $flowTask` | `FlowTask::destroy()` |

**Namespace:** `JobMetric\Flow\Events\FlowTask\*`

### FlowTransition Events

Events fired for FlowTransition entity CRUD operations.

| Event Class | Event Key | Description | Payload | Triggered When |
|------------|-----------|-------------|---------|----------------|
| `FlowTransitionStoreEvent` | `flow_transition.stored` | Fired when a new FlowTransition is created | `FlowTransition $flowTransition` | `FlowTransition::store()` |
| `FlowTransitionUpdateEvent` | `flow_transition.updated` | Fired when an existing FlowTransition is updated | `FlowTransition $flowTransition` | `FlowTransition::update()` |
| `FlowTransitionDeleteEvent` | `flow_transition.deleted` | Fired when a FlowTransition is deleted | `FlowTransition $flowTransition` | `FlowTransition::destroy()` |

**Namespace:** `JobMetric\Flow\Events\FlowTransition\*`

## Listening to Events

### Method 1: Event Listeners in Service Provider

Register event listeners in a service provider:

```php
namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Flow\Events\Flow\FlowStoreEvent;
use JobMetric\Flow\Events\Flow\FlowUpdateEvent;
use JobMetric\Flow\Events\FlowState\FlowStateStoreEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        FlowStoreEvent::class => [
            \App\Listeners\Flow\LogFlowCreation::class,
            \App\Listeners\Flow\InvalidateFlowCache::class,
        ],
        FlowUpdateEvent::class => [
            \App\Listeners\Flow\LogFlowUpdate::class,
            \App\Listeners\Flow\InvalidateFlowCache::class,
        ],
        FlowStateStoreEvent::class => [
            \App\Listeners\FlowState\UpdateFlowVisualization::class,
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
use JobMetric\Flow\Events\Flow\FlowStoreEvent;

Event::listen(FlowStoreEvent::class, function (FlowStoreEvent $event) {
    $flow = $event->flow;
    
    // Perform actions
    Log::info('Flow created', ['flow_id' => $flow->id]);
    Cache::forget("flow_{$flow->id}");
});
```

### Method 3: Using Event Subscribers

Create event subscribers for multiple events:

```php
namespace App\Listeners;

use Illuminate\Events\Dispatcher;
use JobMetric\Flow\Events\Flow\FlowStoreEvent;
use JobMetric\Flow\Events\Flow\FlowUpdateEvent;
use JobMetric\Flow\Events\Flow\FlowDeleteEvent;

class FlowEventSubscriber
{
    public function handleFlowStored(FlowStoreEvent $event): void
    {
        $flow = $event->flow;
        Log::info('Flow stored', ['flow_id' => $flow->id]);
    }

    public function handleFlowUpdated(FlowUpdateEvent $event): void
    {
        $flow = $event->flow;
        Log::info('Flow updated', ['flow_id' => $flow->id]);
    }

    public function handleFlowDeleted(FlowDeleteEvent $event): void
    {
        $flow = $event->flow;
        Log::info('Flow deleted', ['flow_id' => $flow->id]);
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            FlowStoreEvent::class,
            [FlowEventSubscriber::class, 'handleFlowStored']
        );

        $events->listen(
            FlowUpdateEvent::class,
            [FlowEventSubscriber::class, 'handleFlowUpdated']
        );

        $events->listen(
            FlowDeleteEvent::class,
            [FlowEventSubscriber::class, 'handleFlowDeleted']
        );
    }
}
```

Register the subscriber:

```php
namespace App\Providers;

use App\Listeners\FlowEventSubscriber;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $subscribe = [
        FlowEventSubscriber::class,
    ];
}
```

## Complete Examples

### Example 1: Cache Invalidation on Flow Changes

Invalidate cache when flows are modified:

```php
namespace App\Listeners\Flow;

use Illuminate\Support\Facades\Cache;
use JobMetric\Flow\Events\Flow\FlowStoreEvent;
use JobMetric\Flow\Events\Flow\FlowUpdateEvent;
use JobMetric\Flow\Events\Flow\FlowDeleteEvent;

class InvalidateFlowCache
{
    public function handle(FlowStoreEvent|FlowUpdateEvent|FlowDeleteEvent $event): void
    {
        $flow = $event->flow;

        // Invalidate specific flow cache
        Cache::forget("flow_{$flow->id}");
        Cache::forget("flow_{$flow->id}_states");
        Cache::forget("flow_{$flow->id}_transitions");

        // Invalidate flow list cache
        Cache::forget("flows_{$flow->subject_type}");

        // Clear all flow caches
        forgetFlowCache();
    }
}
```

### Example 2: Audit Logging

Log all flow operations for audit trail:

```php
namespace App\Listeners\Flow;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use JobMetric\Flow\Events\Flow\FlowStoreEvent;
use JobMetric\Flow\Events\Flow\FlowUpdateEvent;
use JobMetric\Flow\Events\Flow\FlowDeleteEvent;

class AuditFlowOperations
{
    public function handleFlowStored(FlowStoreEvent $event): void
    {
        $this->logAudit('created', $event->flow);
    }

    public function handleFlowUpdated(FlowUpdateEvent $event): void
    {
        $this->logAudit('updated', $event->flow);
    }

    public function handleFlowDeleted(FlowDeleteEvent $event): void
    {
        $this->logAudit('deleted', $event->flow);
    }

    protected function logAudit(string $action, $flow): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => "flow.{$action}",
            'model_type' => get_class($flow),
            'model_id' => $flow->id,
            'changes' => $flow->getChanges(),
            'ip_address' => request()->ip(),
        ]);
    }
}
```

### Example 3: Notification System

Send notifications when flows are created or updated:

```php
namespace App\Listeners\Flow;

use App\Notifications\FlowCreated;
use App\Notifications\FlowUpdated;
use Illuminate\Support\Facades\Notification;
use JobMetric\Flow\Events\Flow\FlowStoreEvent;
use JobMetric\Flow\Events\Flow\FlowUpdateEvent;

class NotifyFlowChanges
{
    public function handleFlowStored(FlowStoreEvent $event): void
    {
        $flow = $event->flow;

        // Notify administrators
        $admins = User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->get();

        Notification::send($admins, new FlowCreated($flow));
    }

    public function handleFlowUpdated(FlowUpdateEvent $event): void
    {
        $flow = $event->flow;

        // Notify flow owners
        if ($flow->created_by) {
            $owner = User::find($flow->created_by);
            if ($owner) {
                $owner->notify(new FlowUpdated($flow));
            }
        }
    }
}
```

### Example 4: Search Index Update

Update search index when flows change:

```php
namespace App\Listeners\Flow;

use App\Services\SearchService;
use JobMetric\Flow\Events\Flow\FlowStoreEvent;
use JobMetric\Flow\Events\Flow\FlowUpdateEvent;
use JobMetric\Flow\Events\Flow\FlowDeleteEvent;

class UpdateSearchIndex
{
    public function __construct(
        protected SearchService $searchService
    ) {}

    public function handleFlowStored(FlowStoreEvent $event): void
    {
        $this->searchService->indexFlow($event->flow);
    }

    public function handleFlowUpdated(FlowUpdateEvent $event): void
    {
        $this->searchService->updateFlow($event->flow);
    }

    public function handleFlowDeleted(FlowDeleteEvent $event): void
    {
        $this->searchService->removeFlow($event->flow->id);
    }
}
```

### Example 5: State Change Tracking

Track state changes when FlowStates are modified:

```php
namespace App\Listeners\FlowState;

use App\Models\StateChangeHistory;
use JobMetric\Flow\Events\FlowState\FlowStateStoreEvent;
use JobMetric\Flow\Events\FlowState\FlowStateUpdateEvent;
use JobMetric\Flow\Events\FlowState\FlowStateDeleteEvent;

class TrackStateChanges
{
    public function handleStateStored(FlowStateStoreEvent $event): void
    {
        $this->recordChange('created', $event->flowState);
    }

    public function handleStateUpdated(FlowStateUpdateEvent $event): void
    {
        $this->recordChange('updated', $event->flowState);
    }

    public function handleStateDeleted(FlowStateDeleteEvent $event): void
    {
        $this->recordChange('deleted', $event->flowState);
    }

    protected function recordChange(string $action, $state): void
    {
        StateChangeHistory::create([
            'flow_id' => $state->flow_id,
            'state_id' => $state->id,
            'action' => $action,
            'changes' => $state->getChanges(),
            'performed_by' => auth()->id(),
            'performed_at' => now(),
        ]);
    }
}
```

### Example 6: Task Execution Monitoring

Monitor task changes for analytics:

```php
namespace App\Listeners\FlowTask;

use App\Services\AnalyticsService;
use JobMetric\Flow\Events\FlowTask\FlowTaskStoreEvent;
use JobMetric\Flow\Events\FlowTask\FlowTaskUpdateEvent;
use JobMetric\Flow\Events\FlowTask\FlowTaskDeleteEvent;

class MonitorTaskChanges
{
    public function __construct(
        protected AnalyticsService $analytics
    ) {}

    public function handleTaskStored(FlowTaskStoreEvent $event): void
    {
        $task = $event->flowTask;
        
        $this->analytics->track('flow_task.created', [
            'task_id' => $task->id,
            'flow_id' => $task->flow_id,
            'transition_id' => $task->flow_transition_id,
            'driver' => $task->driver,
            'type' => $task->type,
        ]);
    }

    public function handleTaskUpdated(FlowTaskUpdateEvent $event): void
    {
        $task = $event->flowTask;
        
        $this->analytics->track('flow_task.updated', [
            'task_id' => $task->id,
            'changes' => $task->getChanges(),
        ]);
    }

    public function handleTaskDeleted(FlowTaskDeleteEvent $event): void
    {
        $task = $event->flowTask;
        
        $this->analytics->track('flow_task.deleted', [
            'task_id' => $task->id,
        ]);
    }
}
```

### Example 7: Transition Validation Logging

Log transition changes for debugging:

```php
namespace App\Listeners\FlowTransition;

use Illuminate\Support\Facades\Log;
use JobMetric\Flow\Events\FlowTransition\FlowTransitionStoreEvent;
use JobMetric\Flow\Events\FlowTransition\FlowTransitionUpdateEvent;
use JobMetric\Flow\Events\FlowTransition\FlowTransitionDeleteEvent;

class LogTransitionChanges
{
    public function handleTransitionStored(FlowTransitionStoreEvent $event): void
    {
        $transition = $event->flowTransition;
        
        Log::info('Flow transition created', [
            'transition_id' => $transition->id,
            'flow_id' => $transition->flow_id,
            'from_state' => $transition->from,
            'to_state' => $transition->to,
            'slug' => $transition->slug,
        ]);
    }

    public function handleTransitionUpdated(FlowTransitionUpdateEvent $event): void
    {
        $transition = $event->flowTransition;
        
        Log::info('Flow transition updated', [
            'transition_id' => $transition->id,
            'changes' => $transition->getChanges(),
        ]);
    }

    public function handleTransitionDeleted(FlowTransitionDeleteEvent $event): void
    {
        $transition = $event->flowTransition;
        
        Log::warning('Flow transition deleted', [
            'transition_id' => $transition->id,
            'flow_id' => $transition->flow_id,
        ]);
    }
}
```

### Example 8: Complete Event Listener Setup

Complete setup for all flow events:

```php
namespace App\Providers;

use App\Listeners\Flow\AuditFlowOperations;
use App\Listeners\Flow\InvalidateFlowCache;
use App\Listeners\Flow\NotifyFlowChanges;
use App\Listeners\FlowState\TrackStateChanges;
use App\Listeners\FlowTask\MonitorTaskChanges;
use App\Listeners\FlowTransition\LogTransitionChanges;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Flow\Events\Flow\FlowDeleteEvent;
use JobMetric\Flow\Events\Flow\FlowStoreEvent;
use JobMetric\Flow\Events\Flow\FlowUpdateEvent;
use JobMetric\Flow\Events\FlowState\FlowStateDeleteEvent;
use JobMetric\Flow\Events\FlowState\FlowStateStoreEvent;
use JobMetric\Flow\Events\FlowState\FlowStateUpdateEvent;
use JobMetric\Flow\Events\FlowTask\FlowTaskDeleteEvent;
use JobMetric\Flow\Events\FlowTask\FlowTaskStoreEvent;
use JobMetric\Flow\Events\FlowTask\FlowTaskUpdateEvent;
use JobMetric\Flow\Events\FlowTransition\FlowTransitionDeleteEvent;
use JobMetric\Flow\Events\FlowTransition\FlowTransitionStoreEvent;
use JobMetric\Flow\Events\FlowTransition\FlowTransitionUpdateEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // Flow events
        FlowStoreEvent::class => [
            AuditFlowOperations::class,
            InvalidateFlowCache::class,
            NotifyFlowChanges::class,
        ],
        FlowUpdateEvent::class => [
            AuditFlowOperations::class,
            InvalidateFlowCache::class,
            NotifyFlowChanges::class,
        ],
        FlowDeleteEvent::class => [
            AuditFlowOperations::class,
            InvalidateFlowCache::class,
        ],

        // FlowState events
        FlowStateStoreEvent::class => [
            TrackStateChanges::class,
        ],
        FlowStateUpdateEvent::class => [
            TrackStateChanges::class,
        ],
        FlowStateDeleteEvent::class => [
            TrackStateChanges::class,
        ],

        // FlowTask events
        FlowTaskStoreEvent::class => [
            MonitorTaskChanges::class,
        ],
        FlowTaskUpdateEvent::class => [
            MonitorTaskChanges::class,
        ],
        FlowTaskDeleteEvent::class => [
            MonitorTaskChanges::class,
        ],

        // FlowTransition events
        FlowTransitionStoreEvent::class => [
            LogTransitionChanges::class,
        ],
        FlowTransitionUpdateEvent::class => [
            LogTransitionChanges::class,
        ],
        FlowTransitionDeleteEvent::class => [
            LogTransitionChanges::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
```

## Event Timing

Events are fired **after** the database operation completes:

```php
// Execution order:
// 1. Validate input
// 2. Perform database operation (create/update/delete)
// 3. Fire event ← Event fired here
// 4. Return response
```

This means:
- The model is **saved** to database before event fires
- You can access **fresh model data** in listeners
- Database transaction is **committed** before event fires
- Events are **synchronous** by default (can be queued)

## Queued Events

You can queue events for asynchronous processing:

```php
namespace App\Listeners\Flow;

use Illuminate\Contracts\Queue\ShouldQueue;
use JobMetric\Flow\Events\Flow\FlowStoreEvent;

class ProcessFlowAsync implements ShouldQueue
{
    public function handle(FlowStoreEvent $event): void
    {
        $flow = $event->flow;
        
        // Heavy processing
        $this->generateFlowDocumentation($flow);
        $this->updateSearchIndex($flow);
        $this->sendNotifications($flow);
    }
}
```

## Best Practices

1. **Keep Listeners Lightweight**: Perform heavy operations asynchronously
   ```php
   // ✅ Good: Queue heavy operations
   class HeavyOperationListener implements ShouldQueue
   {
       public function handle($event) { /* ... */ }
   }

   // ❌ Bad: Blocking operations in listener
   class HeavyOperationListener
   {
       public function handle($event) {
           sleep(10); // Blocks execution
       }
   }
   ```

2. **Handle Failures Gracefully**: Use try-catch in listeners
   ```php
   public function handle(FlowStoreEvent $event): void
   {
       try {
           // Operation that might fail
           $this->externalService->sync($event->flow);
       } catch (\Exception $e) {
           Log::error('Failed to sync flow', [
               'flow_id' => $event->flow->id,
               'error' => $e->getMessage(),
           ]);
       }
   }
   ```

3. **Avoid Circular Events**: Don't trigger events that cause the same event
   ```php
   // ❌ Bad: Circular event
   public function handle(FlowStoreEvent $event): void
   {
       // This will fire FlowStoreEvent again!
       Flow::store([...]);
   }
   ```

4. **Use Event Keys for Filtering**: Filter events by key if needed
   ```php
   Event::listen(function ($event) {
       if (method_exists($event, 'key')) {
           $key = $event::key();
           if (str_starts_with($key, 'flow.')) {
               // Handle flow events
           }
       }
   });
   ```

5. **Test Event Listeners**: Write tests for your listeners
   ```php
   public function test_flow_store_event_triggers_cache_invalidation(): void
   {
       Event::fake();
       
       Flow::store([...]);
       
       Event::assertDispatched(FlowStoreEvent::class);
   }
   ```

## Testing Events

### Fake Events in Tests

```php
use Illuminate\Support\Facades\Event;
use JobMetric\Flow\Events\Flow\FlowStoreEvent;

public function test_flow_creation_fires_event(): void
{
    Event::fake();

    $flow = Flow::store([...]);

    Event::assertDispatched(FlowStoreEvent::class, function ($event) use ($flow) {
        return $event->flow->id === $flow->id;
    });
}
```

### Assert Event Not Dispatched

```php
Event::fake();

// Perform operation that shouldn't fire event
Flow::query()->where('id', 999)->delete();

Event::assertNotDispatched(FlowDeleteEvent::class);
```

### Assert Multiple Events

```php
Event::fake();

Flow::store([...]);
Flow::update($id, [...]);

Event::assertDispatched(FlowStoreEvent::class);
Event::assertDispatched(FlowUpdateEvent::class);
```

## Related Documentation

- [Flow Service](/packages/laravel-flow/deep-diving/services/flow) - Learn about flow management
- [FlowState Service](/packages/laravel-flow/deep-diving/services/flow-state) - Learn about state management
- [FlowTask Service](/packages/laravel-flow/deep-diving/services/flow-task) - Learn about task management
- [FlowTransition Service](/packages/laravel-flow/deep-diving/services/flow-transition) - Learn about transition management

