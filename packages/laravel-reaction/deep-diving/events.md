---
sidebar_position: 5
sidebar_label: Events
---

import Link from "@docusaurus/Link";

# Events

Laravel Reaction provides a comprehensive event system that fires domain events for all reaction operations. These events allow you to hook into the reaction lifecycle and perform additional actions when reactions are added or removed.

## Overview

The event system in Laravel Reaction:

- **Fires automatically** during reaction operations
- **Provides Reaction model instances** in event payloads
- **Uses DomainEvent interface** for consistency
- **Supports event listeners** for custom logic
- **Enables event-driven architecture** for reaction management

## Event Structure

All events in Laravel Reaction:

- Implement `JobMetric\EventSystem\Contracts\DomainEvent`
- Are `readonly` classes for immutability
- Contain the affected Reaction model instance
- Provide a stable `key()` method
- Include metadata via `definition()` method

### Base Event Structure

```php
readonly class ReactionAddEvent implements DomainEvent
{
    public function __construct(
        public Reaction $reaction
    ) {}

    public static function key(): string
    {
        return 'reaction.added';
    }

    public static function definition(): DomainEventDefinition
    {
        return new DomainEventDefinition(
            self::key(),
            'reaction::base.entity_names.reaction',
            'reaction::base.events.reaction_added.title',
            'reaction::base.events.reaction_added.description',
            'fas fa-heart',
            ['reaction', 'interaction', 'social']
        );
    }
}
```

## Available Events

### Reaction Events

Events fired for Reaction operations.

| Event Class | Event Key | Description | Payload | Triggered When |
|------------|-----------|-------------|---------|----------------|
| `ReactionAddEvent` | `reaction.added` | Fired when a new reaction is added | `Reaction $reaction` | `HasReaction::addReaction()` |
| `ReactionRemovingEvent` | `reaction.removing` | Fired before a reaction is removed | `Reaction $reaction` | Before `Reaction::delete()` |
| `ReactionRemovedEvent` | `reaction.removed` | Fired after a reaction is removed | `Reaction $reaction` | After `Reaction::delete()` |

**Namespace:** `JobMetric\Reaction\Events\*`

## Listening to Events

### Method 1: Event Listeners in Service Provider

Register event listeners in a service provider:

```php
namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Reaction\Events\ReactionAddEvent;
use JobMetric\Reaction\Events\ReactionRemovedEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        ReactionAddEvent::class => [
            \App\Listeners\Reaction\LogReactionCreation::class,
            \App\Listeners\Reaction\InvalidateReactionCache::class,
            \App\Listeners\Reaction\NotifyReactionAdded::class,
        ],
        ReactionRemovedEvent::class => [
            \App\Listeners\Reaction\LogReactionRemoval::class,
            \App\Listeners\Reaction\InvalidateReactionCache::class,
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
use JobMetric\Reaction\Events\ReactionAddEvent;

Event::listen(ReactionAddEvent::class, function (ReactionAddEvent $event) {
    $reaction = $event->reaction;
    
    // Perform actions
    Log::info('Reaction added', [
        'reaction_id' => $reaction->id,
        'reaction_type' => $reaction->reaction,
        'reactable_type' => $reaction->reactable_type,
        'reactable_id' => $reaction->reactable_id,
    ]);
    
    Cache::forget("reactions.{$reaction->reactable_type}.{$reaction->reactable_id}");
});
```

### Method 3: Using Event Subscribers

Create event subscribers for multiple events:

```php
namespace App\Listeners;

use Illuminate\Events\Dispatcher;
use JobMetric\Reaction\Events\ReactionAddEvent;
use JobMetric\Reaction\Events\ReactionRemovedEvent;

class ReactionEventSubscriber
{
    public function handleReactionAdded(ReactionAddEvent $event): void
    {
        $reaction = $event->reaction;
        Log::info('Reaction added', [
            'reaction_id' => $reaction->id,
            'reaction_type' => $reaction->reaction,
            'reactable' => "{$reaction->reactable_type}:{$reaction->reactable_id}",
        ]);
    }

    public function handleReactionRemoved(ReactionRemovedEvent $event): void
    {
        $reaction = $event->reaction;
        Log::warning('Reaction removed', [
            'reaction_id' => $reaction->id,
            'reaction_type' => $reaction->reaction,
        ]);
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            ReactionAddEvent::class,
            [ReactionEventSubscriber::class, 'handleReactionAdded']
        );

        $events->listen(
            ReactionRemovedEvent::class,
            [ReactionEventSubscriber::class, 'handleReactionRemoved']
        );
    }
}
```

