---
sidebar_position: 5
sidebar_label: HasHierarchicalType
---

import Link from "@docusaurus/Link";

# HasHierarchicalType

Adds hierarchical flag for the current type (enable or check). Use when the type supports parent/child or tree structure.

## Namespace

```php
JobMetric\Typeify\Traits\HasHierarchicalType
```

## Methods

### hierarchical(): static

Enable hierarchical structure for the current type.

```php
$postType->define('page')->hierarchical();
```

**Throws:** `TypeifyTypeNotMatchException` when no type is selected.

### hasHierarchical(): bool

Whether hierarchical is enabled for the current type.

```php
$postType->type('page');
if ($postType->hasHierarchical()) {
    // show parent selector, tree UI, etc.
}
```

**Throws:** `TypeifyTypeNotMatchException` when no type is selected.

## Related

- <Link to="/packages/typeify/deep-diving/base-type">BaseType</Link>
