---
sidebar_position: 5
sidebar_label: Events
---

import Link from "@docusaurus/Link";

# Events

Laravel Language provides a comprehensive event system that fires domain events for all CRUD operations on Language entities. These events allow you to hook into the language lifecycle and perform additional actions when languages are created, updated, or deleted.

## Overview

The event system in Laravel Language:

- **Fires automatically** during CRUD operations
- **Provides model instances** in event payloads
- **Uses DomainEvent interface** for consistency
- **Supports event listeners** for custom logic
- **Enables event-driven architecture** for language management

## Event Structure

All events in Laravel Language:

- Implement `JobMetric\EventSystem\Contracts\DomainEvent`
- Are `readonly` classes for immutability
- Contain the affected model instance
- Provide a stable `key()` method
- Include metadata via `definition()` method

### Base Event Structure

```php
readonly class LanguageStoredEvent implements DomainEvent
{
    public function __construct(
        public Language $language,
        public array $data
    ) {}

    public static function key(): string
    {
        return 'language.stored';
    }

    public static function definition(): DomainEventDefinition
    {
        return new DomainEventDefinition(
            self::key(),
            'language::base.entity_names.language',
            'language::base.events.language_stored.title',
            'language::base.events.language_stored.description',
            'fas fa-save',
            ['language', 'storage', 'management']
        );
    }
}
```

## Available Events

### Language Events

Events fired for Language entity CRUD operations.

| Event Class | Event Key | Description | Payload | Triggered When |
|------------|-----------|-------------|---------|----------------|
| `LanguageStoredEvent` | `language.stored` | Fired when a new Language is created | `Language $language, array $data` | `Language::store()` |
| `LanguageUpdatedEvent` | `language.updated` | Fired when an existing Language is updated | `Language $language, array $data` | `Language::update()` |
| `LanguageDeletingEvent` | `language.deleting` | Fired before a Language is deleted | `Language $language` | Before `Language::delete()` |
| `LanguageDeletedEvent` | `language.deleted` | Fired after a Language is deleted | `Language $language` | After `Language::delete()` |

**Namespace:** `JobMetric\Language\Events\Language\*`

### SetLocaleEvent

Event fired when the application locale is set by middleware.

| Event Class | Event Key | Description | Payload | Triggered When |
|------------|-----------|-------------|---------|----------------|
| `SetLocaleEvent` | `language.locale_set` | Fired when locale is set | None | `SetLanguageMiddleware` execution |

**Namespace:** `JobMetric\Language\Events\SetLocaleEvent`

## Listening to Events

### Method 1: Event Listeners in Service Provider

Register event listeners in a service provider:

```php
namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Language\Events\Language\LanguageStoredEvent;
use JobMetric\Language\Events\Language\LanguageUpdatedEvent;
use JobMetric\Language\Events\Language\LanguageDeletedEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        LanguageStoredEvent::class => [
            \App\Listeners\Language\LogLanguageCreation::class,
            \App\Listeners\Language\InvalidateLanguageCache::class,
        ],
        LanguageUpdatedEvent::class => [
            \App\Listeners\Language\LogLanguageUpdate::class,
            \App\Listeners\Language\InvalidateLanguageCache::class,
        ],
        LanguageDeletedEvent::class => [
            \App\Listeners\Language\LogLanguageDeletion::class,
            \App\Listeners\Language\InvalidateLanguageCache::class,
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
use JobMetric\Language\Events\Language\LanguageStoredEvent;

Event::listen(LanguageStoredEvent::class, function (LanguageStoredEvent $event) {
    $language = $event->language;
    
    // Perform actions
    Log::info('Language created', ['language_id' => $language->id, 'locale' => $language->locale]);
    Cache::forget("languages.active");
    Cache::forget("language.{$language->locale}");
});
```

### Method 3: Using Event Subscribers

Create event subscribers for multiple events:

