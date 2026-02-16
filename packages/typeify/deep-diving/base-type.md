---
sidebar_position: 1
sidebar_label: BaseType
---

import Link from "@docusaurus/Link";

# BaseType

The `BaseType` abstract class is the foundation for type registries. Subclasses register named types (keys) and attach parameters (label, description, flags) to each. State is stored in the Laravel container under the key returned by `typeName()`.

## Namespace

```php
JobMetric\Typeify\BaseType
```

## Overview

- **define(string $type)** – Register a new type and set it as current; chain trait methods to set parameters.
- **type(string $type)** – Switch current type to an existing one; throws if not registered.
- **get()** – Get all parameters for the current type.
- **getTypes()** – List all registered type keys.
- **hasType(string $type)** – Check if a type is registered.
- **ensureTypeExists(string $type)** – Throw if the type is not registered (use for validation).

## Abstract Method

### typeName(): string

Return a unique container key for this registry (e.g. `'post-type'`, `'product-type'`). All type data is stored in the Laravel container under this key. Must be unique across all your type registries so that different subclasses do not overwrite each other.

```php
protected function typeName(): string
{
    return 'post-type';
}
```

Use short, kebab-case names that describe the registry: `post-type`, `product-type`, `taxonomy-type`, `media-type`.

## Lifecycle

1. **Bootstrap** – You create an instance of your type class (e.g. `new PostType()`) and call `define('key')` for each type, chaining trait methods. This fills the Laravel container under `typeName()`.
2. **Usage** – Anywhere in the same request you can instantiate the same class again (or resolve from container), call `type('key')` to select a type, then use `get()`, `getLabel()`, `getDescription()`, or trait getters.
3. **Persistence** – Data lives only in the container for the current request. Typically you register types once per request (e.g. in a service provider or when building the registry) and then read them in controllers, APIs, or views.

## Defining Types

After `define($type)` the current type is set to `$type`, so you can chain methods from traits (`label()`, `description()`, `import()`, `export()`, etc.). Each call to `define()` adds or overwrites one type in the container.

```php
$postType = new PostType();

$postType->define('blog')
    ->label('Blog Post')
    ->description('Posts for the blog section');

$postType->define('news')
    ->label('News')
    ->description('News articles');
```

Defining the same key again overwrites that type's parameters. The order of definition does not matter for reading; use `getTypes()` to get the list of keys.

## Selecting a Type

Use `type($type)` to switch the current type. All subsequent getters (e.g. `get()`, `getLabel()`) refer to this type until you call `type()` again or `define()`.

```php
$postType->type('blog');
$params = $postType->get();
$label = $postType->getLabel();
```

**Throws:** <Link to="/packages/typeify/deep-diving/exceptions/typeify-type-not-found-exception">TypeifyTypeNotFoundException</Link> if the type is not registered.

## Reading Parameters

- **get()** – Returns the full array of parameters for the current type. Throws if no type is selected or the current type is not in the container.
- **getTypes()** – Returns the list of all registered type keys. Does not require a type to be selected.
- **hasType(string $type)** – Returns whether a type key is registered. Does not require a type to be selected.
- **ensureTypeExists(string $type)** – Throws if the type is not registered. Use this to validate user input or request parameters before calling `type($type)`.

```php
$postType->type('blog');
$all = $postType->get();
$postType->ensureTypeExists('blog');
$keys = $postType->getTypes();
$exists = $postType->hasType('blog');
```

**Throws:** <Link to="/packages/typeify/deep-diving/exceptions/typeify-type-not-match-exception">TypeifyTypeNotMatchException</Link> when no type is selected or when using `get()` and the current type is not registered.

## Container Storage

Type data is stored as a singleton in the Laravel container:

- **Key:** The value returned by `typeName()` (e.g. `'post-type'`).
- **Value:** An array of the form `[ 'typeKey' => [ 'param' => value, ... ], ... ]`.

The same data is shared for the whole request. If you register types in a service provider or at the start of a request, controllers, APIs, and CLI commands will see the same definitions. No need to pass the registry instance around unless you want to encapsulate access.

## Internal Methods (Protected)

