---
sidebar_position: 1
sidebar_label: BladeNamespaceRegistrationException
---

import Link from "@docusaurus/Link";

# BladeNamespaceRegistrationException

The `BladeNamespaceRegistrationException` is thrown when there's an error registering a Blade namespace for custom field views.

## Namespace

```php
JobMetric\CustomField\Exceptions\BladeNamespaceRegistrationException
```

## Overview

This exception is thrown when the package attempts to register a Blade namespace for custom field views but encounters an error. This typically happens during service provider boot when setting up view paths.

## When This Exception Is Thrown

This exception is thrown when:

- The Blade namespace registration fails
- The view path is invalid or inaccessible
- There's a conflict with an existing namespace

## Exception Message

The exception message includes:
- `namespace`: The namespace that failed to register
- `path`: The path that was attempted

## Example

```php
try {
    // Custom field view registration
} catch (BladeNamespaceRegistrationException $e) {
    Log::error('Failed to register custom field namespace: ' . $e->getMessage());
}
```

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/exceptions/blade-view-not-found-exception">BladeViewNotFoundException</Link>

