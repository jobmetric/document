---
sidebar_position: 1
sidebar_label: HasTranslation
---

import Link from "@docusaurus/Link";

# HasTranslation Trait

The `HasTranslation` trait is the **core foundation** of Laravel Translation package, providing powerful multilingual capabilities for your Eloquent models. It enables per-field translations with optional versioning, query scopes, and a comprehensive set of helper methods for managing translations seamlessly.

## When to Use HasTranslation

**Use `HasTranslation` when you need:**

- **Multilingual content management**: Store and retrieve content in multiple languages for the same model
- **Per-field translations**: Different fields can have different translations for different locales
- **Dynamic translation storage**: Translations stored in database, making them manageable through your application
- **Version history**: Track changes to translations over time with optional versioning
- **Query support**: Search and filter models based on translated content
- **Flexible field control**: Whitelist specific fields or allow all fields to be translatable

**Example scenarios:**
- E-commerce products with names, descriptions, and specifications in multiple languages
- Blog posts and articles with titles and content in different locales
- CMS pages and content with multilingual support
- Categories and taxonomies with translated names and descriptions
- News articles and media content in multiple languages
- Educational content with course materials in different languages
- Real estate listings with property descriptions in various locales

## Overview

`HasTranslation` transforms any Eloquent model into a fully multilingual entity, allowing you to:

- **Store translations per field** - Each translatable field can have different values for different locales
- **Control translatable fields** - Whitelist specific fields or allow all fields with `['*']`
- **Version history** - Optional versioning system to track translation changes over time
- **Query translations** - Powerful query scopes to search and filter by translated content
- **Simple API** - Intuitive methods for creating, reading, updating, and deleting translations

## Namespace

```php
JobMetric\Translation\HasTranslation
```

## Quick Start

Add the trait to your model and define which fields should be translatable:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use JobMetric\Translation\HasTranslation;

class Post extends Model
{
    use HasTranslation;

    /**
     * Only these fields can be translated.
     * Use ['*'] to allow all fields.
     */
    protected array $translatables = ['title', 'summary', 'body'];

    /**
     * Enable versioning to keep history of translations.
     * When enabled, each update creates a new version and soft-deletes the previous one.
     */
    protected bool $translationVersioning = true;

    protected $fillable = ['slug', 'status', 'translation'];
}
```

## Configuration Properties

### `$translatables`

Defines which fields can be translated. Accepts:

- **Array of field names**: `['title', 'summary', 'body']` - Only these fields can be translated
- **Wildcard**: `['*']` - All fields can be translated

```php
protected array $translatables = ['title', 'summary'];
```

### `$translationVersioning`

Enables version history tracking for translations:

- **`true`**: Each translation update creates a new version, previous versions are soft-deleted
- **`false`**: No versioning, translations are updated in place

```php
protected bool $translationVersioning = true;
```

## Creating Models with Translations

### Using the Virtual `translation` Attribute

The trait provides a virtual `translation` attribute that you can use during `create` or `update`:

```php
$post = Post::create([
    'slug' => 'hello-world',
    'status' => 'published',
    'translation' => [
        'en' => [
            'title'   => 'Hello World',
            'summary' => 'My first post',
            'body'    => 'Welcome to my blog!',
        ],
        'fa' => [
            'title'   => 'سلام دنیا',
            'summary' => 'اولین پست من',
            'body'    => 'به وبلاگ من خوش آمدید!',
        ],
        'ar' => [
            'title'   => 'مرحبا بالعالم',
            'summary' => 'منشورتي الأولى',
            'body'    => 'مرحبا بك في مدونتي!',
        ],
    ],
]);

// Retrieve translations
echo $post->getTranslation('title', 'fa');  // سلام دنیا
echo $post->getTranslation('title', 'en');  // Hello World
echo $post->getTranslation('title', 'ar');  // مرحبا بالعالم
```

### Creating First, Then Adding Translations

You can also create the model first and add translations separately:

```php
$post = Post::create([
    'slug' => 'hello-world',
    'status' => 'published',
]);

// Add translations one by one
$post->translate('en', [
    'title' => 'Hello World',
    'summary' => 'My first post',
]);