Subclasses and traits use these; you typically do not call them from application code.

- **setInContainer(array $params)** – Replaces the entire type map in the container with `$params`. Used internally after `define()` or when a trait sets a parameter.
- **getInContainer()** – Returns the full type map from the container. If the key is not bound, it binds an empty array and returns it.
- **setTypeParam(string $key, mixed $params)** – Sets one parameter for the current type. Throws if no type is selected. Used by traits (e.g. `label()`, `import()`).
- **getTypeParam(string $key, mixed $default)** – Gets one parameter for the current type, or `$default` if missing. Used by traits (e.g. `getLabel()`, `hasImport()`).

The **TraitBooter** is used after each `define()` so that traits can run custom logic when a type is defined (e.g. set defaults).

## Validation and Safe Usage

When the type key comes from user input (e.g. request parameter, API query), validate it before use:

```php
$requestedType = $request->input('type');
$postType = new PostType();

if (!$postType->hasType($requestedType)) {
    abort(404, 'Invalid type');
}
$postType->type($requestedType);
```

Or use exception-based validation:

```php
$postType->ensureTypeExists($requestedType);
$postType->type($requestedType);
```

This avoids <Link to="/packages/typeify/deep-diving/exceptions/typeify-type-not-found-exception">TypeifyTypeNotFoundException</Link> in production and gives you control over the HTTP response.

## Multiple Registries

You can have several type registries in the same application, each with its own `typeName()`. For example: `PostType` (`post-type`), `ProductType` (`product-type`), `TaxonomyType` (`taxonomy-type`). They do not interfere because each uses a different container key.

```php
$postType = new PostType();
$productType = new ProductType();

$postType->define('blog')->label('Blog');
$productType->define('physical')->label('Physical Product');

$postType->type('blog');
$productType->type('physical');
```

## Example Registry

```php
namespace App\Type;

use JobMetric\Typeify\BaseType;

class PostType extends BaseType
{
    protected function typeName(): string
    {
        return 'post-type';
    }
}
```

Add traits as needed:

```php
use JobMetric\Typeify\Traits\HasImportType;
use JobMetric\Typeify\Traits\HasExportType;
use JobMetric\Typeify\Traits\HasHierarchicalType;

class PostType extends BaseType
{
    use HasImportType, HasExportType, HasHierarchicalType;

    protected function typeName(): string
    {
        return 'post-type';
    }
}
```

## Best Practices

1. **Register types once** – Prefer registering all types in a service provider or a dedicated bootstrap class so the container is filled at the start of the request.
2. **Use translation keys** – For `label()` and `description()` pass translation keys (e.g. `posts.types.blog`) so `getLabel()` and `getDescription()` work with `trans()` and localization.
3. **Validate input** – Use `hasType()` or `ensureTypeExists()` before `type()` when the type key comes from the request.
4. **One registry per concern** – Keep one subclass per logical registry (post types, product types, etc.) and use a clear, unique `typeName()`.

## Common Mistakes

- **Calling get() or getLabel() without selecting a type** – Always call `define('key')` or `type('key')` first; otherwise <Link to="/packages/typeify/deep-diving/exceptions/typeify-type-not-match-exception">TypeifyTypeNotMatchException</Link> is thrown.
- **Using the same typeName() in two classes** – Two subclasses with the same `typeName()` will share the same container key and overwrite each other's data.
- **Assuming types persist across requests** – The container is per-request. Re-register types every request (e.g. in a provider) or in a bootstrap script that runs when building the registry.

## Related Documentation

- <Link to="/packages/typeify/deep-diving/traits/has-label-type">HasLabelType</Link>
- <Link to="/packages/typeify/deep-diving/traits/has-description-type">HasDescriptionType</Link>
- <Link to="/packages/typeify/deep-diving/exceptions/typeify-type-not-found-exception">TypeifyTypeNotFoundException</Link>
- <Link to="/packages/typeify/deep-diving/exceptions/typeify-type-not-match-exception">TypeifyTypeNotMatchException</Link>
- <Link to="/packages/typeify/showcase">Showcase</Link> – Real-world examples
