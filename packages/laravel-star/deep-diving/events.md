---
sidebar_position: 5
sidebar_label: Events
---

import Link from "@docusaurus/Link";

# Events

Laravel Star provides a comprehensive event system that fires domain events for all star rating operations. These events allow you to hook into the rating lifecycle and perform additional actions when stars are added, updated, or removed.

## Overview

The event system in Laravel Star:

- **Fires automatically** during star rating operations
- **Provides Star model instances** in event payloads
- **Uses DomainEvent interface** for consistency
- **Supports event listeners** for custom logic
- **Enables event-driven architecture** for rating management

## Event Structure

All events in Laravel Star:

- Implement `JobMetric\EventSystem\Contracts\DomainEvent`
- Are `readonly` classes for immutability
- Contain the affected Star model instance
- Provide a stable `key()` method
- Include metadata via `definition()` method

### Base Event Structure

```php
readonly class StarAddEvent implements DomainEvent
{
    public function __construct(
        public Star $star
    ) {}

    public static function key(): string
    {
        return 'star.added';
    }

    public static function definition(): DomainEventDefinition
    {
        return new DomainEventDefinition(
            self::key(),
            'star::base.entity_names.star',
            'star::base.events.star_added.title',
            'star::base.events.star_added.description',
            'fas fa-star',
            ['star', 'rating', 'evaluation']
        );
    }
}
```

## Available Events

### Star Events

Events fired for Star rating operations.

| Event Class | Event Key | Description | Payload | Triggered When |
|------------|-----------|-------------|---------|----------------|
| `StarAddEvent` | `star.added` | Fired when a new star rating is added | `Star $star` | `HasStar::addStar()` |
| `StarUpdatingEvent` | `star.updating` | Fired before a star rating is updated | `Star $star, int $rate` | Before `Star::update()` |
| `StarUpdatedEvent` | `star.updated` | Fired after a star rating is updated | `Star $star, int $rate` | After `Star::update()` |
| `StarRemovingEvent` | `star.removing` | Fired before a star rating is removed | `Star $star` | Before `Star::delete()` |
| `StarRemovedEvent` | `star.removed` | Fired after a star rating is removed | `Star $star` | After `Star::delete()` |

**Namespace:** `JobMetric\Star\Events\*`

## Listening to Events

### Method 1: Event Listeners in Service Provider

Register event listeners in a service provider:

```php
namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Star\Events\StarAddEvent;
use JobMetric\Star\Events\StarUpdatedEvent;
use JobMetric\Star\Events\StarRemovedEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        StarAddEvent::class => [
            \App\Listeners\Star\LogStarCreation::class,
            \App\Listeners\Star\InvalidateStarCache::class,
            \App\Listeners\Star\NotifyStarAdded::class,
        ],
        StarUpdatedEvent::class => [
            \App\Listeners\Star\LogStarUpdate::class,
            \App\Listeners\Star\InvalidateStarCache::class,
        ],
        StarRemovedEvent::class => [
            \App\Listeners\Star\LogStarRemoval::class,
            \App\Listeners\Star\InvalidateStarCache::class,
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
use JobMetric\Star\Events\StarAddEvent;

Event::listen(StarAddEvent::class, function (StarAddEvent $event) {
    $star = $event->star;
    
    // Perform actions
    Log::info('Star rating added', [
        'star_id' => $star->id,
        'rate' => $star->rate,
        'starable_type' => $star->starable_type,
        'starable_id' => $star->starable_id,
    ]);
    
    Cache::forget("star_ratings.{$star->starable_type}.{$star->starable_id}");
});
```

### Method 3: Using Event Subscribers

Create event subscribers for multiple events:

