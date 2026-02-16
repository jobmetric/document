---
sidebar_position: 1
sidebar_label: TypeifyTypeNotFoundException
---

import Link from "@docusaurus/Link";

# TypeifyTypeNotFoundException

Thrown when switching to a type that is not registered in the registry (e.g. when calling `type('unknown')`).

## Namespace

```php
JobMetric\Typeify\Exceptions\TypeifyTypeNotFoundException
```

## Constructor

```php
public function __construct(string $service, string $type, int $code = 400, ?Throwable $previous = null)
```

- **$service** – The container key (value of `typeName()`).
- **$type** – The type key that was not found.
- **$code** – HTTP-style code (default 400).
- **$previous** – Optional previous throwable.

## Message

`"Type [$type] is not available in service [$service]."`

## When It Is Thrown

- When you call `type('key')` and `key` has not been defined with `define('key')`.

## Example

```php
$postType = new PostType();
$postType->define('blog');

$postType->type('blog');
$postType->type('news');
```

The second `type('news')` throws `TypeifyTypeNotFoundException` because `news` was never defined.

## Related

- <Link to="/packages/typeify/deep-diving/exceptions/typeify-type-not-match-exception">TypeifyTypeNotMatchException</Link>
- <Link to="/packages/typeify/deep-diving/base-type">BaseType</Link>
