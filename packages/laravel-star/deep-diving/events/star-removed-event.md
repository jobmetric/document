---
sidebar_position: 5
sidebar_label: StarRemovedEvent
---

import Link from "@docusaurus/Link";

# StarRemovedEvent

The `StarRemovedEvent` is fired after a star rating has been removed.

## Namespace

```php
JobMetric\Star\Events\StarRemovedEvent
```

## Event Key

```php
'star.removed'
```

## Properties

### Star

```php
public Star $star;
```

The star instance that was removed.

## Related Documentation

- <Link to="/packages/laravel-star/deep-diving/events">Events Overview</Link>
- <Link to="/packages/laravel-star/deep-diving/has-star">HasStar</Link>

