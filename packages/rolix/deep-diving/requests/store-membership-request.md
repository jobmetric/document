---
sidebar_position: 3
sidebar_label: StoreMembershipRequest
---

import Link from "@docusaurus/Link";

# StoreMembershipRequest

Form request for validating membership **creation** payloads (assigning a role to a personable, optionally scoped to a memberable).

## Namespace

```php
JobMetric\Rolix\Http\Requests\Membership\StoreMembershipRequest
```

## Overview

Validates morph keys, optional role/collection/ownership/expiry, and per-membership allow/deny overlays. There is **no** `withValidator` — deeper domain checks (duplicates, memberable/role type match, default role resolution) run in the Membership service.

`authorize()` returns `true`.

## Validation Rules

| Field | Rule | Description |
|-------|------|-------------|
| `personable_type` | `required\|string` | Morph class / alias of the person (user, etc.) |
| `personable_id` | `required\|integer` | Personable primary key |
| `memberable_type` | `nullable\|string` | Optional context morph type (tenant, team, …) |
| `memberable_id` | `nullable\|integer` | Optional context morph id |
| `role_id` | `nullable\|integer\|exists:{rolix.tables.role},id` | Role to assign; service may fall back to default role when null |
| `collection` | `nullable\|string` | Logical collection / bucket |
| `is_owner` | `boolean` | Owner flag within the membership |
| `expired_at` | `nullable\|date` | Soft expiry for the membership |
| `allow` | `sometimes\|array` | Extra allow permissions on this membership |
| `allow.*` | `string` | |
| `deny` | `sometimes\|array` | Extra deny permissions on this membership |
| `deny.*` | `string` | |

## Attributes

Labels via `rolix::base.fields.*` for: `personable_type`, `personable_id`, `memberable_type`, `memberable_id`, `role_id`, `collection`, `is_owner`, `expired_at`, `allow`, `deny`.

## withValidator

**Not implemented.** Only Laravel `rules()` apply at the FormRequest layer.

## Usage Examples

### Assign role to a user in a tenant

```php
use JobMetric\Rolix\Facades\Membership;

Membership::store([
    'personable_type' => App\Models\User::class,
    'personable_id' => 42,
    'memberable_type' => App\Models\Tenant::class,
    'memberable_id' => 7,
    'role_id' => 3,
    'collection' => 'staff',
    'is_owner' => false,
    'expired_at' => null,
    'allow' => ['reports.export'],
    'deny' => [],
]);
```

### Controller

```php
use JobMetric\Rolix\Http\Requests\Membership\StoreMembershipRequest;
use JobMetric\Rolix\Facades\Membership;
use JobMetric\Rolix\Http\Resources\MembershipResource;

public function store(StoreMembershipRequest $request)
{
    $response = Membership::store($request->validated());

    return MembershipResource::make($response->getData())
        ->response()
        ->setStatusCode(201);
}
```

### Minimal (personable only)

```php
Membership::store([
    'personable_type' => App\Models\User::class,
    'personable_id' => 1,
    // role_id may be resolved to the default role by the service
]);
```

## Related Documentation

- <Link to="/packages/rolix/deep-diving/requests/update-membership-request">UpdateMembershipRequest</Link>
- <Link to="/packages/rolix/deep-diving/services/membership">Membership Service</Link>
- <Link to="/packages/rolix/deep-diving/resources/membership-resource">MembershipResource</Link>
