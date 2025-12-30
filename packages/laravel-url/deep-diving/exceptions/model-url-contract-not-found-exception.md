---
sidebar_position: 1
sidebar_label: ModelUrlContractNotFoundException
---

import Link from "@docusaurus/Link";

# ModelUrlContractNotFoundException

Thrown when a model uses `HasUrl` trait but does not implement `UrlContract` interface.

## Namespace

```php
JobMetric\Url\Exceptions\ModelUrlContractNotFoundException
```

## Overview

This exception is thrown during model boot when:
- Model uses `HasUrl` trait
- Model does not implement `UrlContract` interface

## When It's Thrown

The exception is thrown automatically when:

1. A model uses `HasUrl` trait
2. The model does not implement `UrlContract` interface
3. The model is booted (during application startup or first use)

## Example

```php
// Bad: Missing UrlContract
class Product extends Model
{
    use HasUrl;  // Throws ModelUrlContractNotFoundException
}

// Good: Implements UrlContract
class Product extends Model implements UrlContract
{
    use HasUrl;
    
    public function getFullUrl(): string
    {
        return '/shop/' . ($this->slug ?? 'product-' . $this->id);
    }
}
```

## Error Message

The exception message is translated using `url::base.exceptions.model_url_contract_not_found`:

```php
trans('url::base.exceptions.model_url_contract_not_found', [
    'model' => $model
])
```

## Handling

This exception should be caught during development to fix the model:

```php
try {
    $product = new Product();
} catch (ModelUrlContractNotFoundException $e) {
    // Fix: Add UrlContract implementation
}
```

## Prevention

Always implement `UrlContract` when using `HasUrl`:

```php
class Product extends Model implements UrlContract
{
    use HasUrl;

    public function getFullUrl(): string
    {
        return '/shop/' . ($this->slug ?? 'product-' . $this->id);
    }
}
```

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl Trait</Link> - Trait that requires UrlContract
- <Link to="/packages/laravel-url/deep-diving/url-contract">UrlContract</Link> - Interface that must be implemented
