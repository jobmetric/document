---
sidebar_position: 1
sidebar_label: RoleTypeRegistry
---

# RoleTypeRegistry

Registry for role types and their options (label, hierarchy, bound memberable model). Used to validate role `type` values and resolve membership default-role scope.

## Namespace

```php
JobMetric\Rolix\Support\RoleTypeRegistry
```

## Facade

```php
use JobMetric\Rolix\Facades\RoleTypeRegistry;
```

## Boot

Types from `config('rolix.types')` are registered in `RolixServiceProvider::afterRegisterPackage`.

## Options

| Key | Type | Description |
|-----|------|-------------|
| `label` | `string` | Translation key or label |
| `description` | `string` | Translation key or description |
| `hierarchical` | `bool` | Whether parent/child roles are allowed |
| `model` | `string\|null` | Memberable FQCN; omit for system types |

## Methods

### `register()`

```php
public function register(string $type, array $options = []): self
```

Creates or merges options for a type.

```php
RoleTypeRegistry::register('tenant', [
    'model' => \App\Models\Tenant::class,
    'hierarchical' => true,
    'label' => 'Tenant',
]);
```

### `unregister()`

```php
public function unregister(string $type): self
```

### `has()` / `get()` / `all()` / `values()`

```php
RoleTypeRegistry::has('tenant');     // bool
RoleTypeRegistry::get('tenant');     // ?array options
RoleTypeRegistry::all();             // array<string, array>
RoleTypeRegistry::values();          // list of type names
```

### `getOption()`

```php
public function getOption(string $type, string $key, mixed $default = null): mixed
```

```php
RoleTypeRegistry::getOption('tenant', 'hierarchical', false);
```

### `getModel()` / `isSystem()`

```php
RoleTypeRegistry::getModel('tenant'); // Tenant::class or null
RoleTypeRegistry::isSystem('system'); // true when no model
```

### `ensure()`

```php
public function ensure(string $type): self
```

**Throws:** `RoleTypeNotFoundException` if missing.

Used by Role tree APIs and PermissionManager type trees.

### `clear()`

Removes all registered types (mainly for tests).

## Related Documentation

- [Role Service](/packages/rolix/deep-diving/services/role)
- [HasMembers](/packages/rolix/deep-diving/has-members)
- [Installation](/packages/rolix/installation)
