---
sidebar_position: 2
sidebar_label: Installation
---

import Link from "@docusaurus/Link";

# Installation

## Requirements

Before installing Laravel Metadata, make sure you have:

- **PHP** >= 8.0.1 (8.1+ recommended)
- **Laravel** >= 9.19 (9/10/11 supported)
- **Composer**
- **jobmetric/laravel-package-core** ^1.22
- **jobmetric/laravel-event-system** ^2.7

## Install via Composer

Run the following command to pull in the latest version:

```bash
composer require jobmetric/laravel-metadata
```

## Service Provider

Laravel Package Auto-Discovery will automatically register the service provider. If you're using Laravel < 5.5 or have disabled auto-discovery, manually register the provider in `config/app.php`:

```php
'providers' => [
    // ...
    JobMetric\Metadata\MetadataServiceProvider::class,
],
```

## Publish Configuration

After installation, publish the configuration file (optional):

```bash
php artisan vendor:publish --provider="JobMetric\Metadata\MetadataServiceProvider" --tag="metadata-config"
```

This will create a `config/metadata.php` file where you can customize package settings.

## Run Migrations

**Important:** Before using the package, you must run the migrations to create the `metas` table:

```bash
php artisan migrate
```

This will create the `metas` table with the following structure:

- `id` - Primary key
- `metaable_type` - Model class name (polymorphic)
- `metaable_id` - Model ID (polymorphic)
- `key` - Metadata key (indexed)
- `value` - Metadata value (text, nullable)
- `is_json` - Boolean flag indicating if value is JSON
- `created_at` - Timestamp
- `updated_at` - Timestamp
- Unique index on `(metaable_type, metaable_id, key)`

## Verify Installation

To verify the package is installed correctly, you can check if the trait is available:

```php
use JobMetric\Metadata\HasMeta;

class TestModel extends Model
{
    use HasMeta;
}

// This should work without errors
$model = new TestModel();
```

## Quick Test

Create a simple test to ensure everything is working:

```php
use JobMetric\Metadata\HasMeta;

class Product extends Model
{
    use HasMeta;
}

// Create a product
$product = Product::create(['name' => 'Test Product']);

// Store metadata
$product->storeMetadata('color', 'red');

// Retrieve metadata
$color = $product->getMetadata('color');
// => 'red'

// If no errors occurred, installation is successful!
```

## Configuration

The package configuration file (`config/metadata.php`) allows you to customize:

- **Table Name**: Change the default `metas` table name
- **Other Settings**: Additional package-specific configurations

Example configuration:

```php
return [
    'tables' => [
        'meta' => 'metas',
    ],
];
```

## Next Steps

Now that you've installed Laravel Metadata, you can:

- Learn about <Link to="/packages/laravel-metadata/deep-diving/has-meta">using the HasMeta trait</Link>
- Explore <Link to="/packages/laravel-metadata/showcase">real-world examples</Link>
- Check out the <Link to="/packages/laravel-metadata/deep-diving/has-meta">complete API reference</Link>

## Troubleshooting

### Migration Errors

If you encounter migration errors:

1. Make sure you've run `composer require jobmetric/laravel-metadata`
2. Check that all dependencies are installed
3. Run `php artisan migrate:fresh` if needed (warning: this will drop all tables)

### Trait Not Found

If you get a "Trait not found" error:

1. Make sure the package is properly installed via Composer
2. Run `composer dump-autoload`
3. Clear any opcode cache (OPcache) if enabled

### Event System Not Working

If events are not firing:

1. Ensure `jobmetric/laravel-event-system` is installed
2. Check that event listeners are registered
3. Verify the event system is properly configured

