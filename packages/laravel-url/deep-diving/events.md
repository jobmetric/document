---
sidebar_position: 4
sidebar_label: Events
---

import Link from "@docusaurus/Link";

# Events

Laravel URL provides a comprehensive event system that fires domain events for all URL operations. These events allow you to hook into the URL management lifecycle and perform additional actions when URLs are created, changed, matched, or when resources need to be generated.

## Overview

The event system in Laravel URL:

- **Fires automatically** during URL operations
- **Provides model and URL data** in event payloads
- **Uses DomainEvent interface** for consistency
- **Supports event listeners** for custom logic
- **Enables event-driven architecture** for URL management

## Event Structure

All events in Laravel URL:

- Implement `JobMetric\EventSystem\Contracts\DomainEvent` (where applicable)
- Are `readonly` classes for immutability (where applicable)
- Contain model and URL information
- Provide a stable `key()` method (where applicable)
- Include metadata via `definition()` method (where applicable)

### Base Event Structure

```php
readonly class UrlChanged implements DomainEvent
{
    public function __construct(
        public Model $model,
        public ?string $old,
        public string $new,
        public int $version
    ) {}

    public static function key(): string
    {
        return 'url.changed';
    }

    public static function definition(): DomainEventDefinition
    {
        return new DomainEventDefinition(
            self::key(),
            'url::base.entity_names.url',
            'url::base.events.url_changed.title',
            'url::base.events.url_changed.description',
            'fas fa-link',
            ['url', 'routing', 'seo']
        );
    }
}
```

## Available Events

### URL Events

Events fired for URL operations.

| Event Class | Event Key | Description | Payload | Triggered When |
|------------|-----------|-------------|---------|----------------|
| `UrlChanged` | `url.changed` | Fired after a URL is created or changed | `Model $model, ?string $old, string $new, int $version` | `HasUrl::dispatchSlug()`, `HasUrl::rebuildUrl()` |
| `UrlMatched` | `url.matched` | Fired when fallback route matches an active URL | `Request $request, Url $url, Model $urlable, ?string $collection` | `FullUrlController::__invoke()` |
| `UrlableResourceEvent` | `urlable.resource` | Fired when resource representation is needed | `mixed $urlable` | Accessing `slugable_resource` or `urlable_resource` |

**Namespace:** `JobMetric\Url\Events\*`

## Listening to Events

### Method 1: Event Listeners in Service Provider

Register event listeners in a service provider:

```php
namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Url\Events\UrlChanged;
use JobMetric\Url\Events\UrlMatched;
use JobMetric\Url\Events\UrlableResourceEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        UrlChanged::class => [
            \App\Listeners\Url\LogUrlChanged::class,
            \App\Listeners\Url\InvalidateUrlCache::class,
            \App\Listeners\Url\UpdateSearchIndex::class,
            \App\Listeners\Url\RegenerateSitemap::class,
            \App\Listeners\Url\TrackUrlAnalytics::class,
        ],
        UrlMatched::class => [
            \App\Listeners\Url\HandleUrlMatch::class,
            \App\Listeners\Url\LogUrlAccess::class,
        ],
        UrlableResourceEvent::class => [
            \App\Listeners\Url\GenerateUrlableResource::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
```

### Method 2: Using Event Facade

Listen to events using the Event facade:

```php
use Illuminate\Support\Facades\Event;
use JobMetric\Url\Events\UrlChanged;

Event::listen(UrlChanged::class, function (UrlChanged $event) {
    $model = $event->model;
    $old = $event->old;
    $new = $event->new;
    $version = $event->version;
    
    // Perform actions
    Log::info('URL changed', [
        'model' => get_class($model),
        'model_id' => $model->id,
        'old_url' => $old,
        'new_url' => $new,
        'version' => $version,
    ]);
    
    Cache::tags([get_class($model)])->flush();
});
```

### Method 3: Using Event Subscribers

Create event subscribers for multiple events:

```php
namespace App\Listeners;

use Illuminate\Events\Dispatcher;
use JobMetric\Url\Events\UrlChanged;
use JobMetric\Url\Events\UrlMatched;
use JobMetric\Url\Events\UrlableResourceEvent;

class UrlEventSubscriber
{
    public function handleUrlChanged(UrlChanged $event): void
    {
        $model = $event->model;
        $old = $event->old;
        $new = $event->new;
        
        Log::info('URL changed', [
            'model' => get_class($model),
            'model_id' => $model->id,
            'old_url' => $old,
            'new_url' => $new,
        ]);
    }

    public function handleUrlMatched(UrlMatched $event): void
    {
        $url = $event->url;
        $urlable = $event->urlable;
        
        Log::info('URL matched', [
            'url_id' => $url->id,
            'full_url' => $url->full_url,
            'model' => get_class($urlable),
            'model_id' => $urlable->id,
        ]);
    }

    public function handleUrlableResource(UrlableResourceEvent $event): void
    {
        $urlable = $event->urlable;
        
        if ($urlable instanceof Product) {
            $event->resource = new ProductResource($urlable);
        }
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            UrlChanged::class,
            [UrlEventSubscriber::class, 'handleUrlChanged']
        );

        $events->listen(
            UrlMatched::class,
            [UrlEventSubscriber::class, 'handleUrlMatched']
        );

        $events->listen(
            UrlableResourceEvent::class,
            [UrlEventSubscriber::class, 'handleUrlableResource']
        );
    }
}
```

Register the subscriber:

```php
namespace App\Providers;

use App\Listeners\UrlEventSubscriber;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $subscribe = [
        UrlEventSubscriber::class,
    ];
}
```

## Complete Examples

### Example 1: Cache Invalidation on URL Changes

Invalidate cache when URLs are modified:

```php
namespace App\Listeners\Url;

use Illuminate\Support\Facades\Cache;
use JobMetric\Url\Events\UrlChanged;

class InvalidateUrlCache
{
    public function handle(UrlChanged $event): void
    {
        $model = $event->model;
        $old = $event->old;
        $new = $event->new;

        // Invalidate specific URL cache
        if ($old) {
            Cache::forget("url:{$old}");
            Cache::forget("page:{$old}");
        }
        
        Cache::forget("url:{$new}");
        Cache::forget("page:{$new}");
        
        // Invalidate all URLs cache for this model
        Cache::forget("urls.{$model->getMorphClass()}.{$model->id}");

        // Clear tagged cache
        Cache::tags([get_class($model)])->flush();
        Cache::tags(["url_{$model->getMorphClass()}_{$model->id}"])->flush();
    }
}
```

### Example 2: Audit Logging

Log all URL operations for audit trail:

```php
namespace App\Listeners\Url;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use JobMetric\Url\Events\UrlChanged;
use JobMetric\Url\Events\UrlMatched;

class AuditUrlOperations
{
    public function handleUrlChanged(UrlChanged $event): void
    {
        $this->logAudit('changed', $event->model, [
            'old_url' => $event->old,
            'new_url' => $event->new,
            'version' => $event->version,
        ]);
    }

    public function handleUrlMatched(UrlMatched $event): void
    {
        $this->logAudit('matched', $event->urlable, [
            'url_id' => $event->url->id,
            'full_url' => $event->url->full_url,
            'collection' => $event->collection,
        ]);
    }

    protected function logAudit(string $action, $model, array $data): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => "url.{$action}",
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'data' => $data,
            'ip_address' => request()->ip(),
        ]);
    }
}
```

### Example 3: Search Index Updates

Update search index when URLs change:

```php
namespace App\Listeners\Url;

use App\Services\SearchService;
use JobMetric\Url\Events\UrlChanged;

class UpdateSearchIndex
{
    public function handle(UrlChanged $event): void
    {
        $model = $event->model;
        $old = $event->old;
        $new = $event->new;
        
        // Update search index with new URL
        SearchService::index($model, [
            'url' => $new,
            'old_url' => $old,
            'version' => $event->version,
        ]);
        
        // If old URL exists, update redirects
        if ($old) {
            SearchService::updateRedirect($old, $new);
        }
    }
}
```

### Example 4: Sitemap Generation

Regenerate sitemap when URLs change:

```php
namespace App\Listeners\Url;

use App\Services\SitemapService;
use JobMetric\Url\Events\UrlChanged;

class RegenerateSitemap
{
    public function __construct(
        protected SitemapService $sitemap
    ) {}

    public function handle(UrlChanged $event): void
    {
        $model = $event->model;
        $new = $event->new;
        
        // Regenerate sitemap for this model type
        $this->sitemap->regenerate(get_class($model));
        
        // Add new URL to sitemap
        $this->sitemap->add($new, [
            'lastmod' => now(),
            'changefreq' => 'weekly',
            'priority' => 0.8,
        ]);
        
        // Remove old URL if exists
        if ($event->old) {
            $this->sitemap->remove($event->old);
        }
    }
}
```