Register the subscriber:

```php
namespace App\Providers;

use App\Listeners\ReactionEventSubscriber;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $subscribe = [
        ReactionEventSubscriber::class,
    ];
}
```

## Complete Examples

### Example 1: Cache Invalidation on Reaction Changes

Invalidate cache when reactions are modified:

```php
namespace App\Listeners\Reaction;

use Illuminate\Support\Facades\Cache;
use JobMetric\Reaction\Events\ReactionAddEvent;
use JobMetric\Reaction\Events\ReactionRemovedEvent;

class InvalidateReactionCache
{
    public function handle(ReactionAddEvent|ReactionRemovedEvent $event): void
    {
        $reaction = $event->reaction;

        // Invalidate specific reactable cache
        Cache::forget("reactions.{$reaction->reactable_type}.{$reaction->reactable_id}");
        Cache::forget("reaction_summary.{$reaction->reactable_type}.{$reaction->reactable_id}");
        Cache::forget("reaction_count.{$reaction->reactable_type}.{$reaction->reactable_id}");

        // Invalidate by reaction type
        Cache::forget("reactions.{$reaction->reactable_type}.{$reaction->reactable_id}.{$reaction->reaction}");

        // Invalidate reactor cache if authenticated
        if ($reaction->reactor) {
            Cache::forget("user_reactions.{$reaction->reactor_id}");
        }

        // Clear all reaction caches for this reactable
        Cache::tags(["reactable_{$reaction->reactable_type}_{$reaction->reactable_id}"])->flush();
    }
}
```

### Example 2: Audit Logging

Log all reaction operations for audit trail:

```php
namespace App\Listeners\Reaction;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use JobMetric\Reaction\Events\ReactionAddEvent;
use JobMetric\Reaction\Events\ReactionRemovedEvent;

class AuditReactionOperations
{
    public function handleReactionAdded(ReactionAddEvent $event): void
    {
        $this->logAudit('added', $event->reaction);
    }

    public function handleReactionRemoved(ReactionRemovedEvent $event): void
    {
        $this->logAudit('removed', $event->reaction);
    }

    protected function logAudit(string $action, $reaction): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => "reaction.{$action}",
            'model_type' => get_class($reaction),
            'model_id' => $reaction->id,
            'reactable_type' => $reaction->reactable_type,
            'reactable_id' => $reaction->reactable_id,
            'reaction_type' => $reaction->reaction,
            'reactor_type' => $reaction->reactor_type,
            'reactor_id' => $reaction->reactor_id,
            'device_id' => $reaction->device_id,
            'ip_address' => request()->ip(),
        ]);
    }
}
```

### Example 3: Notification System

Send notifications when reactions are added:

```php
namespace App\Listeners\Reaction;

use App\Notifications\ReactionAdded;
use Illuminate\Support\Facades\Notification;
use JobMetric\Reaction\Events\ReactionAddEvent;

class NotifyReactionChanges
{
    public function handleReactionAdded(ReactionAddEvent $event): void
    {
        $reaction = $event->reaction;
        $reactable = $reaction->reactable;

        // Only notify for authenticated users
        if (!$reaction->reactor) {
            return;
        }

        // Get reactable owner
        $owner = null;
        if (method_exists($reactable, 'user')) {
            $owner = $reactable->user;
        } elseif (method_exists($reactable, 'author')) {
            $owner = $reactable->author;
        }

        // Don't notify if user reacted to their own content
        if ($owner && $owner->id !== $reaction->reactor->id) {
            $owner->notify(new ReactionAdded($reaction));
        }

        // Notify administrators for popular content
        if ($reactable->reactions()->count() >= 100) {
            $admins = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })->get();

            Notification::send($admins, new ReactionAdded($reaction));
        }
    }
}
```

