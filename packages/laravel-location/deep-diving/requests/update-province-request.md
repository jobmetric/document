---
sidebar_position: 4
sidebar_label: UpdateProvinceRequest
---

# UpdateProvinceRequest

Form request class for validating Province update data. This request supports partial updates and context injection.

## Namespace

`JobMetric\Location\Http\Requests\Province\UpdateProvinceRequest`

## Overview

Key features:

- **Partial updates**: fields are optional (`sometimes`)
- **Context-aware uniqueness**: supports `province_id` and `country_id` context for `CheckExistNameRule`
- **Static rules method**: provides `rulesFor()`

## Context Management

```php
$request = new UpdateProvinceRequest();
$request->setContext([
    'province_id' => 10,
    'country_id' => 1,
]);
```

## Validation Rules

| Field | Rule | Description |
|------|------|-------------|
| `country_id` | `sometimes\|required\|integer\|exists:{countries},id` | Parent country id |
| `name` | `sometimes\|required\|string\|max:255` | Province name (unique within country, excluding current) |
| `status` | `sometimes\|boolean` | Enabled/disabled |

## Usage Examples

```php
use JobMetric\Location\Facades\Province;

$provinceId = 10;

$response = Province::update($provinceId, [
    'country_id' => 1,
    'name' => 'Tehran (Updated)',
]);
```

