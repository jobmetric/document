---
sidebar_position: 1
sidebar_label: HasReaction
---

import Link from "@docusaurus/Link";

# HasReaction

The `HasReaction` trait provides reaction functionality to Eloquent models. Add this trait to any model that can receive reactions (articles, posts, comments, products, etc.).

## Namespace

```php
JobMetric\Reaction\HasReaction
```

## Overview

The `HasReaction` trait enables models to receive reactions from users or devices. It provides methods to add, remove, toggle, update, and query reactions. The trait uses polymorphic relationships, making it work with any Eloquent model.

## Usage

Add the trait to your model:

```php
use JobMetric\Reaction\HasReaction;

class Article extends Model
{
    use HasReaction;
}
```

## Relationships

### Reactions

Get all reactions for the model:

```php
$article->reactions; // Collection of Reaction models
$article->reactions()->where('reaction', 'like')->get();
```

**Returns:** `MorphMany` - Relationship to Reaction model

## Available Methods

### Add Reaction

Add a reaction to the model:

```php
$article->addReaction('like', $user);
// Or with options
$article->addReaction('like', $user, [
    'ip' => '192.168.1.1',
    'device_id' => 'abc123',
    'source' => 'web',
]);

// Anonymous reaction (by device)
$article->addReaction('like', null, ['device_id' => 'abc123']);
```

**Parameters:**
- `$reaction` (`string`): The reaction type (e.g., 'like', 'dislike', 'love')
- `$reactor` (`Model|null`): The model that is reacting (e.g., User). Can be null for anonymous reactions
- `$options` (`array`): Optional array with:
  - `ip` (`string|null`): IP address (defaults to request IP)
  - `device_id` (`string|null`): Device identifier
  - `source` (`string|null`): Source platform (e.g., 'web', 'app')

**Returns:** `Reaction` - The created or updated reaction instance

**Behavior:**
- If a reaction already exists from the same reactor/device, it updates the reaction type
- If the same reaction type already exists, it returns the existing reaction
- Fires `ReactionAddEvent` when a new reaction is created

### Remove Reaction

Remove a specific reaction:

```php
$article->removeReaction('like', $user);
// Or by device
$article->removeReaction('like', null, 'abc123');
```

**Parameters:**
- `$reaction` (`string`): The reaction type to remove
- `$reactor` (`Model|null`): The reactor model (optional)
- `$device_id` (`string|null`): Device ID for anonymous reactions (optional)

**Returns:** `bool` - True if reaction was removed

**Events:**
- Fires `ReactionRemovingEvent` before deletion
- Fires `ReactionRemovedEvent` after deletion

### Toggle Reaction

Toggle a reaction (add if not exists, remove if exists):

```php
$article->toggleReaction('like', $user);
// Or with options
$article->toggleReaction('like', $user, ['device_id' => 'abc123']);
```

**Parameters:**
- `$reaction` (`string`): The reaction type
- `$reactor` (`Model|null`): The reactor model (optional)
- `$options` (`array`): Optional array with device_id, ip, source

**Returns:** `Reaction|bool` - Reaction instance if added, true if removed

### Remove All Reactions

Remove all reactions by a reactor or device:

```php
$article->removeAllReactions($user);
// Or by device
$article->removeAllReactions(null, 'abc123');
// Force delete (skip soft delete)
$article->removeAllReactions($user, null, true);
```

**Parameters:**
- `$reactor` (`Model|null`): The reactor model (optional)
- `$device_id` (`string|null`): Device ID (optional)
- `$force` (`bool`): Force delete (skip soft delete, default: false)

**Returns:** `int` - Number of reactions removed

### Update Reaction

Update reaction type from one to another:

```php
$article->updateReaction('like', 'love', $user);
// Or by device
$article->updateReaction('like', 'dislike', null, 'abc123');
```

**Parameters:**
- `$from` (`string`): Current reaction type
- `$to` (`string`): New reaction type
- `$reactor` (`Model|null`): The reactor model (optional)
- `$device_id` (`string|null`): Device ID (optional)

**Returns:** `Reaction` - The updated or newly created reaction

**Behavior:**
- If the current reaction exists, updates it to the new type
- If the current reaction doesn't exist, creates a new reaction with the new type

### Restore Reaction

Restore a soft-deleted reaction:

```php
$article->restoreReaction('like', $user);
// Or by device
$article->restoreReaction('like', null, 'abc123');
```

**Parameters:**
- `$reaction` (`string`): The reaction type
- `$reactor` (`Model|null`): The reactor model (optional)
- `$device_id` (`string|null`): Device ID (optional)

**Returns:** `bool` - True if reaction was restored