```php
namespace App\Listeners;

use Illuminate\Events\Dispatcher;
use JobMetric\Language\Events\Language\LanguageStoredEvent;
use JobMetric\Language\Events\Language\LanguageUpdatedEvent;
use JobMetric\Language\Events\Language\LanguageDeletedEvent;

class LanguageEventSubscriber
{
    public function handleLanguageStored(LanguageStoredEvent $event): void
    {
        $language = $event->language;
        Log::info('Language stored', [
            'language_id' => $language->id,
            'locale' => $language->locale,
            'name' => $language->name,
        ]);
    }

    public function handleLanguageUpdated(LanguageUpdatedEvent $event): void
    {
        $language = $event->language;
        Log::info('Language updated', [
            'language_id' => $language->id,
            'locale' => $language->locale,
            'changes' => $language->getChanges(),
        ]);
    }

    public function handleLanguageDeleted(LanguageDeletedEvent $event): void
    {
        $language = $event->language;
        Log::warning('Language deleted', [
            'language_id' => $language->id,
            'locale' => $language->locale,
        ]);
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            LanguageStoredEvent::class,
            [LanguageEventSubscriber::class, 'handleLanguageStored']
        );

        $events->listen(
            LanguageUpdatedEvent::class,
            [LanguageEventSubscriber::class, 'handleLanguageUpdated']
        );

        $events->listen(
            LanguageDeletedEvent::class,
            [LanguageEventSubscriber::class, 'handleLanguageDeleted']
        );
    }
}
```

Register the subscriber:

```php
namespace App\Providers;

use App\Listeners\LanguageEventSubscriber;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $subscribe = [
        LanguageEventSubscriber::class,
    ];
}
```

## Complete Examples

### Example 1: Cache Invalidation on Language Changes

Invalidate cache when languages are modified:

```php
namespace App\Listeners\Language;

use Illuminate\Support\Facades\Cache;
use JobMetric\Language\Events\Language\LanguageStoredEvent;
use JobMetric\Language\Events\Language\LanguageUpdatedEvent;
use JobMetric\Language\Events\Language\LanguageDeletedEvent;

class InvalidateLanguageCache
{
    public function handle(LanguageStoredEvent|LanguageUpdatedEvent|LanguageDeletedEvent $event): void
    {
        $language = $event->language;

        // Invalidate specific language cache
        Cache::forget("language.{$language->locale}");
        Cache::forget("language.{$language->id}");

        // Invalidate active languages cache
        Cache::forget('languages.active');
        Cache::forget('languages.all');

        // Invalidate current language cache
        Cache::forget("language.current.{$language->locale}");
    }
}
```

### Example 2: Audit Logging

Log all language operations for audit trail:

```php
namespace App\Listeners\Language;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use JobMetric\Language\Events\Language\LanguageStoredEvent;
use JobMetric\Language\Events\Language\LanguageUpdatedEvent;
use JobMetric\Language\Events\Language\LanguageDeletedEvent;

class AuditLanguageOperations
{
    public function handleLanguageStored(LanguageStoredEvent $event): void
    {
        $this->logAudit('created', $event->language, $event->data);
    }

    public function handleLanguageUpdated(LanguageUpdatedEvent $event): void
    {
        $this->logAudit('updated', $event->language, $event->data);
    }

    public function handleLanguageDeleted(LanguageDeletedEvent $event): void
    {
        $this->logAudit('deleted', $event->language);
    }

    protected function logAudit(string $action, $language, ?array $data = null): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => "language.{$action}",
            'model_type' => get_class($language),
            'model_id' => $language->id,
            'data' => $data,
            'changes' => $language->getChanges(),
            'ip_address' => request()->ip(),
        ]);
    }
}
```

### Example 3: Notification System

Send notifications when languages are created or updated:

```php
namespace App\Listeners\Language;

use App\Notifications\LanguageCreated;
use App\Notifications\LanguageUpdated;
use Illuminate\Support\Facades\Notification;
use JobMetric\Language\Events\Language\LanguageStoredEvent;
use JobMetric\Language\Events\Language\LanguageUpdatedEvent;

class NotifyLanguageChanges
{
    public function handleLanguageStored(LanguageStoredEvent $event): void
    {
        $language = $event->language;

        // Notify administrators
        $admins = User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->get();

        Notification::send($admins, new LanguageCreated($language));
    }

    public function handleLanguageUpdated(LanguageUpdatedEvent $event): void
    {
        $language = $event->language;

        // Notify if status changed
        if ($language->wasChanged('status')) {
            $admins = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })->get();

            Notification::send($admins, new LanguageUpdated($language));
        }
    }
}
```

### Example 4: Search Index Update

Update search index when languages change:

