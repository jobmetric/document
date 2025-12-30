---
sidebar_position: 3
sidebar_label: InvalidStarActorException
---

import Link from "@docusaurus/Link";

# InvalidStarActorException

The `InvalidStarActorException` is thrown when attempting to create a star rating without a valid starrer or device identifier.

## Namespace

```php
JobMetric\Star\Exceptions\InvalidStarActorException
```

## When It's Thrown

The exception is thrown during star creation when:
- No starrer (user) is provided (`starred_by_type` and `starred_by_id` are both null/empty)
- No device identifier is provided (`device_id` is null/empty)
- Both conditions are true (no way to identify the source of the rating)

## Exception Details

### Message

The exception message is retrieved from the translation file:

```php
trans('star::base.exceptions.invalid_star_actor')
```

### HTTP Status Code

Default HTTP status code: `400` (Bad Request)

## How to Avoid

### Provide a Starrer

```php
$product->addStar(5, $user); // ✅ Valid - user provided
```

### Provide a Device ID

```php
$product->addStar(5, null, ['device_id' => 'device-123']); // ✅ Valid - device_id provided
```

### Invalid Usage

```php
// ❌ This will throw InvalidStarActorException
$product->addStar(5); // No starrer, no device_id
$product->addStar(5, null); // No starrer, no device_id
$product->addStar(5, null, []); // No starrer, no device_id
```

## Handling the Exception

```php
use JobMetric\Star\Exceptions\InvalidStarActorException;

try {
    $product->addStar(5);
} catch (InvalidStarActorException $e) {
    return response()->json([
        'error' => 'A starrer or device identifier is required',
    ], 400);
}
```

## Related Documentation

- <Link to="/packages/laravel-star/deep-diving/has-star">HasStar</Link>
- <Link to="/packages/laravel-star/deep-diving/models/star">Star Model</Link>

