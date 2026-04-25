---
sidebar_position: 7
sidebar_label: Dynamic Resource Resolution
---

# Dynamic Resource Resolution

`ResourceResolveEvent` is a generic event for resolving the proper resource representation for any subject (model, DTO, or object) based on context.

---

## Why Use It

- Decouples models from resource classes
- Supports context-based transformations (`api.list`, `api.detail`, `admin.table`)
- Encourages deterministic rendering via declared `includes`
- Works well with polymorphic resources

---

## Event Contract (Conceptual)

Key properties:

- `subject`: object to be transformed
- `context`: usage location (`api.list`, `api.detail`, etc.)
- `hints`: behavior flags like `forbid_db`
- `includes`: expected relations for deterministic rendering
- `resource`: resolved output set by a listener

---

## Dispatch

```php
use JobMetric\PackageCore\Events\ResourceResolveEvent;

$event = new ResourceResolveEvent(
    subject: $post,
    context: 'api.detail',
    hints: ['forbid_db' => true],
    includes: ['category', 'tags']
);

event($event);

return $event->resource;
```

---

## Listener Example

```php
final class ResolvePostResource
{
    public function handle(ResourceResolveEvent $event): void
    {
        if ($event->isResolved() || ! $event->subject instanceof Post) {
            return;
        }

        $event->setResource(new PostResource($event->subject));
    }
}
```

---

## Context Strategy

- Keep a stable context naming convention:
  - `api.list`
  - `api.detail`
  - `admin.table`
  - `admin.detail`

---

## Best Practices

- Keep listeners synchronous
- Follow single-writer behavior (`if isResolved() return`)
- Avoid lazy loading in list contexts
- Declare required relations through `includes`
- Define a fallback strategy when no listener handles a subject

## Common Pitfalls

- Multiple listeners calling `setResource()` for the same subject
- Ambiguous or inconsistent context naming
- Listeners introducing unnecessary DB queries