### Example 5: Analytics Tracking

Track URL changes for analytics:

```php
namespace App\Listeners\Url;

use App\Services\AnalyticsService;
use JobMetric\Url\Events\UrlChanged;
use JobMetric\Url\Events\UrlMatched;

class TrackUrlAnalytics
{
    public function __construct(
        protected AnalyticsService $analytics
    ) {}

    public function handleUrlChanged(UrlChanged $event): void
    {
        $model = $event->model;
        
        $this->analytics->track('url.changed', [
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'old_url' => $event->old,
            'new_url' => $event->new,
            'version' => $event->version,
        ]);
    }

    public function handleUrlMatched(UrlMatched $event): void
    {
        $url = $event->url;
        $urlable = $event->urlable;
        
        $this->analytics->track('url.matched', [
            'url_id' => $url->id,
            'full_url' => $url->full_url,
            'model_type' => get_class($urlable),
            'model_id' => $urlable->id,
            'collection' => $event->collection,
        ]);
    }
}
```

### Example 6: Fallback Route Handling

Handle unmatched URLs with custom logic:

```php
namespace App\Listeners\Url;

use JobMetric\Url\Events\UrlMatched;

class HandleUrlMatch
{
    public function handle(UrlMatched $event): void
    {
        $model = $event->urlable;
        $request = $event->request;

        // Handle different model types
        if ($model instanceof Product) {
            $event->response = view('products.show', [
                'product' => $model,
            ]);
        } elseif ($model instanceof Category) {
            $event->response = view('categories.show', [
                'category' => $model,
            ]);
        } elseif ($model instanceof Page) {
            $event->response = view('pages.show', [
                'page' => $model,
            ]);
        }

        // Handle API requests
        if ($request->wantsJson()) {
            $event->response = response()->json([
                'url' => $event->url->full_url,
                'model' => $model->toArray(),
            ]);
        }
    }
}
```

### Example 7: Resource Generation

Transform models into API resources:

```php
namespace App\Listeners\Url;

use App\Http\Resources\ProductResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\PageResource;
use JobMetric\Url\Events\UrlableResourceEvent;

class GenerateUrlableResource
{
    public function handle(UrlableResourceEvent $event): void
    {
        $urlable = $event->urlable;

        if ($urlable instanceof Product) {
            $event->resource = new ProductResource($urlable);
        } elseif ($urlable instanceof Category) {
            $event->resource = new CategoryResource($urlable);
        } elseif ($urlable instanceof Page) {
            $event->resource = new PageResource($urlable);
        }
    }
}
```

### Example 8: Complete Event Listener Setup

Complete setup for all URL events:

```php
namespace App\Providers;

use App\Listeners\Url\AuditUrlOperations;
use App\Listeners\Url\GenerateUrlableResource;
use App\Listeners\Url\HandleUrlMatch;
use App\Listeners\Url\InvalidateUrlCache;
use App\Listeners\Url\RegenerateSitemap;
use App\Listeners\Url\TrackUrlAnalytics;
use App\Listeners\Url\UpdateSearchIndex;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Url\Events\UrlChanged;
use JobMetric\Url\Events\UrlMatched;
use JobMetric\Url\Events\UrlableResourceEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // After URL change
        UrlChanged::class => [
            AuditUrlOperations::class,
            InvalidateUrlCache::class,
            UpdateSearchIndex::class,
            RegenerateSitemap::class,
            TrackUrlAnalytics::class,
        ],

        // After URL match
        UrlMatched::class => [
            HandleUrlMatch::class,
            AuditUrlOperations::class,
            TrackUrlAnalytics::class,
        ],

        // Resource generation
        UrlableResourceEvent::class => [
            GenerateUrlableResource::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
```

## Event Timing

### UrlChanged

Fired **after** the URL is saved to database:

```php
// Execution order:
// 1. Validate slug and URL
// 2. Check for conflicts
// 3. Create or update URL record
// 4. Save to database
// 5. Fire UrlChanged ← Event fired here
// 6. Return model instance
```

**Note**: This event fires for both new URLs and updates to existing URLs.

### UrlMatched

Fired **when** the fallback route matches an active URL:

