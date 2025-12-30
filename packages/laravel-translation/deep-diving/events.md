---
sidebar_position: 5
sidebar_label: Events
---

import Link from "@docusaurus/Link";

# Events

Laravel Translation provides a comprehensive event system that fires domain events for all translation operations. These events allow you to hook into the translation lifecycle and perform additional actions when translations are stored or forgotten.

## Overview

The event system in Laravel Translation:

- **Fires automatically** during translation operations
- **Provides model and translation data** in event payloads
- **Uses DomainEvent interface** for consistency
- **Supports event listeners** for custom logic
- **Enables event-driven architecture** for translation management

## Event Structure

All events in Laravel Translation:

- Implement `JobMetric\EventSystem\Contracts\DomainEvent`
- Are `readonly` classes for immutability
- Contain model and translation information
- Provide a stable `key()` method
- Include metadata via `definition()` method

### Base Event Structure

```php
readonly class TranslationStoredEvent implements DomainEvent
{
    public function __construct(
        public Model $model,
        public string $locale,
        public array $data
    ) {}

    public static function key(): string
    {
        return 'translation.stored';
    }

    public static function definition(): DomainEventDefinition
    {
        return new DomainEventDefinition(
            self::key(),
            'translation::base.entity_names.translation',
            'translation::base.events.translation_stored.title',
            'translation::base.events.translation_stored.description',
            'fas fa-save',
            ['translation', 'storage', 'localization']
        );
    }
}
```

## Available Events

### Translation Events

Events fired for translation operations.

| Event Class | Event Key | Description | Payload | Triggered When |
|------------|-----------|-------------|---------|----------------|
| `TranslationStoredEvent` | `translation.stored` | Fired after storing or updating a translation | `Model $model, string $locale, array $data` | `HasTranslation::setTranslation()` |
| `TranslationForgetEvent` | `translation.forgotten` | Fired after forgetting a translation | `Translation $translation` | `HasTranslation::forgetTranslation()` |

**Namespace:** `JobMetric\Translation\Events\*`

## Listening to Events

### Method 1: Event Listeners in Service Provider

Register event listeners in a service provider:

```php
namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Translation\Events\TranslationStoredEvent;
use JobMetric\Translation\Events\TranslationForgetEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        TranslationStoredEvent::class => [
            \App\Listeners\Translation\LogTranslationStored::class,
            \App\Listeners\Translation\InvalidateTranslationCache::class,
            \App\Listeners\Translation\UpdateSearchIndex::class,
            \App\Listeners\Translation\NotifyTranslationChange::class,
        ],
        TranslationForgetEvent::class => [
            \App\Listeners\Translation\LogTranslationForgotten::class,
            \App\Listeners\Translation\InvalidateTranslationCache::class,
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
use JobMetric\Translation\Events\TranslationStoredEvent;

Event::listen(TranslationStoredEvent::class, function (TranslationStoredEvent $event) {
    $model = $event->model;
    $locale = $event->locale;
    $data = $event->data;
    
    // Perform actions
    Log::info('Translation stored', [
        'model' => get_class($model),
        'model_id' => $model->id,
        'locale' => $locale,
        'field' => $data['field'] ?? null,
        'value' => $data['value'] ?? null,
    ]);
    
    Cache::tags([get_class($model)])->flush();
});
```

### Method 3: Using Event Subscribers

Create event subscribers for multiple events:

```php
namespace App\Listeners;

use Illuminate\Events\Dispatcher;
use JobMetric\Translation\Events\TranslationStoredEvent;
use JobMetric\Translation\Events\TranslationForgetEvent;

class TranslationEventSubscriber
{
    public function handleTranslationStored(TranslationStoredEvent $event): void
    {
        $model = $event->model;
        $locale = $event->locale;
        
        Log::info('Translation stored', [
            'model' => get_class($model),
            'model_id' => $model->id,
            'locale' => $locale,
        ]);
    }

    public function handleTranslationForgotten(TranslationForgetEvent $event): void
    {
        $translation = $event->translation;
        
        Log::warning('Translation forgotten', [
            'translation_id' => $translation->id,
            'locale' => $translation->locale,
            'field' => $translation->field,
        ]);
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            TranslationStoredEvent::class,
            [TranslationEventSubscriber::class, 'handleTranslationStored']
        );

        $events->listen(
            TranslationForgetEvent::class,
            [TranslationEventSubscriber::class, 'handleTranslationForgotten']
        );
    }
}
```

