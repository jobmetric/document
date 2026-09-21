---
sidebar_position: 3
sidebar_label: Permission Cache
---

# Permission Cache

`PermissionCache` stores allow/deny snapshots for personable models so repeated authorization checks stay cheap at scale.

## Namespace

```php
JobMetric\Rolix\Support\PermissionCache
```

## Layers

1. **Request memo** on `HasRole` (`$rolixMemo`) — always active
2. **Laravel Cache** — when `config('rolix.cache.enabled')` is `true`

Shared cache keys include:

- Global **roles version** (bumped on role store/update/destroy)
- Per-personable **version** (bumped on membership mutations)
- Scope bucket (context + collection)

## Config

```php
'cache' => [
    'enabled' => env('ROLIX_CACHE_ENABLED', true),
    'ttl' => env('ROLIX_CACHE_TTL', 60),
    'store' => env('ROLIX_CACHE_STORE', null), // null = default store
    'prefix' => env('ROLIX_CACHE_PREFIX', 'rolix'),
],
```

## Methods

### `enabled()`

```php
public static function enabled(): bool
```

### `remember()`

```php
public static function remember(
    Model $personable,
    string $bucket,
    callable $callback
): mixed
```

Runs `$callback` immediately when cache is disabled or the model does not exist yet. On backend failure, falls back to `$callback()` without throwing.

Used by `HasRole::getPermissions()`.

### `forget()`

```php
public static function forget(Model $personable): void
```

Clears request memo via `forgetRolixCache()` when available, then bumps the personable version key.

### `forgetByMorph()`

```php
public static function forgetByMorph(?string $type, int|string|null $id): void
```

Invalidates by morph identity without loading the model (used from Membership `afterCommon`).

### `bumpRoles()`

```php
public static function bumpRoles(): void
```

Increments the global roles version so all cached permission snapshots become stale after role allow/deny/rule changes.

## Invalidation Matrix

| Event | Call |
|-------|------|
| Membership CRUD / restore / forceDelete | `forget($personable)` or `forgetByMorph(...)` |
| Role store / update / destroy | `bumpRoles()` |
| Manual | `$user->forgetRolixCache()` and/or `PermissionCache::forget($user)` |

## Related Documentation

- [HasRole](/packages/rolix/deep-diving/has-role)
- [Membership Service](/packages/rolix/deep-diving/services/membership)
- [Role Service](/packages/rolix/deep-diving/services/role)
- [Installation](/packages/rolix/installation)
