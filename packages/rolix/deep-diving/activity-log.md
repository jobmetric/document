---
sidebar_position: 6
sidebar_label: Activity Log
---

import Link from "@docusaurus/Link";

# Activity Log

Rolix records role and membership mutations in `role_activity_logs` (config key `rolix.tables.role_activity_log`) through `JobMetric\Rolix\Support\ActivityLogger`. Failures inside the logger are swallowed so audit issues never break domain mutations.

## Wiring

`Role` and `Membership` services call `ActivityLogger::log()` from `afterCommon` for mutating operations:

| Operation | Role action | Membership action |
|-----------|-------------|-------------------|
| `store` | `create_role` | `assign_role` |
| `update` | `update_role` | `update_membership` |
| `destroy` | `delete_role` | `remove_role` |
| `restore` | — | `restore_membership` |
| `forceDelete` | — | `force_delete_membership` |

Role’s `afterCommon` logs for `store`, `update`, and `destroy`. Membership soft-delete / restore / force-delete follow the same logger with the matching CRUD operation name.

---

## ActivityLogger::log

**Namespace:** `JobMetric\Rolix\Support\ActivityLogger`

```php
public static function log(string $operation, Model $model, array $data = []): void
```

### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `$operation` | `string` | CRUD operation name (`store`, `update`, `destroy`, `restore`, `forceDelete`, or custom) |
| `$model` | `Model` | Subject model (`Role` or `Membership`) |
| `$data` | `array` | Optional payload; currently reads `$data['reason']` into the log row |

### Behavior

1. Resolves `action` via `ActivityActions::fromOperation($operation, $model)`.
2. Reads the authenticated user from `Auth::user()` as actor; if not a `Model`, uses `actor_type = 'system'` and `actor_id = 0`.
3. Sets `subject_type` / `subject_id` from `$model->getMorphClass()` / `$model->getKey()`.
4. Fills target / context based on model type:

| Subject | `target_*` | `context_*` |
|---------|------------|-------------|
| `Membership` | personable morph | memberable morph (may be null) |
| `Role` | role morph (same as subject) | `null` |
| other `Model` | subject morph | (not specially set) |

5. Captures `ip_address` from `request()?->ip()`, `user_agent` from `request()?->userAgent()`, and `performed_at` as `now()`.
6. Creates a `RoleActivityLog` row inside `try/catch (Throwable)` — exceptions are ignored.

### Manual usage

```php
use JobMetric\Rolix\Support\ActivityLogger;

ActivityLogger::log('store', $role, ['reason' => 'Imported from legacy ACL']);
```

---

## ActivityActions

**Namespace:** `JobMetric\Rolix\Support\ActivityActions`

### Constants

| Constant | Value |
|----------|-------|
| `CREATE_ROLE` | `create_role` |
| `UPDATE_ROLE` | `update_role` |
| `DELETE_ROLE` | `delete_role` |
| `ASSIGN_ROLE` | `assign_role` |
| `REMOVE_ROLE` | `remove_role` |
| `UPDATE_MEMBERSHIP` | `update_membership` |
| `RESTORE_MEMBERSHIP` | `restore_membership` |
| `FORCE_DELETE_MEMBERSHIP` | `force_delete_membership` |

### fromOperation

```php
public static function fromOperation(string $operation, object $subject): string
```

| `$operation` | If `$subject instanceof Role` | Otherwise (membership / other) |
|--------------|-------------------------------|--------------------------------|
| `store` | `create_role` | `assign_role` |
| `update` | `update_role` | `update_membership` |
| `destroy` | `delete_role` | `remove_role` |
| `restore` | `restore_membership` | `restore_membership` |
| `forceDelete` | `force_delete_membership` | `force_delete_membership` |
| anything else | returned as-is (`$operation`) | returned as-is |

```php
use JobMetric\Rolix\Support\ActivityActions;
use JobMetric\Rolix\Models\Role;

ActivityActions::fromOperation('store', new Role); // create_role
```

---

## RoleActivityLog Model

**Namespace:** `JobMetric\Rolix\Models\RoleActivityLog`  
**Table:** `config('rolix.tables.role_activity_log')`

### Fields

| Column | Type | Description |
|--------|------|-------------|
| `id` | int | Primary key |
| `action` | string | Canonical action name (see constants) |
| `actor_type` | string | Morph type of actor, or `"system"` |
| `actor_id` | int | Actor id, or `0` for system |
| `target_type` | string | Morph type of the target entity |
| `target_id` | int | Target id |
| `context_type` | string\|null | Optional context morph type |
| `context_id` | int\|null | Optional context morph id |
| `subject_type` | string | Morph type of the mutated model |
| `subject_id` | int | Subject id |
| `reason` | string\|null | Optional reason from `$data['reason']` |
| `ip_address` | string\|null | Request IP |
| `user_agent` | string\|null | Request user agent |
| `performed_at` | datetime | When the action occurred |
| `created_at` / `updated_at` | datetime | Eloquent timestamps |

### Relations

| Method | Type | Morph columns |
|--------|------|---------------|
| `actor()` | `MorphTo` | `actor_type`, `actor_id` |
| `target()` | `MorphTo` | `target_type`, `target_id` |
| `context()` | `MorphTo` | `context_type`, `context_id` |
| `subject()` | `MorphTo` | `subject_type`, `subject_id` |

### Resource accessors

| Accessor | Event dispatched |
|----------|------------------|
| `actor_resource` | `ActorResourceEvent` |
| `target_resource` | `TargetResourceEvent` |
| `context_resource` | `ContextResourceEvent` |
| `subject_resource` | `SubjectResourceEvent` |

Listen and set `$event->resource` — same pattern as membership personable/memberable resources. See <Link to="/packages/rolix/deep-diving/events">Events</Link>.

### Example query

```php
use JobMetric\Rolix\Models\RoleActivityLog;
use JobMetric\Rolix\Support\ActivityActions;

$logs = RoleActivityLog::query()
    ->where('action', ActivityActions::ASSIGN_ROLE)
    ->where('target_type', App\Models\User::class)
    ->where('target_id', 42)
    ->latest('performed_at')
    ->get();

foreach ($logs as $log) {
    $actorJson = $log->actor_resource;
}
```

## Related Documentation

- <Link to="/packages/rolix/deep-diving/events">Domain Events</Link>
- <Link to="/packages/rolix/deep-diving/services/role">Role Service</Link>
- <Link to="/packages/rolix/deep-diving/services/membership">Membership Service</Link>