$post->translate('fa', [
    'title' => 'سلام دنیا',
    'summary' => 'اولین پست من',
]);
```

## Reading Translations

### Get Single Translation

Retrieve a specific field translation for a locale:

```php
// Get latest active translation
$title = $post->getTranslation('title', 'fa');

// Get specific version (if versioning is enabled)
$titleV1 = $post->getTranslation('title', 'fa', 1);
```

### Get All Translations for a Locale

```php
$translations = $post->getTranslations('fa');

// Output:
// Array
// (
//     [title] => سلام دنیا
//     [summary] => اولین پست من
//     [body] => به وبلاگ من خوش آمدید!
// )
```

### Get All Translations (All Locales)

```php
$allTranslations = $post->getTranslations();

// Output:
// Array
// (
//     [en] => Array
//         (
//             [title] => Hello World
//             [summary] => My first post
//             [body] => Welcome to my blog!
//         )
//     [fa] => Array
//         (
//             [title] => سلام دنیا
//             [summary] => اولین پست من
//             [body] => به وبلاگ من خوش آمدید!
//         )
// )
```

## Updating Translations

### Update via Virtual Attribute

```php
$post->update([
    'translation' => [
        'en' => [
            'summary' => 'Updated English summary',
        ],
        'fa' => [
            'title' => 'تیتر جدید',
        ],
    ],
]);
```

### Update Single Field

```php
$post->setTranslation('fa', 'title', 'تیتر جدید');
```

### Batch Update

```php
$post->translateBatch([
    'en' => [
        'title' => 'Updated Title',
        'summary' => 'Updated Summary',
    ],
    'fa' => [
        'title' => 'عنوان به‌روز شده',
        'summary' => 'خلاصه به‌روز شده',
    ],
]);
```

### Using `translate()` Method

```php
// Update single locale
$post->translate('en', [
    'title' => 'New Title',
    'summary' => 'New Summary',
]);
```

## Versioning System

When `$translationVersioning = true`, the trait maintains a complete history of translation changes.

### How Versioning Works

- Each time you update a translation, a new version is created
- The previous version is soft-deleted (not permanently removed)
- You can access any version of a translation
- The latest active version is returned by default

### Working with Versions

```php
// Create initial translation
$post->translate('en', ['title' => 'Version 1']);

// Update creates version 2
$post->translate('en', ['title' => 'Version 2']);

// Update creates version 3
$post->translate('en', ['title' => 'Version 3']);

// Get latest active version
echo $post->getTranslation('title', 'en');  // Version 3

// Get specific version
echo $post->getTranslation('title', 'en', 1);  // Version 1
echo $post->getTranslation('title', 'en', 2);  // Version 2

// Get latest version number
$latestVersion = $post->latestTranslationVersion('title', 'en');  // 3
```

### Translation History

Retrieve all versions of a translation:

```php
$history = $post->getTranslationVersions('title', 'en');

// Output:
// Array
// (
//     [0] => Array
//         (
//             [version] => 3
//             [value] => Version 3
//             [deleted_at] => null
//         )
//     [1] => Array
//         (
//             [version] => 2
//             [value] => Version 2
//             [deleted_at] => 2025-01-15 10:30:00
//         )
//     [2] => Array
//         (
//             [version] => 1
//             [value] => Version 1
//             [deleted_at] => 2025-01-15 10:25:00
//         )
// )
```

## Query Scopes

The trait provides powerful query scopes to search and filter models based on their translations.

### `whereTranslationEquals`

Find models where a translation field exactly matches a value:

```php
// Find posts with title "Hello World" in English
$posts = Post::whereTranslationEquals('title', 'Hello World', 'en')->get();

// Works with any translatable field
$posts = Post::whereTranslationEquals('summary', 'My first post', 'en')->get();
```

### `whereTranslationLike`

Find models where a translation field contains a value (LIKE query):

```php
// Find posts where summary contains "first" in English
$posts = Post::whereTranslationLike('summary', 'first', 'en')->get();

// Case-insensitive search
$posts = Post::whereTranslationLike('title', 'hello', 'en')->get();
```

### `searchTranslation`

Full-text search in translations (supports multiple languages):

```php
// Search in Persian
$posts = Post::searchTranslation('summary', 'خلاصه', 'fa')->get();

