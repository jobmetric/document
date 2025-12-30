---
sidebar_position: 7
sidebar_label: MetadataValueExistRule
---

import Link from "@docusaurus/Link";

# MetadataValueExistRule

The `MetadataValueExistRule` is a validation rule that checks if a metadata value already exists for a specific model class and metadata key combination. This rule ensures uniqueness of metadata values across models, making it ideal for validating unique slugs, codes, identifiers, and other metadata that must be unique.

## Namespace

```php
JobMetric\Metadata\Rules\MetadataValueExistRule
```

## Overview

`MetadataValueExistRule` validates that a given metadata value does **not** already exist for a specific model class and key combination. It's particularly useful for:

- **Unique Identifiers**: Ensuring unique slugs, codes, or identifiers stored as metadata
- **Business Rules**: Enforcing business constraints on metadata values
- **Data Integrity**: Preventing duplicate metadata values that could cause conflicts
- **Form Validation**: Validating user input before storing metadata

The rule performs a database query to check if a metadata value already exists, filtering by:
- Model class (metaable_type)
- Metadata key
- Metadata value

## Basic Usage

### In Form Request

```php
namespace App\Http\Requests;

use App\Models\Product;
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
                'max:255',
                new MetadataValueExistRule(Product::class, 'slug'),
            ],
        ];
    }
}
```

### In Controller

```php
use App\Models\Product;
use JobMetric\Metadata\Rules\MetadataValueExistRule;

public function store(Request $request)
{
    $validated = $request->validate([
        'code' => [
            'required',
            'string',
            new MetadataValueExistRule(Product::class, 'code'),
        ],
    ]);

    // Store product with metadata
}
```

### Direct Validation

```php
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use JobMetric\Metadata\Rules\MetadataValueExistRule;

$validator = Validator::make($data, [
    'employee_id' => [
        'required',
        'string',
        new MetadataValueExistRule(User::class, 'employee_id'),
    ],
]);

if ($validator->fails()) {
    // Handle validation errors
}
```

## Constructor

```php
public function __construct(string $class_name, string $key)
```

### Parameters

- **`string $class_name`**: The fully-qualified model class name (e.g., `Product::class` or `'App\Models\Product'`)
- **`string $key`**: The metadata key to check (e.g., `'slug'`, `'code'`, `'identifier'`)

### Example

```php
// Using class constant
new MetadataValueExistRule(Product::class, 'slug')

// Using string
new MetadataValueExistRule('App\Models\Product', 'slug')
```

## How It Works

The rule performs the following steps:

1. **Query Metadata Table**: Searches the `meta` table for existing records
2. **Filter by Model Type**: Filters by `metaable_type` matching the provided class name
3. **Filter by Key**: Filters by `key` matching the provided metadata key
4. **Filter by Value**: Filters by `value` matching the input value
5. **Check Existence**: Returns `true` if value does NOT exist (validation passes), `false` if it exists (validation fails)

### Internal Implementation

```php
public function passes($attribute, $value): bool
{
    return !Meta::query()
        ->whereHasMorph('metaable', $this->class_name, function (Builder $query) use ($value) {
            $query->where([
                'key' => $this->key,
                'value' => $value
            ]);
        })
        ->exists();
}
```

**Key Points**:
- Uses `whereHasMorph` to filter by polymorphic relationship
- Checks for exact value match (case-sensitive for strings)
- Returns negation (`!exists()`) because rule passes when value does NOT exist
- Works with all value types (string, integer, boolean, JSON)

## Complete Examples

### Example 1: Unique Product Slug

Ensure product slugs are unique across all products:

```php
namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Metadata\Rules\MetadataValueExistRule;

class StoreProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                new MetadataValueExistRule(Product::class, 'slug'),
            ],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'slug' => 'This slug is already in use. Please choose a different one.',
        ];
    }
}
```

### Example 2: Unique User Employee Code

Validate unique employee codes for users:

```php
namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Metadata\Rules\MetadataValueExistRule;

class StoreUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'employee_code' => [
                'required',
                'string',
                'size:6',
                'regex:/^[A-Z0-9]{6}$/',
                new MetadataValueExistRule(User::class, 'employee_code'),
            ],
        ];
    }
}
```

### Example 3: Unique Category Identifier

Ensure category identifiers are unique:

```php
use App\Models\Category;
use JobMetric\Metadata\Rules\MetadataValueExistRule;

$request->validate([
    'name' => ['required', 'string'],
    'identifier' => [
        'required',
        'string',
        'alpha_dash',
        new MetadataValueExistRule(Category::class, 'identifier'),
    ],
]);
```

### Example 4: Update with Exclusion

When updating, exclude the current model from uniqueness check:

```php
namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Metadata\Rules\MetadataValueExistRule;

class UpdateProductRequest extends FormRequest
{
    public function rules(): array
    {
        $productId = $this->route('product')->id;

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

**Note**: The rule checks all products. To exclude the current product, you may need a custom rule or modify the validation logic.

### Example 5: Multiple Metadata Keys

Validate multiple unique metadata values:

```php
namespace App\Http\Requests;

use App\Models\Product;
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
            'sku' => [
                'required',
                'string',
                new MetadataValueExistRule(Product::class, 'sku'),
            ],
            'barcode' => [
                'nullable',
                'string',
                new MetadataValueExistRule(Product::class, 'barcode'),
            ],
        ];
    }
}
```

### Example 6: Conditional Validation

Apply rule conditionally based on other fields:

```php
namespace App\Http\Requests;

use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use JobMetric\Metadata\Rules\MetadataValueExistRule;

class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'type' => ['required', 'in:article,page'],
            'slug' => [
                'required',
                'string',
                Rule::when(
                    $this->type === 'page',
                    new MetadataValueExistRule(Post::class, 'slug')
                ),
            ],
        ];
    }
}
```

### Example 7: Custom Error Messages

Provide custom error messages:

```php
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use JobMetric\Metadata\Rules\MetadataValueExistRule;

$validator = Validator::make($data, [
    'slug' => [
        'required',
        'string',
        new MetadataValueExistRule(Product::class, 'slug'),
    ],
], [
    'slug.required' => 'The slug field is required.',
    'slug' => 'This slug is already taken. Please choose a different one.',
]);

if ($validator->fails()) {
    return response()->json([
        'errors' => $validator->errors(),
    ], 422);
}
```

### Example 8: With Other Validation Rules

Combine with other Laravel validation rules:

```php
namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use JobMetric\Metadata\Rules\MetadataValueExistRule;

class StoreProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'slug' => [
                'required',
                'string',
                'min:3',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('products', 'slug')->ignore($this->product),
                new MetadataValueExistRule(Product::class, 'slug'),
            ],
        ];
    }
}
```

## Value Type Handling

The rule handles different value types:

### String Values

```php
// Case-sensitive string comparison
new MetadataValueExistRule(Product::class, 'slug')
// Checks: WHERE value = 'product-slug'
```

### Numeric Values

```php
// Integer comparison
new MetadataValueExistRule(Product::class, 'code')
// Checks: WHERE value = 12345
```

### Boolean Values

```php
// Boolean comparison
new MetadataValueExistRule(Product::class, 'is_featured')
// Checks: WHERE value = 1 or value = 0
```

### JSON Values

```php
// JSON-encoded array comparison
new MetadataValueExistRule(Product::class, 'tags')
// Checks: WHERE value = '["tag1","tag2"]' (JSON-encoded)
```

**Important**: JSON values are compared as strings (after JSON encoding), so array order matters.

## Error Messages

### Default Message

The rule uses a translation key for error messages:

```php
trans('metadata::base.rule.exist', ['field' => $this->key])
```

### Custom Messages

Override in validation:

```php
$validator = Validator::make($data, [
    'slug' => new MetadataValueExistRule(Product::class, 'slug'),
], [
    'slug' => 'This slug is already in use.',
]);
```

Or in FormRequest:

```php
public function messages(): array
{
    return [
        'slug' => 'The slug :input is already taken. Please choose another.',
    ];
}
```

## When to Use

Use `MetadataValueExistRule` when you need to:

- **Unique Identifiers**: Validate unique slugs, codes, or identifiers stored as metadata
- **Business Constraints**: Enforce business rules on metadata values
- **Data Integrity**: Prevent duplicate metadata values
- **Form Validation**: Validate user input before storing metadata
- **API Validation**: Ensure unique values in API endpoints

## When NOT to Use

Avoid using this rule when:

- **Database Columns**: If the value is stored in a regular database column, use `unique` rule instead
- **Case-Insensitive**: The rule is case-sensitive; use custom validation for case-insensitive checks
- **Complex Queries**: For complex uniqueness checks involving multiple conditions, consider custom rules
- **Performance Critical**: For high-traffic scenarios, consider caching or database indexes

## Best Practices

### 1. Use Class Constants

Prefer class constants over strings:

```php
// Good
new MetadataValueExistRule(Product::class, 'slug')

