---
sidebar_position: 3
sidebar_label: Translation Service
---

import Link from "@docusaurus/Link";

# Translation Service

The `Translation` service provides a **single reusable entry point** for storing translations across any translatable model.  
It centralizes validation, model lookup, translation persistence, and unified response output.

## When to Use Translation Service

**Use `Translation` service when you need:**

- **Shared set-translation logic**: avoid duplicating translation loops in multiple package services
- **Request-driven validation**: validate payloads with a dedicated translation request (`SetTranslationRequest`)
- **Model-agnostic behavior**: reuse one implementation for attributes, products, posts, or any translatable model
- **Consistent responses**: always return `JobMetric\PackageCore\Output\Response`
- **Optional domain-specific not-found errors**: map missing model IDs to your package exceptions via callback

**Example scenarios:**
- Attribute package: `Attribute::setTranslation()` and `AttributeValue::setTranslation()`
- Product package: set translation for product entities from panel or API
- Any package service with `translatable_id` + `translation` payload

## Namespace

```php
JobMetric\Translation\Services\Translation
```

## Bound Service Key

The service is registered as a singleton in container with key:

```php
translation
```

You can access it via:

```php
app('translation')
```

or with facade:

```php
JobMetric\Translation\Facades\Translation
```

## Related Built-ins

- **Form Request:** `JobMetric\Translation\Http\Requests\SetTranslationRequest`
- **Helper:** `translation_set(...)`
- **Facade:** `JobMetric\Translation\Facades\Translation`

## Method Signature

```php
public function setTranslation(
    array $data,
    array $requestContext,
    string $modelClass,
    string $message,
    int $status = 200,
    ?Closure $notFoundExceptionFactory = null
): Response
```

### Parameters

- `$data`  
  Incoming payload, typically:
  - `locale` (string)
  - `translatable_id` (int)
  - `translation` (array of locale => fields)

- `$requestContext`  
  Context passed to `SetTranslationRequest`:
  - `model_class` (class-string)
  - `table` (string)
  - `attribute_path` (string for label translation path with `{field}`)

- `$modelClass`  
  Target model class to fetch and translate (must be translatable).

- `$message`  
  Success message for the final `Response`.

- `$status`  
  Success status code (default `200`).

- `$notFoundExceptionFactory`  
  Optional callback:
  `fn(int $id, ModelNotFoundException $e): Throwable`
  to throw package-specific exceptions.

## Quick Start (Service Call)

```php
use Illuminate\Database\Eloquent\ModelNotFoundException;
use JobMetric\Translation\Facades\Translation;
use App\Models\Product;
use App\Exceptions\ProductNotFoundException;

$response = Translation::setTranslation(
    data: [
        'locale' => 'en',
        'translatable_id' => 12,
        'translation' => [
            'en' => ['name' => 'Product Name'],
            'fa' => ['name' => 'نام محصول'],
        ],
    ],
    requestContext: [
        'model_class' => Product::class,
        'table' => 'products',
        'attribute_path' => 'product::base.form.product.fields.{field}.title',
    ],
    modelClass: Product::class,
    message: trans('product::base.messages.product.set_translation'),
    status: 200,
    notFoundExceptionFactory: fn (int $id, ModelNotFoundException $e) => new ProductNotFoundException($id, previous: $e)
);
```

## Better Practical Examples

### Example 1: Inside a Package Service Method (Real Pattern)

Use this pattern when your package service already has its own domain exceptions and message keys.

```php
use Illuminate\Database\Eloquent\ModelNotFoundException;
use JobMetric\PackageCore\Output\Response;
use JobMetric\Product\Exceptions\ProductNotFoundException;
use JobMetric\Product\Models\Product as ProductModel;

public function setTranslation(array $data): Response
{
    return translation_set(
        data: $data,
        requestContext: [
            'model_class' => ProductModel::class,
            'table' => config('product.tables.product'),
            'attribute_path' => 'product::base.form.product.fields.{field}.title',
        ],
        modelClass: ProductModel::class,
        message: trans('product::base.messages.product.set_translation'),
        status: 200,
        notFoundExceptionFactory: fn (int $id, ModelNotFoundException $e) => new ProductNotFoundException($id, previous: $e)
    );
}
```

