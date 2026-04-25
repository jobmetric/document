---
sidebar_position: 2
sidebar_label: Installation
---

# Installation

## Requirements

Before installing Laravel Package Core, make sure you have:

- PHP >= 8.0.1
- Laravel >= 9.19
- Composer

## Install via Composer

Run the following command:

```bash
composer require jobmetric/laravel-package-core
```

## Autoloaded Helpers

This package autoloads `src/helpers.php` automatically via Composer files autoload.  
After installation, run:

```bash
composer dump-autoload
```

## Next Steps

After installation, continue with:

- [Showcase](/packages/laravel-package-core/showcase) for practical examples
- [Package Core Service Provider](/packages/laravel-package-core/deep-diving/package-core-service-provider)
- [AbstractCrudService](/packages/laravel-package-core/deep-diving/abstract-crud-service)
- [ResourceResolveEvent](/packages/laravel-package-core/deep-diving/resource-resolve-event)
