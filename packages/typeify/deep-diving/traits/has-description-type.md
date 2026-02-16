---
sidebar_position: 2
sidebar_label: HasDescriptionType
---

import Link from "@docusaurus/Link";

# HasDescriptionType

Adds description getter/setter for the current type. The description is passed to `trans()` when getting.

## Namespace

```php
JobMetric\Typeify\Traits\HasDescriptionType
```

## Methods

### description(string $description): static

Set the description for the current type (translation key or literal text).

```php
$postType->define('blog')->description('Posts for the blog section');
```

**Throws:** `TypeifyTypeNotMatchException` when no type is selected.

### getDescription(): string

Get the description for the current type (run through `trans()`).

```php
$postType->type('blog');
$description = $postType->getDescription();
```

**Throws:** `TypeifyTypeNotMatchException` when no type is selected.

## Related

- <Link to="/packages/typeify/deep-diving/traits/has-label-type">HasLabelType</Link>
- <Link to="/packages/typeify/deep-diving/base-type">BaseType</Link>