// Search in English
$posts = Post::searchTranslation('title', 'Hello', 'en')->get();
```

### Combining with Other Query Methods

Query scopes can be chained with other Eloquent methods:

```php
$posts = Post::where('status', 'published')
    ->whereTranslationEquals('title', 'Hello World', 'en')
    ->whereTranslationLike('summary', 'first', 'en')
    ->orderBy('created_at', 'desc')
    ->get();
```

## Managing Translatable Fields

### Get Allowed Fields

```php
$fields = $post->getTranslatableFields();

// Output: ['title', 'summary', 'body']
```

### Check if All Fields Are Allowed

```php
if ($post->translatablesAllowAll()) {
    // All fields can be translated
} else {
    // Only specific fields can be translated
}
```

### Add New Translatable Fields

```php
// Merge new fields with existing ones
$post->mergeTranslatables(['seo_title', 'meta_description']);

// Now translatable fields: ['title', 'summary', 'body', 'seo_title', 'meta_description']
```

### Remove Translatable Field

```php
$post->removeTranslatableField('summary');

// Now translatable fields: ['title', 'body']
```

## Checking Translation Existence

### Check if Field Has Translation

```php
if ($post->hasTranslationField('title', 'fa')) {
    // Translation exists
    echo $post->getTranslation('title', 'fa');
} else {
    // Translation doesn't exist
    echo 'No translation available';
}
```

### Check if Any Translation Exists

```php
if ($post->hasTranslation('title')) {
    // At least one locale has this field translated
}
```

## Deleting Translations

### Forget Single Field Translation

```php
// Remove translation for specific field and locale
$post->forgetTranslation('summary', 'en');

// Check if removed
var_dump($post->hasTranslationField('summary', 'en'));  // bool(false)
```

### Forget All Translations for a Locale

```php
// Remove all translations for a specific locale
$post->forgetTranslation(null, 'en');
```

## Real-World Examples

### Example 1: E-Commerce Product

```php
class Product extends Model
{
    use HasTranslation;

    protected array $translatables = [
        'name',
        'description',
        'short_description',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected bool $translationVersioning = true;
}

// Create product with translations
$product = Product::create([
    'sku' => 'PROD-001',
    'price' => 99.99,
    'translation' => [
        'en' => [
            'name' => 'Wireless Headphones',
            'description' => 'High-quality wireless headphones with noise cancellation',
            'short_description' => 'Premium wireless headphones',
            'meta_title' => 'Wireless Headphones - Best Price',
            'meta_description' => 'Buy wireless headphones with best features',
        ],
        'fa' => [
            'name' => 'هدفون بی‌سیم',
            'description' => 'هدفون بی‌سیم با کیفیت بالا و حذف نویز',
            'short_description' => 'هدفون بی‌سیم پریمیوم',
            'meta_title' => 'هدفون بی‌سیم - بهترین قیمت',
            'meta_description' => 'خرید هدفون بی‌سیم با بهترین ویژگی‌ها',
        ],
    ],
]);
```

### Example 2: Blog Post with Versioning

```php
class BlogPost extends Model
{
    use HasTranslation;

