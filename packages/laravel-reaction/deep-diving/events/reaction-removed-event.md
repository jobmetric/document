---
sidebar_position: 3
sidebar_label: ReactionRemovedEvent
---

import Link from "@docusaurus/Link";

# ReactionRemovedEvent

The `ReactionRemovedEvent` is fired after a reaction has been removed (soft deleted) from a reactable model.

## Namespace

```php
JobMetric\Reaction\Events\ReactionRemovedEvent
```

## Overview

This event is dispatched after a reaction is successfully deleted. It provides access to the reaction instance that was removed, allowing you to perform post-deletion operations like updating caches, sending notifications, or updating analytics.

## Event Key

```php
'reaction.removed'
```

## Properties

### Reaction

```php
public Reaction $reaction;
```

The reaction instance that was removed. This contains all reaction data including reactor, reactable, reaction type, IP, device_id, and source. Note that the reaction is soft-deleted, so it may still exist in the database.

## Usage

### Listening to the Event

```php
use JobMetric\Reaction\Events\ReactionRemovedEvent;
use Illuminate\Support\Facades\Event;

Event::listen(ReactionRemovedEvent::class, function (ReactionRemovedEvent $event) {
    $reaction = $event->reaction;
    
    // Update cache
    Cache::forget("reactions.{$reaction->reactable_type}.{$reaction->reactable_id}");
    
    // Send notification
    if ($reaction->reactor) {
        Notification::send($reaction->reactable->author, new ReactionRemovedNotification($reaction));
    }
});
```

### In Event Listeners

```php
use JobMetric\Reaction\Events\ReactionRemovedEvent;

class ReactionRemovedListener
{
    public function handle(ReactionRemovedEvent $event): void
    {
        $reaction = $event->reaction;
        
        // Your logic here
        $this->updateCache($reaction);
        $this->updateAnalytics($reaction);
    }
    
    private function updateCache(Reaction $reaction): void
    {
        // Invalidate reaction count cache
        $cacheKey = "reactions.{$reaction->reactable_type}.{$reaction->reactable_id}";
        Cache::forget($cacheKey);
        
        // Invalidate summary cache
        $summaryKey = "reaction_summary.{$reaction->reactable_type}.{$reaction->reactable_id}";
        Cache::forget($summaryKey);
    }
    
    private function updateAnalytics(Reaction $reaction): void
    {
        Analytics::event('reaction_removed', [
            'reaction_type' => $reaction->reaction,
            'reactable_type' => class_basename($reaction->reactable),
            'reactable_id' => $reaction->reactable_id,
        ]);
    }
}
```

### Using Event System

Since this event implements `DomainEvent`, you can use it with the event system:

```php
use JobMetric\Reaction\Events\ReactionRemovedEvent;

// Get event definition
$definition = ReactionRemovedEvent::definition();

// Get event key
$key = ReactionRemovedEvent::key();
```

## Complete Examples

### Cache Invalidation

```php
use JobMetric\Reaction\Events\ReactionRemovedEvent;

Event::listen(ReactionRemovedEvent::class, function (ReactionRemovedEvent $event) {
    $reaction = $event->reaction;
    
    // Invalidate all related caches
    $reactable = $reaction->reactable;
    
    Cache::forget("reactions.{$reaction->reactable_type}.{$reaction->reactable_id}");
    Cache::forget("reaction_summary.{$reaction->reactable_type}.{$reaction->reactable_id}");
    
    // If reactor exists, invalidate their reaction cache
    if ($reaction->reactor) {
        Cache::forget("user_reactions.{$reaction->reactor_id}");
    }
});
```

### Notification on Removal

```php
use JobMetric\Reaction\Events\ReactionRemovedEvent;

Event::listen(ReactionRemovedEvent::class, function (ReactionRemovedEvent $event) {
    $reaction = $event->reaction;
    
    // Only notify for authenticated users
    if (!$reaction->reactor) {
        return;
    }
    
    // Get reactable owner
    $owner = $reaction->reactable->author ?? null;
    
    if ($owner && $owner->id !== $reaction->reactor->id) {
        $owner->notify(new ReactionRemovedNotification($reaction));
    }
});
```

### Analytics Tracking

```php
use JobMetric\Reaction\Events\ReactionRemovedEvent;

Event::listen(ReactionRemovedEvent::class, function (ReactionRemovedEvent $event) {
    $reaction = $event->reaction;
    
    // Track reaction removal in analytics
    Analytics::event('reaction_removed', [
        'reaction_type' => $reaction->reaction,
        'reactable_type' => class_basename($reaction->reactable),
        'reactable_id' => $reaction->reactable_id,
        'source' => $reaction->source,
        'is_anonymous' => !$reaction->reactor,
        'removed_at' => now(),
    ]);
});
```

## When to Use ReactionRemovedEvent

Use this event when you need to:

- **Cache Management**: Invalidate or update cached reaction data after removal
- **Notifications**: Send notifications when reactions are removed
- **Analytics**: Track reaction removals for analytics
- **Business Logic**: Trigger additional business logic after reactions are removed
- **Integration**: Integrate with external services after removal

## Related Documentation

- <Link to="/packages/laravel-reaction/deep-diving/events/reaction-add-event">ReactionAddEvent</Link>
- <Link to="/packages/laravel-reaction/deep-diving/events/reaction-removing-event">ReactionRemovingEvent</Link>
- <Link to="/packages/laravel-reaction/deep-diving/has-reaction">HasReaction</Link>

