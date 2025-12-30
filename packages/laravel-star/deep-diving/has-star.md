---
sidebar_position: 1
sidebar_label: HasStar
---

import Link from "@docusaurus/Link";

# HasStar

The `HasStar` trait provides star rating functionality to Eloquent models. Add this trait to any model that can receive star ratings (products, articles, reviews, services, etc.).

## Namespace

```php
JobMetric\Star\HasStar
```

## Overview

The `HasStar` trait enables models to receive star ratings from users or devices. It provides methods to add, remove, update, and query ratings. The trait uses polymorphic relationships, making it work with any Eloquent model.

## Usage

Add the trait to your model:

```php
use JobMetric\Star\HasStar;

class Product extends Model
{
    use HasStar;
}
```

## Relationships

### Stars

Get all star ratings for the model:

```php
$product->stars; // Collection of Star models
$product->stars()->where('rate', 5)->get();
```

**Returns:** `MorphMany` - Relationship to Star model

## Available Methods

### Add Star

Add or update a star rating:

```php
$product->addStar(5, $user);
// Or with options
$product->addStar(4, $user, [
    'ip' => '192.168.1.1',
    'device_id' => 'abc123',
    'source' => 'web',
]);

// Anonymous rating (by device)
$product->addStar(5, null, ['device_id' => 'abc123']);
```

**Parameters:**
- `$rate` (`int`): The rating value (must be within min_star and max_star config)
- `$starredBy` (`Model|null`): The model that is rating (e.g., User). Can be null for anonymous ratings
- `$options` (`array`): Optional array with:
  - `ip` (`string|null`): IP address (defaults to request IP)
  - `device_id` (`string|null`): Device identifier
  - `source` (`string|null`): Source platform (e.g., 'web', 'app')

**Returns:** `Star` - The created or updated star instance

**Behavior:**
- If a rating already exists from the same starrer/device, it updates the rating value
- If the same rating value already exists, it returns the existing star
- Validates rating is within min_star and max_star range
- Fires `StarAddEvent` when a new rating is created

**Exceptions:**
- `MinStarException`: If rating is below minimum configured value
- `MaxStarException`: If rating is above maximum configured value

### Remove Star

Remove a star rating:

```php
$product->removeStar($user);
// Or by device
$product->removeStar(null, 'abc123');
```

**Parameters:**
- `$starredBy` (`Model|null`): The starrer model (optional)
- `$device_id` (`string|null`): Device ID for anonymous ratings (optional)

**Returns:** `bool` - True if rating was removed

**Events:**
- Fires `StarRemovingEvent` before deletion
- Fires `StarRemovedEvent` after deletion

### Has Star

Check if a star rating exists:

```php
$product->hasStar($user);
// Or by device
$product->hasStar(null, 'abc123');
```

**Parameters:**
- `$starredBy` (`Model|null`): The starrer model (optional)
- `$device_id` (`string|null`): Device ID (optional)

**Returns:** `bool` - True if rating exists

### Star Count

Get total count of all star ratings:

```php
$product->starCount();
```

**Returns:** `int` - Total rating count

### Star Average

Get average of all star ratings:

```php
$product->starAvg();
// Returns: 4.3 (float)
```

**Returns:** `float` - Average rating value

### Star Summary

Get a summary of all rating values with counts:

```php
$summary = $product->starSummary();
// Returns: [5 => 10, 4 => 5, 3 => 2, 2 => 1, 1 => 0]
```

**Returns:** `Collection<int, int>` - Map of rating value => count

### Latest Stars

Get the latest star ratings:

```php
$stars = $product->latestStars(10);
```

**Parameters:**
- `$limit` (`int`): Number of ratings to retrieve (default: 5)

**Returns:** `EloquentCollection<Star>` - Collection of Star models

### Forget Stars

Remove all star ratings by a starrer or device:

```php
$product->forgetStars($user);
// Or by device
$product->forgetStars(null, 'abc123');
```

**Parameters:**
- `$starredBy` (`Model|null`): The starrer model (optional)
- `$device_id` (`string|null`): Device ID (optional)

**Returns:** `int` - Number of ratings removed

### Is Rated As

Check if rated with a specific value:

```php
$product->isRatedAs(5, $user);
// Or by device
$product->isRatedAs(4, null, 'abc123');
```