Register the subscriber:

```php
namespace App\Providers;

use App\Listeners\TranslationEventSubscriber;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $subscribe = [
        TranslationEventSubscriber::class,
    ];
}
```

## Complete Examples

### Example 1: Cache Invalidation on Translation Changes

Invalidate cache when translations are modified:

```php
namespace App\Listeners\Translation;

use Illuminate\Support\Facades\Cache;
use JobMetric\Translation\Events\TranslationStoredEvent;
use JobMetric\Translation\Events\TranslationForgetEvent;

class InvalidateTranslationCache
{
    public function handle(TranslationStoredEvent|TranslationForgetEvent $event): void
    {
        $model = $event->model ?? $event->translation->translatable;
        $locale = $event->locale ?? $event->translation->locale;

        // Invalidate specific model cache
        Cache::forget("translation.{$model->getMorphClass()}.{$model->id}");
        Cache::forget("translation.{$model->getMorphClass()}.{$model->id}.{$locale}");
        
        // Invalidate all translations cache for this model
        Cache::forget("translations.{$model->getMorphClass()}.{$model->id}");

        // Clear tagged cache
        Cache::tags([get_class($model)])->flush();
        Cache::tags(["translation_{$model->getMorphClass()}_{$model->id}"])->flush();
    }
}
```

### Example 2: Audit Logging

Log all translation operations for audit trail:

```php
namespace App\Listeners\Translation;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use JobMetric\Translation\Events\TranslationStoredEvent;
use JobMetric\Translation\Events\TranslationForgetEvent;

class AuditTranslationOperations
{
    public function handleTranslationStored(TranslationStoredEvent $event): void
    {
        $this->logAudit('stored', $event->model, $event->locale, $event->data);
    }

    public function handleTranslationForgotten(TranslationForgetEvent $event): void
    {
        $translation = $event->translation;
        
        $this->logAudit('forgotten', $translation->translatable, $translation->locale, [
            'field' => $translation->field,
            'value' => $translation->value,
        ]);
    }

    protected function logAudit(string $action, $model, string $locale, array $data): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => "translation.{$action}",
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'locale' => $locale,
            'data' => $data,
            'ip_address' => request()->ip(),
        ]);
    }
}
```

### Example 3: Search Index Updates

Update search index when important translations change:

```php
namespace App\Listeners\Translation;

use App\Services\SearchService;
use JobMetric\Translation\Events\TranslationStoredEvent;
use JobMetric\Translation\Events\TranslationForgetEvent;

class UpdateSearchIndex
{
    protected array $searchableFields = ['title', 'description', 'content', 'body'];

    public function handleTranslationStored(TranslationStoredEvent $event): void
    {
        $field = $event->data['field'] ?? null;
        
        // Only update index for searchable fields
        if (in_array($field, $this->searchableFields)) {
            SearchService::index($event->model, $event->locale);
        }
    }

    public function handleTranslationForgotten(TranslationForgetEvent $event): void
    {
        $translation = $event->translation;
        
        // Re-index if searchable field was forgotten
        if (in_array($translation->field, $this->searchableFields)) {
            SearchService::index($translation->translatable, $translation->locale);
        }
    }
}
```

### Example 4: Notification System

Send notifications when critical translations change:

```php
namespace App\Listeners\Translation;

use App\Notifications\TranslationChanged;
use Illuminate\Support\Facades\Notification;
use JobMetric\Translation\Events\TranslationStoredEvent;

class NotifyTranslationChanges
{
    protected array $notifiableFields = ['title', 'status', 'published', 'featured'];

    public function handle(TranslationStoredEvent $event): void
    {
        $field = $event->data['field'] ?? null;
        $model = $event->model;

        // Only notify for specific fields
        if (!in_array($field, $this->notifiableFields)) {
            return;
        }

        // Get model owner
        $owner = null;
        if (method_exists($model, 'user')) {
            $owner = $model->user;
        } elseif (method_exists($model, 'author')) {
            $owner = $model->author;
        }

        if ($owner) {
            $owner->notify(new TranslationChanged($model, $event->locale, $field));
        }

        // Notify administrators for critical fields
        if (in_array($field, ['status', 'published'])) {
            $admins = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })->get();

            Notification::send($admins, new TranslationChanged($model, $event->locale, $field));
        }
    }
}
```

### Example 5: Analytics Tracking

Track translation changes for analytics:

