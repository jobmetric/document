---
sidebar_position: 2
sidebar_label: Installation
---

# Installation

## Requirements

Before installing Laravel Event System, make sure you have:

- **PHP** >= 8.1 (8.2+ recommended)
- **Laravel** >= 9.19 (9/10/11 supported)
- **Composer**
- **JobMetric Package Core** >= 1.33 (automatically installed as dependency)

## Install via Composer

Run the following command to pull in the latest version:

```bash
composer require jobmetric/laravel-event-system
```

## Publish Configuration

After installation, publish the configuration file (optional):

```bash
php artisan vendor:publish --provider="JobMetric\EventSystem\EventSystemServiceProvider" --tag="event-system-config"
```

This will create a `config/event-system.php` file where you can customize package settings:

```php
return [
    'cache_time' => env('EVENT_SYSTEM_CACHE_TIME', 60),
    'cache_key' => env('EVENT_SYSTEM_CACHE_KEY', 'event_system_cache'),
    'tables' => [
        'event' => 'events',
    ],
];
```

## Run Migrations

**Important:** Before using the package, you must run the migrations to create the events table:

```bash
php artisan migrate
```

This will create the `events` table with the following structure:

- `id` - Primary key
- `name` - Unique name identifier for the event-listener binding
- `description` - Optional description
- `event` - Fully qualified class name of the event
- `listener` - Fully qualified class name of the listener
- `priority` - Execution priority (lower values execute earlier)
- `status` - Boolean flag to enable/disable the listener
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

## Service Provider

The package automatically registers its service provider. If you're using Laravel's package discovery (default), no manual registration is needed.

If you need to manually register the provider, add it to `config/app.php`:

```php
'providers' => [
    // ...
    JobMetric\EventSystem\EventSystemServiceProvider::class,
],
```

## Facades

The package provides facades for easy access:

- `EventSystem` - Main service facade for managing event-listener bindings
- `EventBus` - Facade for dispatching domain events

You can use them directly:

```php
use JobMetric\EventSystem\Facades\EventSystem;
use JobMetric\EventSystem\Facades\EventBus;

// Use EventSystem service
$events = EventSystem::all();

// Use EventBus
EventBus::dispatchByKey('user.registered', 123);
```

## Verify Installation

To verify the installation, you can check if the events table was created:

```bash
php artisan migrate:status
```

You should see the `events` table migration in the list.

## Quick Test

Create a simple test to verify everything works:

```php
use JobMetric\EventSystem\Facades\EventSystem;

// Register a test event
addEventSystem(
    'test.event',
    App\Events\TestEvent::class,
    App\Listeners\TestListener::class,
    description: 'Test event binding'
);

// List all events
$events = EventSystem::all();

// Check if event exists
if ($events->count() > 0) {
    echo "Installation successful!";
}
```

If this works without errors, your installation is successful!

## Next Steps

Now that you have Laravel Event System installed:

1. **[Learn EventSystem Service](/packages/laravel-event-system/deep-diving/event-system)** - Start using the core service class
2. **[Explore Domain Events](/packages/laravel-event-system/deep-diving/domain-event)** - Learn about domain event architecture
3. **[Read the Documentation](/packages/laravel-event-system/intro)** - Discover all available features

## Troubleshooting

### Migration Fails

If the migration fails, make sure:
- Your database connection is configured correctly
- You have the necessary permissions
- No conflicting table exists

### Class Not Found

If you get a "Class not found" error:
- Make sure you've run `composer install`
- Clear the autoload cache: `composer dump-autoload`
- Check that the package is listed in `composer.json`

### Events Not Registering

If events aren't being registered:
- Verify the migrations ran successfully
- Check that the event and listener classes exist
- Ensure you're using fully qualified class names

## Support

If you encounter any issues during installation:

- Check the [GitHub Issues](https://github.com/jobmetric/laravel-event-system/issues)
- Review the documentation
- Ensure you're using a supported Laravel version

