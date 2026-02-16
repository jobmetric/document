---
sidebar_position: 2
sidebar_label: TypeifyTypeNotMatchException
---

import Link from "@docusaurus/Link";

# TypeifyTypeNotMatchException

Thrown when no type is selected or the current type is not registered, and you try to get/set parameters (e.g. `get()`, `getLabel()`, or trait setters without a selected type).

## Namespace

```php
JobMetric\Typeify\Exceptions\TypeifyTypeNotMatchException
```

## Constructor

```php
public function __construct(string $service, string $type, int $code = 400, ?Throwable $previous = null)
```

- **$service** – The service class name (e.g. your `PostType` class).
- **$type** – The type key (may be empty when no type is set).
- **$code** – HTTP-style code (default 400).
- **$previous** – Optional previous throwable.

## Message

`"Type [$type] is not match in service [$service]."`

## When It Is Thrown

- When you call `get()`, `getLabel()`, `getDescription()`, or any trait getter/setter without having called `define('key')` or `type('key')` first.
- When you call `ensureTypeExists('key')` and the type is not registered.

## Example

```php
$postType = new PostType();
$postType->getLabel();
```

This throws `TypeifyTypeNotMatchException` because no type was selected.

```php
$postType->define('blog');
$postType->ensureTypeExists('news');
```

This throws when `news` is not defined.

## Related

- <Link to="/packages/typeify/deep-diving/exceptions/typeify-type-not-found-exception">TypeifyTypeNotFoundException</Link>
- <Link to="/packages/typeify/deep-diving/base-type">BaseType</Link>
