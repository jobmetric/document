---
sidebar_position: 1
sidebar_label: StoreCountryRequest
---

# StoreCountryRequest

Form request class for validating Country creation data.

## Namespace

`JobMetric\Location\Http\Requests\Country\StoreCountryRequest`

## Overview

The `StoreCountryRequest` validates incoming data when creating a new Country. It ensures:

- Required fields are present
- Data types and constraints are correct
- Name uniqueness is enforced via `CheckExistNameRule`

## Validation Rules

### Required Fields

| Field | Rule | Description |
|------|------|-------------|
| `name` | `required\|string\|max:255` | Country name (must be unique) |

### Optional Fields

| Field | Rule | Description |
|------|------|-------------|
| `flag` | `nullable\|string\|max:255` | Flag filename/key |
| `mobile_prefix` | `nullable\|integer\|min:1\|max:999` | Calling code (without `+`) |
| `validation` | `nullable\|array` | List of regex patterns for mobile validation |
| `address_on_letter` | `nullable\|string` | Address format template |
| `status` | `sometimes\|boolean` | Enabled/disabled flag |

## Uniqueness

Name uniqueness is validated using:

- `JobMetric\Location\Rules\CheckExistNameRule`

## Usage Examples

### Basic Store (Controller)

```php
use JobMetric\Location\Http\Requests\Country\StoreCountryRequest;
use JobMetric\Location\Facades\Country;

public function store(StoreCountryRequest $request)
{
    $validated = $request->validated();

    return response()->json(
        Country::store($validated)
    );
}
```

### Minimal payload

```php
$data = [
    'name' => 'Germany',
];
```

### Complete payload

```php
$data = [
    'name' => 'Iran',
    'flag' => 'ir.svg',
    'mobile_prefix' => 98,
    'validation' => [
        '/^9\\d{9}$/',
    ],
    'address_on_letter' => "{country}, {province}, {city}\n{district}, {street}, {number}",
    'status' => true,
];
```

## Authorization

`authorize()` returns `true` by default. Override it in your application if you need custom authorization.

