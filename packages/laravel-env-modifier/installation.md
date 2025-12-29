---
sidebar_position: 2
sidebar_label: Installation
---

import Link from "@docusaurus/Link";

# Installation

## Requirements

Before installing Laravel Env Modifier, make sure you have:

- **PHP** >= 8.0.1 (8.1+ recommended)
- **Laravel** >= 9.19 (9/10/11 supported)
- **Composer**

## Install via Composer

Run the following command to pull in the latest version:

```bash
composer require jobmetric/laravel-env-modifier
```

## Service Provider

Laravel Package Auto-Discovery will automatically register the service provider. If you're using Laravel < 5.5 or have disabled auto-discovery, manually register the provider in `config/app.php`:

```php
'providers' => [
    // ...
    JobMetric\EnvModifier\EnvModifierServiceProvider::class,
],
```

## Facade (Optional)

The facade is automatically registered via auto-discovery. If you need to register it manually, add it to `config/app.php`:

```php
'aliases' => [
    // ...
    'EnvModifier' => JobMetric\EnvModifier\Facades\EnvModifier::class,
],
```

## Helper Functions

The package automatically loads global helper functions. No additional configuration is needed. These functions are available throughout your application:

- `env_modifier_use()` - Bind to a specific `.env` file
- `env_modifier_create()` - Create a new `.env` file
- `env_modifier_get()` - Read keys from `.env` file
- `env_modifier_set()` - Set/update keys
- `env_modifier_all()` - Get all keys
- `env_modifier_has()` - Check if key exists
- `env_modifier_delete_file()` - Delete `.env` file
- `env_modifier_backup()` - Create backup
- `env_modifier_restore()` - Restore from backup
- `env_modifier_merge_from()` - Merge from another file
- And more...

## Verify Installation

To verify the package is installed correctly, you can check if the facade is available:

```php
use JobMetric\EnvModifier\Facades\EnvModifier;

// This should work without errors
$all = EnvModifier::all();
```

Or test with a helper function:

```php
// This should work without errors
$all = env_modifier_all();
```

## Quick Test

Create a simple test to ensure everything is working:

```php
use JobMetric\EnvModifier\Facades\EnvModifier as EnvMod;

// Set path to your main .env file
EnvMod::setPath(base_path('.env'));

// Read a key (this won't modify anything)
$appName = EnvMod::get('APP_NAME');

// If no errors occurred, installation is successful!
```

## Default Behavior

By default, the package will work with your application's main `.env` file located at `base_path('.env')`. You can change the target file at any time using `setPath()` or `env_modifier_use()`.

## Next Steps

Now that you've installed Laravel Env Modifier, you can:

- Learn about <Link to="/packages/laravel-env-modifier/deep-diving/env-modifier">basic usage</Link>
- Explore <Link to="/packages/laravel-env-modifier/showcase">real-world examples</Link>
- Check out the <Link to="/packages/laravel-env-modifier/deep-diving/env-modifier">complete API reference</Link>

## Troubleshooting

### Facade Not Found

If you get a "Class not found" error for the facade, make sure:

1. Auto-discovery is enabled (Laravel 5.5+)
2. Or manually register the service provider in `config/app.php`
3. Run `composer dump-autoload`

### Helper Functions Not Available

If helper functions are not available:

1. Make sure the package is properly installed via Composer
2. Run `composer dump-autoload`
3. Clear any opcode cache (OPcache) if enabled

### File Permission Issues

If you encounter permission errors when writing to `.env` files:

1. Ensure the web server has write permissions to the file
2. Check file ownership matches the web server user
3. For production, consider using deployment scripts with proper permissions

