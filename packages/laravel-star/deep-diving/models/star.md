---
sidebar_position: 1
sidebar_label: Star
---

import Link from "@docusaurus/Link";

# Star Model

The `Star` model represents a star rating given from any actor model (e.g., User, Device) to any target model (e.g., Product, Article). This model supports polymorphic relations for both the rating entity (starred_by) and the target entity (starable).

## Namespace

```php
JobMetric\Star\Models\Star
```

## Overview

The `Star` model stores all star ratings in the application. It uses polymorphic relationships to work with any Eloquent model and includes automatic IP and device tracking.

## Properties

### Starred By Type

```php
public string|null $starred_by_type;
```

The class name of the actor who gave the rating (polymorphic). Can be null for anonymous ratings.

### Starred By ID

```php
public int|null $starred_by_id;
```

The ID of the actor who gave the rating (polymorphic). Can be null for anonymous ratings.

### Starable Type

```php
public string $starable_type;
```

The class name of the target model being rated.

### Starable ID

```php
public int $starable_id;
```

The ID of the target model being rated.

### Rate

```php
public int $rate;
```

The rating value (e.g., 1-5, 0-10). Must be within the configured min_star and max_star range.

### IP

```php
public string|null $ip;
```

The IP address from which the rating was made.

### Device ID

```php
public string|null $device_id;
```

Optional device identifier for anonymous ratings.

### Source

```php
public string|null $source;
```

Optional source indicator (e.g., 'web', 'app', 'api').

## Relationships

### Starred By

Get the model that gave the rating:

```php
$star->starredBy; // User, Admin, etc. or null
```

**Returns:** `Model|null` - The starrer model or null for anonymous ratings

### Starable

Get the model that was rated:

```php
$star->starable; // Product, Article, etc.
```

**Returns:** `Model` - The starable model

## Query Scopes

### Of Starred By

Filter ratings by starrer:

```php
Star::ofStarredBy($user)->get();
```

**Parameters:**
- `$starredBy` (`Model`): The starrer model

**Returns:** `Builder` - Query builder

### Of Starable

Filter ratings by starable:

```php
Star::ofStarable($product)->get();
```

**Parameters:**
- `$starable` (`Model`): The starable model

**Returns:** `Builder` - Query builder

## Helper Methods

### Is Rated As

Check if rating equals a specific value:

```php
$star->isRatedAs(5); // true/false
```

**Parameters:**
- `$value` (`int`): The value to check

**Returns:** `bool` - True if rating equals the value

### Is Rated Above

Check if rating is above a specific value:

```php
$star->isRatedAbove(3); // true/false
```

**Parameters:**
- `$value` (`int`): The value to compare against

**Returns:** `bool` - True if rating is above the value

### Is Rated Below

Check if rating is below a specific value:

```php
$star->isRatedBelow(5); // true/false
```

**Parameters:**
- `$value` (`int`): The value to compare against

**Returns:** `bool` - True if rating is below the value

## Table Configuration

The table name can be configured in `config/star.php`:

```php
'tables' => [
    'star' => 'stars', // Default table name
],
```

## Complete Examples

### Querying Stars

```php
use JobMetric\Star\Models\Star;

// Get all ratings
$stars = Star::all();

// Get ratings by value
$fiveStars = Star::where('rate', 5)->get();

// Get ratings for a specific product
$product = Product::find(1);
$stars = Star::ofStarable($product)->get();

// Get ratings from a specific user
$user = User::find(1);
$stars = Star::ofStarredBy($user)->get();

// Get ratings with starrer and starable
$stars = Star::with(['starredBy', 'starable'])->get();
```

### Working with Star Instance

```php
$star = Star::find(1);

// Check rating value
if ($star->isRatedAs(5)) {
    echo "Perfect rating!";
}

// Compare rating
if ($star->isRatedAbove(3)) {
    echo "Above average rating";
}

if ($star->isRatedBelow(2)) {
    echo "Low rating - needs attention";
}

// Access relationships
echo "{$star->starredBy->name} rated {$star->starable->name} with {$star->rate} stars";
```

## When to Use Star Model

Use the `Star` model directly when you need to:

- **Direct Queries**: Query ratings directly without going through relationships
- **Bulk Operations**: Perform bulk operations on ratings
- **Analytics**: Analyze rating data across the application
- **Custom Logic**: Implement custom rating-related logic
- **Reporting**: Generate reports on rating activity

## Related Documentation

- <Link to="/packages/laravel-star/deep-diving/has-star">HasStar</Link>
- <Link to="/packages/laravel-star/deep-diving/can-star">CanStar</Link>
- <Link to="/packages/laravel-star/deep-diving/events">Events</Link>

