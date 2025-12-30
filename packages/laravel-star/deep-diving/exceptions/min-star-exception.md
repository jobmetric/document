---
sidebar_position: 2
sidebar_label: MinStarException
---

import Link from "@docusaurus/Link";

# MinStarException

The `MinStarException` is thrown when attempting to add a star rating that is below the minimum configured value.

## Namespace

```php
JobMetric\Star\Exceptions\MinStarException
```

## When It's Thrown

The exception is thrown when:
- A rating value is below the `min_star` configuration value
- Default minimum is 1, but can be configured in `config/star.php`

## Exception Details

### Message

The exception message includes the attempted rate and minimum allowed rate:

```php
trans('star::base.exceptions.min_rate', [
    'min_rate' => $minRate,
    'rate' => $rate,
])
```

### HTTP Status Code

Default HTTP status code: `400` (Bad Request)

## How to Avoid

Ensure the rating value is within the configured range:

```php
// In config/star.php
'min_star' => 1,

// Usage
$product->addStar(1, $user); // ✅ Valid
$product->addStar(0, $user); // ❌ Throws MinStarException
```

## Handling the Exception

```php
use JobMetric\Star\Exceptions\MinStarException;

try {
    $product->addStar(0, $user);
} catch (MinStarException $e) {
    return response()->json([
        'error' => $e->getMessage(),
    ], 400);
}
```

## Related Documentation

- <Link to="/packages/laravel-star/deep-diving/exceptions/max-star-exception">MaxStarException</Link>
- <Link to="/packages/laravel-star/deep-diving/has-star">HasStar</Link>

