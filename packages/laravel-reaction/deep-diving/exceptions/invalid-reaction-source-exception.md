---
sidebar_position: 1
sidebar_label: InvalidReactionSourceException
---

import Link from "@docusaurus/Link";

# InvalidReactionSourceException

The `InvalidReactionSourceException` is thrown when attempting to create a reaction without a valid reactor or device identifier.

## Namespace

```php
JobMetric\Reaction\Exceptions\InvalidReactionSourceException
```

## Overview

This exception is thrown during reaction creation when neither a reactor (user) nor a device_id is provided. Reactions must have at least one identifier to track who or what made the reaction.

## When It's Thrown

The exception is thrown in the `Reaction` model's `creating` event when:

- No reactor (user) is provided (`reactor_type` and `reactor_id` are both null/empty)
- No device identifier is provided (`device_id` is null/empty)
- Both conditions are true (no way to identify the source of the reaction)

## Exception Details

### Message

The exception message is retrieved from the translation file:

```php
trans('reaction::base.exceptions.invalid_reaction_source')
```

### HTTP Status Code

Default HTTP status code: `400` (Bad Request)

## How to Avoid

### Provide a Reactor

```php
$article->addReaction('like', $user); // ✅ Valid - user provided
```

### Provide a Device ID

```php
$article->addReaction('like', null, ['device_id' => 'device-123']); // ✅ Valid - device_id provided
```

### Invalid Usage

```php
// ❌ This will throw InvalidReactionSourceException
$article->addReaction('like'); // No reactor, no device_id
$article->addReaction('like', null); // No reactor, no device_id
$article->addReaction('like', null, []); // No reactor, no device_id
```

## Handling the Exception

### Try-Catch Block

```php
use JobMetric\Reaction\Exceptions\InvalidReactionSourceException;

try {
    $article->addReaction('like');
} catch (InvalidReactionSourceException $e) {
    // Handle the exception
    return response()->json([
        'error' => 'A reactor or device identifier is required',
    ], 400);
}
```

### In Controllers

```php
use JobMetric\Reaction\Exceptions\InvalidReactionSourceException;

public function like(Article $article)
{
    try {
        $user = auth()->user();
        $deviceId = request()->header('X-Device-ID');
        
        if ($user) {
            $article->addReaction('like', $user);
        } elseif ($deviceId) {
            $article->addReaction('like', null, ['device_id' => $deviceId]);
        } else {
            throw new InvalidReactionSourceException();
        }
        
        return response()->json(['success' => true]);
    } catch (InvalidReactionSourceException $e) {
        return response()->json([
            'error' => $e->getMessage(),
        ], 400);
    }
}
```

### Global Exception Handler

```php
use JobMetric\Reaction\Exceptions\InvalidReactionSourceException;

public function register(): void
{
    $this->renderable(function (InvalidReactionSourceException $e, $request) {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'A reactor or device identifier is required to add a reaction',
            ], 400);
        }
        
        return redirect()->back()->with('error', $e->getMessage());
    });
}
```

## Complete Examples

### Safe Reaction Addition

```php
public function react(Article $article, string $reaction)
{
    $user = auth()->user();
    $deviceId = request()->header('X-Device-ID');
    
    try {
        if ($user) {
            $article->addReaction($reaction, $user);
        } elseif ($deviceId) {
            $article->addReaction($reaction, null, ['device_id' => $deviceId]);
        } else {
            throw new InvalidReactionSourceException();
        }
        
        return response()->json(['success' => true]);
    } catch (InvalidReactionSourceException $e) {
        return response()->json([
            'error' => 'Please log in or provide a device identifier',
        ], 400);
    }
}
```

### Middleware for Device ID

```php
class EnsureDeviceId
{
    public function handle($request, Closure $next)
    {
        if (!auth()->check() && !$request->header('X-Device-ID')) {
            return response()->json([
                'error' => 'Device identifier required for anonymous reactions',
            ], 400);
        }
        
        return $next($request);
    }
}
```

## When to Use

This exception helps ensure data integrity by requiring that every reaction has a source identifier. Use it to:

- **Validate Input**: Ensure reactions always have a source
- **Data Integrity**: Prevent orphaned reactions without identifiers
- **Security**: Ensure proper tracking of reaction sources
- **Analytics**: Ensure all reactions can be tracked and analyzed

## Related Documentation

- <Link to="/packages/laravel-reaction/deep-diving/has-reaction">HasReaction</Link>
- <Link to="/packages/laravel-reaction/deep-diving/models/reaction">Reaction Model</Link>