```php
namespace App\Listeners\Translation;

use App\Services\AnalyticsService;
use JobMetric\Translation\Events\TranslationStoredEvent;
use JobMetric\Translation\Events\TranslationForgetEvent;

class TrackTranslationAnalytics
{
    public function __construct(
        protected AnalyticsService $analytics
    ) {}

    public function handleTranslationStored(TranslationStoredEvent $event): void
    {
        $model = $event->model;
        $locale = $event->locale;
        $data = $event->data;
        
        $this->analytics->track('translation.stored', [
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'locale' => $locale,
            'field' => $data['field'] ?? null,
            'version' => $data['version'] ?? null,
        ]);
    }

    public function handleTranslationForgotten(TranslationForgetEvent $event): void
    {
        $translation = $event->translation;
        
        $this->analytics->track('translation.forgotten', [
            'translation_id' => $translation->id,
            'locale' => $translation->locale,
            'field' => $translation->field,
            'model_type' => $translation->translatable_type,
            'model_id' => $translation->translatable_id,
        ]);
    }
}
```

### Example 6: Translation Synchronization

Synchronize translations with external systems:

```php
namespace App\Listeners\Translation;

use App\Services\ExternalApiService;
use JobMetric\Translation\Events\TranslationStoredEvent;
use JobMetric\Translation\Events\TranslationForgetEvent;

class SynchronizeTranslations
{
    protected array $syncableFields = ['title', 'description', 'content'];

    public function __construct(
        protected ExternalApiService $externalApi
    ) {}

    public function handleTranslationStored(TranslationStoredEvent $event): void
    {
        $field = $event->data['field'] ?? null;
        
        // Only sync specific fields
        if (!in_array($field, $this->syncableFields)) {
            return;
        }

        $this->externalApi->syncTranslation(
            $event->model,
            $event->locale,
            $field,
            $event->data['value'] ?? null
        );
    }

    public function handleTranslationForgotten(TranslationForgetEvent $event): void
    {
        $translation = $event->translation;
        
        if (in_array($translation->field, $this->syncableFields)) {
            $this->externalApi->deleteTranslation(
                $translation->translatable,
                $translation->locale,
                $translation->field
            );
        }
    }
}
```

### Example 7: Real-time Updates

Send real-time updates via WebSockets or broadcasting:

```php
namespace App\Listeners\Translation;

use Illuminate\Support\Facades\Broadcast;
use JobMetric\Translation\Events\TranslationStoredEvent;
use JobMetric\Translation\Events\TranslationForgetEvent;

class BroadcastTranslationChanges
{
    public function handleTranslationStored(TranslationStoredEvent $event): void
    {
        $model = $event->model;
        
        Broadcast::channel("translation.{$model->getMorphClass()}.{$model->id}", function () {
            return true;
        })->toOthers();
        
        event(new TranslationChanged([
            'type' => 'stored',
            'model' => $model,
            'locale' => $event->locale,
            'field' => $event->data['field'] ?? null,
        ]));
    }

    public function handleTranslationForgotten(TranslationForgetEvent $event): void
    {
        $translation = $event->translation;
        $model = $translation->translatable;
        
        event(new TranslationChanged([
            'type' => 'forgotten',
            'model' => $model,
            'locale' => $translation->locale,
            'field' => $translation->field,
        ]));
    }
}
```

### Example 8: Complete Event Listener Setup

Complete setup for all translation events:

```php
namespace App\Providers;

use App\Listeners\Translation\AuditTranslationOperations;
use App\Listeners\Translation\BroadcastTranslationChanges;
use App\Listeners\Translation\InvalidateTranslationCache;
use App\Listeners\Translation\NotifyTranslationChanges;
use App\Listeners\Translation\TrackTranslationAnalytics;
use App\Listeners\Translation\UpdateSearchIndex;
use App\Listeners\Translation\SynchronizeTranslations;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Translation\Events\TranslationStoredEvent;
use JobMetric\Translation\Events\TranslationForgetEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // After storing
        TranslationStoredEvent::class => [
            AuditTranslationOperations::class,
            InvalidateTranslationCache::class,
            UpdateSearchIndex::class,
            NotifyTranslationChanges::class,
            TrackTranslationAnalytics::class,
            BroadcastTranslationChanges::class,
            SynchronizeTranslations::class,
        ],

        // After forgetting
        TranslationForgetEvent::class => [
            AuditTranslationOperations::class,
            InvalidateTranslationCache::class,
            UpdateSearchIndex::class,
            TrackTranslationAnalytics::class,
            BroadcastTranslationChanges::class,
            SynchronizeTranslations::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
```

