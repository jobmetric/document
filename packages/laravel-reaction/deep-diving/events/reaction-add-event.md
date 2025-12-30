---
sidebar_position: 1
sidebar_label: ReactionAddEvent
---

import Link from "@docusaurus/Link";

# ReactionAddEvent

The `ReactionAddEvent` is fired when a new reaction is added to a reactable model.

## Namespace

```php
JobMetric\Reaction\Events\ReactionAddEvent
```

## Overview

This event is dispatched after a new reaction is successfully created. It provides access to the reaction instance, allowing you to perform additional actions like sending notifications, updating analytics, or triggering other business logic.

## Event Key

```php
'reaction.added'
```

## Properties

### Reaction

```php
public Reaction $reaction;
```

The reaction instance that was added. This contains all reaction data including reactor, reactable, reaction type, IP, device_id, and source.

## Usage

### Listening to the Event

```php
use JobMetric\Reaction\Events\ReactionAddEvent;
use Illuminate\Support\Facades\Event;

Event::listen(ReactionAddEvent::class, function (ReactionAddEvent $event) {
    $reaction = $event->reaction;
    
    // Send notification
    if ($reaction->reactor) {
        Notification::send($reaction->reactable->author, new ReactionNotification($reaction));
    }
    
    // Update analytics
    Analytics::track('reaction_added', [
        'reaction_type' => $reaction->reaction,
        'reactable_type' => $reaction->reactable_type,
    ]);
});
```

### In Event Listeners

```php
use JobMetric\Reaction\Events\ReactionAddEvent;

class ReactionAddListener
{
    public function handle(ReactionAddEvent $event): void
    {
        $reaction = $event->reaction;
        
        // Your logic here
        $this->updateReactionCount($reaction);
        $this->sendNotification($reaction);
    }
    
    private function updateReactionCount(Reaction $reaction): void
    {
        // Update cached reaction counts
        Cache::forget("reactions.{$reaction->reactable_type}.{$reaction->reactable_id}");
    }
    
    private function sendNotification(Reaction $reaction): void
    {
        // Send notification to content owner
        if ($reaction->reactable->author) {
            $reaction->reactable->author->notify(
                new NewReactionNotification($reaction)
            );
        }
    }
}
```

### Using Event System

Since this event implements `DomainEvent`, you can use it with the event system:

```php
use JobMetric\Reaction\Events\ReactionAddEvent;

// Get event definition
$definition = ReactionAddEvent::definition();

// Get event key
$key = ReactionAddEvent::key();
```

## Complete Examples

### Notification on Reaction

```php
use JobMetric\Reaction\Events\ReactionAddEvent;

Event::listen(ReactionAddEvent::class, function (ReactionAddEvent $event) {
    $reaction = $event->reaction;
    
    // Only notify for authenticated users
    if (!$reaction->reactor) {
        return;
    }
    
    // Get reactable owner
    $owner = $reaction->reactable->author ?? null;
    
    if ($owner && $owner->id !== $reaction->reactor->id) {
        $owner->notify(new ReactionAddedNotification($reaction));
    }
});
```

### Analytics Tracking

```php
use JobMetric\Reaction\Events\ReactionAddEvent;

Event::listen(ReactionAddEvent::class, function (ReactionAddEvent $event) {
    $reaction = $event->reaction;
    
    // Track reaction in analytics
    Analytics::event('reaction_added', [
        'reaction_type' => $reaction->reaction,
        'reactable_type' => class_basename($reaction->reactable),
        'reactable_id' => $reaction->reactable_id,
        'source' => $reaction->source,
        'is_anonymous' => !$reaction->reactor,
    ]);
});
```

### Cache Invalidation

```php
use JobMetric\Reaction\Events\ReactionAddEvent;

Event::listen(ReactionAddEvent::class, function (ReactionAddEvent $event) {
    $reaction = $event->reaction;
    
    // Invalidate reaction count cache
    $cacheKey = "reactions.{$reaction->reactable_type}.{$reaction->reactable_id}";
    Cache::forget($cacheKey);
    
    // Invalidate summary cache
    $summaryKey = "reaction_summary.{$reaction->reactable_type}.{$reaction->reactable_id}";
    Cache::forget($summaryKey);
});
```

## When to Use ReactionAddEvent

Use this event when you need to:

- **Notifications**: Send notifications when reactions are added
- **Analytics**: Track reaction activity for analytics
- **Cache Management**: Invalidate or update cached reaction data
- **Business Logic**: Trigger additional business logic when reactions are added
- **Integration**: Integrate with external services when reactions occur

## Related Documentation

- <Link to="/packages/laravel-reaction/deep-diving/events/reaction-removing-event">ReactionRemovingEvent</Link>
- <Link to="/packages/laravel-reaction/deep-diving/events/reaction-removed-event">ReactionRemovedEvent</Link>
- <Link to="/packages/laravel-reaction/deep-diving/has-reaction">HasReaction</Link>