    protected array $translatables = ['title', 'content', 'excerpt'];
    protected bool $translationVersioning = true;
}

$post = BlogPost::create(['slug' => 'my-post']);

// Initial translation
$post->translate('en', [
    'title' => 'My First Post',
    'content' => 'Initial content...',
]);

// Editor makes changes (creates version 2)
$post->translate('en', [
    'title' => 'My First Post - Updated',
    'content' => 'Updated content with more details...',
]);

// Get current version
echo $post->getTranslation('title', 'en');  // My First Post - Updated

// Get previous version
echo $post->getTranslation('title', 'en', 1);  // My First Post

// View history
$history = $post->getTranslationVersions('title', 'en');
```

### Example 3: Multi-Language Search

```php
// Search for products in multiple languages
$searchTerm = 'headphones';

$products = Product::where(function($query) use ($searchTerm) {
    $query->whereTranslationLike('name', $searchTerm, 'en')
          ->orWhereTranslationLike('name', $searchTerm, 'fa')
          ->orWhereTranslationLike('name', $searchTerm, 'ar');
})->get();

// Display results with appropriate language
foreach ($products as $product) {
    $locale = app()->getLocale();
    echo $product->getTranslation('name', $locale);
}
```

## Best Practices

### 1. Define Translatable Fields Explicitly

```php
// ✅ Good: Explicit field list
protected array $translatables = ['title', 'summary', 'body'];

// ⚠️ Use with caution: All fields translatable
protected array $translatables = ['*'];
```

### 2. Enable Versioning for Important Content

```php
// ✅ Good: Enable versioning for content that changes frequently
protected bool $translationVersioning = true;
```

### 3. Use Query Scopes for Performance

```php
// ✅ Good: Use query scopes for efficient searching
$posts = Post::whereTranslationEquals('title', 'Hello', 'en')->get();

// ❌ Avoid: Loading all posts and filtering in PHP
$allPosts = Post::all();
$filtered = $allPosts->filter(function($post) {
    return $post->getTranslation('title', 'en') === 'Hello';
});
```

### 4. Always Check Translation Existence

```php
// ✅ Good: Check before using
if ($post->hasTranslationField('title', $locale)) {
    $title = $post->getTranslation('title', $locale);
} else {
    $title = 'No translation available';
}

// ❌ Avoid: Direct access without check
$title = $post->getTranslation('title', $locale);  // May return null
```

### 5. Batch Operations for Multiple Translations

```php
// ✅ Good: Batch update
$post->translateBatch([
    'en' => ['title' => 'Title', 'summary' => 'Summary'],
    'fa' => ['title' => 'عنوان', 'summary' => 'خلاصه'],
]);

// ❌ Avoid: Multiple individual updates
$post->setTranslation('en', 'title', 'Title');
$post->setTranslation('en', 'summary', 'Summary');
$post->setTranslation('fa', 'title', 'عنوان');
$post->setTranslation('fa', 'summary', 'خلاصه');
```

## Integration with Relationships

Translations work seamlessly with Eloquent relationships:

```php
class Category extends Model
{
    use HasTranslation;
    protected array $translatables = ['name', 'description'];
}

class Product extends Model
{
    use HasTranslation;
    protected array $translatables = ['name', 'description'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}

// Access translations through relationships
$product = Product::with('category')->first();
$productName = $product->getTranslation('name', 'fa');
$categoryName = $product->category->getTranslation('name', 'fa');
```

## Summary

The `HasTranslation` trait provides a comprehensive solution for multilingual content management:

- ✅ **Simple Setup** - Just add the trait and define translatable fields
- ✅ **Flexible Configuration** - Control which fields are translatable
- ✅ **Version History** - Optional versioning to track changes
- ✅ **Powerful Queries** - Query scopes for efficient searching
- ✅ **Intuitive API** - Easy-to-use methods for all operations
- ✅ **Performance Optimized** - Efficient database queries
- ✅ **Relationship Support** - Works seamlessly with Eloquent relationships

This trait allows you to build fully multilingual applications while keeping your code clean and maintainable.

## Related Documentation

- <Link to="/packages/laravel-translation/deep-diving/translation-field-exist-rule">TranslationFieldExistRule</Link> - Validation rule for unique translations
- [TranslationArrayRequest](/packages/laravel-translation/deep-diving/requests/translation-array-request) - Form request trait for array-based translations
- [MultiTranslationArrayRequest](/packages/laravel-translation/deep-diving/requests/multi-translation-array-request) - Form request trait for multi-locale array translations
- [TranslationTypeObjectRequest](/packages/laravel-translation/deep-diving/requests/translation-type-object-request) - Form request trait for Typeify-based translations
- [MultiTranslationTypeObjectRequest](/packages/laravel-translation/deep-diving/requests/multi-translation-type-object-request) - Form request trait for multi-locale Typeify translations
- [TranslationResource](/packages/laravel-translation/deep-diving/resources/translation-resource) - JSON resource for single translation rows
- [TranslationCollectionResource](/packages/laravel-translation/deep-diving/resources/translation-collection-resource) - JSON resource for translation collections
- [Events](/packages/laravel-translation/deep-diving/events) - Translation events system
- [Showcase](/packages/laravel-translation/showcase) - Real-world usage examples