## Event Timing

### TranslationStoredEvent

Fired **after** the translation is saved to database:

```php
// Execution order:
// 1. Validate input data
// 2. Create or update translation record
// 3. Save to database
// 4. Fire TranslationStoredEvent ← Event fired here
// 5. Return model instance
```

**Note**: This event fires for both new translations and updates to existing translations.

### TranslationForgetEvent

Fired **after** the translation is deleted from database:

```php
// Execution order:
// 1. Find translation record(s)
// 2. Delete translation record(s)
// 3. Fire TranslationForgetEvent ← Event fired here
// 4. Return model instance
```

**Important Notes**:
- The translation is **saved** to database before `TranslationStoredEvent` fires
- You can access **fresh translation data** in listeners
- Database transaction is **committed** before events fire
- Events are **synchronous** by default (can be queued)
- `TranslationStoredEvent` fires for **both** create and update operations
- Multiple `TranslationStoredEvent` events may fire when storing multiple fields

## Queued Events

You can queue events for asynchronous processing:

```php
namespace App\Listeners\Translation;

use Illuminate\Contracts\Queue\ShouldQueue;
use JobMetric\Translation\Events\TranslationStoredEvent;

class ProcessTranslationAsync implements ShouldQueue
{
    public function handle(TranslationStoredEvent $event): void
    {
        $model = $event->model;
        $locale = $event->locale;
        
        // Heavy processing that doesn't block the request
        $this->updateSearchIndex($model, $locale);
        $this->syncWithExternalService($model, $locale);
        $this->generateAnalyticsReport($model, $locale);
    }

    protected function updateSearchIndex($model, $locale): void
    {
        // Update search index
    }

    protected function syncWithExternalService($model, $locale): void
    {
        // Sync with external API
    }

    protected function generateAnalyticsReport($model, $locale): void
    {
        // Generate analytics
    }
}
```

## Event Payload Details

### TranslationStoredEvent

```php
readonly class TranslationStoredEvent implements DomainEvent
{
    public function __construct(
        public Model $model,      // Model instance
        public string $locale,     // Locale code (e.g., 'en', 'fa')
        public array $data         // Translation data
    ) {}
}
```

**Available Properties**:
- `$model`: The model instance that received the translation
- `$locale`: The locale code (e.g., `'en'`, `'fa'`, `'de'`)
- `$data`: Array containing:
  - `field`: The translated field name
  - `value`: The translation value
  - `version`: The translation version (if versioning is enabled)

**Example Payload**:

```php
$event->model;        // Product instance
$event->locale;       // 'en'
$event->data;         // ['field' => 'title', 'value' => 'Product Name', 'version' => 1]
```

### TranslationForgetEvent

```php
readonly class TranslationForgetEvent implements DomainEvent
{
    public function __construct(
        public Translation $translation  // Translation model instance (deleted)
    ) {}
}
```

**Available Properties**:
- `$translation`: The `Translation` model instance with:
  - `id`: Translation ID
  - `translatable_type`: Type of parent model
  - `translatable_id`: ID of parent model
  - `locale`: Locale code
  - `field`: Field name
  - `value`: Translation value
  - `version`: Translation version
  - `created_at`: Creation timestamp
  - `updated_at`: Update timestamp

**Example Payload**:

```php
$event->translation->translatable;  // Product instance
$event->translation->locale;       // 'en'
$event->translation->field;        // 'title'
$event->translation->value;        // 'Product Name'
```

## When to Use Events

Use events when you need to:

- **Cache Management**: Invalidate or update cached translations
- **Search Indexing**: Update search index when translations change
- **Notifications**: Send notifications when critical translations change
- **Analytics**: Track translation operations for analytics
- **Audit Logging**: Log translation changes for compliance
- **Synchronization**: Sync translations with external systems
- **Real-time Updates**: Broadcast translation changes to clients
- **Business Rules**: Enforce business rules on translation operations
- **Integration**: Integrate with external services
- **Side Effects**: Perform side effects without coupling

## Related Documentation

- <Link to="/packages/laravel-translation/deep-diving/has-translation">HasTranslation</Link>
- <Link to="/packages/laravel-translation/deep-diving/resources/translation-resource">TranslationResource</Link>
- <Link to="/packages/laravel-translation/deep-diving/resources/translation-collection-resource">TranslationCollectionResource</Link>