### Example 4: Analytics Tracking

Track reaction changes for analytics:

```php
namespace App\Listeners\Reaction;

use App\Services\AnalyticsService;
use JobMetric\Reaction\Events\ReactionAddEvent;
use JobMetric\Reaction\Events\ReactionRemovedEvent;

class TrackReactionAnalytics
{
    public function __construct(
        protected AnalyticsService $analytics
    ) {}

    public function handleReactionAdded(ReactionAddEvent $event): void
    {
        $reaction = $event->reaction;
        
        $this->analytics->track('reaction.added', [
            'reaction_id' => $reaction->id,
            'reaction_type' => $reaction->reaction,
            'reactable_type' => $reaction->reactable_type,
            'reactable_id' => $reaction->reactable_id,
            'reactor_type' => $reaction->reactor_type,
            'reactor_id' => $reaction->reactor_id,
            'device_id' => $reaction->device_id,
            'source' => $reaction->source,
            'ip_address' => $reaction->ip_address,
            'is_anonymous' => !$reaction->reactor,
        ]);
    }

    public function handleReactionRemoved(ReactionRemovedEvent $event): void
    {
        $reaction = $event->reaction;
        
        $this->analytics->track('reaction.removed', [
            'reaction_id' => $reaction->id,
            'reaction_type' => $reaction->reaction,
            'reactable_type' => $reaction->reactable_type,
            'reactable_id' => $reaction->reactable_id,
            'removed_at' => now(),
        ]);
    }
}
```

### Example 5: Reaction Aggregation

Update reaction aggregates when reactions change:

```php
namespace App\Listeners\Reaction;

use JobMetric\Reaction\Events\ReactionAddEvent;
use JobMetric\Reaction\Events\ReactionRemovedEvent;

class UpdateReactionAggregates
{
    public function handleReactionAdded(ReactionAddEvent $event): void
    {
        $this->recalculateAggregates($event->reaction);
    }

    public function handleReactionRemoved(ReactionRemovedEvent $event): void
    {
        $this->recalculateAggregates($event->reaction);
    }

    protected function recalculateAggregates($reaction): void
    {
        $reactable = $reaction->reactable;
        
        // Recalculate reaction counts by type
        $counts = $reactable->reactions()
            ->selectRaw('reaction, COUNT(*) as count')
            ->groupBy('reaction')
            ->pluck('count', 'reaction')
            ->toArray();
        
        $totalCount = $reactable->reactions()->count();
        
        // Update reactable model if it has reaction fields
        if (method_exists($reactable, 'updateReactionCounts')) {
            $reactable->updateReactionCounts($counts, $totalCount);
        }
        
        // Or update directly if columns exist
        if (Schema::hasColumn($reactable->getTable(), 'reaction_counts')) {
            $reactable->update([
                'reaction_counts' => $counts,
                'reaction_total' => $totalCount,
            ]);
        }
    }
}
```

### Example 6: Real-time Updates

Send real-time updates via WebSockets or broadcasting:

```php
namespace App\Listeners\Reaction;

use Illuminate\Support\Facades\Broadcast;
use JobMetric\Reaction\Events\ReactionAddEvent;
use JobMetric\Reaction\Events\ReactionRemovedEvent;

class BroadcastReactionChanges
{
    public function handleReactionAdded(ReactionAddEvent $event): void
    {
        $reaction = $event->reaction;
        
        Broadcast::channel("reactable.{$reaction->reactable_type}.{$reaction->reactable_id}", function () {
            return true;
        })->toOthers();
        
        event(new ReactionChanged([
            'type' => 'added',
            'reaction' => $reaction,
            'counts' => $reaction->reactable->reactions()
                ->selectRaw('reaction, COUNT(*) as count')
                ->groupBy('reaction')
                ->pluck('count', 'reaction')
                ->toArray(),
            'total' => $reaction->reactable->reactions()->count(),
        ]));
    }

    public function handleReactionRemoved(ReactionRemovedEvent $event): void
    {
        $reaction = $event->reaction;
        
        event(new ReactionChanged([
            'type' => 'removed',
            'reaction' => $reaction,
            'counts' => $reaction->reactable->reactions()
                ->selectRaw('reaction, COUNT(*) as count')
                ->groupBy('reaction')
                ->pluck('count', 'reaction')
                ->toArray(),
            'total' => $reaction->reactable->reactions()->count(),
        ]));
    }
}
```