// Avoid
new MetadataValueExistRule('App\Models\Product', 'slug')
```

### 2. Combine with Other Rules

Always combine with type and format validation:

```php
'slug' => [
    'required',
    'string',
    'max:255',
    'regex:/^[a-z0-9-]+$/',
    new MetadataValueExistRule(Product::class, 'slug'),
],
```

### 3. Provide Clear Error Messages

Use custom messages for better UX:

```php
public function messages(): array
{
    return [
        'slug' => 'This slug is already in use. Please choose a different one.',
    ];
}
```

### 4. Consider Performance

For high-traffic scenarios:

- Add database indexes on `metaable_type`, `key`, and `value`
- Consider caching frequently checked values
- Use database-level unique constraints when possible

### 5. Handle Updates Properly

When updating, ensure you're not checking the current record:

```php
// In update scenario, you may need custom logic
// to exclude the current model from the check
```

## Common Mistakes

### Mistake 1: Not Combining with Type Validation

```php
// Bad: No type validation
'slug' => new MetadataValueExistRule(Product::class, 'slug'),

// Good: Combined with type validation
'slug' => [
    'required',
    'string',
    new MetadataValueExistRule(Product::class, 'slug'),
],
```

### Mistake 2: Using Wrong Model Class

```php
// Bad: Wrong model class
new MetadataValueExistRule(User::class, 'slug') // For products

// Good: Correct model class
new MetadataValueExistRule(Product::class, 'slug')
```

### Mistake 3: Case Sensitivity Issues

```php
// Rule is case-sensitive
// 'Product-Slug' and 'product-slug' are considered different
// Normalize input before validation if needed
```

### Mistake 4: Not Handling JSON Values

```php
// JSON values are compared as strings
// Ensure consistent encoding/decoding
```

## Performance Considerations

### Database Queries

The rule performs a database query for each validation:

```php
// Each rule instance = 1 database query
$rules = [
    'slug' => new MetadataValueExistRule(Product::class, 'slug'),
    'code' => new MetadataValueExistRule(Product::class, 'code'),
];
// = 2 database queries
```

### Optimization Tips

1. **Add Database Indexes**:

```php
// Migration
Schema::table('meta', function (Blueprint $table) {
    $table->index(['metaable_type', 'key', 'value']);
});
```

2. **Cache Frequently Checked Values**:

```php
// Cache unique values to reduce database queries
```

3. **Batch Validation**:

```php
// Validate multiple fields in single request
// to reduce overall query count
```

## Related Documentation

- <Link to="/packages/laravel-metadata/deep-diving/has-meta">HasMeta</Link>
- <Link to="/packages/laravel-metadata/deep-diving/models/meta">Meta Model</Link>
- <Link to="/packages/laravel-metadata/deep-diving/resources/metadata-resource">MetadataResource</Link>

