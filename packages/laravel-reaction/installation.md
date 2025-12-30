---
sidebar_position: 2
sidebar_label: Installation
---

import Link from "@docusaurus/Link";

# Installation

## Requirements

Before installing Laravel Reaction, make sure you have:

- **PHP** >= 8.0.1 (8.1+ recommended)
- **Laravel** >= 9.19 (9/10/11 supported)
- **Composer**
- **jobmetric/laravel-package-core** ^1.20
- **jobmetric/laravel-event-system** ^2.7

## Install via Composer

Run the following command to pull in the latest version:

```bash
composer require jobmetric/laravel-reaction
```

## Service Provider

Laravel Package Auto-Discovery will automatically register the service provider. If you're using Laravel < 5.5 or have disabled auto-discovery, manually register the provider in `config/app.php`:

```php
'providers' => [
    // ...
    JobMetric\Reaction\ReactionServiceProvider::class,
],
```

## Publish Configuration

After installation, publish the configuration file:

```bash
php artisan vendor:publish --provider="JobMetric\Reaction\ReactionServiceProvider" --tag="reaction-config"
```

This will create a `config/reaction.php` file where you can customize package settings.

## Publish Migrations

Publish and run the migration to create the reactions table:

```bash
php artisan vendor:publish --provider="JobMetric\Reaction\ReactionServiceProvider" --tag="reaction-migrations"
php artisan migrate
```

## Publish Translations

If you want to customize translation files:

```bash
php artisan vendor:publish --provider="JobMetric\Reaction\ReactionServiceProvider" --tag="reaction-translations"
```

## Verify Installation

To verify the package is installed correctly, you can test adding a reaction:

```php
use JobMetric\Reaction\HasReaction;
use JobMetric\Reaction\CanReact;

// Add traits to your models
class Article extends Model
{
    use HasReaction;
}

class User extends Model
{
    use CanReact;
}

// Test
$article = Article::create(['title' => 'Test']);
$user = User::create(['name' => 'Test User']);

$article->addReaction('like', $user);
// If no errors occurred, installation is successful!
```

## Next Steps

Now that you've installed Laravel Reaction, you can:

- Learn about <Link to="/packages/laravel-reaction/deep-diving/has-reaction">HasReaction trait</Link>
- Explore <Link to="/packages/laravel-reaction/showcase">real-world examples</Link>
- Check out the <Link to="/packages/laravel-reaction/deep-diving/has-reaction">complete API reference</Link>

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

### Events Not Firing

If events are not firing:

1. Ensure `laravel-event-system` is properly installed
2. Check that events are registered in the event system
3. Verify event listeners are properly configured

