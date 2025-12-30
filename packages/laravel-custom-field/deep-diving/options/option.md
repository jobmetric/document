---
sidebar_position: 2
sidebar_label: Option
---

import Link from "@docusaurus/Link";

# Option

The `Option` class represents a single option instance for select, radio, or checkbox fields. It contains all option configuration including label, value, selected state, and metadata.

## Namespace

```php
JobMetric\CustomField\Option\Option
```

## Overview

The `Option` class is the result of building an option with `OptionBuilder`. It contains all the option configuration and is used internally by fields to render option elements.

## Properties

### Label

```php
public string $label;
```

The option label text.

### Value

```php
public string|int|bool $value;
```

The option value.

### Selected

```php
public bool $selected;
```

Whether the option is selected.

### Description

```php
public string $description;
```

Option description text.

### Meta Info

```php
public string $metaInfo;
```

Meta information for the option.

### Extra Content

```php
public string $extraContent;
```

Extra HTML content for the option.

### Tag

```php
public string $tag;
```

Option tag identifier.

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/options/option-builder">OptionBuilder</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link>

