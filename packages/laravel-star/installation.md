---
sidebar_position: 2
sidebar_label: Installation
---

import Link from "@docusaurus/Link";

# Installation

## Requirements

Before installing Laravel Star, make sure you have:

- **PHP** >= 8.0.1 (8.1+ recommended)
- **Laravel** >= 9.19 (9/10/11 supported)
- **Composer**
- **jobmetric/laravel-package-core** ^1.7
- **jobmetric/laravel-event-system** ^2.7

## Install via Composer

Run the following command to pull in the latest version:

```bash
composer require jobmetric/laravel-star
```

## Service Provider

Laravel Package Auto-Discovery will automatically register the service provider. If you're using Laravel < 5.5 or have disabled auto-discovery, manually register the provider in `config/app.php`:

```php
'providers' => [
    // ...
    JobMetric\Star\StarServiceProvider::class,
],
```

## Publish Configuration

After installation, publish the configuration file:

```bash
php artisan vendor:publish --provider="JobMetric\Star\StarServiceProvider" --tag="star-config"
```

This will create a `config/star.php` file where you can customize package settings:

```php
return [
    'min_star' => 1,        // Minimum rating value
    'max_star' => 5,        // Maximum rating value
    'default_source' => 'web', // Default source identifier
    
    'tables' => [
        'star' => 'stars',  // Table name for stars
    ],
    
    'headers' => [
        'device_id' => 'X-Device-ID',  // Header name for device ID
        'source' => 'X-Source',         // Header name for source
    ],
];
```

## Publish Migrations

Publish and run the migration to create the stars table:

```bash
php artisan vendor:publish --provider="JobMetric\Star\StarServiceProvider" --tag="star-migrations"
php artisan migrate
```

## Publish Translations

If you want to customize translation files:

```bash
php artisan vendor:publish --provider="JobMetric\Star\StarServiceProvider" --tag="star-translations"
```

## Verify Installation

To verify the package is installed correctly, you can test adding a star rating:

```php
use JobMetric\Star\HasStar;
use JobMetric\Star\CanStar;

// Add traits to your models
class Product extends Model
{
    use HasStar;
}

class User extends Model
{
    use CanStar;
}

// Test
$product = Product::create(['name' => 'Test Product']);
$user = User::create(['name' => 'Test User']);

$product->addStar(5, $user);
// If no errors occurred, installation is successful!
```

## Next Steps

Now that you've installed Laravel Star, you can:

- Learn about <Link to="/packages/laravel-star/deep-diving/has-star">HasStar trait</Link>
- Explore <Link to="/packages/laravel-star/showcase">real-world examples</Link>
- Check out the <Link to="/packages/laravel-star/deep-diving/has-star">complete API reference</Link>

## Troubleshooting

### Migration Errors

If you get migration errors:

1. Make sure all dependencies are installed
2. Check that the migrations table exists
3. Run `php artisan migrate:status` to check migration status
4. Ensure database connection is configured correctly

### Trait Methods Not Found

If you get "Method not found" errors:

1. Make sure the package is properly installed via Composer
2. Run `composer dump-autoload`
3. Clear any opcode cache (OPcache) if enabled
4. Verify traits are properly imported

### Rating Validation Errors

If you get `MaxStarException` or `MinStarException`:

1. Check your configuration in `config/star.php`
2. Ensure the rating value is within the configured range
3. Verify `min_star` and `max_star` values are correct

### Events Not Firing

If events are not firing:

1. Ensure `laravel-event-system` is properly installed
2. Check that events are registered in the event system
3. Verify event listeners are properly configured

