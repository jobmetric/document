---
sidebar_position: 3
sidebar_label: StarUpdatedEvent
---

import Link from "@docusaurus/Link";

# StarUpdatedEvent

The `StarUpdatedEvent` is fired after a star rating has been updated.

## Namespace

```php
JobMetric\Star\Events\StarUpdatedEvent
```

## Event Key

```php
'star.updated'
```

## Properties

### Star

```php
public Star $star;
```

The star instance that was updated.

### Rate

```php
public int $rate;
```

The new rating value.

## Related Documentation

- <Link to="/packages/laravel-star/deep-diving/events">Events Overview</Link>
- <Link to="/packages/laravel-star/deep-diving/has-star">HasStar</Link>

