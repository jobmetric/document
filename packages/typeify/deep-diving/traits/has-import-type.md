---
sidebar_position: 3
sidebar_label: HasImportType
---

import Link from "@docusaurus/Link";

# HasImportType

Adds import flag for the current type (enable or check).

## Namespace

```php
JobMetric\Typeify\Traits\HasImportType
```

## Methods

### import(): static

Enable import for the current type.

```php
$postType->define('blog')->import();
```

**Throws:** `TypeifyTypeNotMatchException` when no type is selected.

### hasImport(): bool

Whether import is enabled for the current type.

```php
$postType->type('blog');
if ($postType->hasImport()) {
    // allow import for this type
}
```

**Throws:** `TypeifyTypeNotMatchException` when no type is selected.

## Related

- <Link to="/packages/typeify/deep-diving/traits/has-export-type">HasExportType</Link>
- <Link to="/packages/typeify/deep-diving/base-type">BaseType</Link>
