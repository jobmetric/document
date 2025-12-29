---
sidebar_position: 1
sidebar_label: MetadataValueExistRule
---

import Link from "@docusaurus/Link";

# MetadataValueExistRule

The `MetadataValueExistRule` is a validation rule that checks if a metadata value already exists for a specific model class and metadata key. Useful for ensuring unique metadata values.

## Namespace

```php
JobMetric\Metadata\Rules\MetadataValueExistRule
```

## Overview

This validation rule verifies that a given metadata value does not already exist for a specific model class and key combination. It's useful for ensuring unique values in metadata, such as unique slugs or codes.

## Basic Usage

### In Form Request

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Metadata\Rules\MetadataValueExistRule;

class StoreProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'slug' => [
                'required',
                'string',
                new MetadataValueExistRule(Product::class, 'slug'),
            ],
        ];
    }
}
```

### In Controller

```php
use JobMetric\Metadata\Rules\MetadataValueExistRule;

$request->validate([
    'code' => [
        'required',
        new MetadataValueExistRule(Product::class, 'code'),
    ],
]);
```

## Constructor

```php
public function __construct(string $class_name, string $key)
```

**Parameters:**
- `string $class_name` - The fully-qualified model class name
- `string $key` - The metadata key to check

## How It Works

The rule:

1. Checks if the value already exists in the metadata table
2. Filters by the specified model class (metaable_type)
3. Filters by the specified metadata key
4. Returns `true` if the value does NOT exist (validation passes)
5. Returns `false` if the value exists (validation fails)

## Complete Examples

### Unique Product Slug

```php
use JobMetric\Metadata\Rules\MetadataValueExistRule;

$request->validate([
    'slug' => [
        'required',
        'string',
        'max:255',
        new MetadataValueExistRule(Product::class, 'slug'),
    ],
]);
```

### Unique User Code

```php
$request->validate([
    'user_code' => [
        'required',
        'string',
        new MetadataValueExistRule(User::class, 'user_code'),
    ],
]);
```

### Custom Error Message

```php
$validator = Validator::make($data, [
    'slug' => new MetadataValueExistRule(Product::class, 'slug'),
], [
    'slug' => 'This slug is already taken.',
]);
```

## Related Documentation

- <Link to="/packages/laravel-metadata/deep-diving/has-meta">HasMeta Trait</Link>
- <Link to="/packages/laravel-metadata/deep-diving/models/meta">Meta Model</Link>

