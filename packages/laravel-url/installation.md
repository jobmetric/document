---
sidebar_position: 2
sidebar_label: Installation
---

import Link from "@docusaurus/Link";

# Installation

This guide will walk you through installing and configuring Laravel URL in your Laravel application.

## Requirements

- PHP >= 8.1
- Laravel >= 10.0
- Database (MySQL, PostgreSQL, SQLite, or SQL Server)

## Installation Steps

### Step 1: Install via Composer

Run the following command to install the package:

```bash
composer require jobmetric/laravel-url
```

### Step 2: Publish Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=url-config
```

This will create a `config/url.php` file in your application.

### Step 3: Run Migrations

Run the migrations to create the required database tables:

```bash
php artisan migrate
```

This will create two tables:
- `slugs` - Stores slug information for models
- `urls` - Stores versioned full URL history

## Configuration

After publishing the configuration, you can customize the package behavior in `config/url.php`:

```php
return [
    'tables' => [
        'slug' => 'slugs',
        'url' => 'urls',
    ],

    'register_fallback' => env('URL_REGISTER_FALLBACK', true),

    'fallback_middleware' => [
        'web',
    ],
];
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tables.slug` | string | `'slugs'` | Table name for slugs |
| `tables.url` | string | `'urls'` | Table name for URLs |
| `register_fallback` | bool | `true` | Whether to register the fallback route |
| `fallback_middleware` | array | `['web']` | Middleware stack for fallback route |

## Next Steps

Now that you have Laravel URL installed, you can:

- <Link to="/packages/laravel-url/deep-diving/has-url">Learn about HasUrl trait</Link> - Add URL management to your models
- <Link to="/packages/laravel-url/showcase">View examples</Link> - See real-world usage examples
- <Link to="/packages/laravel-url/deep-diving/has-url">Explore the API</Link> - Complete API reference

## Troubleshooting

### Migration Errors

If you encounter migration errors, ensure:
- Your database connection is properly configured
- You have sufficient database permissions
- No conflicting table names exist

### Fallback Route Issues

If the fallback route doesn't work:
- Check that `register_fallback` is set to `true`
- Verify middleware configuration
- Ensure routes are loaded after package service provider

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl Trait</Link> - Core trait for URL management
- <Link to="/packages/laravel-url/deep-diving/url-contract">UrlContract</Link> - Interface for URL-capable models