```php
namespace App\Listeners;

use Illuminate\Events\Dispatcher;
use JobMetric\Star\Events\StarAddEvent;
use JobMetric\Star\Events\StarUpdatedEvent;
use JobMetric\Star\Events\StarRemovedEvent;

class StarEventSubscriber
{
    public function handleStarAdded(StarAddEvent $event): void
    {
        $star = $event->star;
        Log::info('Star added', [
            'star_id' => $star->id,
            'rate' => $star->rate,
            'starable' => "{$star->starable_type}:{$star->starable_id}",
        ]);
    }

    public function handleStarUpdated(StarUpdatedEvent $event): void
    {
        $star = $event->star;
        Log::info('Star updated', [
            'star_id' => $star->id,
            'old_rate' => $star->getOriginal('rate'),
            'new_rate' => $event->rate,
        ]);
    }

    public function handleStarRemoved(StarRemovedEvent $event): void
    {
        $star = $event->star;
        Log::warning('Star removed', [
            'star_id' => $star->id,
            'rate' => $star->rate,
        ]);
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            StarAddEvent::class,
            [StarEventSubscriber::class, 'handleStarAdded']
        );

        $events->listen(
            StarUpdatedEvent::class,
            [StarEventSubscriber::class, 'handleStarUpdated']
        );

        $events->listen(
            StarRemovedEvent::class,
            [StarEventSubscriber::class, 'handleStarRemoved']
        );
    }
}
```

Register the subscriber:

```php
namespace App\Providers;

use App\Listeners\StarEventSubscriber;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $subscribe = [
        StarEventSubscriber::class,
    ];
}
```

## Complete Examples

### Example 1: Cache Invalidation on Star Changes

Invalidate cache when star ratings are modified:

```php
namespace App\Listeners\Star;

use Illuminate\Support\Facades\Cache;
use JobMetric\Star\Events\StarAddEvent;
use JobMetric\Star\Events\StarUpdatedEvent;
use JobMetric\Star\Events\StarRemovedEvent;

class InvalidateStarCache
{
    public function handle(StarAddEvent|StarUpdatedEvent|StarRemovedEvent $event): void
    {
        $star = $event->star;

        // Invalidate specific starable cache
        Cache::forget("star_ratings.{$star->starable_type}.{$star->starable_id}");
        Cache::forget("star_average.{$star->starable_type}.{$star->starable_id}");
        Cache::forget("star_count.{$star->starable_type}.{$star->starable_id}");

        // Invalidate all stars cache for this starable
        Cache::tags(["starable_{$star->starable_type}_{$star->starable_id}"])->flush();
    }
}
```

### Example 2: Audit Logging

Log all star rating operations for audit trail:

```php
namespace App\Listeners\Star;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use JobMetric\Star\Events\StarAddEvent;
use JobMetric\Star\Events\StarUpdatedEvent;
use JobMetric\Star\Events\StarRemovedEvent;

class AuditStarOperations
{
    public function handleStarAdded(StarAddEvent $event): void
    {
        $this->logAudit('added', $event->star);
    }

    public function handleStarUpdated(StarUpdatedEvent $event): void
    {
        $this->logAudit('updated', $event->star, [
            'old_rate' => $event->star->getOriginal('rate'),
            'new_rate' => $event->rate,
        ]);
    }

    public function handleStarRemoved(StarRemovedEvent $event): void
    {
        $this->logAudit('removed', $event->star);
    }

    protected function logAudit(string $action, $star, array $extra = []): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => "star.{$action}",
            'model_type' => get_class($star),
            'model_id' => $star->id,
            'starable_type' => $star->starable_type,
            'starable_id' => $star->starable_id,
            'rate' => $star->rate,
            'data' => $extra,
            'ip_address' => request()->ip(),
        ]);
    }
}
```

### Example 3: Notification System

Send notifications when star ratings are added or updated:

```php
namespace App\Listeners\Star;

use App\Notifications\StarRatingAdded;
use App\Notifications\StarRatingUpdated;
use Illuminate\Support\Facades\Notification;
use JobMetric\Star\Events\StarAddEvent;
use JobMetric\Star\Events\StarUpdatedEvent;

class NotifyStarChanges
{
    public function handleStarAdded(StarAddEvent $event): void
    {
        $star = $event->star;
        $starable = $star->starable;

        // Notify starable owner if it has an author/user
        if (method_exists($starable, 'user') && $starable->user) {
            $starable->user->notify(new StarRatingAdded($star));
        }

        // Notify administrators for high ratings
        if ($star->rate >= 5) {
            $admins = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })->get();

            Notification::send($admins, new StarRatingAdded($star));
        }
    }

    public function handleStarUpdated(StarUpdatedEvent $event): void
    {
        $star = $event->star;
        $oldRate = $star->getOriginal('rate');
        $newRate = $event->rate;

        // Notify if rating significantly changed
        if (abs($oldRate - $newRate) >= 2) {
            $starable = $star->starable;
            
            if (method_exists($starable, 'user') && $starable->user) {
                $starable->user->notify(new StarRatingUpdated($star, $oldRate, $newRate));
            }
        }
    }
}
```

