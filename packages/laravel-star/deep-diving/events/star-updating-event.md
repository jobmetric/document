---
sidebar_position: 2
sidebar_label: StarUpdatingEvent
---

import Link from "@docusaurus/Link";

# StarUpdatingEvent

The `StarUpdatingEvent` is fired before a star rating is updated.

## Namespace

```php
JobMetric\Star\Events\StarUpdatingEvent
```

## Event Key

```php
'star.updating'
```

## Properties

### Star

```php
public Star $star;
```

The star instance that is about to be updated.

### Rate

```php
public int $rate;
```

The new rating value.

## Related Documentation

- <Link to="/packages/laravel-star/deep-diving/events">Events Overview</Link>
- <Link to="/packages/laravel-star/deep-diving/has-star">HasStar</Link>

