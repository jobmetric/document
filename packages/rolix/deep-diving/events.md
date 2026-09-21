---
sidebar_position: 5
sidebar_label: Events
---

import Link from "@docusaurus/Link";

# Domain Events

All Rolix domain events implement `JobMetric\EventSystem\Contracts\DomainEvent` and are registered on `EventRegistry` in `RolixServiceProvider::afterBootPackage()` when Event System is installed (`$this->app->bound('EventRegistry')`).

Titles and descriptions live under `rolix::base.events.*` (en/fa).

## Quick Reference

| Class | `key()` | Fired when |
|-------|---------|------------|
| `RoleStoreEvent` | `role.stored` | Role created |
| `RoleUpdateEvent` | `role.updated` | Role updated |
| `RoleDeleteEvent` | `role.deleted` | Role deleted |
| `MembershipStoreEvent` | `membership.stored` | Membership created |
| `MembershipUpdateEvent` | `membership.updated` | Membership updated |
| `MembershipDeleteEvent` | `membership.deleted` | Membership soft-deleted |
| `MembershipRestoreEvent` | `membership.restored` | Membership restored |
| `MembershipForceDeleteEvent` | `membership.force_deleted` | Membership force-deleted |
| `RegisterPathPermissionEvent` | `permission.paths_registering` | App booted — collect permission file paths |
| `PersonableResourceEvent` | `resource.personable` | Resolving personable API resource |
| `MemberableResourceEvent` | `resource.memberable` | Resolving memberable API resource |
| `ActorResourceEvent` | `resource.actor` | Resolving activity-log actor resource |
| `TargetResourceEvent` | `resource.target` | Resolving activity-log target resource |
| `ContextResourceEvent` | `resource.context` | Resolving activity-log context resource |
| `SubjectResourceEvent` | `resource.subject` | Resolving activity-log subject resource |

CRUD events are wired through `AbstractCrudService` via `$storeEventClass`, `$updateEventClass`, `$deleteEventClass`, etc. on the Role / Membership services.

---

## Role Events

### RoleStoreEvent

**Namespace:** `JobMetric\Rolix\Events\Role\RoleStoreEvent`  
**Key:** `role.stored`  
**Tags:** `role`, `storage`, `management`

| Constructor prop | Type | Description |
|------------------|------|-------------|
| `$role` | `Role` | Newly stored role |
| `$data` | `array` | Store payload (default `[]`) |

**When fired:** After a successful `Role::store()`.

```php
use Illuminate\Support\Facades\Event;
use JobMetric\Rolix\Events\Role\RoleStoreEvent;

Event::listen(RoleStoreEvent::class, function (RoleStoreEvent $event) {
    logger()->info('Role stored', [
        'id' => $event->role->id,
        'name' => $event->role->name,
        'data' => $event->data,
    ]);
});
```

### RoleUpdateEvent

**Namespace:** `JobMetric\Rolix\Events\Role\RoleUpdateEvent`  
**Key:** `role.updated`  
**Tags:** `role`, `storage`, `management`

| Constructor prop | Type | Description |
|------------------|------|-------------|
| `$role` | `Role` | Updated role |
| `$data` | `array` | Update payload (default `[]`) |

**When fired:** After a successful `Role::update()`.

```php
Event::listen(RoleUpdateEvent::class, function (RoleUpdateEvent $event) {
    cache()->forget("rolix.role.{$event->role->id}");
});
```

### RoleDeleteEvent

**Namespace:** `JobMetric\Rolix\Events\Role\RoleDeleteEvent`  
**Key:** `role.deleted`  
**Tags:** `role`, `storage`, `management`

| Constructor prop | Type | Description |
|------------------|------|-------------|
| `$role` | `Role` | Deleted role instance |

**When fired:** After a successful `Role::destroy()` (super roles are blocked before delete).

```php
Event::listen(RoleDeleteEvent::class, function (RoleDeleteEvent $event) {
    // $event->role still holds attributes after deletion from the service flow
});
```

---

## Membership Events

### MembershipStoreEvent

**Namespace:** `JobMetric\Rolix\Events\Membership\MembershipStoreEvent`  
**Key:** `membership.stored`  
**Tags:** `membership`, `storage`, `management`

| Constructor prop | Type | Description |
|------------------|------|-------------|
| `$membership` | `Membership` | Created membership |
| `$data` | `array` | Store payload (default `[]`) |

**When fired:** After `Membership::store()`.

```php
use JobMetric\Rolix\Events\Membership\MembershipStoreEvent;

Event::listen(MembershipStoreEvent::class, function (MembershipStoreEvent $event) {
    notifyAdmins($event->membership);
});
```

### MembershipUpdateEvent

**Namespace:** `JobMetric\Rolix\Events\Membership\MembershipUpdateEvent`  
**Key:** `membership.updated`

| Constructor prop | Type | Description |
|------------------|------|-------------|
| `$membership` | `Membership` | Updated membership |
| `$data` | `array` | Update payload (default `[]`) |

**When fired:** After `Membership::update()`.

### MembershipDeleteEvent

**Namespace:** `JobMetric\Rolix\Events\Membership\MembershipDeleteEvent`  
**Key:** `membership.deleted`

