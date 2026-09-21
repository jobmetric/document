---
sidebar_position: 4
sidebar_label: RoleTreeResource
---

import Link from "@docusaurus/Link";

# RoleTreeResource

Flat hierarchical role list item (OpenCart-style). Extends the `RoleResource` payload with `depth` and `path_label` attributes set by `Role::flatTree()`.

## Namespace

```php
JobMetric\Rolix\Http\Resources\RoleTreeResource
```

## Overview

`RoleTreeResource`:

1. Builds the base array via `RoleResource::make($this->resource)->toArray($request)`
2. Merges:
   - `depth` — number of ancestors (integer, default `0`)
   - `path_label` — breadcrumb string (default falls back to `name`)

These attributes are expected on the underlying model (or array) as set by `Role::flatTree()`.

## Resource Structure

```json
{
  "id": 2,
  "type": "system",
  "parent_id": 1,
  "name": "Editor",
  "description": null,
  "allow": ["posts.update"],
  "deny": [],
  "is_default": false,
  "is_super": false,
  "ordering": 10,
  "created_at": "2024-01-02T09:00:00.000000Z",
  "updated_at": "2024-01-02T09:00:00.000000Z",
  "depth": 1,
  "path_label": "Administrator > Editor"
}
```

Nested relations from `RoleResource` (`parent`, `children`, `rules`, `paths`, `ancestors`) appear only if those relations were loaded on the models returned by `flatTree`.

## Field Details

### Complete Field Reference

All `RoleResource` fields, plus:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `depth` | integer | Ancestor count from closure paths (`level > 0`) | `1` |
| `path_label` | string | `"Ancestor > … > Name"` breadcrumb | `"Administrator > Editor"` |

### whenLoaded Relations

Same as <Link to="/packages/rolix/deep-diving/resources/role-resource">RoleResource</Link> (inherited through the base `toArray` merge).

## Basic Usage

```php
use JobMetric\Rolix\Facades\Role;
use JobMetric\Rolix\Http\Resources\RoleTreeResource;

$flat = Role::flatTree('system');

return RoleTreeResource::collection($flat);
```

```php
// Subtree under role id 1
$flat = Role::flatTree('system', 1);

return RoleTreeResource::collection($flat);
```

## How depth / path_label Are Computed

Inside `Role::flatTree()`:

- Loads all roles of the type (optionally restricted with `inSubtree($rootId)`)
- Loads `RolePath` rows with `level > 0`
- Sets `depth` = count of ancestor path ids
- Sets `path_label` = ancestor names (root → leaf) joined with ` > `, ending with the role’s own name
- Returns a pre-order DFS ordered collection

## Related Documentation

- <Link to="/packages/rolix/deep-diving/resources/role-resource">RoleResource</Link>
- <Link to="/packages/rolix/deep-diving/services/role">Role Service</Link> (`flatTree`, `nestedTree`)
