---
sidebar_position: 1
sidebar_label: StoreRoleRequest
---

import Link from "@docusaurus/Link";

# StoreRoleRequest

Form request for validating role **creation** payloads. Used by the Role service via `dto($data, StoreRoleRequest::class)` inside `changeFieldStore`.

## Namespace

```php
JobMetric\Rolix\Http\Requests\Role\StoreRoleRequest
```

## Overview

`StoreRoleRequest` ensures:

- Required fields (`name`) are present
- Optional hierarchy, permissions, and rule drivers are well-typed
- Cross-field checks for role type, parent, permissions, unique super role, and registered rule drivers

`authorize()` always returns `true` (authorization is expected at the application/controller layer).

## Validation Rules

| Field | Rule | Description |
|-------|------|-------------|
| `type` | `sometimes\|nullable\|string\|max:255` | Role type key; defaults to `system` in the service when omitted |
| `parent_id` | `nullable\|integer\|exists:{rolix.tables.role},id` | Parent role id (same type, hierarchical types only) |
| `name` | `required\|string\|max:255` | Display name |
| `description` | `nullable\|string` | Optional description |
| `allow` | `sometimes\|array` | Allowed permission strings |
| `allow.*` | `string` | Each allow entry |
| `deny` | `sometimes\|array` | Denied permission strings |
| `deny.*` | `string` | Each deny entry |
| `is_default` | `sometimes\|boolean` | Default role for the type |
| `is_super` | `sometimes\|boolean` | Super role (bypasses allow/deny lists) |
| `ordering` | `sometimes\|integer\|min:0` | Sort order |
| `rules` | `sometimes\|array` | Role rule definitions |
| `rules.*.driver` | `required_with:rules\|string` | Evaluator `name()` |
| `rules.*.payload` | `nullable\|array` | Driver-specific payload |

Table name for `exists` comes from `config('rolix.tables.role')`.

## Attributes

Translated labels via `rolix::base.fields.*` for: `type`, `parent_id`, `name`, `description`, `allow`, `deny`, `is_default`, `is_super`, `ordering`, `rules`.

## Cross-Field Validation (`withValidator`)

Runs after basic rules. Early-returns if the resolved type is unknown.

### 1. Role type

- Resolved type: `$data['type'] ?? 'system'`
- Must exist in `RoleTypeRegistry::has($type)`
- Error key: `type` → `rolix::base.exceptions.role_type_not_found`

### 2. Parent (`validateParent`)

When `parent_id` is set:

| Check | Error key | Translation |
|-------|-----------|-------------|
| Type is not hierarchical (`hierarchical` option `false`) | `parent_id` | `rolix::base.validation.role.parent_not_allowed` |
| Parent exists but `parent->type !== $type` | `parent_id` | `rolix::base.validation.role.parent_type_mismatch` |

### 3. Permissions (`validatePermissions`)

Skipped when `is_super` is truthy.

Otherwise, if `Permission::getFlatPermissions(null, $model)` is non-empty for the type’s model, each `allow` / `deny` entry must be in that list.

| Check | Error key | Translation |
|-------|-----------|-------------|
| Unknown permission string | `allow` or `deny` | `rolix::base.validation.role.permission_not_registered` |

### 4. Rule drivers (`validateRuleDrivers`)

Each `rules.$index.driver` must satisfy `RuleEvaluatorRegistry::has($driver)`.

| Check | Error key | Translation |
|-------|-----------|-------------|
| Unknown / invalid driver | `rules.$index.driver` | `rolix::base.validation.role.rule_driver_invalid` |

### 5. Unique super (`validateUniqueSuper`)

When `is_super` is truthy, no other role with the same `type` may already have `is_super = true`.

| Check | Error key | Translation |
|-------|-----------|-------------|
| Super already exists for type | `is_super` | `rolix::base.validation.role.is_super_already_exists` |

## Usage Examples

### Controller

```php
use JobMetric\Rolix\Facades\Role;
use JobMetric\Rolix\Http\Requests\Role\StoreRoleRequest;
use JobMetric\Rolix\Http\Resources\RoleResource;

public function store(StoreRoleRequest $request)
{
    $response = Role::store($request->validated());

    return RoleResource::make($response->getData())
        ->response()
        ->setStatusCode(201);
}
```

### Via Role service / dto

```php
use JobMetric\Rolix\Facades\Role;

Role::store([
    'type' => 'system',
    'name' => 'Editor',
    'description' => 'Can edit content',
    'allow' => ['posts.view', 'posts.update'],
    'deny' => ['posts.delete'],
    'is_default' => false,
    'is_super' => false,
    'ordering' => 10,
    'parent_id' => null,
    'rules' => [
        [
            'driver' => 'env',
            'payload' => ['environments' => 'local,staging'],
        ],
    ],
]);
```

### Minimal payload

```php
Role::store([
    'name' => 'Viewer',
]);
// type defaults to "system" in Role::changeFieldStore
```

## Related Documentation

- <Link to="/packages/rolix/deep-diving/requests/update-role-request">UpdateRoleRequest</Link>
- <Link to="/packages/rolix/deep-diving/evaluators/overview">Rule Evaluators</Link>
- <Link to="/packages/rolix/deep-diving/services/role">Role Service</Link>
