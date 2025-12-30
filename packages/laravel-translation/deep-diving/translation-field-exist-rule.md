---
sidebar_position: 6
sidebar_label: TranslationFieldExistRule
---

import Link from "@docusaurus/Link";

# TranslationFieldExistRule

The `TranslationFieldExistRule` is a validation rule that ensures a translated field value is unique per locale across records of a given model that uses the `HasTranslation` trait. It is aware of the package's versioning semantics and supports optional scoping by parent constraints and update-safe exclusions by current object id.

## Namespace

```php
JobMetric\Translation\Rules\TranslationFieldExistRule
```

## Overview

`TranslationFieldExistRule` validates that:

- A translated field value is **unique per locale** across model records
- The rule respects **versioning semantics** (active vs historical translations)
- Supports **update-safe exclusion** (exclude current record when updating)
- Allows **parent scoping** for hierarchical models
- Provides **customizable error messages** via translation keys

This rule is essential for:

- **Data Integrity**: Ensuring unique translated values per locale
- **Form Validation**: Validating translation uniqueness in form requests
- **Update Safety**: Excluding current record during updates
- **Hierarchical Models**: Scoping uniqueness within parent relationships
- **Versioning Awareness**: Respecting translation versioning policies

## Constructor

```php
public function __construct(
    string  $class_name,
    string  $field_name = 'title',
    ?string $locale = null,
    ?int    $object_id = null,
    ?int    $parent_id = -1,
    array   $parent_where = [],
    string  $field_name_trans = 'translation::base.rule.default_field'
)
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `$class_name` | string | Yes | - | Fully-qualified parent model class (must use `HasTranslation`) |
| `$field_name` | string | No | `'title'` | Translation field to check (e.g., `'title'`, `'slug'`) |
| `$locale` | string\|null | No | `app()->getLocale()` | Locale code (e.g., `'en'`, `'fa'`) |
| `$object_id` | int\|null | No | `null` | Current parent id to exclude (for updates) |
| `$parent_id` | int\|null | No | `-1` | Filter on parent table's `parent_id` (use `-1` to ignore) |
| `$parent_where` | array | No | `[]` | Additional where constraints on parent table |
| `$field_name_trans` | string | No | `'translation::base.rule.default_field'` | i18n key for field name in error message |

### Parameter Details

#### `$class_name` (string, required)

Fully-qualified class name of the parent model that uses `HasTranslation` trait.

```php
// Using class constant
new TranslationFieldExistRule(Post::class, 'title')

// Using string
new TranslationFieldExistRule('App\Models\Post', 'title')
```

**Requirements:**
- Class must exist
- Class must use `HasTranslation` trait
- Throws `ModelHasTranslationNotFoundException` if requirements not met

#### `$field_name` (string, default: `'title'`)

The translation field name to check for uniqueness.

```php
'title'    // Check title uniqueness
'slug'     // Check slug uniqueness
'name'     // Check name uniqueness
```

#### `$locale` (string|null, default: `app()->getLocale()`)

The locale code to check uniqueness within.

```php
'en'       // English
'fa'       // Persian
'de'       // German
null       // Uses app()->getLocale()
```

#### `$object_id` (int|null, default: `null`)

Current parent model id to exclude from uniqueness check. Used when updating existing records.

```php
null       // No exclusion (for create operations)
$post->id  // Exclude current post (for update operations)
```

#### `$parent_id` (int|null, default: `-1`)

Optional filter on parent table's `parent_id` column. Use `-1` to ignore.

```php
-1         // Ignore parent_id filter
5          // Only check within parent_id = 5
null       // Ignore parent_id filter
```

#### `$parent_where` (array, default: `[]`)

Additional where constraints on the parent table.

```php
[]                              // No additional constraints
['status' => 'published']       // Only check published records
['category_id' => 1]            // Only check within category 1
['status' => 'active', 'type' => 'post']  // Multiple constraints
```

#### `$field_name_trans` (string, default: `'translation::base.rule.default_field'`)

Translation key for rendering a human-friendly field name in error messages.

```php
'translation::base.rule.default_field'  // Default
'validation.attributes.title'            // Custom field name
```

## How It Works

### Validation Process

The rule performs the following steps:

1. **Validates Model**: Checks if class exists and uses `HasTranslation` trait
2. **Builds Query**: Constructs database query with constraints
3. **Applies Versioning**: Respects versioning semantics (active vs historical)
4. **Applies Scoping**: Applies parent_id and parent_where constraints
5. **Excludes Current**: Excludes current record if `object_id` provided
6. **Checks Uniqueness**: Returns `true` if no conflict, `false` if conflict exists

### Versioning Awareness

The rule respects translation versioning:

**Versioning ON** (`usesTranslationVersioning()` returns `true`):
- Checks only **active** rows (`deleted_at IS NULL`)
- Represents latest version for each `(locale, field)` combination

**Versioning OFF**:
- Checks `version = 1` AND `deleted_at IS NULL`
- Strict version 1 matching

### Uniqueness Target

The rule checks uniqueness for:
- `translatable_type` = model class name
- `locale` = specified locale
- `field` = field name
- `value` = submitted value
- Versioning constraints (as above)
- Optional parent constraints
- Optional current record exclusion

## Basic Usage

### In Form Request (Create)

Validate translation uniqueness when creating:

```php
namespace App\Http\Requests;

