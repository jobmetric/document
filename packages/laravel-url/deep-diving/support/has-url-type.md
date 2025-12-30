---
sidebar_position: 1
sidebar_label: HasUrlType
---

import Link from "@docusaurus/Link";

# HasUrlType Trait

The `HasUrlType` trait adds URL capability to a Typeify type definition, allowing you to mark types as URL-capable and automatically generate URL validation rules.

## Namespace

```php
JobMetric\Url\Typeify\HasUrlType
```

## Overview

The trait provides:

- **URL capability flag**: Marks a type as URL-capable
- **Method chaining**: Fluent interface for type definitions
- **Integration**: Works with `UrlTypeObjectRequest` for automatic validation

## When to Use HasUrlType

**Use `HasUrlType` when you need:**

- **Typeify integration**: Mark types as URL-capable in Typeify definitions
- **Automatic validation**: Generate URL validation rules automatically
- **Type-based URL support**: Enable URL features for specific types

**Example scenarios:**
- Typeify type definitions for products, categories, etc.
- Dynamic form generation with URL support
- Type-based validation systems

## Methods

### `url()`

Enable URL capability on the current type:

```php
$type->url();
```

Returns the type instance for method chaining.

### `hasUrl()`

Determine whether the current type has URL capability:

```php
if ($type->hasUrl()) {
    // Type supports URLs
}
```

Returns `true` if URL capability is enabled, `false` otherwise.

## Usage

### Basic Usage

```php
use JobMetric\Typeify\Type;
use JobMetric\Url\Typeify\HasUrlType;

$type = Type::make('product')
    ->url()  // Enable URL capability
    ->fields([
        'name' => 'string',
        'slug' => 'string',
    ]);
```

### With Form Request

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Url\Http\Requests\UrlTypeObjectRequest;
use JobMetric\Typeify\Type;

class StoreProductRequest extends FormRequest
{
    use UrlTypeObjectRequest;

    public function rules(): array
    {
        $type = Type::make('product')->url();
        
        $rules = [
            'name' => ['required', 'string'],
        ];

        $this->renderUrlField(
            $rules,
            $type->hasUrl(),  // Check if type has URL
            Product::class,
            'products',
            null
        );

        return $rules;
    }
}
```

## Complete Examples

### Example 1: Simple Type Definition

```php
$type = Type::make('product')
    ->url()
    ->fields([
        'name' => 'string',
        'slug' => 'string',
    ]);
```

### Example 2: Multiple Types

```php
$productType = Type::make('product')->url();
$categoryType = Type::make('category')->url();
$postType = Type::make('post')->url();
```

### Example 3: Conditional URL Support

```php
$type = Type::make('item');

if ($needsUrl) {
    $type->url();
}

$type->fields([
    'name' => 'string',
]);
```

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl Trait</Link> - Trait that manages URLs
- <Link to="/packages/laravel-url/deep-diving/url-type-object-request">UrlTypeObjectRequest</Link> - Request trait that uses this
