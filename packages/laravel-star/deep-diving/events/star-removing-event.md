---
sidebar_position: 4
sidebar_label: StarRemovingEvent
---

import Link from "@docusaurus/Link";

# StarRemovingEvent

The `StarRemovingEvent` is fired before a star rating is removed.

## Namespace

```php
JobMetric\Star\Events\StarRemovingEvent
```

## Event Key

```php
'star.removing'
```

## Properties

### Star

```php
public Star $star;
```

The star instance that is about to be removed.

## Related Documentation

- <Link to="/packages/laravel-star/deep-diving/events">Events Overview</Link>
- <Link to="/packages/laravel-star/deep-diving/has-star">HasStar</Link>

