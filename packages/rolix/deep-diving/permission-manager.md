---
sidebar_position: 4
sidebar_label: Permission Manager
---

# PermissionManager

Loads and serves permission catalogs from PHP files, grouped by **context** and optional **model** scope.

## Namespace

```php
JobMetric\Rolix\Services\PermissionManager
```

## Facade

```php
use JobMetric\Rolix\Facades\Permission;
```

Container binding: `rolix.permission`.

## Constant

```php
PermissionManager::SYSTEM_MODEL_KEY; // '__system__'
```

Used internally when `$model` is `null` (system-wide permissions).

## File Format

Each permission file returns an associative array of **permission key → translation key**:

```php
<?php

return [
    'view' => 'permissions/hero/view',
    'edit' => 'permissions/hero/edit',
    'settings.open' => 'permissions/hero/settings/open',
];
```

## Boot Loading

On application boot, Rolix:

1. Loads every `config/permissions/*.php` (basename = context)
2. Dispatches `RegisterPathPermissionEvent`
3. Registers paths from listeners via `addPermissionFile()`

## Methods

### `addPermissionFile()`

```php
public function addPermissionFile(
    string $context,
    string $path,
    ?string $model = null
): void
```

| Parameter | Description |
|-----------|-------------|
| `$context` | Context name (e.g. `hero`) |
| `$path` | Absolute path to PHP file |
| `$model` | FQCN for model-scoped catalog, or `null` for system |

**Throws:** `InvalidArgumentException` if file missing, not an array, or entries are not strings.

```php
Permission::addPermissionFile('hero', resource_path('permissions/hero.php'));
Permission::addPermissionFile(
    'hero',
    resource_path('permissions/hero-tenant.php'),
    Tenant::class
);
```

---

### `getPermissions()`

```php
public function getPermissions(
    ?string $context = null,
    string $view = 'assoc',
    ?string $model = null
): array
```

| `$view` | Result |
|---------|--------|
| `assoc` (default) | `perm => lang` (or nested by context) |
| `flat` | list of permission keys |
| `lang` | list of lang keys |
| `flat_lang` | list of `{perm, lang}` or context map |
| `tree` | nested tree (ignores `$context`, uses model scope) |

```php
Permission::getPermissions('hero');
Permission::getPermissions('hero', 'flat');
Permission::getPermissions(null, 'tree', Tenant::class);
```

---

### `hasPermission()`

Whether a permission key exists in a context catalog (definition lookup — **not** user authorization).

```php
public function hasPermission(
    string $context,
    string $permission,
    ?string $model = null
): bool
```

```php
Permission::hasPermission('hero', 'view');
```

For user checks use `HasRole::hasPermission()`.

---

### `getContextPermission()`

```php
public function getContextPermission(?string $model = null): array
```

**Returns:** list of context names for the model scope.

---

### `getFlatPermissions()` / `getLangPermissions()` / `getFlatLangPermissions()` / `getAssocPermissions()`

Typed helpers used by `getPermissions()` views. Prefer the unified `getPermissions()` API unless you need a specific shape.

---

### `getPermissionTree()`

Build a nested tree from dotted permission keys for a model scope.

```php
public function getPermissionTree(?string $model = null): array
```

**Returns:** list of nodes:

```php
[
    [
        'perm' => 'hero',
        'lang' => '...',
        'children' => [
            ['perm' => 'hero.view', 'lang' => '...', 'children' => []],
        ],
    ],
]
```

Parent of `a.b.c` is `a.b` when that key exists.

---

### `getPermissionTreeForType()`

```php
public function getPermissionTreeForType(string $type): array
```

Ensures the role type exists, then builds the tree for that type's bound model (`null` for system types).

**Throws:** `RoleTypeNotFoundException`

```php
Permission::getPermissionTreeForType('system');
Permission::getPermissionTreeForType('tenant');
```

## Related Documentation

- [Events](/packages/rolix/deep-diving/events) — `RegisterPathPermissionEvent`
- [Installation](/packages/rolix/installation)
- [StoreRoleRequest](/packages/rolix/deep-diving/requests/store-role-request) — validates allow/deny against catalogs
