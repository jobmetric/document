---
sidebar_position: 2
sidebar_label: Installation
---

import Link from "@docusaurus/Link";

# Installation

## Requirements

Before installing Laravel Custom Field, make sure you have:

- **PHP** >= 8.0.1 (8.1+ recommended)
- **Laravel** >= 9.19 (9/10/11 supported)
- **Composer**
- **jobmetric/laravel-package-core** ^1.32

## Install via Composer

Run the following command to pull in the latest version:

```bash
composer require jobmetric/laravel-custom-field
```

## Service Provider

Laravel Package Auto-Discovery will automatically register the service provider. If you're using Laravel < 5.5 or have disabled auto-discovery, manually register the provider in `config/app.php`:

```php
'providers' => [
    // ...
    JobMetric\CustomField\CustomFieldServiceProvider::class,
],
```

## Publish Configuration

After installation, publish the configuration file (optional):

```bash
php artisan vendor:publish --provider="JobMetric\CustomField\CustomFieldServiceProvider" --tag="custom-field-config"
```

This will create a `config/custom-field.php` file where you can customize package settings.

## Verify Installation

To verify the package is installed correctly, you can test building a field:

```php
use JobMetric\CustomField\CustomFieldBuilder;

$field = CustomFieldBuilder::text()
    ->name('test')
    ->label('Test Field')
    ->build();

$html = $field->toHtml();
// If no errors occurred, installation is successful!
```

## IDE Helpers

The package automatically generates IDE helpers after installation. These helpers provide autocomplete for field builders and methods.

If you need to regenerate IDE helpers manually:

```bash
php artisan custom-field:generate-ide-helpers
```

## Next Steps

Now that you've installed Laravel Custom Field, you can:

- Learn about <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">building fields</Link>
- Explore <Link to="/packages/laravel-custom-field/showcase">real-world examples</Link>
- Check out the <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">complete API reference</Link>

## Troubleshooting

### Builder Methods Not Found

If you get "Method not found" errors:

1. Make sure the package is properly installed via Composer
2. Run `composer dump-autoload`
3. Clear any opcode cache (OPcache) if enabled
4. Regenerate IDE helpers: `php artisan custom-field:generate-ide-helpers`

### Views Not Found

If you get "View not found" errors:

1. Make sure the service provider is registered
2. Check that blade views are published (if using custom templates)
3. Verify the package views are accessible

### Assets Not Loading

If JavaScript or CSS assets aren't loading:

1. Check that asset paths are correct
2. Verify the `toHtml()` method returns proper asset paths
3. Ensure assets are included in your layout




