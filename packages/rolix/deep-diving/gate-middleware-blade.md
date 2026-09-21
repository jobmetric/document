---
sidebar_position: 3
sidebar_label: Gate Middleware Blade
---

# Gate, Middleware & Blade

Rolix registers authorization surfaces in `RolixServiceProvider::afterBootPackage` so you can authorize without custom controllers.

## When to Use

- **Gate** — policies, `Gate::allows`, `$this->authorize()`
- **Middleware** — protect routes with a permission key
- **Blade** — show/hide UI by permission
- **Helper** — checks outside HTTP (jobs, CLI, nested services)

## Gate::before

If the authenticated user object implements `hasPermission()`, Gate abilities map to Rolix permission keys.

```php
Gate::allows('hero.view');
Gate::forUser($user)->allows('hero.view');

// with memberable context
Gate::allows('hero.view', [$tenant]);

// context + collection
Gate::allows('hero.view', [$tenant, 'ops']);
```

### Argument Rules

| Gate `$arguments[0]` | Gate `$arguments[1]` | Passed to `hasPermission` |
|----------------------|----------------------|---------------------------|
| `Model` instance | — | `$context` |
| `Model` instance | `string` | `$context`, `$collection` |
| non-Model | — | ignored (`null` context) |

If the user is missing `hasPermission`, Gate continues to normal policies (`null` from `before`).

---

## Middleware `rolix.permission`

Alias registered as `rolix.permission` → `EnsurePermission`.

```php
Route::get('/hero', HeroController::class)
    ->middleware('rolix.permission:hero.view');
```

### `EnsurePermission::handle()`

```php
public function handle(
    Request $request,
    Closure $next,
    string $permission
): Response
```

| Source | Used as |
|--------|---------|
| `$request->user()` | Must implement `hasPermission` |
| `$request->attributes['rolix.memberable']` | Optional `Model` context |
| `$request->attributes['rolix.collection']` | Optional collection string |

Aborts with **403** when unauthorized.

```php
// In a previous middleware or controller:
$request->attributes->set('rolix.memberable', $tenant);
$request->attributes->set('rolix.collection', 'ops');
```

---

## Blade `@rolixCan`

```blade
@rolixCan('hero.view')
    <a href="...">Hero</a>
@endrolixCan

@rolixCan('hero.view', $tenant)
    ...
@endrolixCan

@rolixCan('hero.view', $tenant, 'ops')
    ...
@endrolixCan
```

Uses `auth()->user()->hasPermission(...)`. Returns `false` when guest or user lacks the method.

Programmatic check:

```php
Blade::check('rolixCan', 'hero.view', $tenant);
```

---

## Helper `rolix_has_permission()`

```php
function rolix_has_permission(
    mixed $user,
    string $permission,
    ?Model $context = null,
    ?string $collection = null
): bool
```

```php
if (rolix_has_permission($user, 'hero.view', $tenant)) {
    // ...
}

rolix_has_permission(null, 'hero.view'); // false
```

## Related Documentation

- [HasRole](/packages/rolix/deep-diving/has-role)
- [Permission Manager](/packages/rolix/deep-diving/permission-manager)
- [Showcase](/packages/rolix/showcase)