use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Translation\Rules\TranslationFieldExistRule;

class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        $locale = $this->input('locale', app()->getLocale());
        
        return [
            'translation.' . $locale . '.title' => [
                'required',
                'string',
                'max:255',
                new TranslationFieldExistRule(
                    Post::class,
                    'title',
                    $locale,
                    null,        // object_id (null on create)
                    -1,          // parent_id (ignore)
                    []            // parent_where
                ),
            ],
        ];
    }
}
```

### In Form Request (Update)

Exclude current record when updating:

```php
namespace App\Http\Requests;

use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Translation\Rules\TranslationFieldExistRule;

class UpdatePostRequest extends FormRequest
{
    public function rules(): array
    {
        $locale = $this->input('locale', app()->getLocale());
        $post = $this->route('post'); // Get current post
        
        return [
            'translation.' . $locale . '.title' => [
                'required',
                'string',
                'max:255',
                new TranslationFieldExistRule(
                    Post::class,
                    'title',
                    $locale,
                    $post->id,   // Exclude current post
                    -1,          // parent_id (ignore)
                    []            // parent_where
                ),
            ],
        ];
    }
}
```

### Direct Validation

```php
use Illuminate\Support\Facades\Validator;
use JobMetric\Translation\Rules\TranslationFieldExistRule;

$validator = Validator::make($data, [
    'translation.en.title' => [
        'required',
        'string',
        new TranslationFieldExistRule(Post::class, 'title', 'en'),
    ],
]);

if ($validator->fails()) {
    return response()->json($validator->errors(), 422);
}
```

## Complete Examples

### Example 1: Basic Uniqueness Check

Ensure product titles are unique per locale:

```php
namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Translation\Rules\TranslationFieldExistRule;

class StoreProductRequest extends FormRequest
{
    public function rules(): array
    {
        $locale = $this->input('locale', 'en');
        
        return [
            'translation.' . $locale . '.title' => [
                'required',
                'string',
                'max:255',
                new TranslationFieldExistRule(
                    Product::class,
                    'title',
                    $locale
                ),
            ],
        ];
    }
}
```

### Example 2: Update with Exclusion

Exclude current record when updating:

```php
namespace App\Http\Requests;

use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Translation\Rules\TranslationFieldExistRule;

class UpdatePostRequest extends FormRequest
{
    public function rules(): array
    {
        $locale = $this->input('locale', 'en');
        $post = $this->route('post');
        
        return [
            'translation.' . $locale . '.title' => [
                'required',
                'string',
                new TranslationFieldExistRule(
                    Post::class,
                    'title',
                    $locale,
                    $post->id  // Exclude current post
                ),
            ],
        ];
    }
}
```

### Example 3: With Parent Scoping

Ensure uniqueness within a parent category:

```php
namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Translation\Rules\TranslationFieldExistRule;

class StoreCategoryRequest extends FormRequest
{
    public function rules(): array
    {
        $locale = $this->input('locale', 'en');
        $parentId = $this->input('parent_id');
        
        return [
            'translation.' . $locale . '.name' => [
                'required',
                'string',
                new TranslationFieldExistRule(
                    Category::class,
                    'name',
                    $locale,
                    null,
                    $parentId !== null ? $parentId : -1  // Scope by parent
                ),
            ],
        ];
    }
}
```

### Example 4: With Additional Parent Constraints

Add additional constraints on parent table:

```php
namespace App\Http\Requests;

use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Translation\Rules\TranslationFieldExistRule;

