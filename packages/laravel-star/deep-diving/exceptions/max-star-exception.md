---
sidebar_position: 1
sidebar_label: MaxStarException
---

import Link from "@docusaurus/Link";

# MaxStarException

The `MaxStarException` is thrown when attempting to add a star rating that exceeds the maximum configured value.

## Namespace

```php
JobMetric\Star\Exceptions\MaxStarException
```

## When It's Thrown

The exception is thrown when:
- A rating value exceeds the `max_star` configuration value
- Default maximum is 5, but can be configured in `config/star.php`

## Exception Details

### Message

The exception message includes the attempted rate and maximum allowed rate:

```php
trans('star::base.exceptions.max_rate', [
    'max_rate' => $maxRate,
    'rate' => $rate,
])
```

### HTTP Status Code

Default HTTP status code: `400` (Bad Request)

## How to Avoid

Ensure the rating value is within the configured range:

```php
// In config/star.php
'max_star' => 5,

// Usage
$product->addStar(5, $user); // ✅ Valid
$product->addStar(6, $user); // ❌ Throws MaxStarException
```

## Handling the Exception

```php
use JobMetric\Star\Exceptions\MaxStarException;

try {
    $product->addStar(6, $user);
} catch (MaxStarException $e) {
    return response()->json([
        'error' => $e->getMessage(),
    ], 400);
}
```

## Related Documentation

- <Link to="/packages/laravel-star/deep-diving/exceptions/min-star-exception">MinStarException</Link>
- <Link to="/packages/laravel-star/deep-diving/has-star">HasStar</Link>

