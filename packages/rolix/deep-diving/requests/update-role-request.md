---
sidebar_position: 2
sidebar_label: UpdateRoleRequest
---

import Link from "@docusaurus/Link";

# UpdateRoleRequest

Form request for validating role **update** payloads. Supports dto context (`id` / `role_id`) so cross-field checks know which role is being updated.

## Namespace

```php
JobMetric\Rolix\Http\Requests\Role\UpdateRoleRequest
```

## Overview

`UpdateRoleRequest`:

- Uses partial (`sometimes`) field rules suitable for PATCH-style updates
- Exposes static `rulesFor($input, $context)` for `dto()`
- Accepts context via `setContext(['id' => $roleId])` (also accepts `role_id`)
- Enforces demotion protection, hierarchy cycles, unique super, permissions, and rule drivers

`authorize()` returns `true`.

## Context

| Key | Purpose |
|-----|---------|
| `id` | Role being updated (preferred) |
| `role_id` | Alias for `id` |

```php
$data = dto($payload, UpdateRoleRequest::class, ['id' => $role->id]);
```

## Validation Rules (`rulesFor`)

| Field | Rule | Description |
|-------|------|-------------|
| `type` | `sometimes\|string\|max:255` | Change role type (must exist in registry) |
| `parent_id` | `nullable\|integer\|exists:{rolix.tables.role},id` | New parent |
| `name` | `sometimes\|string\|max:255` | Display name |
| `description` | `nullable\|string` | Description |
| `allow` | `sometimes\|array` | Allow list |
| `allow.*` | `string` | |
| `deny` | `sometimes\|array` | Deny list |
| `deny.*` | `string` | |
| `is_default` | `sometimes\|boolean` | Default flag |
| `is_super` | `sometimes\|boolean` | Super flag |
| `ordering` | `sometimes\|integer\|min:0` | Ordering |
| `rules` | `sometimes\|array` | Replace rules when present |
| `rules.*.driver` | `required_with:rules\|string` | Evaluator name |
| `rules.*.payload` | `nullable\|array` | Payload |

`rules()` delegates to `self::rulesFor($this->all(), $this->context)`.

## Attributes

Same as store: `type`, `parent_id`, `name`, `description`, `allow`, `deny`, `is_default`, `is_super`, `ordering`, `rules` via `rolix::base.fields.*`.

## Cross-Field Validation (`withValidator`)

Resolved type: `$data['type'] ?? $role?->type ?? 'system'`.

### Type existence

Unknown type → error on `type` (`rolix::base.exceptions.role_type_not_found`), then return.

### Super demotion

If the existing role is super and the payload sets `is_super` to a falsy value:

| Error key | Translation |
|-----------|-------------|
| `is_super` | `rolix::base.exceptions.role_is_super_cannot_demote` |

### Unique super

When promoting to super (`is_super` truthy and the current role is not already super), no other role of the same type may be super (excluding current id).

| Error key | Translation |
|-----------|-------------|
| `is_super` | `rolix::base.validation.role.is_super_already_exists` |

### Parent constraints

| Condition | Error key | Translation |
|-----------|-----------|-------------|
| `parent_id === role id` | `parent_id` | `rolix::base.validation.role.parent_self` |
| Type not hierarchical | `parent_id` | `rolix::base.validation.role.parent_not_allowed` |
| Parent type mismatch | `parent_id` | `rolix::base.validation.role.parent_type_mismatch` |
| Assigning parent would create a cycle (via `role_paths`) | `parent_id` | `rolix::base.validation.role.parent_cycle` |

Cycle detection: `wouldCreateCycle()` checks whether the proposed parent already has a path row with `path_id = role.id` and `level > 0`.

### Permissions

Permission validation is skipped when:

- Payload `is_super` is truthy, **or**
- The role is already super and `is_super` is omitted from the payload

Otherwise `allow` / `deny` entries must be registered for the type’s model (same as store).

### Rule drivers

Same as store: each `rules.$index.driver` must pass `RuleEvaluatorRegistry::has()`.

## Usage Examples

### Partial update

```php
use JobMetric\Rolix\Facades\Role;

Role::update($roleId, [
    'name' => 'Senior Editor',
    'ordering' => 5,
]);
```

### Replace rules

```php
Role::update($roleId, [
    'rules' => [
        [
            'driver' => 'weekday',
            'payload' => ['days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']],
        ],
    ],
]);
// Omitting "rules" leaves existing rules unchanged
```

### Controller

```php
use JobMetric\Rolix\Http\Requests\Role\UpdateRoleRequest;
use JobMetric\Rolix\Facades\Role;

public function update(UpdateRoleRequest $request, int $id)
{
    return Role::update($id, $request->validated());
}
```

### Direct rulesFor

```php
$rules = UpdateRoleRequest::rulesFor(
    ['name' => 'X'],
    ['id' => 15]
);
```

## Related Documentation

- <Link to="/packages/rolix/deep-diving/requests/store-role-request">StoreRoleRequest</Link>
- <Link to="/packages/rolix/deep-diving/services/role">Role Service</Link>
- <Link to="/packages/rolix/deep-diving/evaluators/overview">Rule Evaluators</Link>