| Constructor prop | Type | Description |
|------------------|------|-------------|
| `$membership` | `Membership` | Soft-deleted membership |

**When fired:** After soft delete (`destroy`).

### MembershipRestoreEvent

**Namespace:** `JobMetric\Rolix\Events\Membership\MembershipRestoreEvent`  
**Key:** `membership.restored`

| Constructor prop | Type | Description |
|------------------|------|-------------|
| `$membership` | `Membership` | Restored membership |

**When fired:** After `Membership::restore()`.

### MembershipForceDeleteEvent

**Namespace:** `JobMetric\Rolix\Events\Membership\MembershipForceDeleteEvent`  
**Key:** `membership.force_deleted`

| Constructor prop | Type | Description |
|------------------|------|-------------|
| `$membership` | `Membership` | Permanently deleted membership |

**When fired:** After `Membership::forceDelete()`.

```php
use JobMetric\Rolix\Events\Membership\MembershipForceDeleteEvent;

Event::listen(MembershipForceDeleteEvent::class, function (MembershipForceDeleteEvent $event) {
    audit()->note('membership purged', $event->membership->id);
});
```

---

## Permission Paths

### RegisterPathPermissionEvent

**Namespace:** `JobMetric\Rolix\Events\RegisterPathPermissionEvent`  
**Key:** `permission.paths_registering`  
**Tags:** `permission`, `registration`, `management`

Mutable collector (not a readonly CRUD event). Constructed with an empty path map, then listeners call `addPath()`.

| Method | Signature | Description |
|--------|-----------|-------------|
| `addPath` | `(string $context, string $path, ?string $model = null): void` | Register a permission PHP file; throws `InvalidArgumentException` on duplicate context+model |
| `getPaths` | `(): array` | Flat list of `[context, path, model\|null]` |

**When fired:** Once on `app()->booted()` in `RolixServiceProvider`, after loading `config_path('permissions/*.php')`. Returned paths are passed to `Permission::addPermissionFile()`.

```php
use JobMetric\Rolix\Events\RegisterPathPermissionEvent;
use App\Models\Tenant;

Event::listen(RegisterPathPermissionEvent::class, function (RegisterPathPermissionEvent $event) {
    $event->addPath('hero', __DIR__.'/../permissions/hero.php');
    $event->addPath('hero', __DIR__.'/../permissions/hero-tenant.php', Tenant::class);
});
```

`null` / empty `$model` maps to the system model key inside `PermissionManager`.

---

## Resource Resolution Events

Mutable events used by model accessors to supply JsonResource (or array) payloads for morph relations. Listen and set `$event->resource`.

### PersonableResourceEvent

**Key:** `resource.personable`  
**Props:** `$personable` (mixed), `$resource` (mixed\|null, set by listener)

**When fired:** `Membership::getPersonableResourceAttribute()`.

```php
use JobMetric\Rolix\Events\Resources\PersonableResourceEvent;
use App\Http\Resources\UserResource;

Event::listen(PersonableResourceEvent::class, function (PersonableResourceEvent $event) {
    if ($event->personable instanceof \App\Models\User) {
        $event->resource = UserResource::make($event->personable);
    }
});
```

### MemberableResourceEvent

**Key:** `resource.memberable`  
**Props:** `$memberable` (mixed), `$resource` (mixed\|null)

**When fired:** `Membership::getMemberableResourceAttribute()` when memberable morph keys are set.

### ActorResourceEvent

**Key:** `resource.actor`  
**Props:** `$actor` (mixed), `$resource` (mixed\|null)

**When fired:** `RoleActivityLog::getActorResourceAttribute()`.

### TargetResourceEvent

**Key:** `resource.target`  
**Props:** `$target` (mixed), `$resource` (mixed\|null)

**When fired:** `RoleActivityLog::getTargetResourceAttribute()`.

### ContextResourceEvent

**Key:** `resource.context`  
**Props:** `$context` (mixed), `$resource` (mixed\|null)

**When fired:** `RoleActivityLog::getContextResourceAttribute()`.

### SubjectResourceEvent

**Key:** `resource.subject`  
**Props:** `$subject` (mixed), `$resource` (mixed\|null)

**When fired:** `RoleActivityLog::getSubjectResourceAttribute()`.

```php
use JobMetric\Rolix\Events\Resources\ActorResourceEvent;

Event::listen(ActorResourceEvent::class, function (ActorResourceEvent $event) {
    if ($event->actor instanceof \App\Models\User) {
        $event->resource = [
            'id' => $event->actor->id,
            'name' => $event->actor->name,
        ];
    }
});
```

---

## Listening Tips

- Prefer `Event::listen(SomeEvent::class, …)` or dedicated listener classes.
- Domain event `key()` values are stable for Event System UI / registry metadata.
- Resource events start with `$resource = null`; leave unset if you do not handle that morph type.

## Related Documentation

- <Link to="/packages/rolix/deep-diving/activity-log">Activity Log</Link>
- <Link to="/packages/rolix/deep-diving/resources/membership-resource">MembershipResource</Link>
- <Link to="/packages/laravel-event-system/deep-diving/domain-event">Event System DomainEvent</Link>
