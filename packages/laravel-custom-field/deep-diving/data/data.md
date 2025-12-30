---
sidebar_position: 2
sidebar_label: Data
---

import Link from "@docusaurus/Link";

# Data

The `Data` class represents a single data attribute instance. It contains the data attribute name and value, which are rendered as HTML data-* attributes.

## Namespace

```php
JobMetric\CustomField\Attribute\Data\Data
```

## Overview

The `Data` class is the result of building a data attribute with `DataBuilder`. It contains the data attribute configuration and is used internally by fields to render data-* HTML attributes.

## Properties

### Name

```php
public string $name;
```

The data attribute name (without the "data-" prefix).

### Value

```php
public string|int|bool|null $value;
```

The data attribute value.

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/data/data-builder">DataBuilder</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link>

