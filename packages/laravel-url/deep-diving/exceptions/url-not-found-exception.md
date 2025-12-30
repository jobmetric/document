---
sidebar_position: 5
sidebar_label: UrlNotFoundException
---

import Link from "@docusaurus/Link";

# UrlNotFoundException

Thrown when attempting to resolve a URL that doesn't exist.

## Namespace

```php
JobMetric\Url\Exceptions\UrlNotFoundException
```

## Overview

This exception is thrown when:
- Attempting to resolve a URL that doesn't exist
- URL is not found in the database

## When It's Thrown

The exception is thrown when:

1. Attempting to resolve a URL that doesn't exist
2. URL is not found in the database (active or trashed)

## Example

```php
try {
    $model = Url::resolveActiveByFullUrl('/non-existent-path');
    if (!$model) {
        throw new UrlNotFoundException();
    }
} catch (UrlNotFoundException $e) {
    // Handle not found
}
```

## Handling

```php
try {
    $model = Url::resolveActiveByFullUrl($fullUrl);
    if (!$model) {
        throw new UrlNotFoundException();
    }
} catch (UrlNotFoundException $e) {
    abort(404, 'URL not found');
}
```

## Error Message

The exception message is translated using `url::base.exceptions.not_found`:

```php
trans('url::base.exceptions.not_found')
```

## Prevention

Check for null before throwing:

```php
$model = Url::resolveActiveByFullUrl($fullUrl);
if (!$model) {
    abort(404, 'URL not found');
}
```

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/models/url">Url Model</Link> - Model that may throw this exception
