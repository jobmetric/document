---
sidebar_position: 2
sidebar_label: HasMembers
---

# HasMembers Trait

The `HasMembers` trait turns a model into a **memberable** context (tenant, organization, team, project) that can assign, query, and remove members.

## When to Use

**Use `HasMembers` when:**

- The model is the **scope** of membership (not the person)
- You want `$tenant->assignMember($user, $role)` instead of building morph arrays manually
- You need to list active members of a context

Pair with [HasRole](/packages/rolix/deep-diving/has-role) on the personable side and register the model in [RoleTypeRegistry](/packages/rolix/deep-diving/support/role-type-registry).

## Namespace

```php
JobMetric\Rolix\Traits\HasMembers
```

## Basic Usage

```php
use Illuminate\Database\Eloquent\Model;
use JobMetric\Rolix\Traits\HasMembers;

class Tenant extends Model
{
    use HasMembers;
}
```

```php
use JobMetric\Rolix\Facades\RoleTypeRegistry;

RoleTypeRegistry::register('tenant', [
    'model' => Tenant::class,
    'hierarchical' => true,
]);
```

## Methods

### `memberships()`

```php
public function memberships(): MorphMany
```

Morph-many relation as **memberable**.

---

### `members()`

Active (non-expired) memberships for this memberable.

```php
public function members(?string $collection = null): Collection
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `$collection` | `string\|null` | Optional collection filter |

**Returns:** `Collection` of `Membership` models

```php
$all = $tenant->members();
$ops = $tenant->members('ops');
```

---

### `assignMember()`

Assign a personable to this memberable with a role (via Membership service).

```php
public function assignMember(
    Model $personable,
    Role|int $role,
    array $attributes = []
): Membership
```

| Parameter | Description |
|-----------|-------------|
| `$personable` | User (or any HasRole model) |
| `$role` | Role model or id |
| `$attributes` | Extra fields: `collection`, `is_owner`, `allow`, `deny`, `expired_at`, … |

**Returns:** created `Membership`

```php
$membership = $tenant->assignMember($user, $role, [
    'collection' => 'ops',
    'is_owner' => false,
]);
```

---

### `removeMember()`

Soft-delete memberships for a personable on this memberable.

```php
public function removeMember(
    Model $personable,
    Role|int|null $role = null,
    ?string $collection = null
): int
```

When `$role` is `null`, all roles for that personable on this memberable are removed (optionally filtered by collection).

**Returns:** number of destroyed memberships

```php
$tenant->removeMember($user, $role);
$tenant->removeMember($user); // all roles on this tenant
```

---

### `hasMember()`

Whether a personable has an active membership on this memberable.

```php
public function hasMember(
    Model $personable,
    Role|int|null $role = null,
    ?string $collection = null
): bool
```

```php
if ($tenant->hasMember($user, $role)) {
    // ...
}
```

## Example: Invite Flow

```php
$role = Role::store([
    'type' => 'tenant',
    'name' => 'Member',
    'allow' => ['workspace.view'],
])->data;

$tenant->assignMember($user, $role->id);

assert($tenant->hasMember($user, $role->id));
assert($user->hasPermission('workspace.view', $tenant));
```

## Related Documentation

- [HasRole](/packages/rolix/deep-diving/has-role)
- [RoleTypeRegistry](/packages/rolix/deep-diving/support/role-type-registry)
- [Membership Service](/packages/rolix/deep-diving/services/membership)
- [Showcase](/packages/rolix/showcase)
