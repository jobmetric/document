---
sidebar_position: 5
sidebar_label: RoleRuleResource
---

import Link from "@docusaurus/Link";

# RoleRuleResource

Transforms a `RoleRule` model (driver + payload attached to a role) into JSON.

## Namespace

```php
JobMetric\Rolix\Http\Resources\RoleRuleResource
```

## Overview

Each rule row stores:

- `driver` — evaluator `name()` registered in `RuleEvaluatorRegistry`
- `payload` — JSON configuration for that evaluator

Timestamps are ISO 8601. The `role` relation is documented on the model but **not** currently nested in `toArray`.

## Resource Structure

```json
{
  "id": 5,
  "role_id": 2,
  "driver": "time",
  "payload": {
    "from": "09:00",
    "to": "18:00",
    "timezone": "Asia/Tehran"
  },
  "created_at": "2024-01-02T09:00:00.000000Z",
  "updated_at": "2024-01-02T09:00:00.000000Z"
}
```

## Field Details

### Complete Field Reference

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | integer | Rule primary key | `5` |
| `role_id` | integer | Owning role id | `2` |
| `driver` | string | Evaluator name (`time`, `weekday`, …) | `"time"` |
| `payload` | array\|null | Driver-specific settings | `{ "from": "09:00", "to": "18:00" }` |
| `created_at` | string\|null | ISO 8601 | `"2024-01-02T09:00:00.000000Z"` |
| `updated_at` | string\|null | ISO 8601 | `"2024-01-02T09:00:00.000000Z"` |

### whenLoaded Relations

None exposed in the current `toArray` implementation. Rules are typically nested under `RoleResource` when `rules` is loaded.

## Basic Usage

```php
use JobMetric\Rolix\Models\RoleRule;
use JobMetric\Rolix\Http\Resources\RoleRuleResource;

return RoleRuleResource::collection(
    RoleRule::query()->where('role_id', 2)->get()
);
```

Via role:

```php
use JobMetric\Rolix\Http\Resources\RoleResource;
use JobMetric\Rolix\Models\Role;

return RoleResource::make(Role::with('rules')->find(2));
```

## Related Documentation

- <Link to="/packages/rolix/deep-diving/evaluators/overview">Rule Evaluators Overview</Link>
- <Link to="/packages/rolix/deep-diving/resources/role-resource">RoleResource</Link>