```php
namespace App\Listeners\Language;

use App\Services\SearchService;
use JobMetric\Language\Events\Language\LanguageStoredEvent;
use JobMetric\Language\Events\Language\LanguageUpdatedEvent;
use JobMetric\Language\Events\Language\LanguageDeletedEvent;

class UpdateSearchIndex
{
    public function __construct(
        protected SearchService $searchService
    ) {}

    public function handleLanguageStored(LanguageStoredEvent $event): void
    {
        $this->searchService->indexLanguage($event->language);
    }

    public function handleLanguageUpdated(LanguageUpdatedEvent $event): void
    {
        $this->searchService->updateLanguage($event->language);
    }

    public function handleLanguageDeleted(LanguageDeletedEvent $event): void
    {
        $this->searchService->removeLanguage($event->language->id);
    }
}
```

### Example 5: Locale Change Tracking

Track locale changes when SetLocaleEvent fires:

```php
namespace App\Listeners\Language;

use App\Models\LocaleChangeHistory;
use Illuminate\Support\Facades\Auth;
use JobMetric\Language\Events\SetLocaleEvent;

class TrackLocaleChanges
{
    public function handle(SetLocaleEvent $event): void
    {
        $locale = app()->getLocale();
        
        LocaleChangeHistory::create([
            'user_id' => Auth::id(),
            'locale' => $locale,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'changed_at' => now(),
        ]);
    }
}
```

### Example 6: Complete Event Listener Setup

Complete setup for all language events:

```php
namespace App\Providers;

use App\Listeners\Language\AuditLanguageOperations;
use App\Listeners\Language\InvalidateLanguageCache;
use App\Listeners\Language\NotifyLanguageChanges;
use App\Listeners\Language\TrackLocaleChanges;
use App\Listeners\Language\UpdateSearchIndex;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Language\Events\Language\LanguageDeletedEvent;
use JobMetric\Language\Events\Language\LanguageStoredEvent;
use JobMetric\Language\Events\Language\LanguageUpdatedEvent;
use JobMetric\Language\Events\SetLocaleEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // Language events
        LanguageStoredEvent::class => [
            AuditLanguageOperations::class,
            InvalidateLanguageCache::class,
            NotifyLanguageChanges::class,
            UpdateSearchIndex::class,
        ],
        LanguageUpdatedEvent::class => [
            AuditLanguageOperations::class,
            InvalidateLanguageCache::class,
            NotifyLanguageChanges::class,
            UpdateSearchIndex::class,
        ],
        LanguageDeletedEvent::class => [
            AuditLanguageOperations::class,
            InvalidateLanguageCache::class,
            UpdateSearchIndex::class,
        ],

        // Locale events
        SetLocaleEvent::class => [
            TrackLocaleChanges::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
```

## Event Timing

Events are fired **after** the database operation completes:

```php
// Execution order:
// 1. Validate input
// 2. Perform database operation (create/update/delete)
// 3. Fire event ← Event fired here
// 4. Return response
```

This means:
- The model is **saved** to database before event fires
- You can access **fresh model data** in listeners
- Database transaction is **committed** before event fires
- Events are **synchronous** by default (can be queued)

## Queued Events

You can queue events for asynchronous processing:

```php
namespace App\Listeners\Language;

use Illuminate\Contracts\Queue\ShouldQueue;
use JobMetric\Language\Events\Language\LanguageStoredEvent;

class ProcessLanguageAsync implements ShouldQueue
{
    public function handle(LanguageStoredEvent $event): void
    {
        $language = $event->language;
        
        // Heavy processing that doesn't block the request
        $this->generateLanguageAssets($language);
        $this->updateSearchIndex($language);
        $this->sendWelcomeNotifications($language);
    }

    protected function generateLanguageAssets($language): void
    {
        // Generate language-specific assets
    }

    protected function updateSearchIndex($language): void
    {
        // Update search index
    }

    protected function sendWelcomeNotifications($language): void
    {
        // Send notifications
    }
}
```

## When to Use Events

Use events when you need to:

- **Cache Management**: Invalidate or update cached language data
- **Notifications**: Send notifications when languages change
- **Analytics**: Track language operations for analytics
- **Audit Logging**: Log language changes for compliance
- **Search Indexing**: Update search indexes when languages change
- **Integration**: Integrate with external services
- **Side Effects**: Perform side effects without coupling

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/language-service">Language Service</Link>
- <Link to="/packages/laravel-language/deep-diving/models/language">Language Model</Link>
- <Link to="/packages/laravel-language/deep-diving/middleware/set-language-middleware">SetLanguageMiddleware</Link>

