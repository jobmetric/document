---
sidebar_position: 2
sidebar_label: Installation
---

# Installation

## Requirements

Before installing Rolix, make sure you have:

- **PHP** >= 8.0.1 (8.1+ recommended)
- **Laravel** >= 9.19 (9/10/11 supported)
- **Composer**
- **JobMetric Package Core** >= 1.35 (automatically installed as dependency)
- **JobMetric Event System** >= 2.7 (automatically installed as dependency)

## Install via Composer

```bash
composer require jobmetric/rolix
```

## Publish Configuration

```bash
php artisan vendor:publish --provider="JobMetric\Rolix\RolixServiceProvider" --tag="rolix-config"
```

This creates `config/rolix.php` with table names, cache settings, and default role types:

```php
return [
    'tables' => [
        'role' => 'roles',
        'role_path' => 'role_paths',
        'membership' => 'memberships',
        'role_rule' => 'role_rules',
        'role_activity_log' => 'role_activity_logs',
    ],

    'cache' => [
        'enabled' => env('ROLIX_CACHE_ENABLED', true),
        'ttl' => env('ROLIX_CACHE_TTL', 60),
        'store' => env('ROLIX_CACHE_STORE', null),
        'prefix' => env('ROLIX_CACHE_PREFIX', 'rolix'),
    ],

    'types' => [
        'system' => [
            'label' => 'rolix::base.types.system.label',
            'description' => 'rolix::base.types.system.description',
            'hierarchical' => true,
        ],
    ],
];
```

## Run Migrations

```bash
php artisan migrate
```

Rolix ships migrations for roles, role paths, memberships, role rules, and activity logs.

## Permission Files (Optional)

Place PHP permission catalogs under `config/permissions/*.php`. Each file name becomes the **context** (for example `config/permissions/hero.php` → context `hero`):

```php
<?php

return [
    'view' => 'permissions/hero/view',
    'edit' => 'permissions/hero/edit',
];
```

Other packages can also register paths through `RegisterPathPermissionEvent` at boot.

## Next Steps

- See the [Showcase](/packages/rolix/showcase) for a multi-tenant walkthrough
- Add [HasRole](/packages/rolix/deep-diving/has-role) to your user model
- Explore [Role](/packages/rolix/deep-diving/services/role) and [Membership](/packages/rolix/deep-diving/services/membership) services
- Configure [Permission Cache](/packages/rolix/deep-diving/support/permission-cache)