```php
// Execution order:
// 1. Find matching URL in database
// 2. Load related model
// 3. Fire UrlMatched ← Event fired here
// 4. Return response (set by listener)
```

**Important Notes**:
- The URL is **matched** before `UrlMatched` fires
- You can access **matched URL and model** in listeners
- Response **must be set** by a listener
- If no listener sets response, default behavior applies

### UrlableResourceEvent

Fired **when** resource representation is needed:

```php
// Execution order:
// 1. Access slugable_resource or urlable_resource
// 2. Fire UrlableResourceEvent ← Event fired here
// 3. Return resource (set by listener)
```

**Important Notes**:
- Event fires **lazily** when resource is accessed
- Resource **must be set** by a listener
- If no listener sets resource, null is returned

## Queued Events

You can queue events for asynchronous processing:

```php
namespace App\Listeners\Url;

use Illuminate\Contracts\Queue\ShouldQueue;
use JobMetric\Url\Events\UrlChanged;

class ProcessUrlAsync implements ShouldQueue
{
    public function handle(UrlChanged $event): void
    {
        $model = $event->model;
        $new = $event->new;
        
        // Heavy processing that doesn't block the request
        $this->updateSearchIndex($model, $new);
        $this->regenerateSitemap($model);
        $this->syncWithExternalService($model, $new);
    }

    protected function updateSearchIndex($model, $url): void
    {
        // Update search index
    }

    protected function regenerateSitemap($model): void
    {
        // Regenerate sitemap
    }

    protected function syncWithExternalService($model, $url): void
    {
        // Sync with external API
    }
}
```

## Event Payload Details

### UrlChanged

```php
readonly class UrlChanged implements DomainEvent
{
    public function __construct(
        public Model $model,      // Model instance
        public ?string $old,      // Previous URL (null on create)
        public string $new,       // New active URL
        public int $version       // Version number of new URL
    ) {}
}
```

**Available Properties**:
- `$model`: The model instance that received the URL change
- `$old`: The previous URL (null on first creation)
- `$new`: The new active URL
- `$version`: The version number of the new URL

**Example Payload**:

```php
$event->model;        // Product instance
$event->old;          // '/shop/laptops/macbook-pro-13' or null
$event->new;          // '/shop/laptops/macbook-pro-14'
$event->version;      // 2
```

### UrlMatched

```php
class UrlMatched
{
    public Request $request;      // Incoming HTTP request
    public Url $url;             // Matched Url model instance
    public Model $urlable;       // Related model instance
    public ?string $collection;  // Optional collection name
    public mixed $response = null;  // Response to return (set by listener)
}
```

**Available Properties**:
- `$request`: The incoming HTTP request
- `$url`: The matched `Url` model instance
- `$urlable`: The related model instance
- `$collection`: Optional collection name
- `$response`: Response to return (must be set by listener)

**Example Payload**:

```php
$event->request;      // Request instance
$event->url;          // Url model instance
$event->urlable;      // Product instance
$event->collection;   // 'products' or null
$event->response;     // null (set by listener)
```

### UrlableResourceEvent

```php
class UrlableResourceEvent
{
    public mixed $urlable;       // Model instance needing resource
    public mixed $resource = null;  // Resource representation (set by listener)
}
```

**Available Properties**:
- `$urlable`: The model instance that needs a resource
- `$resource`: The resource representation (must be set by listener)

**Example Payload**:

```php
$event->urlable;      // Product instance
$event->resource;     // null (set by listener)
```

## When to Use Events

Use events when you need to:

- **Cache Management**: Invalidate or update cached URLs
- **Search Indexing**: Update search index when URLs change
- **Sitemap Generation**: Regenerate sitemaps on URL changes
- **Analytics**: Track URL operations for analytics
- **Audit Logging**: Log URL changes for compliance
- **Fallback Routing**: Handle unmatched URLs with custom logic
- **Resource Transformation**: Transform models into API resources
- **SEO Optimization**: Track URL changes for SEO purposes
- **Integration**: Integrate with external services
- **Side Effects**: Perform side effects without coupling

## Related Documentation

- <Link to="/packages/laravel-url/deep-diving/has-url">HasUrl</Link>
- <Link to="/packages/laravel-url/deep-diving/full-url-controller">FullUrlController</Link>
- <Link to="/packages/laravel-url/deep-diving/models/url">Url Model</Link>
- <Link to="/packages/laravel-url/deep-diving/models/slug">Slug Model</Link>