### Example 7: Spam Detection

Detect and handle potential spam reactions:

```php
namespace App\Listeners\Reaction;

use App\Services\SpamDetectionService;
use JobMetric\Reaction\Events\ReactionAddEvent;
use JobMetric\Reaction\Events\ReactionRemovingEvent;

class DetectSpamReactions
{
    public function __construct(
        protected SpamDetectionService $spamDetection
    ) {}

    public function handleReactionAdded(ReactionAddEvent $event): void
    {
        $reaction = $event->reaction;
        
        // Check for spam patterns
        $isSpam = $this->spamDetection->check([
            'ip_address' => $reaction->ip_address,
            'device_id' => $reaction->device_id,
            'reaction_type' => $reaction->reaction,
            'reactable_id' => $reaction->reactable_id,
            'reactor_id' => $reaction->reactor_id,
        ]);
        
        if ($isSpam) {
            // Mark as spam or delete
            $reaction->update(['is_spam' => true]);
            
            // Log for review
            Log::warning('Potential spam reaction detected', [
                'reaction_id' => $reaction->id,
                'ip_address' => $reaction->ip_address,
                'device_id' => $reaction->device_id,
            ]);
        }
    }

    public function handleReactionRemoving(ReactionRemovingEvent $event): void
    {
        $reaction = $event->reaction;
        
        // Prevent rapid reaction changes (potential abuse)
        $recentChanges = $reaction->reactable->reactions()
            ->where(function ($query) use ($reaction) {
                if ($reaction->reactor_id) {
                    $query->where('reactor_id', $reaction->reactor_id);
                } else {
                    $query->where('device_id', $reaction->device_id);
                }
            })
            ->where('updated_at', '>', now()->subMinutes(5))
            ->count();
        
        if ($recentChanges > 10) {
            Log::warning('Rapid reaction changes detected', [
                'reaction_id' => $reaction->id,
                'changes' => $recentChanges,
            ]);
        }
    }
}
```

### Example 8: Complete Event Listener Setup

Complete setup for all reaction events:

```php
namespace App\Providers;

use App\Listeners\Reaction\AuditReactionOperations;
use App\Listeners\Reaction\BroadcastReactionChanges;
use App\Listeners\Reaction\DetectSpamReactions;
use App\Listeners\Reaction\InvalidateReactionCache;
use App\Listeners\Reaction\NotifyReactionChanges;
use App\Listeners\Reaction\TrackReactionAnalytics;
use App\Listeners\Reaction\UpdateReactionAggregates;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Reaction\Events\ReactionAddEvent;
use JobMetric\Reaction\Events\ReactionRemovedEvent;
use JobMetric\Reaction\Events\ReactionRemovingEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // Reaction added
        ReactionAddEvent::class => [
            AuditReactionOperations::class,
            InvalidateReactionCache::class,
            NotifyReactionChanges::class,
            TrackReactionAnalytics::class,
            UpdateReactionAggregates::class,
            BroadcastReactionChanges::class,
            DetectSpamReactions::class,
        ],

        // Reaction removing (before deletion)
        ReactionRemovingEvent::class => [
            DetectSpamReactions::class,
        ],

        // Reaction removed (after deletion)
        ReactionRemovedEvent::class => [
            AuditReactionOperations::class,
            InvalidateReactionCache::class,
            TrackReactionAnalytics::class,
            UpdateReactionAggregates::class,
            BroadcastReactionChanges::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
```

