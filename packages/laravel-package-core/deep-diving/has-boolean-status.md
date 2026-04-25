---
sidebar_position: 5
sidebar_label: Boolean Status Scopes
---

# Boolean Status Scopes

`HasBooleanStatus` is a simple trait for models with a boolean status field (such as `status` or `is_active`, depending on implementation).

---

## What It Adds

This trait adds ready-to-use query scopes:

- `active()`
- `inactive()`

---

## Usage

```php
use JobMetric\PackageCore\Models\HasBooleanStatus;

class User extends Model
{
    use HasBooleanStatus;
}
```

---

## Query Scopes

Use the built-in scopes directly:

```php
$users = User::active()->get();
$disabledUsers = User::inactive()->get();
```

### active

Filters records to the enabled/active state based on trait logic.  
Use this scope in list endpoints, business queries, and dashboards where only active entities should be visible.

```php
$activeUsers = User::active()->latest()->paginate(20);
```

### inactive

Filters records to the disabled/inactive state.  
This is useful for audit views, re-activation flows, and administrative cleanup screens.

```php
$inactiveUsers = User::inactive()->whereNotNull('deleted_at')->get();
```

You can also chain them with other query constraints:

```php
$users = User::active()
    ->where('role', 'admin')
    ->latest()
    ->paginate(20);
```

---

## Recommended Pattern

- Use this trait when models share a consistent active/inactive convention
- Avoid duplicating active/inactive conditions in controllers
- Customize trait behavior if your status column naming differs

## Common Pitfalls

- Assuming every model uses the same status column name
- Mixing complex business status semantics with simple boolean status
