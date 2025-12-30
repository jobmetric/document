---
sidebar_position: 1
sidebar_label: StarAddEvent
---

import Link from "@docusaurus/Link";

# StarAddEvent

The `StarAddEvent` is fired when a new star rating is added to a starable model.

## Namespace

```php
JobMetric\Star\Events\StarAddEvent
```

## Event Key

```php
'star.added'
```

## Properties

### Star

```php
public Star $star;
```

The star instance that was added. This contains all rating data including starrer, starable, rate, IP, device_id, and source.

## Usage

```php
use JobMetric\Star\Events\StarAddEvent;
use Illuminate\Support\Facades\Event;

Event::listen(StarAddEvent::class, function (StarAddEvent $event) {
    $star = $event->star;
    
    // Send notification
    if ($star->starable->author) {
        $star->starable->author->notify(
            new NewRatingNotification($star)
        );
    }
    
    // Update cache
    Cache::forget("ratings.{$star->starable_type}.{$star->starable_id}");
});
```

## Related Documentation

- <Link to="/packages/laravel-star/deep-diving/events">Events Overview</Link>
- <Link to="/packages/laravel-star/deep-diving/has-star">HasStar</Link>