## Event Timing

### ReactionAddEvent

Fired **after** the reaction is saved to database:

```php
// Execution order:
// 1. Validate input
// 2. Create reaction record
// 3. Save to database
// 4. Fire ReactionAddEvent ← Event fired here
// 5. Return response
```

### ReactionRemovingEvent / ReactionRemovedEvent

- `ReactionRemovingEvent`: Fired **before** the deletion operation
- `ReactionRemovedEvent`: Fired **after** the deletion operation completes

```php
// Execution order:
// 1. Fire ReactionRemovingEvent ← Before deletion
// 2. Soft delete reaction record
// 3. Fire ReactionRemovedEvent ← After deletion
// 4. Return response
```

**Important Notes**:
- The model is **saved** to database before `ReactionAddEvent` fires
- You can access **fresh model data** in listeners
- Database transaction is **committed** before events fire
- Events are **synchronous** by default (can be queued)
- `ReactionRemovingEvent` allows you to **prevent** deletion if needed
- Reactions are **soft-deleted**, so they still exist in database after removal

## Queued Events

You can queue events for asynchronous processing:

```php
namespace App\Listeners\Reaction;

use Illuminate\Contracts\Queue\ShouldQueue;
use JobMetric\Reaction\Events\ReactionAddEvent;

class ProcessReactionAsync implements ShouldQueue
{
    public function handle(ReactionAddEvent $event): void
    {
        $reaction = $event->reaction;
        
        // Heavy processing that doesn't block the request
        $this->updateSearchIndex($reaction);
        $this->sendWelcomeNotifications($reaction);
        $this->generateAnalyticsReport($reaction);
    }

    protected function updateSearchIndex($reaction): void
    {
        // Update search index with new reaction
    }

    protected function sendWelcomeNotifications($reaction): void
    {
        // Send notifications
    }

    protected function generateAnalyticsReport($reaction): void
    {
        // Generate analytics
    }
}
```

## Event Payload Details

### ReactionAddEvent

```php
readonly class ReactionAddEvent implements DomainEvent
{
    public function __construct(
        public Reaction $reaction  // Complete Reaction model instance
    ) {}
}
```

**Available Properties on `$reaction`**:
- `id`: Reaction ID
- `reaction`: Reaction type (e.g., 'like', 'love', 'haha')
- `reactable_type`: Type of reacted model
- `reactable_id`: ID of reacted model
- `reactor_type`: Type of reacting entity (User, Device, etc.)
- `reactor_id`: ID of reacting entity
- `device_id`: Device identifier (if anonymous)
- `ip_address`: IP address of reactor
- `source`: Source of reaction
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp
- `deleted_at`: Deletion timestamp (null for active reactions)

### ReactionRemovingEvent / ReactionRemovedEvent

```php
readonly class ReactionRemovedEvent implements DomainEvent
{
    public function __construct(
        public Reaction $reaction  // Reaction model instance (soft-deleted)
    ) {}
}
```

**Available Properties**:
- `$reaction`: Reaction model instance (still accessible, but soft-deleted)
- All properties from `ReactionAddEvent` are available
- `deleted_at`: Contains deletion timestamp

## When to Use Events

Use events when you need to:

- **Cache Management**: Invalidate or update cached reaction data
- **Notifications**: Send notifications when reactions change
- **Analytics**: Track reaction operations for analytics
- **Audit Logging**: Log reaction changes for compliance
- **Reaction Aggregation**: Update reaction counts and summaries
- **Real-time Updates**: Broadcast reaction changes to clients
- **Spam Detection**: Detect and handle spam reactions
- **Integration**: Integrate with external services
- **Side Effects**: Perform side effects without coupling

## Related Documentation

- <Link to="/packages/laravel-reaction/deep-diving/has-reaction">HasReaction</Link>
- <Link to="/packages/laravel-reaction/deep-diving/can-react">CanReact</Link>
- <Link to="/packages/laravel-reaction/deep-diving/models/reaction">Reaction Model</Link>