class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        $locale = $this->input('locale', 'en');
        
        return [
            'translation.' . $locale . '.slug' => [
                'required',
                'string',
                new TranslationFieldExistRule(
                    Post::class,
                    'slug',
                    $locale,
                    null,
                    -1,
                    ['status' => 'published']  // Only check published posts
                ),
            ],
        ];
    }
}
```

### Example 5: Multiple Locales

Validate uniqueness for multiple locales:

```php
namespace App\Http\Requests;

use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Translation\Rules\TranslationFieldExistRule;

class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        $rules = [];
        $locales = ['en', 'fa', 'de'];
        
        foreach ($locales as $locale) {
            $rules["translation.{$locale}.title"] = [
                'required',
                'string',
                new TranslationFieldExistRule(
                    Post::class,
                    'title',
                    $locale
                ),
            ];
        }
        
        return $rules;
    }
}
```

### Example 6: Custom Error Message

Provide custom field name in error message:

```php
namespace App\Http\Requests;

use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Translation\Rules\TranslationFieldExistRule;

class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        $locale = $this->input('locale', 'en');
        
        return [
            'translation.' . $locale . '.title' => [
                'required',
                'string',
                new TranslationFieldExistRule(
                    Post::class,
                    'title',
                    $locale,
                    null,
                    -1,
                    [],
                    'validation.attributes.title'  // Custom field name
                ),
            ],
        ];
    }
}
```

### Example 7: Complex Scoping

Combine parent_id and parent_where constraints:

```php
namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Translation\Rules\TranslationFieldExistRule;

class StoreProductRequest extends FormRequest
{
    public function rules(): array
    {
        $locale = $this->input('locale', 'en');
        $categoryId = $this->input('category_id');
        
        return [
            'translation.' . $locale . '.name' => [
                'required',
                'string',
                new TranslationFieldExistRule(
                    Product::class,
                    'name',
                    $locale,
                    null,
                    $categoryId,  // Scope by category
                    ['status' => 'active', 'type' => 'product']  // Additional constraints
                ),
            ],
        ];
    }
}
```

### Example 8: Conditional Validation

Apply rule conditionally:

```php
namespace App\Http\Requests;

use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use JobMetric\Translation\Rules\TranslationFieldExistRule;

class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        $locale = $this->input('locale', 'en');
        $rules = [
            'translation.' . $locale . '.title' => ['required', 'string'],
        ];

        // Only validate uniqueness for published posts
        if ($this->input('status') === 'published') {
            $rules['translation.' . $locale . '.title'][] = new TranslationFieldExistRule(
                Post::class,
                'title',
                $locale
            );
        }

        return $rules;
    }
}
```

## Error Messages

### Default Error Message

The rule uses a translation key for error messages:

```php
trans('translation::base.rule.exist', [
    'field' => trans($this->field_name_trans)
])
```

**Translation Key:** `translation::base.rule.exist`

**Default Message:** `"The translation field already exists."`

### Custom Error Messages

Override error messages in form requests:

```php
namespace App\Http\Requests;

use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Translation\Rules\TranslationFieldExistRule;

class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        $locale = $this->input('locale', 'en');
        
        return [
            'translation.' . $locale . '.title' => [
                'required',
                'string',
                new TranslationFieldExistRule(Post::class, 'title', $locale),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'translation.' . $this->input('locale', 'en') . '.title' => 
                'This title already exists for this language.',
        ];
    }
}
```

### Error Response Format

When validation fails:

```json
{
    "errors": {
        "translation.en.title": [
            "The translation field already exists."
        ]
    }
}
```

## Versioning Behavior

### Versioning Enabled

When `usesTranslationVersioning()` returns `true`:

```php
// Only checks active translations (deleted_at IS NULL)
// Represents latest version per (locale, field)
```

**Query Logic:**
```sql
WHERE deleted_at IS NULL
```

### Versioning Disabled

When versioning is disabled:

```php
// Checks version = 1 AND deleted_at IS NULL
```

**Query Logic:**
```sql
WHERE version = 1 AND deleted_at IS NULL
```

## When to Use

Use `TranslationFieldExistRule` when you need to:

- **Unique Translations**: Ensure translated field values are unique per locale
- **Form Validation**: Validate translation uniqueness in form requests
- **Update Safety**: Exclude current record when updating translations
- **Hierarchical Models**: Enforce uniqueness within parent relationships
- **Versioning Awareness**: Respect translation versioning policies
- **Scoped Uniqueness**: Apply additional constraints on parent table

## When NOT to Use

Avoid using this rule when:

- **Global Uniqueness**: If you need global uniqueness (not per locale), use Laravel's `unique` rule
- **Non-Translatable Fields**: For regular database columns, use standard validation rules
- **Performance Critical**: For high-frequency validations, consider caching or database indexes

## Best Practices

### 1. Always Use Class Constants

```php
// Good: Use class constants
new TranslationFieldExistRule(Post::class, 'title', 'en')

