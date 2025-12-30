---
sidebar_position: 5
sidebar_label: SlugExistRule
---

import Link from "@docusaurus/Link";

# SlugExistRule

The `SlugExistRule` is a validation rule that ensures a slug is unique per model type and optional collection, excluding soft-deleted rows and optionally excluding the current record (useful for update forms).

## Namespace

```php
JobMetric\Url\Rules\SlugExistRule
```

## Overview

`SlugExistRule` validates that:

- A slug is **unique** for a given model class and optional collection
- Only **active** (non-deleted) slugs are considered
- The current record can be **excluded** (for updates)
- Slug is **normalized** exactly like `HasUrl` (slugify + trim + limit to 100 chars)

This rule is essential for:

- **Data Integrity**: Ensuring slug uniqueness per model type and collection
- **Form Validation**: Validating slug uniqueness in form requests
- **Update Safety**: Excluding current record during updates
- **Pre-flight Checks**: Catching conflicts before calling `dispatchSlug()`

## When to Use SlugExistRule

**Use `SlugExistRule` when you need:**

- **Form validation**: Validate slug uniqueness in form requests
- **Pre-flight checks**: Catch conflicts before calling `dispatchSlug()`
- **Update safety**: Exclude current record when updating slugs
- **Collection scoping**: Enforce uniqueness within specific collections

**Example scenarios:**
- Product slug validation in create/update forms
- Category slug uniqueness checks
- Blog post slug validation
- CMS page slug management
- Any model using `HasUrl` that needs slug validation

## Constructor

```php
public function __construct(
    string   $className,
    ?string  $collection = null,
    ?int     $objectId   = null
)
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `$className` | string | Yes | - | Model class that uses `HasUrl` |
| `$collection` | string\|null | No | `null` | Optional collection scope |
| `$objectId` | int\|null | No | `null` | Current model ID to exclude (for updates) |

### Parameter Details

#### `$className` (string, required)

Fully-qualified class name of the model that uses `HasUrl` trait.

```php
// Using class constant
new SlugExistRule(Product::class, 'products')

// Using string
new SlugExistRule('App\Models\Product', 'products')
```

**Requirements:**
- Class must exist
- Class must use `HasUrl` trait

#### `$collection` (string|null, default: `null`)

Optional collection name to scope uniqueness check.

```php
'products'           // Check within 'products' collection
'featured-products'   // Check within 'featured-products' collection
null                 // Check within null collection (default)
```

#### `$objectId` (int|null, default: `null`)

Current model ID to exclude from uniqueness check. Used when updating existing records.

```php
null       // No exclusion (for create operations)
$product->id  // Exclude current product (for update operations)
```

## How It Works

The rule performs the following steps:

1. **Normalization**: Slug is normalized (slugify + trim + limit to 100 chars)
2. **Query**: Checks for active slugs matching:
   - Same model type
   - Same slug
   - Same collection (or both null)
   - Excludes current record (if `objectId` provided)
3. **Validation**: Fails if matching slug exists

## Basic Usage

### In Form Request (Create)

```php
namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Url\Rules\SlugExistRule;

class StoreProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:100',
                new SlugExistRule(Product::class, 'products'),
            ],
        ];
    }
}
```

### In Form Request (Update)

```php
namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Url\Rules\SlugExistRule;

class UpdateProductRequest extends FormRequest
{
    public function rules(): array
    {
        $productId = $this->route('product')?->id ?? null;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'string',
                'max:100',
                new SlugExistRule(Product::class, 'products', $productId),
            ],
        ];
    }
}
```

### Direct Validation

```php
use Illuminate\Support\Facades\Validator;
use JobMetric\Url\Rules\SlugExistRule;

$validator = Validator::make($data, [
    'slug' => [
        'required',
        'string',
        'max:100',
        new SlugExistRule(Product::class, 'products'),
    ],
]);

if ($validator->fails()) {
    return response()->json($validator->errors(), 422);
}
```

## Complete Examples

### Example 1: Simple Uniqueness

```php
$rules = [
    'slug' => [
        'required',
        'string',
        'max:100',
        new SlugExistRule(Product::class),
    ],
];
```

### Example 2: With Collection

```php
$rules = [
    'slug' => [
        'required',
        'string',
        'max:100',
        new SlugExistRule(Product::class, 'products'),
    ],
];
```

### Example 3: Update with Exclusion

```php
$product = $this->route('product');

$rules = [
    'slug' => [
        'sometimes',
        'string',
        'max:100',
        new SlugExistRule(Product::class, 'products', $product->id),
    ],
];
```

### Example 4: Dynamic Collection

```php
$collection = $this->input('slug_collection');

$rules = [
    'slug' => [
        'required',
        'string',
        'max:100',
        new SlugExistRule(Product::class, $collection),
    ],
];
```

### Example 5: Multiple Models

```php
class StoreProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
            'slug' => [
                'required',
                'string',
                'max:100',
                new SlugExistRule(Product::class, 'products'),
            ],
        ];
    }
}

class StoreCategoryRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
            'slug' => [
                'required',
                'string',
                'max:100',
                new SlugExistRule(Category::class, 'categories'),
            ],
        ];
    }
}
```

### Example 6: Conditional Validation

```php
public function rules(): array
{
    $rules = [
        'name' => ['required', 'string'],
    ];

    // Only validate uniqueness for published products
    if ($this->input('status') === 'published') {
        $rules['slug'] = [
            'required',
            'string',
            'max:100',
            new SlugExistRule(Product::class, 'products'),
        ];
    }

    return $rules;
}
```

### Example 7: Nested Payloads

```php
return [
    'product' => ['required', 'array'],
    'product.slug' => [
        'required',
        'string',
        'max:100',
        new SlugExistRule(Product::class, $this->input('product.slug_collection')),
    ],
];
```

### Example 8: Programmatic Validation

```php
use Illuminate\Support\Facades\Validator;
use JobMetric\Url\Rules\SlugExistRule;

$data = ['slug' => 'MacBook Pro 14'];
$rule = new SlugExistRule(Product::class, 'products');

$validator = Validator::make($data, [
    'slug' => ['required', 'string', 'max:100', $rule],
]);

$validator->validate(); // throws if collision exists
```

## Error Messages

The rule uses the translation key `url::base.rule.exist`:

```php
trans('url::base.rule.exist')
```

### Custom Error Messages

```php
public function messages(): array
{
    return [
        'slug.*' => 'This slug is already in use.',
    ];
}
```

### Custom Translation Key

Override the translation key in `resources/lang/{locale}/url/base.php`:

```php
return [
    'rule' => [
        'exist' => 'This slug is already taken.',
    ],
];
```

## When to Use

Use `SlugExistRule` when:

- **Form validation**: Validating slug uniqueness in form requests
- **Pre-flight checks**: Catching conflicts before calling `dispatchSlug()`
- **Update safety**: Excluding current record when updating

## When NOT to Use

Avoid using this rule when:

- **Global uniqueness**: If you need global uniqueness (not per model type), use Laravel's `unique` rule
- **Non-slug fields**: For regular database columns, use standard validation rules
- **Performance critical**: For high-frequency validations, consider caching or database indexes

## Best Practices

### 1. Always Use Class Constants

```php
// Good: Use class constants
new SlugExistRule(Product::class, 'products')

// Avoid: String literals
new SlugExistRule('App\Models\Product', 'products')
```

### 2. Exclude Current Record on Updates

```php
// Good: Exclude current record
new SlugExistRule(Product::class, 'products', $product->id)

// Avoid: Not excluding on updates
new SlugExistRule(Product::class, 'products')  // May fail on update
```

### 3. Combine with Type Validation

```php
// Good: Combined with type validation
'slug' => [
    'required',
    'string',
    'max:100',
    new SlugExistRule(Product::class, 'products'),
]

// Avoid: Missing type validation
'slug' => [
    new SlugExistRule(Product::class, 'products'),
]
```

### 4. Match the 100-Char Limit

```php
// Good: Match internal normalization
'slug' => [
    'required',
    'string',
    'max:100',
    new SlugExistRule(Product::class, 'products'),
]
```

## Common Mistakes

### Mistake 1: Not Excluding Current Record on Updates

```php
// Bad: May fail when updating with same value
new SlugExistRule(Product::class, 'products')

// Good: Exclude current record
new SlugExistRule(Product::class, 'products', $product->id)
```

### Mistake 2: Missing Type Validation

```php
// Bad: Missing type validation
'slug' => [
    new SlugExistRule(Product::class, 'products'),
]

// Good: Combined with type validation
'slug' => [
    'required',
    'string',
    'max:100',
    new SlugExistRule(Product::class, 'products'),
]
```

### Mistake 3: Not Matching Char Limit

```php
// Bad: Different limit
'slug' => [
    'required',
    'string',
    'max:255',  // Doesn't match internal 100-char limit
    new SlugExistRule(Product::class, 'products'),
]

// Good: Match internal limit
'slug' => [
    'required',
    'string',
    'max:100',
    new SlugExistRule(Product::class, 'products'),
]
```

## Performance Considerations

### Database Queries

The rule performs a database query for each validation:

```php
// Each rule instance = 1 database query
$rules = [
    'slug' => new SlugExistRule(Product::class, 'products'),
];
// = 1 database query
```

### Optimization Tips

1. **Add Database Indexes**:

```php
// Migration
Schema::table('slugs', function (Blueprint $table) {
    $table->index(['slugable_type', 'slug', 'collection', 'deleted_at']);
});
```

2. **Cache Validation Results**:

```php
// Cache unique slugs to reduce database queries
```

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl Trait</Link> - Trait that manages slugs
- <Link to="/packages/laravel-url/deep-diving/url-type-object-request">UrlTypeObjectRequest</Link> - Request trait that uses this rule
