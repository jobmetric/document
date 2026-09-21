---
sidebar_position: 1
sidebar_label: HasRole
---

# HasRole Trait

The `HasRole` trait turns any Eloquent model into a **personable** actor that can hold memberships, evaluate permissions, and integrate with Gate, middleware, and Blade.

## When to Use

**Use `HasRole` when you need:**

- Permission checks on users (or any personable model)
- Assigning / syncing / removing roles in system or memberable scope
- Super-role and owner shortcuts
- Collection-scoped memberships
- Request-scoped memoization and shared permission cache

**Example scenarios:**

- Staff accounts with system roles
- Tenant members with scoped roles
- API clients that must pass Gate / middleware checks

## Namespace

```php
JobMetric\Rolix\Traits\HasRole
```

## Basic Usage

```php
use Illuminate\Foundation\Auth\User as Authenticatable;
use JobMetric\Rolix\Traits\HasRole;

class User extends Authenticatable
{
    use HasRole;
}
```

## Permission Evaluation Order

When `hasPermission()` / `getPermissions()` run:

1. Active **super** membership → `allow: ['*']`
2. **Owner** membership for the given memberable (+ optional collection) → `allow: ['*']` in that context only
3. Load non-expired memberships for the scope
4. Resolve roles (and valid ancestors whose rules pass)
5. Merge membership + role `allow` / `deny`
6. Deny wins over allow; supports exact keys, `*`, and `prefix.*`

## Methods

### `hasPermission()`

Check whether the person has a permission.

```php
public function hasPermission(
    string $permission,
    ?Model $context = null,
    ?string $collection = null
): bool
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `$permission` | `string` | Permission key (e.g. `hero.view`) |
| `$context` | `Model\|null` | Memberable model, or `null` for system scope |
| `$collection` | `string\|null` | Optional membership collection filter |

**Returns:** `bool`

```php
$user->hasPermission('hero.view');
$user->hasPermission('hero.view', $tenant);
$user->hasPermission('hero.view', $tenant, 'ops');
```

Internally uses `getPermissions()` then deny/allow matching (including wildcards).

---

### `getPermissions()`

Return the effective allow/deny lists for a scope.

```php
public function getPermissions(
    ?Model $context = null,
    ?string $collection = null
): array
```

**Returns:** `array{allow: array<int, string>, deny: array<int, string>}`

```php
$perms = $user->getPermissions($tenant);
// ['allow' => ['workspace.*'], 'deny' => ['billing.refund']]
```

Results are memoized on the model for the current request and, when enabled, stored in Laravel Cache via `PermissionCache`.

---

### `hasRole()`

Whether the person has the given role in scope (by model, id, or name).

```php
public function hasRole(
    Role|int|string $role,
    ?Model $context = null,
    ?string $collection = null
): bool
```

```php
$user->hasRole($role);
$user->hasRole(12, $tenant);
$user->hasRole('Editor', $tenant, 'ops');
```

---

### `assignRole()`

Create a membership through the Membership service.

```php
public function assignRole(
    Role|int $role,
    ?Model $context = null,
    array $attributes = []
): Membership
```

| Parameter | Description |
|-----------|-------------|
| `$role` | Role model or id |
| `$context` | Memberable model, or `null` for system |
| `$attributes` | Extra membership fields (`collection`, `is_owner`, `allow`, `deny`, `expired_at`, …) |

**Returns:** `Membership` model

```php
$user->assignRole($role);
$user->assignRole($role, $tenant, [
    'is_owner' => true,
    'collection' => 'ops',
    'allow' => ['extra.perm'],
]);
```

Invalidates permission cache for this personable after store.

---

### `removeRole()`

Soft-delete memberships matching the role in scope.

```php
public function removeRole(
    Role|int $role,
    ?Model $context = null,
    ?string $collection = null
): int
```

**Returns:** number of destroyed memberships

```php
$count = $user->removeRole($role, $tenant);
```

---

### `syncRoles()`

Replace all memberships in scope with the given role ids.

```php
public function syncRoles(
    array $roles,
    ?Model $context = null,
    ?string $collection = null
): void
```

```php
$user->syncRoles([$roleA, $roleB->id], $tenant, 'ops');
```

Removes memberships not in `$roles`, assigns missing ones, then forgets cache.

---

### `forgetRolixCache()`

Clear request-scoped memoization and the loaded `memberships` relation.

```php
public function forgetRolixCache(): void
```

For shared cache invalidation use `PermissionCache::forget($user)` (also clears memo).

---

### `memberships()`

```php
public function memberships(): MorphMany
```

Morph-many relation as **personable**.

## Scenarios

### System admin

```php
$user->assignRole($superRole); // is_super on role
$user->hasPermission('anything'); // true
```

### Tenant owner

```php
$user->assignRole($role, $tenant, ['is_owner' => true]);
$user->hasPermission('anything', $tenant); // true
$user->hasPermission('anything');          // false (different scope)
```

### Wildcards

```php
// role allow: ['hero.*'], deny: ['hero.secret']
$user->hasPermission('hero.view');   // true
$user->hasPermission('hero.secret'); // false
```

## Best Practices

- Prefer `hasPermission()` over raw membership queries
- Pass memberable context for multi-tenant checks
- Keep permission keys dotted (`module.action`) so trees and wildcards work
- After external membership changes on an already-loaded model, call `PermissionCache::forget($user)` or reload the model

## Related Documentation

- [HasMembers](/packages/rolix/deep-diving/has-members)
- [Permission Cache](/packages/rolix/deep-diving/support/permission-cache)
- [Gate / Middleware / Blade](/packages/rolix/deep-diving/gate-middleware-blade)
- [Membership Service](/packages/rolix/deep-diving/services/membership)
