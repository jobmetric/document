---
sidebar_position: 4
sidebar_label: HasExportType
---

import Link from "@docusaurus/Link";

# HasExportType

Adds export flag for the current type (enable or check).

## Namespace

```php
JobMetric\Typeify\Traits\HasExportType
```

## Methods

### export(): static

Enable export for the current type.

```php
$postType->define('blog')->export();
```

**Throws:** `TypeifyTypeNotMatchException` when no type is selected.

### hasExport(): bool

Whether export is enabled for the current type.

```php
$postType->type('blog');
if ($postType->hasExport()) {
    // allow export for this type
}
```

**Throws:** `TypeifyTypeNotMatchException` when no type is selected.

## Related

- <Link to="/packages/typeify/deep-diving/traits/has-import-type">HasImportType</Link>
- <Link to="/packages/typeify/deep-diving/base-type">BaseType</Link>
