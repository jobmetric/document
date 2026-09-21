---
sidebar_position: 2
sidebar_label: MembershipResource
---

import Link from "@docusaurus/Link";

# MembershipResource

Transforms a `Membership` model into a JSON structure for API responses, including morph resource hooks and an optional nested role.

## Namespace

```php
JobMetric\Rolix\Http\Resources\MembershipResource
```

## Overview

`MembershipResource`:

- Exposes personable / memberable morph keys and membership metadata
- Formats `expired_at`, `created_at`, `updated_at`, `deleted_at` as ISO 8601
- Always includes `personable_resource` and `memberable_resource` from model accessors (dispatching resource events)
- Includes nested `role` only when the relation is loaded

## Resource Structure

```json
{
  "id": 10,
  "personable_type": "App\\Models\\User",
  "personable_id": 42,
  "memberable_type": "App\\Models\\Tenant",
  "memberable_id": 7,
  "role_id": 3,
  "collection": "staff",
  "is_owner": false,
  "expired_at": null,
  "allow": ["reports.export"],
  "deny": [],
  "created_at": "2024-03-01T10:00:00.000000Z",
  "updated_at": "2024-03-01T10:00:00.000000Z",
  "deleted_at": null,
  "personable_resource": {
    "id": 42,
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "memberable_resource": {
    "id": 7,
    "name": "Acme Corp"
  },
  "role": {
    "id": 3,
    "type": "tenant",
    "parent_id": null,
    "name": "Manager",
    "description": null,
    "allow": ["orders.view"],
    "deny": [],
    "is_default": false,
    "is_super": false,
    "ordering": 0,
    "created_at": "2024-01-01T12:00:00.000000Z",
    "updated_at": "2024-01-01T12:00:00.000000Z"
  }
}
```

When no listener sets morph resources, those fields are `null`. When `memberable_type` / `memberable_id` are both null, `memberable_resource` is `null` without dispatching.

## Field Details

### Complete Field Reference

| Field | Type | Always present | Description | Example |
|-------|------|----------------|-------------|---------|
| `id` | integer | yes | Membership id | `10` |
| `personable_type` | string | yes | Morph type of the person | `"App\\Models\\User"` |
| `personable_id` | integer | yes | Personable id | `42` |
| `memberable_type` | string\|null | yes | Optional context morph type | `"App\\Models\\Tenant"` |
| `memberable_id` | integer\|null | yes | Optional context morph id | `7` |
| `role_id` | integer\|null | yes | Assigned role id | `3` |
| `collection` | string\|null | yes | Collection / bucket | `"staff"` |
| `is_owner` | boolean | yes | Owner flag | `false` |
| `expired_at` | string\|null | yes | ISO 8601 expiry | `null` |
| `allow` | array&lt;string&gt; | yes | Membership allow overlay (`null` → `[]`) | `[]` |
| `deny` | array&lt;string&gt; | yes | Membership deny overlay (`null` → `[]`) | `[]` |
| `created_at` | string\|null | yes | ISO 8601 | `"2024-03-01T10:00:00.000000Z"` |
| `updated_at` | string\|null | yes | ISO 8601 | `"2024-03-01T10:00:00.000000Z"` |
| `deleted_at` | string\|null | yes | Soft-delete timestamp | `null` |
| `personable_resource` | mixed\|null | yes | From `PersonableResourceEvent` | object / null |
| `memberable_resource` | mixed\|null | yes | From `MemberableResourceEvent` | object / null |
| `role` | object | whenLoaded | Nested `RoleResource` | — |

### whenLoaded Relations

| JSON key | Relation | Resource |
|----------|----------|----------|
| `role` | `role` | `RoleResource::make` |

### Morph resource events

| Accessor | Event | Property to set |
|----------|-------|-----------------|
| `personable_resource` | `PersonableResourceEvent` | `$event->resource` |
| `memberable_resource` | `MemberableResourceEvent` | `$event->resource` |

```php
use JobMetric\Rolix\Events\Resources\PersonableResourceEvent;
use App\Http\Resources\UserResource;

Event::listen(PersonableResourceEvent::class, function (PersonableResourceEvent $event) {
    if ($event->personable instanceof \App\Models\User) {
        $event->resource = UserResource::make($event->personable);
    }
});
```

## Basic Usage

```php
use JobMetric\Rolix\Models\Membership;
use JobMetric\Rolix\Http\Resources\MembershipResource;

$membership = Membership::with('role')->find(10);

return MembershipResource::make($membership);
```

```php
return MembershipResource::collection(
    Membership::query()->with('role')->paginate(25)
);
```

## Service Integration

```php
use JobMetric\Rolix\Facades\Membership;
use JobMetric\Rolix\Http\Resources\MembershipResource;

$response = Membership::store([
    'personable_type' => App\Models\User::class,
    'personable_id' => 42,
    'role_id' => 3,
]);

return MembershipResource::make($response->getData());
```

## Related Documentation

- <Link to="/packages/rolix/deep-diving/resources/role-resource">RoleResource</Link>
- <Link to="/packages/rolix/deep-diving/events">Domain Events</Link> (Personable / Memberable resource events)
- <Link to="/packages/rolix/deep-diving/services/membership">Membership Service</Link>