### Example 4: Analytics Tracking

Track star rating changes for analytics:

```php
namespace App\Listeners\Star;

use App\Services\AnalyticsService;
use JobMetric\Star\Events\StarAddEvent;
use JobMetric\Star\Events\StarUpdatedEvent;
use JobMetric\Star\Events\StarRemovedEvent;

class TrackStarAnalytics
{
    public function __construct(
        protected AnalyticsService $analytics
    ) {}

    public function handleStarAdded(StarAddEvent $event): void
    {
        $star = $event->star;
        
        $this->analytics->track('star.added', [
            'star_id' => $star->id,
            'rate' => $star->rate,
            'starable_type' => $star->starable_type,
            'starable_id' => $star->starable_id,
            'starrer_type' => $star->starrer_type,
            'starrer_id' => $star->starrer_id,
            'device_id' => $star->device_id,
            'source' => $star->source,
        ]);
    }

    public function handleStarUpdated(StarUpdatedEvent $event): void
    {
        $star = $event->star;
        
        $this->analytics->track('star.updated', [
            'star_id' => $star->id,
            'old_rate' => $star->getOriginal('rate'),
            'new_rate' => $event->rate,
            'starable_type' => $star->starable_type,
            'starable_id' => $star->starable_id,
        ]);
    }

    public function handleStarRemoved(StarRemovedEvent $event): void
    {
        $star = $event->star;
        
        $this->analytics->track('star.removed', [
            'star_id' => $star->id,
            'rate' => $star->rate,
            'starable_type' => $star->starable_type,
            'starable_id' => $star->starable_id,
        ]);
    }
}
```

### Example 5: Rating Aggregation

Update rating aggregates when stars change:

```php
namespace App\Listeners\Star;

use JobMetric\Star\Events\StarAddEvent;
use JobMetric\Star\Events\StarUpdatedEvent;
use JobMetric\Star\Events\StarRemovedEvent;

class UpdateRatingAggregates
{
    public function handleStarAdded(StarAddEvent $event): void
    {
        $this->recalculateAggregates($event->star);
    }

    public function handleStarUpdated(StarUpdatedEvent $event): void
    {
        $this->recalculateAggregates($event->star);
    }

    public function handleStarRemoved(StarRemovedEvent $event): void
    {
        $this->recalculateAggregates($event->star);
    }

    protected function recalculateAggregates($star): void
    {
        $starable = $star->starable;
        
        // Recalculate average rating
        $average = $starable->stars()->avg('rate');
        $count = $starable->stars()->count();
        
        // Update starable model if it has rating fields
        if (method_exists($starable, 'updateRating')) {
            $starable->updateRating($average, $count);
        }
        
        // Or update directly if columns exist
        if (Schema::hasColumn($starable->getTable(), 'rating_average')) {
            $starable->update([
                'rating_average' => round($average, 2),
                'rating_count' => $count,
            ]);
        }
    }
}
```

### Example 6: Real-time Updates

Send real-time updates via WebSockets or broadcasting:

```php
namespace App\Listeners\Star;

use Illuminate\Support\Facades\Broadcast;
use JobMetric\Star\Events\StarAddEvent;
use JobMetric\Star\Events\StarUpdatedEvent;
use JobMetric\Star\Events\StarRemovedEvent;

class BroadcastStarChanges
{
    public function handleStarAdded(StarAddEvent $event): void
    {
        $star = $event->star;
        
        Broadcast::channel("starable.{$star->starable_type}.{$star->starable_id}", function () {
            return true;
        })->toOthers();
        
        event(new StarRatingChanged([
            'type' => 'added',
            'star' => $star,
            'average' => $star->starable->stars()->avg('rate'),
            'count' => $star->starable->stars()->count(),
        ]));
    }

    public function handleStarUpdated(StarUpdatedEvent $event): void
    {
        $star = $event->star;
        
        event(new StarRatingChanged([
            'type' => 'updated',
            'star' => $star,
            'old_rate' => $star->getOriginal('rate'),
            'new_rate' => $event->rate,
            'average' => $star->starable->stars()->avg('rate'),
        ]));
    }

    public function handleStarRemoved(StarRemovedEvent $event): void
    {
        $star = $event->star;
        
        event(new StarRatingChanged([
            'type' => 'removed',
            'star' => $star,
            'average' => $star->starable->stars()->avg('rate'),
            'count' => $star->starable->stars()->count(),
        ]));
    }
}
```

