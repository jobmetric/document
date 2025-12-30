---
sidebar_position: 2
sidebar_label: CanStar
---

import Link from "@docusaurus/Link";

# CanStar

The `CanStar` trait enables a model to perform star ratings on other models that implement the `HasStar` trait. This trait is typically applied to user models or any actor that can "rate" content.

## Namespace

```php
JobMetric\Star\CanStar
```

## Overview

The `CanStar` trait provides methods for models that can give star ratings. It allows you to check rating status, get rating history, count ratings given, and manage ratings from the starrer's perspective.

## Usage

Add the trait to your model:

```php
use JobMetric\Star\CanStar;

class User extends Model
{
    use CanStar;
}
```

## Relationships

### Stars Given

Get all star ratings given by this model:

```php
$user->starsGiven; // Collection of Star models
$user->starsGiven()->where('rate', 5)->get();
```

**Returns:** `MorphMany` - Relationship to Star model

## Available Methods

### Has Starred

Check if this starrer has rated a specific starable model:

```php
$user->hasStarred($product);
```

**Parameters:**
- `$starable` (`Model`): The model being rated

**Returns:** `bool` - True if a rating exists

### Starred Rate

Get the rating value this starrer gave to a specific starable:

```php
$rate = $user->starredRate($product);
// Returns: 5 or null
```

**Parameters:**
- `$starable` (`Model`): The target model

**Returns:** `int|null` - The rating value or null

### Remove Star From

Remove a star rating from a specific starable model:

```php
$user->removeStarFrom($product);
```

**Parameters:**
- `$starable` (`Model`): The target model

**Returns:** `bool` - True if deletion was successful

### Count Star Given

Count how many times this starrer has given a specific rating value:

```php
$count = $user->countStarGiven(5);
```

**Parameters:**
- `$rate` (`int`): The rating value

**Returns:** `int` - Count of ratings

### Total Stars Given

Count the total number of star ratings this model has given:

```php
$total = $user->totalStarsGiven();
```

**Returns:** `int` - Total rating count

### Star Summary

Get a summary of all rating values and their total counts:

```php
$summary = $user->starSummary();
// Returns: [5 => 50, 4 => 30, 3 => 15, 2 => 4, 1 => 1]
```

**Returns:** `Collection<int, int>` - Map of rating value => count

### Starred Items

Get all starable items this starrer has rated:

```php
$items = $user->starredItems();
// Filter by starable class
$products = $user->starredItems(Product::class);
```

**Parameters:**
- `$starableClass` (`string|null`): Optional starable class filter

**Returns:** `Collection<Model>` - Collection of starable models

### Stars To Type

Get all star ratings this starrer made to a specific starable type:

```php
$stars = $user->starsToType(Product::class);
```

**Parameters:**
- `$starableClass` (`string`): The starable model class name

**Returns:** `Collection<Star>` - Collection of Star models

### Latest Stars Given

Get the latest star ratings made by this model:

```php
$latest = $user->latestStarsGiven(10);
```

**Parameters:**
- `$limit` (`int`): Number of ratings to retrieve (default: 5)

**Returns:** `Collection<Star>` - Collection of Star models

## Complete Examples

### Basic Usage

```php
use JobMetric\Star\CanStar;

class User extends Model
{
    use CanStar;
}

$user = User::find(1);
$product = Product::find(1);

// Check if user has rated
if ($user->hasStarred($product)) {
    echo "User has rated this product";
}

// Get user's rating
$rate = $user->starredRate($product);
if ($rate) {
    echo "User rated: {$rate} stars";
}

// Remove user's rating
$user->removeStarFrom($product);
```

### User Rating History

```php
$user = User::find(1);

// Get all products user has rated
$ratedProducts = $user->starredItems(Product::class);

// Get all items user has rated
$allRatedItems = $user->starredItems();

// Get latest ratings
$latest = $user->latestStarsGiven(20);

foreach ($latest as $star) {
    echo "Rated {$star->starable->name} with {$star->rate} stars\n";
}
```

### User Rating Statistics

```php
$user = User::find(1);

// Get rating summary
$summary = $user->starSummary();
// [5 => 100, 4 => 50, 3 => 20, 2 => 5, 1 => 2]

// Count specific rating value
$fiveStarCount = $user->countStarGiven(5);

// Total ratings given
$total = $user->totalStarsGiven();

// Display statistics
echo "Total ratings: {$total}\n";
echo "5-star ratings: {$fiveStarCount}\n";
foreach ($summary as $rate => $count) {
    echo "{$rate} stars: {$count}\n";
}
```

### Filtering Ratings

```php
$user = User::find(1);

// Get all 5-star ratings given
$fiveStarRatings = $user->starsGiven()->where('rate', 5)->get();

// Get all ratings to products
$productRatings = $user->starsToType(Product::class);

// Get all rated products
$ratedProducts = $user->starredItems(Product::class);
```

## When to Use CanStar

Use the `CanStar` trait when you need to:

- **User Ratings**: Track what users have rated
- **Rating History**: Show user's rating history
- **Rating Statistics**: Display user rating statistics
- **Content Discovery**: Find content a user has rated
- **User Profiles**: Show rating activity on user profiles
- **Analytics**: Analyze user rating patterns

## Related Documentation

- <Link to="/packages/laravel-star/deep-diving/has-star">HasStar</Link>
- <Link to="/packages/laravel-star/deep-diving/models/star">Star Model</Link>
- <Link to="/packages/laravel-star/deep-diving/events">Events</Link>

