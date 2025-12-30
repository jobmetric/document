---
sidebar_position: 2
sidebar_label: BladeViewNotFoundException
---

import Link from "@docusaurus/Link";

# BladeViewNotFoundException

The `BladeViewNotFoundException` is thrown when a required Blade view for a custom field cannot be found.

## Namespace

```php
JobMetric\CustomField\Exceptions\BladeViewNotFoundException
```

## Overview

This exception is thrown when the package attempts to render a custom field but cannot find the required Blade view template. This typically happens when:

- A custom field view file is missing
- The view path is incorrect
- The view namespace is not properly registered

## When This Exception Is Thrown

This exception is thrown when:

- A custom field tries to render but its view template is missing
- The view path resolution fails
- The expected view file doesn't exist at the specified location

## Exception Message

The exception message includes:
- `qualifiedView`: The fully qualified view name that was requested
- `expectedFile`: The expected file path where the view should be located

## Example

```php
try {
    $field = CustomFieldBuilder::text()->build();
    $html = $field->toHtml();
} catch (BladeViewNotFoundException $e) {
    Log::error('Custom field view not found: ' . $e->getMessage());
    // Handle the error, perhaps use a default view
}
```

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/exceptions/blade-namespace-registration-exception">BladeNamespaceRegistrationException</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/exceptions/option-empty-label-exception">OptionEmptyLabelException</Link>

