---
sidebar_position: 1
sidebar_label: LanguageDataNotExist
---

import Link from "@docusaurus/Link";

# LanguageDataNotExist

The `LanguageDataNotExist` exception is thrown when attempting to add a language from predefined data that doesn't exist.

## Namespace

```php
JobMetric\Language\Exceptions\LanguageDataNotExist
```

## When It's Thrown

Thrown when calling `Language::addLanguageData($locale)` and the locale doesn't exist in the predefined data file.

## When to Use LanguageDataNotExist

This exception is thrown automatically when:

- Calling `Language::addLanguageData($locale)` with a locale that doesn't exist in the predefined data file
- The data file is missing or corrupted

## Handling the Exception

```php
use JobMetric\Language\Exceptions\LanguageDataNotExist;

try {
    Language::addLanguageData('xx');
} catch (LanguageDataNotExist $e) {
    return response()->json([
        'error' => $e->getMessage(),
    ], 400);
}
```

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/language-service">Language Service</Link>