**Parameters:**
- `$rate` (`int`): The rating value to check
- `$starredBy` (`Model|null`): The starrer model (optional)
- `$device_id` (`string|null`): Device ID (optional)

**Returns:** `bool` - True if rated with the specified value

### Get Rated Value

Get the rating value given by a starrer or device:

```php
$rate = $product->getRatedValue($user);
// Returns: 5 or null
// Or by device
$rate = $product->getRatedValue(null, 'abc123');
```

**Parameters:**
- `$starredBy` (`Model|null`): The starrer model (optional)
- `$device_id` (`string|null`): Device ID (optional)

**Returns:** `int|null` - The rating value or null

### Is Rated Above

Check if rating is above a certain value:

```php
$product->isRatedAbove(3, $user);
```

**Parameters:**
- `$value` (`int`): The value to compare against
- `$starredBy` (`Model|null`): The starrer model (optional)
- `$device_id` (`string|null`): Device ID (optional)

**Returns:** `bool` - True if rating is above the value

### Is Rated Below

Check if rating is below a certain value:

```php
$product->isRatedBelow(5, $user);
```

**Parameters:**
- `$value` (`int`): The value to compare against
- `$starredBy` (`Model|null`): The starrer model (optional)
- `$device_id` (`string|null`): Device ID (optional)

**Returns:** `bool` - True if rating is below the value

## Complete Examples

### Basic Usage

```php
use JobMetric\Star\HasStar;

class Product extends Model
{
    use HasStar;
}

$product = Product::find(1);
$user = User::find(1);

// Add 5-star rating
$product->addStar(5, $user);

// Check if rated
if ($product->hasStar($user)) {
    echo "User rated this product";
}

// Get average rating
$average = $product->starAvg();

// Get rating count
$count = $product->starCount();

// Get user's rating
$userRating = $product->getRatedValue($user);

// Remove rating
$product->removeStar($user);
```

### Rating Summary

```php
$product = Product::find(1);

// Get summary of all ratings
$summary = $product->starSummary();
// Returns: [5 => 50, 4 => 30, 3 => 15, 2 => 4, 1 => 1]

// Display in view
foreach ($summary as $rate => $count) {
    echo "{$rate} stars: {$count} ratings\n";
}

// Calculate percentage
$total = $product->starCount();
foreach ($summary as $rate => $count) {
    $percentage = ($count / $total) * 100;
    echo "{$rate} stars: {$percentage}%\n";
}
```

### Latest Ratings

```php
$product = Product::find(1);

// Get latest 10 ratings
$latest = $product->latestStars(10);

foreach ($latest as $star) {
    echo "{$star->starredBy->name} rated {$star->rate} stars\n";
}
```

### Anonymous Ratings

```php
// Add rating by device (anonymous user)
$product->addStar(5, null, ['device_id' => 'device-123']);

// Check anonymous rating
$hasRating = $product->hasStar(null, 'device-123');

// Get anonymous rating value
$rating = $product->getRatedValue(null, 'device-123');

// Remove anonymous rating
$product->removeStar(null, 'device-123');
```

### Conditional Checks

```php
$product = Product::find(1);
$user = User::find(1);

// Check specific rating
if ($product->isRatedAs(5, $user)) {
    echo "User gave 5 stars";
}

// Check if rated above 3
if ($product->isRatedAbove(3, $user)) {
    echo "User rated above 3 stars";
}

// Check if rated below 5
if ($product->isRatedBelow(5, $user)) {
    echo "User rated below 5 stars";
}
```

## When to Use HasStar

Use the `HasStar` trait when you need to:

- **Product Ratings**: Add star ratings to products in e-commerce
- **Content Ratings**: Rate articles, posts, reviews, etc.
- **Service Ratings**: Rate services, restaurants, hotels
- **Quality Assessment**: Track quality ratings for any content
- **Analytics**: Collect rating data for analytics and insights
- **Anonymous Ratings**: Support ratings from non-authenticated users
- **Flexible Rating Scales**: Use any rating scale (1-5, 0-10, etc.)

## Related Documentation

- <Link to="/packages/laravel-star/deep-diving/can-star">CanStar</Link>
- <Link to="/packages/laravel-star/deep-diving/models/star">Star Model</Link>
- <Link to="/packages/laravel-star/deep-diving/events">Events</Link>

