---
sidebar_position: 3
sidebar_label: OptionEmptyLabelException
---

import Link from "@docusaurus/Link";

# OptionEmptyLabelException

The `OptionEmptyLabelException` is thrown when attempting to build an option without providing a label.

## Namespace

```php
JobMetric\CustomField\Exceptions\OptionEmptyLabelException
```

## Overview

This exception is thrown when the `OptionBuilder` attempts to build an option but no label has been set. Options require a label to be displayed to users, so this is a required field.

## When This Exception Is Thrown

This exception is thrown when:

- Building an option without setting a label
- The label is an empty string
- The label was not provided in the option builder chain

## Example

```php
use JobMetric\CustomField\CustomFieldBuilder;
use JobMetric\CustomField\Exceptions\OptionEmptyLabelException;

try {
    $select = CustomFieldBuilder::select()
        ->name('country')
        ->options(function ($opt) {
            // Missing label - will throw exception
            $opt->value('IR')->build();
        })
        ->build();
} catch (OptionEmptyLabelException $e) {
    // Handle the error
    Log::error('Option label is required: ' . $e->getMessage());
}
```

## Correct Usage

```php
$select = CustomFieldBuilder::select()
    ->name('country')
    ->options(function ($opt) {
        // Label is required
        $opt->label('Iran')->value('IR')->build();
        $opt->label('Germany')->value('DE')->build();
    })
    ->build();
```

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/options/option-builder">OptionBuilder</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/exceptions/blade-view-not-found-exception">BladeViewNotFoundException</Link>

