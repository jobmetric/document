---
sidebar_position: 1
sidebar_label: Role
---

# Role Service

The Role service provides CRUD, hierarchy/path maintenance, rule sync, and tree listings for Rolix roles. Use the service class or the Facade.

## Namespace

```php
JobMetric\Rolix\Services\Role
```

## Facade

```php
use JobMetric\Rolix\Facades\Role;
```

## Basic CRUD Operations

Inherited from `AbstractCrudService` (Package Core). Responses use the standard Package Core `Response` object (`ok`, `message`, `data`, …).

### Store

```php
$response = Role::store([
    'type' => 'system',
    'name' => 'Editor',
    'description' => 'Can edit content',
    'allow' => ['post.view', 'post.edit'],
    'deny' => ['post.delete'],
    'parent_id' => null,
    'is_default' => false,
    'is_super' => false,
    'ordering' => 10,
    'rules' => [
        [
            'driver' => 'time',
            'payload' => ['from' => '09:00', 'to' => '18:00'],
        ],
    ],
]);

$role = $response->data; // RoleResource / model payload
```

Validation runs through [StoreRoleRequest](/packages/rolix/deep-diving/requests/store-role-request).

### Show

```php
$response = Role::show($id);
$response = Role::show($id, ['parent', 'children', 'rules', 'paths']);
```

### Update

```php
$response = Role::update($id, [
    'allow' => ['post.view', 'post.edit', 'post.publish'],
    'parent_id' => $newParentId,
]);
```

Uses [UpdateRoleRequest](/packages/rolix/deep-diving/requests/update-role-request).

### Destroy

```php
$response = Role::destroy($id);
```

**Notes:**

- Super roles cannot be deleted (`RoleIsSuperException`)
- Children are detached (`parent_id` nullified) and their paths rebuilt
- Bumps global roles cache version and writes activity log

### Query Helpers

```php
Role::paginate($filters);
Role::all($filters);
Role::query(); // underlying query builder helpers from AbstractCrudService
```

## Hierarchy & Paths

Hierarchical types (config / registry `hierarchical => true`) store ancestry in `role_paths`.

### `rebuildPaths()`

```php
public function rebuildPaths(Role $role): void
```

Rebuilds path rows for a role after structural changes. Called internally after store/update/destroy when needed.

### `syncRules()`

```php
public function syncRules(Role $role, ?array $rules): void
```

Replaces `role_rules` for the role. Each item:

```php
[
    'driver' => 'weekday',
    'payload' => ['days' => [1, 2, 3, 4, 5]],
]
```

`driver` must be registered in [RuleEvaluatorRegistry](/packages/rolix/deep-diving/support/rule-evaluator-registry).

## Tree APIs

### `flatTree()`

OpenCart-style flat list with depth and path label.

```php
public function flatTree(string $type, ?int $rootId = null): Collection
```

```php
$nodes = Role::flatTree('system');
$subtree = Role::flatTree('system', $rootId);

foreach ($nodes as $role) {
    // $role->depth, $role->path_label (when prepared by service)
}
```

### `nestedTree()`

Nested array of roles with `children`.

```php
public function nestedTree(string $type, ?int $rootId = null): array
```

```php
$tree = Role::nestedTree('tenant');
```

Both methods call `RoleTypeRegistry::ensure($type)`.

## Side Effects

| Operation | Side effects |
|-----------|--------------|
| store / update / destroy | `ActivityLogger`, `PermissionCache::bumpRoles()`, DomainEvents |
| hierarchy change | path rebuild |
| rules in payload | `syncRules()` |

## Related Documentation

- [RoleTypeRegistry](/packages/rolix/deep-diving/support/role-type-registry)
- [Rule Evaluators](/packages/rolix/deep-diving/evaluators/overview)
- [Events](/packages/rolix/deep-diving/events)
- [RoleResource](/packages/rolix/deep-diving/resources/role-resource)
- [StoreRoleRequest](/packages/rolix/deep-diving/requests/store-role-request)
