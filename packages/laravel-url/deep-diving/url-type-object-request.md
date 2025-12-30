---
sidebar_position: 6
sidebar_label: UrlTypeObjectRequest
---

import Link from "@docusaurus/Link";

# UrlTypeObjectRequest Trait

The `UrlTypeObjectRequest` trait adds URL (slug) validation rules and human-readable attribute labels to FormRequest classes when the target type supports URLs.

## Namespace

```php
JobMetric\Url\Http\Requests\UrlTypeObjectRequest
```

## Overview

The trait provides:

- **Slug validation**: Appends `SlugExistRule` for uniqueness
- **Type validation**: Ensures slug matches type constraints
- **Attribute labels**: Human-readable field names for errors

## When to Use UrlTypeObjectRequest

**Use `UrlTypeObjectRequest` when you need:**

- **Type-based validation**: Validate slugs for types that support URLs
- **Automatic rule generation**: Automatically append slug validation rules
- **Human-friendly labels**: Generate readable attribute labels for slug fields
- **Typeify integration**: Work with Typeify type definitions that have URL capability

**Example scenarios:**
- Form requests for models using `HasUrl`
- Typeify-based form validation with URL support
- Dynamic form generation with slug validation
- Admin panels with slug management

## Quick Start

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Url\Http\Requests\UrlTypeObjectRequest;

class StoreProductRequest extends FormRequest
{
    use UrlTypeObjectRequest;

    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string'],
        ];

        $this->renderUrlField(
            $rules,
            true,  // hasUrl
            Product::class,
            'products',
            null   // object_id (for create)
        );

        return $rules;
    }

    public function attributes(): array
    {
        $params = [];
        $this->renderUrlAttribute($params, true);
        return $params;
    }
}
```

## Methods

### `renderUrlField()`

Appends slug validation rules to the rules array:

```php
public function renderUrlField(
    array   &$rules,
    bool    $hasUrl,
    string  $class_name,
    ?string $collection = null,
    ?int    $object_id = null
): void
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `$rules` | array | Yes | - | Rules array (passed by reference) |
| `$hasUrl` | bool | Yes | - | Whether the type supports URLs |
| `$class_name` | string | Yes | - | Model class name |
| `$collection` | string\|null | No | `null` | Optional collection scope |
| `$object_id` | int\|null | No | `null` | Current model ID to exclude (for updates) |

**What it does:**

- Preserves existing slug rules (if any)
- Appends: `sometimes`, `nullable`, `string`, `max:100`, `SlugExistRule`

### `renderUrlAttribute()`

Appends attribute label for slug field:

```php
public function renderUrlAttribute(
    array &$params,
    bool  $hasUrl
): void
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `$params` | array | Yes | - | Attributes array (passed by reference) |
| `$hasUrl` | bool | Yes | - | Whether the type supports URLs |

**What it does:**

- Adds `slug` attribute label using `url::base.components.url_slug.title`

## Complete Examples

### Example 1: Basic Usage

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Url\Http\Requests\UrlTypeObjectRequest;
use App\Models\Product;

class StoreProductRequest extends FormRequest
{
    use UrlTypeObjectRequest;

    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
        ];

        $this->renderUrlField(
            $rules,
            true,
            Product::class,
            'products',
            null
        );

        return $rules;
    }

    public function attributes(): array
    {
        $params = [];
        $this->renderUrlAttribute($params, true);
        return $params;
    }
}
```

### Example 2: Update Request

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Url\Http\Requests\UrlTypeObjectRequest;
use App\Models\Product;

class UpdateProductRequest extends FormRequest
{
    use UrlTypeObjectRequest;

    public function rules(): array
    {
        $productId = $this->route('product')?->id ?? null;

        $rules = [
            'name' => ['sometimes', 'string', 'max:255'],
        ];

        $this->renderUrlField(
            $rules,
            true,
            Product::class,
            'products',
            $productId
        );

        return $rules;
    }

    public function attributes(): array
    {
        $params = [];
        $this->renderUrlAttribute($params, true);
        return $params;
    }
}
```

### Example 3: Dynamic Collection

```php
public function rules(): array
{
    $collection = $this->input('slug_collection');

    $rules = [
        'name' => ['required', 'string'],
    ];

    $this->renderUrlField(
        $rules,
        true,
        Product::class,
        $collection,
        null
    );

    return $rules;
}
```

### Example 4: Conditional URL Support

```php
public function rules(): array
{
    $hasUrl = $this->input('type') === 'product';

    $rules = [
        'name' => ['required', 'string'],
    ];

    if ($hasUrl) {
        $this->renderUrlField(
            $rules,
            true,
            Product::class,
            'products',
            null
        );
    }

    return $rules;
}
```

### Example 5: With Typeify Integration

```php
use JobMetric\Typeify\Type;

$type = Type::make('product')
    ->url()  // Enable URL capability
    ->fields([
        'name' => 'string',
        'slug' => 'string',
    ]);

// In form request
public function rules(): array
{
    $rules = [];
    
    $this->renderUrlField(
        $rules,
        $type->hasUrl(),  // Check if type has URL
        Product::class,
        'products',
        null
    );

    return $rules;
}
```

## Best Practices

### 1. Always Check hasUrl

```php
// Good: Check before rendering
if ($hasUrl) {
    $this->renderUrlField($rules, true, Product::class, 'products', null);
}

// Bad: Always render
$this->renderUrlField($rules, true, Product::class, 'products', null);
```

### 2. Exclude Current Record on Updates

```php
// Good: Exclude on update
$productId = $this->route('product')?->id ?? null;
$this->renderUrlField($rules, true, Product::class, 'products', $productId);

// Bad: Not excluding
$this->renderUrlField($rules, true, Product::class, 'products', null);
```

### 3. Provide Attribute Labels

```php
// Good: Provide labels
public function attributes(): array
{
    $params = [];
    $this->renderUrlAttribute($params, true);
    return $params;
}
```

## Common Mistakes

### Mistake 1: Not Checking hasUrl

```php
// Bad: Always render
$this->renderUrlField($rules, true, Product::class, 'products', null);
```

### Mistake 2: Not Excluding on Updates

```php
// Bad: May fail on update
$this->renderUrlField($rules, true, Product::class, 'products', null);
```

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/slug-exist-rule">SlugExistRule</Link> - Validation rule used by this trait
- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl Trait</Link> - Trait that manages URLs
- <Link to="/packages/laravel-url/deep-diving/support/has-url-type">HasUrlType</Link> - Typeify trait for URL capability
