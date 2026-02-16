---
sidebar_position: 7
sidebar_label: HasDriverNamespaceType
---

import Link from "@docusaurus/Link";

# HasDriverNamespaceType

Adds driver-namespace config per type. Each type can have multiple driver classes (namespace => options). Requires implementing `namespaceDriver()` to build the default driver namespace (e.g. `"Media"` for `App\Media`).

## Namespace

```php
JobMetric\Typeify\Traits\HasDriverNamespaceType
```

## Abstract Method

### namespaceDriver(): string

Return the base name used to build the default driver namespace (e.g. `"Media"` for `App\Media`).

## Methods

### driverNamespace(array $driverNamespace): static

Register or merge driver namespace(s) for the current type. Keys are class namespaces, values are options (e.g. `['deletable' => true]`). If the type has no drivers yet, a default entry is added using `appNamespace() . Str::studly(namespaceDriver())` with `['deletable' => true]`.

```php
$type->define('video')->driverNamespace([
    App\Media\VideoDriver::class => ['deletable' => true],
]);
```

**Throws:** `TypeifyTypeNotMatchException` when no type is selected.

### getDriverNamespace(): \Illuminate\Support\Collection

Get the driver namespace map for the current type (namespace => options).

```php
$postType->type('blog');
$drivers = $postType->getDriverNamespace();
```

**Throws:** `TypeifyTypeNotMatchException` when no type is selected.

## Related

- <Link to="/packages/typeify/deep-diving/base-type">BaseType</Link>
