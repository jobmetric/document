---
sidebar_position: 4
sidebar_label: UpdateMembershipRequest
---

import Link from "@docusaurus/Link";

# UpdateMembershipRequest

Form request for validating membership **update** payloads. Supports dto context for the membership id (reserved for callers; current rules do not depend on it).

## Namespace

```php
JobMetric\Rolix\Http\Requests\Membership\UpdateMembershipRequest
```

## Overview

- Partial updates via `sometimes` rules
- Static `rulesFor($input, $context)` for `dto()`
- `setContext(array $context)` stores context used by `rules()`
- No `withValidator` — domain invariants stay in the Membership service

`authorize()` returns `true`.

## Context

| Key | Typical use |
|-----|-------------|
| `id` | Membership id when calling `dto(..., ['id' => $membership->id])` |

Context is accepted for consistency with other Update requests; the published `rulesFor` list does not currently branch on it.

## Validation Rules (`rulesFor`)

| Field | Rule | Description |
|-------|------|-------------|
| `role_id` | `sometimes\|nullable\|integer\|exists:{rolix.tables.role},id` | Change assigned role |
| `collection` | `sometimes\|nullable\|string` | Change collection |
| `is_owner` | `sometimes\|boolean` | Change owner flag |
| `expired_at` | `sometimes\|nullable\|date` | Set or clear expiry |
| `allow` | `sometimes\|array` | Replace membership allow list |
| `allow.*` | `string` | |
| `deny` | `sometimes\|array` | Replace membership deny list |
| `deny.*` | `string` | |

Personable / memberable morphs are **not** updatable through this request.

## Attributes

`role_id`, `collection`, `is_owner`, `expired_at`, `allow`, `deny` via `rolix::base.fields.*`.

## withValidator

**Not implemented.**

## Usage Examples

### Change role and expiry

```php
use JobMetric\Rolix\Facades\Membership;

Membership::update($membershipId, [
    'role_id' => 5,
    'expired_at' => '2026-12-31 23:59:59',
]);
```

### Clear expiry and update overlays

```php
Membership::update($membershipId, [
    'expired_at' => null,
    'allow' => ['billing.view'],
    'deny' => ['billing.manage'],
    'is_owner' => true,
]);
```

### Controller

```php
use JobMetric\Rolix\Http\Requests\Membership\UpdateMembershipRequest;
use JobMetric\Rolix\Facades\Membership;

public function update(UpdateMembershipRequest $request, int $id)
{
    return Membership::update($id, $request->validated());
}
```

### dto with context

```php
$data = dto($payload, UpdateMembershipRequest::class, ['id' => $membership->id]);
```

## Related Documentation

- <Link to="/packages/rolix/deep-diving/requests/store-membership-request">StoreMembershipRequest</Link>
- <Link to="/packages/rolix/deep-diving/services/membership">Membership Service</Link>
- <Link to="/packages/rolix/deep-diving/resources/membership-resource">MembershipResource</Link>