### Example 7: Spam Detection

Detect and handle potential spam ratings:

```php
namespace App\Listeners\Star;

use App\Services\SpamDetectionService;
use JobMetric\Star\Events\StarAddEvent;
use JobMetric\Star\Events\StarUpdatingEvent;

class DetectSpamRatings
{
    public function __construct(
        protected SpamDetectionService $spamDetection
    ) {}

    public function handleStarAdded(StarAddEvent $event): void
    {
        $star = $event->star;
        
        // Check for spam patterns
        $isSpam = $this->spamDetection->check([
            'ip_address' => $star->ip_address,
            'device_id' => $star->device_id,
            'rate' => $star->rate,
            'starable_id' => $star->starable_id,
        ]);
        
        if ($isSpam) {
            // Mark as spam or delete
            $star->update(['is_spam' => true]);
            
            // Log for review
            Log::warning('Potential spam rating detected', [
                'star_id' => $star->id,
                'ip_address' => $star->ip_address,
            ]);
        }
    }

    public function handleStarUpdating(StarUpdatingEvent $event): void
    {
        $star = $event->star;
        
        // Prevent rapid rating changes (potential abuse)
        $recentChanges = $star->starable->stars()
            ->where('starrer_id', $star->starrer_id)
            ->where('updated_at', '>', now()->subMinutes(5))
            ->count();
        
        if ($recentChanges > 3) {
            Log::warning('Rapid rating changes detected', [
                'star_id' => $star->id,
                'changes' => $recentChanges,
            ]);
        }
    }
}
```

### Example 8: Complete Event Listener Setup

Complete setup for all star events:

```php
namespace App\Providers;

use App\Listeners\Star\AuditStarOperations;
use App\Listeners\Star\BroadcastStarChanges;
use App\Listeners\Star\DetectSpamRatings;
use App\Listeners\Star\InvalidateStarCache;
use App\Listeners\Star\NotifyStarChanges;
use App\Listeners\Star\TrackStarAnalytics;
use App\Listeners\Star\UpdateRatingAggregates;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Star\Events\StarAddEvent;
use JobMetric\Star\Events\StarRemovedEvent;
use JobMetric\Star\Events\StarRemovingEvent;
use JobMetric\Star\Events\StarUpdatedEvent;
use JobMetric\Star\Events\StarUpdatingEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // Star added
        StarAddEvent::class => [
            AuditStarOperations::class,
            InvalidateStarCache::class,
            NotifyStarChanges::class,
            TrackStarAnalytics::class,
            UpdateRatingAggregates::class,
            BroadcastStarChanges::class,
            DetectSpamRatings::class,
        ],

        // Star updating (before update)
        StarUpdatingEvent::class => [
            DetectSpamRatings::class,
        ],

        // Star updated (after update)
        StarUpdatedEvent::class => [
            AuditStarOperations::class,
            InvalidateStarCache::class,
            NotifyStarChanges::class,
            TrackStarAnalytics::class,
            UpdateRatingAggregates::class,
            BroadcastStarChanges::class,
        ],

        // Star removing (before deletion)
        StarRemovingEvent::class => [
            // Add any pre-deletion logic here
        ],

        // Star removed (after deletion)
        StarRemovedEvent::class => [
            AuditStarOperations::class,
            InvalidateStarCache::class,
            TrackStarAnalytics::class,
            UpdateRatingAggregates::class,
            BroadcastStarChanges::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
```

## Event Timing

### StarAddEvent

Fired **after** the star rating is saved to database:

