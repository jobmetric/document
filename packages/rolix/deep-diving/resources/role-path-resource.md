---
sidebar_position: 3
sidebar_label: RolePathResource
---

import Link from "@docusaurus/Link";

# RolePathResource

Transforms a closure-table `RolePath` row into JSON. Used when `RoleResource` includes loaded `paths`.

## Namespace

```php
JobMetric\Rolix\Http\Resources\RolePathResource
```

## Overview

Each path row links a role to an ancestor (or itself at `level = 0`) within a role type. The optional nested `path` object is the ancestor `Role` summary when the `path` relation is loaded.

## Resource Structure

```json
{
  "type": "system",
  "role_id": 2,
  "path_id": 1,
  "level": 1,
  "path": {
    "id": 1,
    "name": "Administrator",
    "type": "system"
  }
}
```

Self path (level 0) typically has no nested `path` unless the relation was eager-loaded onto that row:

```json
{
  "type": "system",
  "role_id": 2,
  "path_id": 2,
  "level": 0
}
```

## Field Details

### Complete Field Reference

| Field | Type | Always present | Description | Example |
|-------|------|----------------|-------------|---------|
| `type` | string | yes | Role type of the path namespace | `"system"` |
| `role_id` | integer | yes | Descendant role id | `2` |
| `path_id` | integer | yes | Ancestor (or self) role id | `1` |
| `level` | integer | yes | Distance (`0` = self) | `1` |
| `path` | object | whenLoaded | Compact ancestor role | see below |

### whenLoaded Relations

| JSON key | Relation | Shape |
|----------|----------|-------|
| `path` | `path` | `{ id, name, type }` (not a full `RoleResource`) |

## Basic Usage

```php
use JobMetric\Rolix\Models\RolePath;
use JobMetric\Rolix\Http\Resources\RolePathResource;

$paths = RolePath::query()
    ->where('role_id', 2)
    ->with('path')
    ->orderBy('level')
    ->get();

return RolePathResource::collection($paths);
```

Usually consumed via `RoleResource` with `Role::with('paths.path')`.

## Related Documentation

- <Link to="/packages/rolix/deep-diving/resources/role-resource">RoleResource</Link>
- <Link to="/packages/rolix/deep-diving/services/role">Role Service</Link> (`rebuildPaths`, `flatTree`)
