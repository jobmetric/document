---
sidebar_position: 1
sidebar_label: HasLabelType
---

import Link from "@docusaurus/Link";

# HasLabelType

Adds label getter/setter for the current type. The label is passed to `trans()` when getting, so you can use translation keys or literal text.

## Namespace

```php
JobMetric\Typeify\Traits\HasLabelType
```

## Methods

### label(string $label): static

Set the label for the current type (translation key or literal text).

```php
$postType->define('blog')->label('Blog Post');
$postType->define('news')->label('posts.types.news');
```

**Throws:** `TypeifyTypeNotMatchException` when no type is selected.

### getLabel(): string

Get the label for the current type (run through `trans()`).

```php
$postType->type('blog');
$label = $postType->getLabel();
```

**Throws:** `TypeifyTypeNotMatchException` when no type is selected.

## Related

- <Link to="/packages/typeify/deep-diving/traits/has-description-type">HasDescriptionType</Link>
- <Link to="/packages/typeify/deep-diving/base-type">BaseType</Link>