```php
// Execution order:
// 1. Validate input
// 2. Create star record
// 3. Save to database
// 4. Fire StarAddEvent ← Event fired here
// 5. Return response
```

### StarUpdatingEvent / StarUpdatedEvent

- `StarUpdatingEvent`: Fired **before** the update operation
- `StarUpdatedEvent`: Fired **after** the update operation completes

```php
// Execution order:
// 1. Validate input
// 2. Fire StarUpdatingEvent ← Before update
// 3. Update star record
// 4. Save to database
// 5. Fire StarUpdatedEvent ← After update
// 6. Return response
```

### StarRemovingEvent / StarRemovedEvent

- `StarRemovingEvent`: Fired **before** the deletion operation
- `StarRemovedEvent`: Fired **after** the deletion operation completes

```php
// Execution order:
// 1. Fire StarRemovingEvent ← Before deletion
// 2. Delete star record
// 3. Fire StarRemovedEvent ← After deletion
// 4. Return response
```

**Important Notes**:
- The model is **saved** to database before `StarAddEvent` fires
- You can access **fresh model data** in listeners
- Database transaction is **committed** before events fire
- Events are **synchronous** by default (can be queued)
- `StarUpdatingEvent` and `StarRemovingEvent` allow you to **prevent** operations if needed

## Queued Events

You can queue events for asynchronous processing:

```php
namespace App\Listeners\Star;

use Illuminate\Contracts\Queue\ShouldQueue;
use JobMetric\Star\Events\StarAddEvent;

class ProcessStarAsync implements ShouldQueue
{
    public function handle(StarAddEvent $event): void
    {
        $star = $event->star;
        
        // Heavy processing that doesn't block the request
        $this->updateSearchIndex($star);
        $this->sendWelcomeNotifications($star);
        $this->generateAnalyticsReport($star);
    }

    protected function updateSearchIndex($star): void
    {
        // Update search index with new rating
    }

    protected function sendWelcomeNotifications($star): void
    {
        // Send notifications
    }

    protected function generateAnalyticsReport($star): void
    {
        // Generate analytics
    }
}
```

## Event Payload Details

### StarAddEvent

```php
readonly class StarAddEvent implements DomainEvent
{
    public function __construct(
        public Star $star  // Complete Star model instance
    ) {}
}
```

**Available Properties on `$star`**:
- `id`: Star ID
- `rate`: Rating value (1-5 or configured range)
- `starable_type`: Type of rated model
- `starable_id`: ID of rated model
- `starrer_type`: Type of rating entity (User, Device, etc.)
- `starrer_id`: ID of rating entity
- `device_id`: Device identifier (if anonymous)
- `ip_address`: IP address of rater
- `source`: Source of rating
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

### StarUpdatingEvent / StarUpdatedEvent

```php
readonly class StarUpdatedEvent implements DomainEvent
{
    public function __construct(
        public Star $star,  // Star model instance
        public int $rate    // New rating value
    ) {}
}
```

**Available Properties**:
- `$star`: Star model instance (with old `rate` value in `getOriginal('rate')`)
- `$rate`: New rating value being set

### StarRemovingEvent / StarRemovedEvent

```php
readonly class StarRemovedEvent implements DomainEvent
{
    public function __construct(
        public Star $star  // Star model instance (before deletion)
    ) {}
}
```

**Available Properties**:
- `$star`: Star model instance (still accessible before deletion)

## When to Use Events

Use events when you need to:

- **Cache Management**: Invalidate or update cached rating data
- **Notifications**: Send notifications when ratings change
- **Analytics**: Track rating operations for analytics
- **Audit Logging**: Log rating changes for compliance
- **Rating Aggregation**: Update average ratings and counts
- **Real-time Updates**: Broadcast rating changes to clients
- **Spam Detection**: Detect and handle spam ratings
- **Integration**: Integrate with external services
- **Side Effects**: Perform side effects without coupling

## Related Documentation

- <Link to="/packages/laravel-star/deep-diving/has-star">HasStar</Link>
- <Link to="/packages/laravel-star/deep-diving/can-star">CanStar</Link>
- <Link to="/packages/laravel-star/deep-diving/models/star">Star Model</Link>

