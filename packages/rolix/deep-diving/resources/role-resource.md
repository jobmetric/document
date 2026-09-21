---
sidebar_position: 1
sidebar_label: RoleResource
---

import Link from "@docusaurus/Link";

# RoleResource

Transforms a `Role` model into a JSON-serializable array for API responses, including optional relations and an `ancestors` projection derived from loaded paths.

## Namespace

```php
JobMetric\Rolix\Http\Resources\RoleResource
```

## Overview

`RoleResource`:

- Exposes core role fields with normalized `allow` / `deny` arrays
- Formats timestamps as ISO 8601 via `?->toISOString()`
- Loads nested relations only when eager-loaded (`whenLoaded`)
- Builds a compact `ancestors` list from loaded `paths` (levels &gt; 0)

## Resource Structure

```json
{
  "id": 1,
  "type": "system",
  "parent_id": null,
  "name": "Administrator",
  "description": "Full system access",
  "allow": ["users.view", "users.update"],
  "deny": [],
  "is_default": false,
  "is_super": true,
  "ordering": 0,
  "created_at": "2024-01-01T12:00:00.000000Z",
  "updated_at": "2024-01-01T12:00:00.000000Z"
}
```

With relations loaded:

```json
{
  "id": 2,
  "type": "system",
  "parent_id": 1,
  "name": "Editor",
  "description": null,
  "allow": ["posts.update"],
  "deny": ["posts.delete"],
  "is_default": false,
  "is_super": false,
  "ordering": 10,
  "created_at": "2024-01-02T09:00:00.000000Z",
  "updated_at": "2024-01-02T09:00:00.000000Z",
  "parent": {
    "id": 1,
    "type": "system",
    "parent_id": null,
    "name": "Administrator",
    "description": "Full system access",
    "allow": [],
    "deny": [],
    "is_default": false,
    "is_super": true,
    "ordering": 0,
    "created_at": "2024-01-01T12:00:00.000000Z",
    "updated_at": "2024-01-01T12:00:00.000000Z"
  },
  "children": [],
  "rules": [
    {
      "id": 5,
      "role_id": 2,
      "driver": "time",
      "payload": { "from": "09:00", "to": "18:00" },
      "created_at": "2024-01-02T09:00:00.000000Z",
      "updated_at": "2024-01-02T09:00:00.000000Z"
    }
  ],
  "paths": [
    {
      "type": "system",
      "role_id": 2,
      "path_id": 2,
      "level": 0
    },
    {
      "type": "system",
      "role_id": 2,
      "path_id": 1,
      "level": 1,
      "path": { "id": 1, "name": "Administrator", "type": "system" }
    }
  ],
  "ancestors": [
    { "id": 1, "name": "Administrator", "type": "system", "level": 1 }
  ]
}
```

## Field Details

### Complete Field Reference

| Field | Type | Always present | Description | Example |
|-------|------|----------------|-------------|---------|
| `id` | integer | yes | Role primary key | `1` |
| `type` | string | yes | Role type registry key | `"system"` |
| `parent_id` | integer\|null | yes | Parent role id | `null` |
| `name` | string | yes | Display name | `"Editor"` |
| `description` | string\|null | yes | Optional description | `"Can edit posts"` |
| `allow` | array&lt;string&gt; | yes | Allowed permissions (`null` → `[]`) | `["posts.view"]` |
| `deny` | array&lt;string&gt; | yes | Denied permissions (`null` → `[]`) | `[]` |
| `is_default` | boolean | yes | Default role for the type | `false` |
| `is_super` | boolean | yes | Super role flag | `false` |
| `ordering` | integer | yes | Sort order | `10` |
| `created_at` | string\|null | yes | ISO 8601 timestamp | `"2024-01-01T12:00:00.000000Z"` |
| `updated_at` | string\|null | yes | ISO 8601 timestamp | `"2024-01-01T12:00:00.000000Z"` |
| `parent` | object | whenLoaded | Nested `RoleResource` | — |
| `children` | array | whenLoaded | Collection of `RoleResource` | — |
| `rules` | array | whenLoaded | `RoleRuleResource` collection | — |
| `paths` | array | whenLoaded | `RolePathResource` collection | — |
| `ancestors` | array | whenLoaded(`paths`) | Compact ancestor rows from paths with `level > 0` | — |

### whenLoaded Relations

| JSON key | Relation | Resource |
|----------|----------|----------|
| `parent` | `parent` | `RoleResource::make` |
| `children` | `children` | `RoleResource::collection` |
| `rules` | `rules` | `RoleRuleResource::collection` |
| `paths` | `paths` | `RolePathResource::collection` |
| `ancestors` | derived from `paths` | Inline `{ id, name, type, level }` sorted by `level` |

`ancestors` requires `paths` to be loaded. Each ancestor role is taken from `$path->path` (uses the relation if loaded, otherwise queries). Null ancestors are filtered out.

## Basic Usage

```php
use JobMetric\Rolix\Models\Role;
use JobMetric\Rolix\Http\Resources\RoleResource;

$role = Role::with(['parent', 'children', 'rules', 'paths.path'])->find(1);

return RoleResource::make($role);
```

```php
return RoleResource::collection(Role::query()->ofType('system')->paginate(20));
```

## Service Integration

```php
use JobMetric\Rolix\Facades\Role;
use JobMetric\Rolix\Http\Resources\RoleResource;

$response = Role::store([
    'name' => 'Editor',
    'type' => 'system',
    'allow' => ['posts.update'],
]);

if ($response->isSuccess()) {
    return RoleResource::make($response->getData())
        ->response()
        ->setStatusCode(201);
}
```

## Related Documentation

- <Link to="/packages/rolix/deep-diving/resources/role-tree-resource">RoleTreeResource</Link>
- <Link to="/packages/rolix/deep-diving/resources/role-path-resource">RolePathResource</Link>
- <Link to="/packages/rolix/deep-diving/resources/role-rule-resource">RoleRuleResource</Link>
- <Link to="/packages/rolix/deep-diving/services/role">Role Service</Link>
