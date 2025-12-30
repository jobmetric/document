---
sidebar_position: 2
sidebar_label: Installation
---

import Link from "@docusaurus/Link";

# Installation

## Requirements

Before installing Laravel Language, make sure you have:

- **PHP** >= 8.2
- **Laravel** >= 9.19 (10/11/12 supported)
- **Composer**
- **jobmetric/laravel-package-core** ^1.31
- **spatie/laravel-query-builder** ^6.3
- **jobmetric/multi-calendar** ^1.2
- **jobmetric/laravel-event-system** ^2.7

## Install via Composer

Run the following command to pull in the latest version:

```bash
composer require jobmetric/laravel-language
```

## Service Provider

Laravel Package Auto-Discovery will automatically register the service provider. If you're using Laravel < 5.5 or have disabled auto-discovery, manually register the provider in `config/app.php`:

```php
'providers' => [
    // ...
    JobMetric\Language\LanguageServiceProvider::class,
],
```

## Publish Configuration

After installation, publish the configuration file:

```bash
php artisan vendor:publish --provider="JobMetric\Language\LanguageServiceProvider" --tag="language-config"
```

This will create a `config/language.php` file where you can customize package settings.

## Publish Migrations

Publish and run the migration to create the languages table:

```bash
php artisan vendor:publish --provider="JobMetric\Language\LanguageServiceProvider" --tag="language-migrations"
php artisan migrate
```

## Publish Translations

If you want to customize translation files:

```bash
php artisan vendor:publish --provider="JobMetric\Language\LanguageServiceProvider" --tag="language-translations"
```

## Publish Assets

If you want to use flag images:

```bash
php artisan vendor:publish --provider="JobMetric\Language\LanguageServiceProvider" --tag="language-assets"
```

## Verify Installation

To verify the package is installed correctly, you can test adding a language:

```php
use JobMetric\Language\Facades\Language;

// Add a language from predefined data
Language::addLanguageData('fa');

// Or create manually
$language = Language::store([
    'name' => 'English',
    'flag' => 'us',
    'locale' => 'en',
    'direction' => 'ltr',
    'calendar' => 'gregorian',
    'first_day_of_week' => 1,
    'status' => true,
]);

// If no errors occurred, installation is successful!
```

## Next Steps

Now that you've installed Laravel Language, you can:

- Learn about <Link to="/packages/laravel-language/deep-diving/language-service">Language Service</Link>
- Explore <Link to="/packages/laravel-language/showcase">real-world examples</Link>
- Check out the <Link to="/packages/laravel-language/deep-diving/language-service">complete API reference</Link>

## Troubleshooting

### Migration Errors

If you get migration errors:

1. Make sure all dependencies are installed
2. Check that the migrations table exists
3. Run `php artisan migrate:status` to check migration status
4. Ensure database connection is configured correctly

### Service Methods Not Found

If you get "Method not found" errors:

1. Make sure the package is properly installed via Composer
2. Run `composer dump-autoload`
3. Clear any opcode cache (OPcache) if enabled
4. Verify the facade is properly imported

### Validation Rule Errors

If validation rules don't work:

1. Ensure the rules are properly imported
2. Check that the language table exists and has data
3. Verify locale codes match your language data

### Events Not Firing

If events are not firing:

1. Ensure `laravel-event-system` is properly installed
2. Check that events are registered in the event system
3. Verify event listeners are properly configured

