---
sidebar_position: 1
sidebar_label: Reaction
---

import Link from "@docusaurus/Link";

# Reaction Model

The `Reaction` model represents a user's or device's reaction (like, dislike, love, etc.) on any reactable model. This model supports polymorphic relations for both the reacting entity (reactor) and the target entity (reactable).

## Namespace

```php
JobMetric\Reaction\Models\Reaction
```

## Overview

The `Reaction` model stores all reactions in the application. It uses polymorphic relationships to work with any Eloquent model, supports soft deletes, and includes automatic pruning capabilities.

## Properties

### Reactor Type

```php
public string|null $reactor_type;
```

The class name of the reacting user (polymorphic). Can be null for anonymous reactions.

### Reactor ID

```php
public int|null $reactor_id;
```

The ID of the reacting user (polymorphic). Can be null for anonymous reactions.

### Reactable Type

```php
public string $reactable_type;
```

The class name of the target model being reacted to.

### Reactable ID

```php
public int $reactable_id;
```

The ID of the target model being reacted to.

### Reaction

```php
public string $reaction;
```

The type of reaction (e.g., 'like', 'dislike', 'love', 'angry', 'sad').

### IP

```php
public string|null $ip;
```

The IP address from which the reaction was made.

### Device ID

```php
public string|null $device_id;
```

Optional device identifier for anonymous reactions.

### Source

```php
public string|null $source;
```

Optional source indicator (e.g., 'web', 'app', 'api').

## Relationships

### Reactor

Get the model that made the reaction:

```php
$reaction->reactor; // User, Admin, etc. or null
```

**Returns:** `Model|null` - The reactor model or null for anonymous reactions

### Reactable

Get the model that was reacted to:

```php
$reaction->reactable; // Article, Post, Comment, etc.
```

**Returns:** `Model` - The reactable model

## Query Scopes

### Of Reactor

Filter reactions by reactor:

```php
Reaction::ofReactor($user)->get();
```

**Parameters:**
- `$reactor` (`Model`): The reactor model

**Returns:** `Builder` - Query builder

### Of Reactable

Filter reactions by reactable:

```php
Reaction::ofReactable($article)->get();
```

**Parameters:**
- `$reactable` (`Model`): The reactable model

**Returns:** `Builder` - Query builder

## Soft Deletes

The model uses soft deletes:

```php
$reaction->delete(); // Soft delete
$reaction->restore(); // Restore
$reaction->forceDelete(); // Permanent delete
```

## Pruning

The model supports automatic pruning of old soft-deleted reactions:

```php
// Configure in config/reaction.php
'reaction' => [
    'prune_days' => 30, // Days to keep soft-deleted reactions
],

// Run pruning
php artisan model:prune
```

## Table Configuration

The table name can be configured in `config/reaction.php`:

```php
'tables' => [
    'reaction' => 'reactions', // Default table name
],
```

## Complete Examples

### Querying Reactions

```php
use JobMetric\Reaction\Models\Reaction;

// Get all reactions
$reactions = Reaction::all();

// Get reactions by type
$likes = Reaction::where('reaction', 'like')->get();

// Get reactions for a specific article
$article = Article::find(1);
$reactions = Reaction::ofReactable($article)->get();

// Get reactions from a specific user
$user = User::find(1);
$reactions = Reaction::ofReactor($user)->get();

// Get reactions with reactor and reactable
$reactions = Reaction::with(['reactor', 'reactable'])->get();
```

### Working with Soft Deletes

```php
$reaction = Reaction::find(1);

// Soft delete
$reaction->delete();

// Restore
$reaction->restore();

// Check if trashed
if ($reaction->trashed()) {
    // Reaction is soft-deleted
}

// Get only trashed
$trashed = Reaction::onlyTrashed()->get();

// Get with trashed
$all = Reaction::withTrashed()->get();
```

## When to Use Reaction Model

Use the `Reaction` model directly when you need to:

- **Direct Queries**: Query reactions directly without going through relationships
- **Bulk Operations**: Perform bulk operations on reactions
- **Analytics**: Analyze reaction data across the application
- **Custom Logic**: Implement custom reaction-related logic
- **Reporting**: Generate reports on reaction activity

## Related Documentation

- <Link to="/packages/laravel-reaction/deep-diving/has-reaction">HasReaction</Link>
- <Link to="/packages/laravel-reaction/deep-diving/can-react">CanReact</Link>
- <Link to="/packages/laravel-reaction/deep-diving/events">Events</Link>

