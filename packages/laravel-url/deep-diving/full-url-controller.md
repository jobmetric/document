---
sidebar_position: 7
sidebar_label: FullUrlController
---

import Link from "@docusaurus/Link";

# FullUrlController

The `FullUrlController` is a fallback controller that resolves any unmatched request path against the versioned `urls` table. It provides smart URL resolution with automatic 301 redirects for legacy URLs.

## Namespace

```php
JobMetric\Url\Http\Controllers\FullUrlController
```

## Overview

The controller handles:
- **Active URL matching**: Finds active URLs and fires `UrlMatched` event
- **Legacy redirects**: Automatically redirects (301) old URLs to canonical versions
- **404 handling**: Returns translated 404 when no match is found

## Configuration

Enable/disable the fallback route in `config/url.php`:

```php
return [
    'register_fallback' => env('URL_REGISTER_FALLBACK', true),
    'fallback_middleware' => ['web'],
];
```

## How It Works

### Request Flow

1. **Normalize path**: Builds candidate paths from request
2. **Check active URLs**: Looks for active URL match
3. **Check legacy URLs**: If no active match, checks soft-deleted URLs
4. **Redirect or 404**: Redirects legacy URLs or returns 404

### Path Candidates

For a request like `GET /shop/laptops/mbp-14`, the controller checks:
- `shop/laptops/mbp-14`
- `shop/laptops/mbp-14/`
- `/shop/laptops/mbp-14`
- `/shop/laptops/mbp-14/`
- `/` (for root paths)

## Usage

### Basic Setup

The controller is automatically registered when `register_fallback` is `true`:

```php
// In routes (automatically registered)
Route::fallback(FullUrlController::class)
    ->name('JobMetric.url.fallback');
```

### Event Handling

Listen to `UrlMatched` event to handle active URLs:

```php
use Illuminate\Support\Facades\Event;
use JobMetric\Url\Events\UrlMatched;

Event::listen(UrlMatched::class, function (UrlMatched $event) {
    if ($event->urlable instanceof Product) {
        $event->respond(view('products.show', ['product' => $event->urlable]));
    }
});
```

## Complete Examples

### Example 1: Product Page Handler

```php
Event::listen(UrlMatched::class, function (UrlMatched $event) {
    if ($event->urlable instanceof Product) {
        $event->respond(view('products.show', ['product' => $event->urlable]));
    }
});
```

### Example 2: Category Page Handler

```php
Event::listen(UrlMatched::class, function (UrlMatched $event) {
    if ($event->urlable instanceof Category) {
        $page = (int) $event->request->query('page', 1);
        $products = $event->urlable->products()->paginate(24, ['*'], 'page', $page);
        $event->respond(view('categories.show', [
            'category' => $event->urlable,
            'products' => $products,
        ]));
    }
});
```

### Example 3: API Response

```php
Event::listen(UrlMatched::class, function (UrlMatched $event) {
    if ($event->request->wantsJson()) {
        $event->respond(response()->json([
            'url' => $event->url->full_url,
            'model' => $event->urlable->toArray(),
        ]));
    }
});
```

### Example 4: Multiple Model Types

```php
Event::listen(UrlMatched::class, function (UrlMatched $event) {
    $model = $event->urlable;

    if ($model instanceof Product) {
        $event->respond(view('products.show', ['product' => $model]));
    } elseif ($model instanceof Category) {
        $event->respond(view('categories.show', ['category' => $model]));
    } elseif ($model instanceof Page) {
        $event->respond(view('pages.show', ['page' => $model]));
    }
});
```

## Automatic Redirects

Legacy URLs automatically redirect (301) to their canonical versions:

- **Request**: `/shop/old-path`
- **Redirect**: `301 → /shop/new-path`
- **Query strings**: Preserved in redirect

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/events">Events</Link> - UrlMatched event documentation
- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl Trait</Link> - Trait that manages URLs

