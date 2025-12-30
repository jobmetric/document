---
sidebar_position: 2
sidebar_label: ReactionRemovingEvent
---

import Link from "@docusaurus/Link";

# ReactionRemovingEvent

The `ReactionRemovingEvent` is fired before a reaction is removed (soft deleted) from a reactable model.

## Namespace

```php
JobMetric\Reaction\Events\ReactionRemovingEvent
```

## Overview

This event is dispatched before a reaction is deleted. It provides access to the reaction instance that is about to be removed, allowing you to perform cleanup operations, logging, or prevent deletion if needed.

## Event Key

```php
'reaction.removing'
```

## Properties

### Reaction

```php
public Reaction $reaction;
```

The reaction instance that is about to be removed. This contains all reaction data including reactor, reactable, reaction type, IP, device_id, and source.

## Usage

### Listening to the Event

```php
use JobMetric\Reaction\Events\ReactionRemovingEvent;
use Illuminate\Support\Facades\Event;

Event::listen(ReactionRemovingEvent::class, function (ReactionRemovingEvent $event) {
    $reaction = $event->reaction;
    
    // Log removal
    Log::info('Reaction being removed', [
        'reaction_id' => $reaction->id,
        'reaction_type' => $reaction->reaction,
        'reactable_type' => $reaction->reactable_type,
    ]);
    
    // Perform cleanup
    $this->cleanupReactionData($reaction);
});
```

### In Event Listeners

```php
use JobMetric\Reaction\Events\ReactionRemovingEvent;

class ReactionRemovingListener
{
    public function handle(ReactionRemovingEvent $event): void
    {
        $reaction = $event->reaction;
        
        // Your logic here
        $this->logRemoval($reaction);
        $this->updateAnalytics($reaction);
    }
    
    private function logRemoval(Reaction $reaction): void
    {
        ActivityLog::create([
            'action' => 'reaction_removed',
            'reaction_id' => $reaction->id,
            'reactable_type' => $reaction->reactable_type,
            'reactable_id' => $reaction->reactable_id,
        ]);
    }
    
    private function updateAnalytics(Reaction $reaction): void
    {
        Analytics::decrement("reactions.{$reaction->reactable_type}.{$reaction->reaction}");
    }
}
```

### Using Event System

Since this event implements `DomainEvent`, you can use it with the event system:

```php
use JobMetric\Reaction\Events\ReactionRemovingEvent;

// Get event definition
$definition = ReactionRemovingEvent::definition();

// Get event key
$key = ReactionRemovingEvent::key();
```

## Complete Examples

### Logging Removal

```php
use JobMetric\Reaction\Events\ReactionRemovingEvent;

Event::listen(ReactionRemovingEvent::class, function (ReactionRemovingEvent $event) {
    $reaction = $event->reaction;
    
    Log::channel('reactions')->info('Reaction removal initiated', [
        'reaction_id' => $reaction->id,
        'reaction_type' => $reaction->reaction,
        'reactor_id' => $reaction->reactor_id,
        'reactable_type' => $reaction->reactable_type,
        'reactable_id' => $reaction->reactable_id,
        'removed_at' => now(),
    ]);
});
```

### Analytics Update

```php
use JobMetric\Reaction\Events\ReactionRemovingEvent;

Event::listen(ReactionRemovingEvent::class, function (ReactionRemovingEvent $event) {
    $reaction = $event->reaction;
    
    // Update analytics before removal
    Analytics::event('reaction_removing', [
        'reaction_type' => $reaction->reaction,
        'reactable_type' => class_basename($reaction->reactable),
        'reactable_id' => $reaction->reactable_id,
        'source' => $reaction->source,
    ]);
});
```

### Cache Invalidation

```php
use JobMetric\Reaction\Events\ReactionRemovingEvent;

Event::listen(ReactionRemovingEvent::class, function (ReactionRemovingEvent $event) {
    $reaction = $event->reaction;
    
    // Invalidate reaction count cache
    $cacheKey = "reactions.{$reaction->reactable_type}.{$reaction->reactable_id}";
    Cache::forget($cacheKey);
});
```

## When to Use ReactionRemovingEvent

Use this event when you need to:

- **Logging**: Log reaction removals for audit purposes
- **Analytics**: Update analytics before reaction is removed
- **Cleanup**: Perform cleanup operations before deletion
- **Validation**: Validate or prevent removal if needed
- **Integration**: Notify external services before removal

## Related Documentation

- <Link to="/packages/laravel-reaction/deep-diving/events/reaction-add-event">ReactionAddEvent</Link>
- <Link to="/packages/laravel-reaction/deep-diving/events/reaction-removed-event">ReactionRemovedEvent</Link>
- <Link to="/packages/laravel-reaction/deep-diving/has-reaction">HasReaction</Link>