### Has Reaction

Check if a specific reaction exists:

```php
$article->hasReaction('like', $user);
// Or by device
$article->hasReaction('like', null, 'abc123');
// Include soft-deleted
$article->hasReaction('like', $user, null, true);
```

**Parameters:**
- `$reaction` (`string`): The reaction type
- `$reactor` (`Model|null`): The reactor model (optional)
- `$device_id` (`string|null`): Device ID (optional)
- `$withTrashed` (`bool`): Include soft-deleted reactions (default: false)

**Returns:** `bool` - True if reaction exists

### Total Reactions

Get total count of all reactions:

```php
$article->totalReactions();
// Include soft-deleted
$article->totalReactions(true);
```

**Parameters:**
- `$withTrashed` (`bool`): Include soft-deleted reactions (default: false)

**Returns:** `int` - Total reaction count

### Count Reactions

Count reactions of a specific type:

```php
$article->countReactions('like');
```

**Parameters:**
- `$reaction` (`string`): The reaction type

**Returns:** `int` - Count of reactions

### Reaction Summary

Get a summary of all reaction types with counts:

```php
$summary = $article->reactionSummary();
// Returns: ['like' => 10, 'love' => 5, 'dislike' => 2]

// Include soft-deleted
$summary = $article->reactionSummary(true);
```

**Parameters:**
- `$withTrashed` (`bool`): Include soft-deleted reactions (default: false)

**Returns:** `Collection<string, int>` - Map of reaction type => count

### Latest Reactions

Get the latest reactions:

```php
$reactions = $article->latestReactions(10);
// Include soft-deleted
$reactions = $article->latestReactions(10, true);
```

**Parameters:**
- `$limit` (`int`): Number of reactions to retrieve (default: 5)
- `$withTrashed` (`bool`): Include soft-deleted reactions (default: false)

**Returns:** `EloquentCollection<Reaction>` - Collection of Reaction models

### Reaction To

Get a specific reaction from a reactor:

```php
$reaction = $article->reactionTo($user);
// Returns: Reaction model or null
```

**Parameters:**
- `$reactor` (`Model`): The reactor model

**Returns:** `Reaction|null` - The reaction instance or null

## Complete Examples

### Basic Usage

```php
use JobMetric\Reaction\HasReaction;

class Article extends Model
{
    use HasReaction;
}

$article = Article::find(1);
$user = User::find(1);

// Add like reaction
$article->addReaction('like', $user);

// Check if liked
if ($article->hasReaction('like', $user)) {
    echo "User liked this article";
}

// Get like count
$likeCount = $article->countReactions('like');

// Toggle reaction
$article->toggleReaction('like', $user);

// Remove reaction
$article->removeReaction('like', $user);
```

### Multiple Reaction Types

```php
$article->addReaction('like', $user);
$article->addReaction('love', $user); // Updates previous like to love
$article->addReaction('dislike', $user); // Updates love to dislike

// Get summary
$summary = $article->reactionSummary();
// ['dislike' => 1]
```

### Anonymous Reactions

```php
// Add reaction by device (anonymous user)
$article->addReaction('like', null, ['device_id' => 'device-123']);

// Check anonymous reaction
$hasReaction = $article->hasReaction('like', null, 'device-123');

// Remove anonymous reaction
$article->removeReaction('like', null, 'device-123');
```

### Reaction Summary

```php
$article = Article::find(1);

// Get summary of all reactions
$summary = $article->reactionSummary();
// Returns: ['like' => 50, 'love' => 20, 'dislike' => 5]

// Display in view
foreach ($summary as $type => $count) {
    echo "{$type}: {$count}\n";
}
```

### Latest Reactions

```php
$article = Article::find(1);

// Get latest 10 reactions
$latest = $article->latestReactions(10);

foreach ($latest as $reaction) {
    echo "{$reaction->reactor->name} reacted with {$reaction->reaction}\n";
}
```

## When to Use HasReaction

Use the `HasReaction` trait when you need to:

- **Content Reactions**: Add reactions to articles, posts, comments, products, etc.
- **Social Features**: Implement like, dislike, love, and other reaction types
- **Engagement Tracking**: Track user engagement with content
- **Analytics**: Collect reaction data for analytics and insights
- **Anonymous Reactions**: Support reactions from non-authenticated users
- **Multiple Reaction Types**: Allow different types of reactions on the same content

## Related Documentation

- <Link to="/packages/laravel-reaction/deep-diving/can-react">CanReact</Link>
- <Link to="/packages/laravel-reaction/deep-diving/models/reaction">Reaction Model</Link>
- <Link to="/packages/laravel-reaction/deep-diving/events">Events</Link>

