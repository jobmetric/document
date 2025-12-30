---
sidebar_position: 2
sidebar_label: CanReact
---

import Link from "@docusaurus/Link";

# CanReact

The `CanReact` trait enables a model to perform reactions on other models that implement the `HasReaction` trait. This trait is typically applied to user models or any actor that can "react" to content.

## Namespace

```php
JobMetric\Reaction\CanReact
```

## Overview

The `CanReact` trait provides methods for models that can give reactions. It allows you to check reaction status, get reaction history, count reactions given, and manage reactions from the reactor's perspective.

## Usage

Add the trait to your model:

```php
use JobMetric\Reaction\CanReact;

class User extends Model
{
    use CanReact;
}
```

## Relationships

### Reactions Given

Get all reactions given by this model:

```php
$user->reactionsGiven; // Collection of Reaction models
$user->reactionsGiven()->where('reaction', 'like')->get();
```

**Returns:** `MorphMany` - Relationship to Reaction model

## Available Methods

### Has Reacted To

Check if this reactor has reacted to a specific reactable model:

```php
$user->hasReactedTo($article);
// Check specific reaction type
$user->hasReactedTo($article, 'like');
```

**Parameters:**
- `$reactable` (`Model`): The model being reacted to
- `$reaction` (`string|null`): Optional reaction type to filter

**Returns:** `bool` - True if a reaction exists

### Reacted With To

Check if this reactor has reacted with a specific reaction type:

```php
$user->reactedWithTo('like', $article);
```

**Parameters:**
- `$reaction` (`string`): The reaction type (e.g., 'like', 'love')
- `$reactable` (`Model`): The target model

**Returns:** `bool` - True if the specific reaction exists

### Reaction To

Get the reaction this reactor made to a specific reactable:

```php
$reaction = $user->reactionTo($article);
// Returns: Reaction model or null
```

**Parameters:**
- `$reactable` (`Model`): The target model

**Returns:** `Reaction|null` - The reaction instance or null

### Remove Reaction From

Remove a reaction from a specific reactable model:

```php
$user->removeReactionFrom($article);
```

**Parameters:**
- `$reactable` (`Model`): The target model

**Returns:** `bool` - True if deletion was successful

### Count Reaction Made

Count how many times this reactor has used a specific reaction type:

```php
$count = $user->countReactionMade('like');
```

**Parameters:**
- `$reaction` (`string`): The reaction type

**Returns:** `int` - Count of reactions

### Total Reactions Given

Count the total number of reactions this model has made:

```php
$total = $user->totalReactionsGiven();
```

**Returns:** `int` - Total reaction count

### Reaction Summary

Get a summary of all reaction types and their total counts:

```php
$summary = $user->reactionSummary();
// Returns: ['like' => 50, 'love' => 20, 'dislike' => 5]
```

**Returns:** `Collection<string, int>` - Map of reaction type => count

### Reacted Items

Get all reactable items this reactor has reacted to:

```php
$items = $user->reactedItems();
// Filter by reaction type
$likedItems = $user->reactedItems('like');
// Filter by reactable class
$articles = $user->reactedItems('like', Article::class);
```

**Parameters:**
- `$reaction` (`string|null`): Optional reaction type filter
- `$reactableClass` (`string|null`): Optional reactable class filter

**Returns:** `Collection<Model>` - Collection of reactable models

### Reactions To Type

Get all reactions this reactor made to a specific reactable type:

```php
$reactions = $user->reactionsToType(Article::class);
```

**Parameters:**
- `$reactableClass` (`string`): The reactable model class name

**Returns:** `Collection<Reaction>` - Collection of Reaction models

### Latest Reactions Given

Get the latest reactions made by this model:

```php
$latest = $user->latestReactionsGiven(10);
```

**Parameters:**
- `$limit` (`int`): Number of reactions to retrieve (default: 5)

**Returns:** `Collection<Reaction>` - Collection of Reaction models

## Complete Examples

### Basic Usage

```php
use JobMetric\Reaction\CanReact;

class User extends Model
{
    use CanReact;
}

$user = User::find(1);
$article = Article::find(1);

// Check if user has reacted
if ($user->hasReactedTo($article)) {
    echo "User has reacted to this article";
}

// Check specific reaction
if ($user->reactedWithTo('like', $article)) {
    echo "User liked this article";
}

// Get user's reaction
$reaction = $user->reactionTo($article);
if ($reaction) {
    echo "User reacted with: {$reaction->reaction}";
}
```

### User Reaction History

```php
$user = User::find(1);

// Get all articles user has liked
$likedArticles = $user->reactedItems('like', Article::class);

// Get all items user has reacted to
$allReactedItems = $user->reactedItems();

// Get latest reactions
$latest = $user->latestReactionsGiven(20);

foreach ($latest as $reaction) {
    echo "Reacted to {$reaction->reactable->title} with {$reaction->reaction}\n";
}
```

### User Reaction Statistics

```php
$user = User::find(1);

// Get reaction summary
$summary = $user->reactionSummary();
// ['like' => 100, 'love' => 50, 'dislike' => 5]

// Count specific reaction type
$likeCount = $user->countReactionMade('like');

// Total reactions given
$total = $user->totalReactionsGiven();

// Display statistics
echo "Total reactions: {$total}\n";
echo "Likes: {$likeCount}\n";
foreach ($summary as $type => $count) {
    echo "{$type}: {$count}\n";
}
```

### Filtering Reactions

```php
$user = User::find(1);

// Get all liked articles
$likedArticles = $user->reactedItems('like', Article::class);

// Get all reactions to articles
$articleReactions = $user->reactionsToType(Article::class);

// Get all liked posts
$likedPosts = $user->reactedItems('like', Post::class);
```

## When to Use CanReact

Use the `CanReact` trait when you need to:

- **User Reactions**: Track what users have reacted to
- **Reaction History**: Show user's reaction history
- **Reaction Statistics**: Display user reaction statistics
- **Content Discovery**: Find content a user has reacted to
- **User Profiles**: Show reaction activity on user profiles
- **Analytics**: Analyze user reaction patterns

## Related Documentation

- <Link to="/packages/laravel-reaction/deep-diving/has-reaction">HasReaction</Link>
- <Link to="/packages/laravel-reaction/deep-diving/models/reaction">Reaction Model</Link>
- <Link to="/packages/laravel-reaction/deep-diving/events">Events</Link>