// Avoid: String literals
new TranslationFieldExistRule('App\Models\Post', 'title', 'en')
```

### 2. Exclude Current Record on Updates

```php
// Good: Exclude current record
new TranslationFieldExistRule(Post::class, 'title', 'en', $post->id)

// Avoid: Not excluding on updates
new TranslationFieldExistRule(Post::class, 'title', 'en')  // May fail on update
```

### 3. Combine with Type Validation

```php
// Good: Combined with type validation
'translation.en.title' => [
    'required',
    'string',
    'max:255',
    new TranslationFieldExistRule(Post::class, 'title', 'en'),
]

// Avoid: Missing type validation
'translation.en.title' => [
    new TranslationFieldExistRule(Post::class, 'title', 'en'),
]
```

### 4. Use Appropriate Scoping

```php
// Good: Scope by parent when needed
new TranslationFieldExistRule(
    Category::class,
    'name',
    'en',
    null,
    $parentId  // Scope by parent
)

// Avoid: Global check when scoping is needed
new TranslationFieldExistRule(Category::class, 'name', 'en')
```

### 5. Provide Custom Field Names

```php
// Good: Custom field name
new TranslationFieldExistRule(
    Post::class,
    'title',
    'en',
    null,
    -1,
    [],
    'validation.attributes.title'
)

// Avoid: Generic field name
new TranslationFieldExistRule(Post::class, 'title', 'en')
```

## Common Mistakes

### Mistake 1: Not Excluding Current Record on Updates

```php
// Bad: May fail when updating with same value
new TranslationFieldExistRule(Post::class, 'title', 'en')

// Good: Exclude current record
new TranslationFieldExistRule(Post::class, 'title', 'en', $post->id)
```

### Mistake 2: Using Wrong Locale

```php
// Bad: Hard-coded locale
new TranslationFieldExistRule(Post::class, 'title', 'en')

// Good: Dynamic locale
$locale = $this->input('locale', app()->getLocale());
new TranslationFieldExistRule(Post::class, 'title', $locale)
```

### Mistake 3: Not Combining with Type Validation

```php
// Bad: Missing type validation
'translation.en.title' => [
    new TranslationFieldExistRule(Post::class, 'title', 'en'),
]

// Good: Combined with type validation
'translation.en.title' => [
    'required',
    'string',
    new TranslationFieldExistRule(Post::class, 'title', 'en'),
]
```

### Mistake 4: Incorrect Parent Scoping

```php
// Bad: Wrong parent_id value
new TranslationFieldExistRule(
    Category::class,
    'name',
    'en',
    null,
    0  // May match parent_id = 0, not ignore
)

// Good: Use -1 to ignore
new TranslationFieldExistRule(
    Category::class,
    'name',
    'en',
    null,
    -1  // Ignore parent_id
)
```

## Performance Considerations

### Database Queries

The rule performs a database query for each validation:

```php
// Each rule instance = 1 database query
$rules = [
    'translation.en.title' => new TranslationFieldExistRule(Post::class, 'title', 'en'),
    'translation.fa.title' => new TranslationFieldExistRule(Post::class, 'title', 'fa'),
];
// = 2 database queries
```

### Optimization Tips

1. **Add Database Indexes**:

```php
// Migration
Schema::table('translations', function (Blueprint $table) {
    $table->index(['translatable_type', 'locale', 'field', 'value']);
    $table->index(['translatable_type', 'locale', 'field', 'deleted_at']);
});
```

2. **Cache Validation Results**:

```php
// Cache unique values to reduce database queries
```

3. **Batch Validation**:

```php
// Validate multiple fields in single request
// to reduce overall query count
```

## Related Documentation

- <Link to="/packages/laravel-translation/deep-diving/has-translation">HasTranslation</Link>
- <Link to="/packages/laravel-translation/deep-diving/requests/translation-array-request">TranslationArrayRequest</Link>
- <Link to="/packages/laravel-translation/deep-diving/requests/multi-translation-array-request">MultiTranslationArrayRequest</Link>
- <Link to="/packages/laravel-translation/deep-diving/requests/translation-type-object-request">TranslationTypeObjectRequest</Link>
- <Link to="/packages/laravel-translation/deep-diving/requests/multi-translation-type-object-request">MultiTranslationTypeObjectRequest</Link>

