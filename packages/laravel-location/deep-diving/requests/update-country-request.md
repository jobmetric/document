---
sidebar_position: 2
sidebar_label: UpdateCountryRequest
---

# UpdateCountryRequest

Form request class for validating Country update data. This request supports **partial updates** and **context-aware uniqueness**.

## Namespace

`JobMetric\Location\Http\Requests\Country\UpdateCountryRequest`

## Overview

The `UpdateCountryRequest` validates incoming data when updating an existing Country entity.

Key features:

- **Partial updates**: all fields are optional (`sometimes`)
- **Context injection**: accepts `country_id` via `setContext()` to exclude the current row in uniqueness checks
- **Static rules method**: provides `rulesFor()` for programmatic validation

## Context Management

The request supports external context injection:

```php
$request = new UpdateCountryRequest();
$request->setContext(['country_id' => 123]);
```

The `country_id` is used for `CheckExistNameRule` so name uniqueness excludes the current country.

## Validation Rules

All fields use `sometimes`, meaning they are only validated if present.

| Field | Rule | Description |
|------|------|-------------|
| `name` | `sometimes\|required\|string\|max:255` | Country name (unique, excluding current) |
| `flag` | `sometimes\|nullable\|string\|max:255` | Flag filename/key |
| `mobile_prefix` | `sometimes\|nullable\|integer\|min:1\|max:999` | Calling code |
| `validation` | `sometimes\|nullable\|array` | Regex patterns list |
| `address_on_letter` | `sometimes\|nullable\|string` | Address template |
| `status` | `sometimes\|boolean` | Enabled/disabled |

## Static Rules Method

### rulesFor()

```php
$input = ['name' => 'Updated Name'];
$context = ['country_id' => 123];

$rules = UpdateCountryRequest::rulesFor($input, $context);
```

## Usage Examples

### Basic Update (Controller)

```php
use JobMetric\Location\Http\Requests\Country\UpdateCountryRequest;
use JobMetric\Location\Facades\Country;

public function update(UpdateCountryRequest $request, int $id)
{
    $request->setContext(['country_id' => $id]);

    return response()->json(
        Country::update($id, $request->validated())
    );
}
```

### Partial update

```php
$data = [
    'flag' => 'de.svg',
    'mobile_prefix' => 49,
];
```

