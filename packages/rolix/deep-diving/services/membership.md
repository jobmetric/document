---
sidebar_position: 2
sidebar_label: Membership
---

# Membership Service

The Membership service manages personable ↔ role links with soft deletes, default role resolution, permission overrides, and cache invalidation.

## Namespace

```php
JobMetric\Rolix\Services\Membership
```

## Facade

```php
use JobMetric\Rolix\Facades\Membership;
```

## Soft-Delete Flags

The service enables:

- `$softDelete = true`
- `$hasRestore = true`
- `$hasForceDelete = true`

## Basic CRUD Operations

### Store

```php
$response = Membership::store([
    'personable_type' => User::class,
    'personable_id' => $user->id,
    'role_id' => $role->id, // optional if a default role exists
    'memberable_type' => Tenant::class, // null for system
    'memberable_id' => $tenant->id,
    'collection' => 'ops',
    'is_owner' => false,
    'expired_at' => null,
    'allow' => ['extra.perm'],
    'deny' => [],
]);
```

Validation: [StoreMembershipRequest](/packages/rolix/deep-diving/requests/store-membership-request).

#### Default Role Resolution

When `role_id` is omitted:

1. If memberable is null → type `system`
2. Else → first registered type whose `model` morph matches `memberable_type`
3. Load role with `is_default = true` for that type
4. If missing → `MembershipDefaultRoleMissingException`

#### Duplicates

Unique constraint violations are rethrown as `MembershipDuplicateException` (HTTP 422 semantics).

### Show / Update

```php
Membership::show($id, ['role', 'personable']);
Membership::update($id, [
    'allow' => ['hero.view'],
    'expired_at' => now()->addMonth(),
]);
```

### Destroy (Soft Delete)

```php
Membership::destroy($id);
```

Soft-deleted memberships no longer grant permissions (`HasRole` queries exclude them via relation defaults / non-trashed).

### Restore

```php
$response = Membership::restore($id);
```

Re-grants permissions and logs `restore_membership`.

### Force Delete

```php
$response = Membership::forceDelete($id);
```

Permanently removes the row and logs `force_delete_membership`.

### Query Helpers

```php
Membership::paginate($filters);
Membership::all($filters);
```

Allowed QueryBuilder fields include morph keys, `role_id`, `collection`, `is_owner`, `expired_at`, timestamps, `deleted_at`.

## Side Effects (`afterCommon`)

For `store`, `update`, `destroy`, `restore`, `forceDelete`:

1. Invalidate permission cache for the personable (`PermissionCache::forget` / `forgetByMorph`)
2. `ActivityLogger::log(...)`
3. Dispatch the matching DomainEvent class

## Prefer Traits for App Code

```php
// Prefer:
$user->assignRole($role, $tenant);
$tenant->assignMember($user, $role);

// Equivalent low-level:
Membership::store([/* morph arrays */]);
```

## Related Documentation

- [HasRole](/packages/rolix/deep-diving/has-role)
- [HasMembers](/packages/rolix/deep-diving/has-members)
- [Activity Log](/packages/rolix/deep-diving/activity-log)
- [Events](/packages/rolix/deep-diving/events)
- [MembershipResource](/packages/rolix/deep-diving/resources/membership-resource)
