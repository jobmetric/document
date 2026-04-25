---
sidebar_position: 9
sidebar_label: Reusable CRUD Service Layer
---

# Reusable CRUD Service Layer

`AbstractCrudService` is a powerful base class for CRUD services that bundles query building, resource transformation, lifecycle hooks, domain events, and a unified response contract.

---

## Features

- Querying with filter/sort support
- Resource-based output transformation
- Transaction wrapping for mutating actions
- Lifecycle hooks (`beforeStore`, `afterUpdate`, etc.)
- Optional soft-delete restore/force-delete flow
- Standard response contract via `JobMetric\PackageCore\Output\Response`

---

## Typical Service Example

```php
class PostService extends \JobMetric\PackageCore\Services\AbstractCrudService
{
    protected string $entityName = 'Post';
    protected bool $softDelete = true;
    protected bool $hasRestore = true;
    protected bool $hasForceDelete = true;

    protected static string $modelClass = \App\Models\Post::class;
    protected static string $resourceClass = \App\Http\Resources\PostResource::class;
    protected static array $fields = ['id', 'title', 'status', 'created_at'];
    protected static array $defaultSort = ['-id'];
}
```

---

## Main Methods

### query

Builds the base query with filtering/sorting support and optional relations.  
Use this when you need to compose custom flows on top of the standard query pipeline.

```php
$query = $service->query(['status' => 'published'], ['author']);
```

### paginate

Returns paginated, transformed results using the configured resource class.  
Best for index endpoints that need stable API pagination behavior.

```php
$response = $service->paginate(20, ['status' => 'published'], ['author']);
```

### all

Returns all matched records without pagination while still applying transformation rules.  
Use carefully for bounded result sets.

```php
$response = $service->all(['status' => 'draft']);
```

### show

Retrieves a single record by identifier and applies resource transformation.  
Use this for detail endpoints and internal service reads.

```php
$response = $service->show(1, ['author', 'comments']);
```

### store

Creates a new record within the service lifecycle (hooks/events/response).  
Input can be normalized through `changeFieldStore` before persistence.

```php
$response = $service->store(['title' => 'New Post', 'status' => 'published']);
```

### update

Updates an existing record through the same lifecycle pipeline as create operations.  
Useful for centralizing validation-adjacent mutation logic.

```php
$response = $service->update(1, ['title' => 'Updated Title']);
```

### destroy

Deletes a record (soft delete when enabled).  
Use this for standard removal operations with event support.

```php
$response = $service->destroy(1);
```

### restore

Restores a soft-deleted record when restore support is enabled.  
Useful for reversible delete workflows.

```php
$response = $service->restore(1);
```

### forceDelete

Permanently removes a soft-deleted record when force-delete is enabled.  
Use for irreversible cleanup operations only.

```php
$response = $service->forceDelete(1);
```

Quick usage example:

```php
$service = app(PostService::class);

$list = $service->paginate(20, ['status' => 'published'], ['author']);
$single = $service->show(1, ['author', 'comments']);
```

---

## Hook Points

Override these methods when needed:

- `changeFieldStore`, `beforeStore`, `afterStore`
- `changeFieldUpdate`, `beforeUpdate`, `afterUpdate`
- `beforeDestroy`, `afterDestroy`
- `beforeRestore`, `afterRestore`
- `beforeForceDelete`, `afterForceDelete`

Hook example:

```php
protected function beforeStore(Model $model, array &$data): void
{
    $data['created_by'] = auth()->id();
}

protected function afterUpdate(Model $model, array &$data): void
{
    activity()->performedOn($model)->log('Entity updated');
}
```

---

## Event Properties

Use these properties to dispatch domain events after operations:

- `$storeEventClass`
- `$updateEventClass`
- `$deleteEventClass`
- `$restoreEventClass`
- `$forceDeleteEventClass`

Example:

```php
protected static ?string $storeEventClass = \App\Events\PostStored::class;
```

---

## Response Contract

Service methods can return a standardized `Response::make(...)` payload:

```php
Response::make(
    true,
    'Post created successfully',
    PostResource::make($post),
    201
);
```

---

## Best Practices

- Keep one dedicated service per entity/domain aggregate
- Centralize mutation logic in hooks instead of controllers
- Keep event mappings explicit and predictable
- Pass required relations intentionally in `show/paginate`
- Use DTO/FormRequest normalization before `store/update`

## Common Pitfalls

- Moving too much business logic into controllers
- Inconsistent response shapes between endpoints
- Skipping transactions for critical operations
- Forgetting soft-delete feature flags (`hasRestore`, `hasForceDelete`)