---

### Example 2: Controller Endpoint Using Facade

Use this when translation is exposed directly from controller layer.

```php
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use JobMetric\Translation\Facades\Translation as TranslationFacade;
use App\Models\Post;

public function setPostTranslation(Request $request, int $id): JsonResponse
{
    $result = TranslationFacade::setTranslation(
        data: array_merge($request->all(), ['translatable_id' => $id]),
        requestContext: [
            'model_class' => Post::class,
            'table' => 'posts',
            'attribute_path' => 'post::base.form.post.fields.{field}.title',
        ],
        modelClass: Post::class,
        message: trans('post::base.messages.post.set_translation')
    );

    return response()->json([
        'ok' => $result->ok,
        'message' => $result->message,
        'status' => $result->status,
    ], $result->status);
}
```

---

### Example 3: Multi-Locale Payload (Expected Shape)

```php
$data = [
    'locale' => 'en',
    'translatable_id' => 55,
    'translation' => [
        'en' => [
            'name' => 'Running Shoes',
            'summary' => 'Comfortable lightweight shoes',
        ],
        'fa' => [
            'name' => 'کفش دویدن',
            'summary' => 'کفش سبک و راحت',
        ],
    ],
];
```

You can pass this payload to service/facade/helper; validation and persistence flow is the same.

---

### Example 4: Domain-Specific Not Found Mapping

If you skip `notFoundExceptionFactory`, missing record throws `ModelNotFoundException`.
If you need package-level exception consistency, map it explicitly:

```php
notFoundExceptionFactory: fn (int $id, ModelNotFoundException $e) =>
    new ProductNotFoundException($id, previous: $e)
```

This is recommended for package APIs that already expose custom exception types.

## Helper Usage

```php
$response = translation_set(
    data: $data,
    requestContext: [
        'model_class' => Product::class,
        'table' => 'products',
        'attribute_path' => 'product::base.form.product.fields.{field}.title',
    ],
    modelClass: Product::class,
    message: trans('product::base.messages.product.set_translation')
);
```

### Helper Example with Minimal Boilerplate

```php
$response = translation_set(
    data: [
        'locale' => 'fa',
        'translatable_id' => 9,
        'translation' => [
            'fa' => ['name' => 'نام فارسی'],
        ],
    ],
    requestContext: [
        'model_class' => \App\Models\Brand::class,
        'table' => 'brands',
        'attribute_path' => 'brand::base.form.brand.fields.{field}.title',
    ],
    modelClass: \App\Models\Brand::class,
    message: trans('brand::base.messages.brand.set_translation')
);
```

## Validation Flow

`Translation::setTranslation()` always validates via:

```php
JobMetric\Translation\Http\Requests\SetTranslationRequest
```

This means consumers **do not inject custom request classes**; the request implementation remains centralized inside `laravel-translation`.

## Output

On success, returns:

```php
Response::make(true, $message, null, $status)
```

## Error Behavior

- Invalid payload -> `ValidationException`
- Missing model -> `ModelNotFoundException` (or your mapped exception through callback)
- Non-translatable model -> `ModelHasTranslationNotFoundException`
- Translation persistence errors -> propagated (`Throwable`)

## Best Practices

1. Keep `requestContext.model_class` and `modelClass` aligned.
2. Always pass package-specific success messages for better API/UI feedback.
3. Use `notFoundExceptionFactory` to keep domain exceptions consistent.
4. Reuse `translation_set(...)` in services for shorter, cleaner code.
5. Keep `attribute_path` aligned with your package language keys to get clean validation labels.
6. Pass a table name from config (`config('package.tables...')`) instead of hardcoded values where possible.

## Related Documentation

- <Link to="./has-translation">HasTranslation Trait</Link>
- <Link to="./has-service-translation">HasServiceTranslation Trait</Link>
- [Request Traits](/packages/laravel-translation/deep-diving/requests/translation-array-request)
- <Link to="./events">Events</Link>

