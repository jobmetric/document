---
sidebar_position: 5
sidebar_label: Events
---

import Link from "@docusaurus/Link";

# Events

Laravel Metadata provides a comprehensive event system that fires domain events for all metadata operations. These events allow you to hook into the metadata lifecycle and perform additional actions when metadata is stored or deleted.

## Overview

The event system in Laravel Metadata:

- **Fires automatically** during metadata operations
- **Provides model and metadata instances** in event payloads
- **Uses DomainEvent interface** for consistency
- **Supports event listeners** for custom logic
- **Enables event-driven architecture** for metadata management

## Event Structure

All events in Laravel Metadata:

- Implement `JobMetric\EventSystem\Contracts\DomainEvent`
- Are `readonly` classes for immutability
- Contain model and metadata information
- Provide a stable `key()` method
- Include metadata via `definition()` method

### Base Event Structure

```php
readonly class MetadataStoredEvent implements DomainEvent
{
    public function __construct(
        public Model $model,
        public Meta $meta
    ) {}

    public static function key(): string
    {
        return 'metadata.stored';
    }

    public static function definition(): DomainEventDefinition
    {
        return new DomainEventDefinition(
            self::key(),
            'metadata::base.entity_names.metadata',
            'metadata::base.events.metadata_stored.title',
            'metadata::base.events.metadata_stored.description',
            'fas fa-save',
            ['metadata', 'storage', 'management']
        );
    }
}
```

## Available Events

### Metadata Events

Events fired for metadata operations.

| Event Class | Event Key | Description | Payload | Triggered When |
|------------|-----------|-------------|---------|----------------|
| `MetadataStoringEvent` | `metadata.storing` | Fired before metadata is stored | `Model $model, string $key, array\|string\|bool\|null $value` | Before `HasMeta::storeMetadata()` saves to database |
| `MetadataStoredEvent` | `metadata.stored` | Fired after metadata is stored | `Model $model, Meta $meta` | After `HasMeta::storeMetadata()` saves to database |
| `MetadataDeletingEvent` | `metadata.deleting` | Fired before metadata is deleted | `Meta $meta` | Before `HasMeta::forgetMetadata()` deletes from database |
| `MetadataDeletedEvent` | `metadata.deleted` | Fired after metadata is deleted | `Meta $meta` | After `HasMeta::forgetMetadata()` deletes from database |

**Namespace:** `JobMetric\Metadata\Events\*`

## Listening to Events

### Method 1: Event Listeners in Service Provider

Register event listeners in a service provider:

```php
namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Metadata\Events\MetadataStoredEvent;
use JobMetric\Metadata\Events\MetadataDeletedEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        MetadataStoredEvent::class => [
            \App\Listeners\Metadata\LogMetadataStored::class,
            \App\Listeners\Metadata\InvalidateMetadataCache::class,
            \App\Listeners\Metadata\UpdateSearchIndex::class,
            \App\Listeners\Metadata\NotifyMetadataChange::class,
        ],
        MetadataDeletedEvent::class => [
            \App\Listeners\Metadata\LogMetadataDeleted::class,
            \App\Listeners\Metadata\InvalidateMetadataCache::class,
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
use JobMetric\Metadata\Events\MetadataStoredEvent;

Event::listen(MetadataStoredEvent::class, function (MetadataStoredEvent $event) {
    $model = $event->model;
    $meta = $event->meta;
    
    // Perform actions
    Log::info('Metadata stored', [
        'model' => get_class($model),
        'model_id' => $model->id,
        'key' => $meta->key,
        'value' => $meta->value,
    ]);
    
    Cache::forget("metadata.{$model->getMorphClass()}.{$model->id}");
});
```

### Method 3: Using Event Subscribers

Create event subscribers for multiple events:

```php
namespace App\Listeners;

use Illuminate\Events\Dispatcher;
use JobMetric\Metadata\Events\MetadataStoredEvent;
use JobMetric\Metadata\Events\MetadataDeletedEvent;

class MetadataEventSubscriber
{
    public function handleMetadataStored(MetadataStoredEvent $event): void
    {
        $model = $event->model;
        $meta = $event->meta;
        
        Log::info('Metadata stored', [
            'model' => get_class($model),
            'model_id' => $model->id,
            'key' => $meta->key,
            'value' => $meta->value,
        ]);
    }

    public function handleMetadataDeleted(MetadataDeletedEvent $event): void
    {
        $meta = $event->meta;
        
        Log::warning('Metadata deleted', [
            'meta_id' => $meta->id,
            'key' => $meta->key,
            'metaable_type' => $meta->metaable_type,
            'metaable_id' => $meta->metaable_id,
        ]);
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            MetadataStoredEvent::class,
            [MetadataEventSubscriber::class, 'handleMetadataStored']
        );

        $events->listen(
            MetadataDeletedEvent::class,
            [MetadataEventSubscriber::class, 'handleMetadataDeleted']
        );
    }
}
```

Register the subscriber:

```php
namespace App\Providers;

use App\Listeners\MetadataEventSubscriber;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $subscribe = [
        MetadataEventSubscriber::class,
    ];
}
```

## Complete Examples

### Example 1: Cache Invalidation on Metadata Changes

Invalidate cache when metadata is modified:

```php
namespace App\Listeners\Metadata;

use Illuminate\Support\Facades\Cache;
use JobMetric\Metadata\Events\MetadataStoredEvent;
use JobMetric\Metadata\Events\MetadataDeletedEvent;

class InvalidateMetadataCache
{
    public function handle(MetadataStoredEvent|MetadataDeletedEvent $event): void
    {
        $model = $event->model ?? $event->meta->metaable;
        $meta = $event->meta;

        // Invalidate specific model metadata cache
        Cache::forget("metadata.{$model->getMorphClass()}.{$model->id}");
        Cache::forget("metadata.{$model->getMorphClass()}.{$model->id}.{$meta->key}");
        
        // Invalidate all metadata cache for this model
        Cache::forget("metadata_all.{$model->getMorphClass()}.{$model->id}");

        // Clear tagged cache
        Cache::tags(["metadata_{$model->getMorphClass()}_{$model->id}"])->flush();
    }
}
```

### Example 2: Audit Logging

Log all metadata operations for audit trail:

```php
namespace App\Listeners\Metadata;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use JobMetric\Metadata\Events\MetadataStoredEvent;
use JobMetric\Metadata\Events\MetadataDeletedEvent;
use JobMetric\Metadata\Events\MetadataStoringEvent;

class AuditMetadataOperations
{
    public function handleMetadataStoring(MetadataStoringEvent $event): void
    {
        $this->logAudit('storing', $event->model, $event->key, $event->value);
    }

    public function handleMetadataStored(MetadataStoredEvent $event): void
    {
        $this->logAudit('stored', $event->model, $event->meta->key, $event->meta->value);
    }

    public function handleMetadataDeleted(MetadataDeletedEvent $event): void
    {
        $this->logAudit('deleted', $event->meta->metaable, $event->meta->key, $event->meta->value);
    }

    protected function logAudit(string $action, $model, string $key, $value): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => "metadata.{$action}",
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'metadata_key' => $key,
            'metadata_value' => is_array($value) ? json_encode($value) : $value,
            'ip_address' => request()->ip(),
        ]);
    }
}
```

### Example 3: Search Index Updates

Update search index when important metadata changes:

```php
namespace App\Listeners\Metadata;

use App\Services\SearchService;
use JobMetric\Metadata\Events\MetadataStoredEvent;
use JobMetric\Metadata\Events\MetadataDeletedEvent;

class UpdateSearchIndex
{
    protected array $searchableKeys = ['title', 'description', 'tags', 'keywords', 'content'];

    public function handleMetadataStored(MetadataStoredEvent $event): void
    {
        $meta = $event->meta;
        
        // Only update index for searchable keys
        if (in_array($meta->key, $this->searchableKeys)) {
            SearchService::index($event->model);
        }
    }

    public function handleMetadataDeleted(MetadataDeletedEvent $event): void
    {
        $meta = $event->meta;
        
        // Re-index if searchable key was deleted
        if (in_array($meta->key, $this->searchableKeys)) {
            SearchService::index($meta->metaable);
        }
    }
}
```

### Example 4: Notification System

Send notifications when critical metadata changes:

```php
namespace App\Listeners\Metadata;

use App\Notifications\MetadataChanged;
use Illuminate\Support\Facades\Notification;
use JobMetric\Metadata\Events\MetadataStoredEvent;

class NotifyMetadataChanges
{
    protected array $notifiableKeys = ['status', 'published', 'approved', 'featured'];

    public function handle(MetadataStoredEvent $event): void
    {
        $meta = $event->meta;
        $model = $event->model;

        // Only notify for specific keys
        if (!in_array($meta->key, $this->notifiableKeys)) {
            return;
        }

        // Get model owner
        $owner = null;
        if (method_exists($model, 'user')) {
            $owner = $model->user;
        } elseif (method_exists($model, 'author')) {
            $owner = $model->author;
        } elseif (method_exists($model, 'owner')) {
            $owner = $model->owner;
        }

        if ($owner) {
            $owner->notify(new MetadataChanged($model, $meta));
        }

        // Notify administrators for status changes
        if ($meta->key === 'status' && in_array($meta->value, ['published', 'rejected'])) {
            $admins = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })->get();

            Notification::send($admins, new MetadataChanged($model, $meta));
        }
    }
}
```

### Example 5: Analytics Tracking

Track metadata changes for analytics:

```php
namespace App\Listeners\Metadata;

use App\Services\AnalyticsService;
use JobMetric\Metadata\Events\MetadataStoredEvent;
use JobMetric\Metadata\Events\MetadataDeletedEvent;

class TrackMetadataAnalytics
{
    public function __construct(
        protected AnalyticsService $analytics
    ) {}

    public function handleMetadataStored(MetadataStoredEvent $event): void
    {
        $model = $event->model;
        $meta = $event->meta;
        
        $this->analytics->track('metadata.stored', [
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'metadata_key' => $meta->key,
            'metadata_value' => $meta->value,
            'is_json' => $meta->is_json,
            'meta_id' => $meta->id,
        ]);
    }

    public function handleMetadataDeleted(MetadataDeletedEvent $event): void
    {
        $meta = $event->meta;
        
        $this->analytics->track('metadata.deleted', [
            'meta_id' => $meta->id,
            'metadata_key' => $meta->key,
            'metadata_value' => $meta->value,
            'metaable_type' => $meta->metaable_type,
            'metaable_id' => $meta->metaable_id,
            'deleted_at' => now(),
        ]);
    }
}
```

### Example 6: Validation and Business Rules

Validate metadata before storing:

```php
namespace App\Listeners\Metadata;

use Illuminate\Validation\ValidationException;
use JobMetric\Metadata\Events\MetadataStoringEvent;

class ValidateMetadataRules
{
    public function handle(MetadataStoringEvent $event): void
    {
        $key = $event->key;
        $value = $event->value;
        $model = $event->model;

        // Validate specific keys
        if ($key === 'price' && is_numeric($value) && $value < 0) {
            throw ValidationException::withMessages([
                'metadata.price' => 'Price cannot be negative.',
            ]);
        }

        if ($key === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw ValidationException::withMessages([
                'metadata.email' => 'Invalid email format.',
            ]);
        }

        if ($key === 'status' && !in_array($value, ['draft', 'published', 'archived'])) {
            throw ValidationException::withMessages([
                'metadata.status' => 'Invalid status value.',
            ]);
        }

        // Business rule: Cannot publish without required metadata
        if ($key === 'status' && $value === 'published') {
            $requiredKeys = ['title', 'description', 'content'];
            $existingKeys = $model->metas()->pluck('key')->toArray();
            
            $missing = array_diff($requiredKeys, $existingKeys);
            if (!empty($missing)) {
                throw ValidationException::withMessages([
                    'metadata.status' => 'Cannot publish without: ' . implode(', ', $missing),
                ]);
            }
        }
    }
}
```

### Example 7: Metadata Synchronization

Synchronize metadata with external systems:

```php
namespace App\Listeners\Metadata;

use App\Services\ExternalApiService;
use JobMetric\Metadata\Events\MetadataStoredEvent;
use JobMetric\Metadata\Events\MetadataDeletedEvent;

class SynchronizeMetadata
{
    protected array $syncableKeys = ['status', 'category', 'tags', 'featured'];

    public function __construct(
        protected ExternalApiService $externalApi
    ) {}

    public function handleMetadataStored(MetadataStoredEvent $event): void
    {
        $meta = $event->meta;
        
        // Only sync specific keys
        if (!in_array($meta->key, $this->syncableKeys)) {
            return;
        }

        $this->externalApi->syncMetadata(
            $event->model,
            $meta->key,
            $meta->value
        );
    }

    public function handleMetadataDeleted(MetadataDeletedEvent $event): void
    {
        $meta = $event->meta;
        
        if (in_array($meta->key, $this->syncableKeys)) {
            $this->externalApi->deleteMetadata(
                $meta->metaable,
                $meta->key
            );
        }
    }
}
```

### Example 8: Complete Event Listener Setup

Complete setup for all metadata events:

```php
namespace App\Providers;

use App\Listeners\Metadata\AuditMetadataOperations;
use App\Listeners\Metadata\InvalidateMetadataCache;
use App\Listeners\Metadata\NotifyMetadataChanges;
use App\Listeners\Metadata\TrackMetadataAnalytics;
use App\Listeners\Metadata\UpdateSearchIndex;
use App\Listeners\Metadata\ValidateMetadataRules;
use App\Listeners\Metadata\SynchronizeMetadata;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Metadata\Events\MetadataStoringEvent;
use JobMetric\Metadata\Events\MetadataStoredEvent;
use JobMetric\Metadata\Events\MetadataDeletingEvent;
use JobMetric\Metadata\Events\MetadataDeletedEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // Before storing
        MetadataStoringEvent::class => [
            ValidateMetadataRules::class,
        ],

        // After storing
        MetadataStoredEvent::class => [
            AuditMetadataOperations::class,
            InvalidateMetadataCache::class,
            UpdateSearchIndex::class,
            NotifyMetadataChanges::class,
            TrackMetadataAnalytics::class,
            SynchronizeMetadata::class,
        ],

        // Before deleting
        MetadataDeletingEvent::class => [
            // Add any pre-deletion logic here
        ],

        // After deleting
        MetadataDeletedEvent::class => [
            AuditMetadataOperations::class,
            InvalidateMetadataCache::class,
            UpdateSearchIndex::class,
            TrackMetadataAnalytics::class,
            SynchronizeMetadata::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
```

## Event Timing

### MetadataStoringEvent

Fired **before** the metadata is saved to database:

```php
// Execution order:
// 1. Validate key is allowed
// 2. Fire MetadataStoringEvent ← Event fired here
// 3. Save/update metadata record
// 4. Fire MetadataStoredEvent
// 5. Return model instance
```

### MetadataStoredEvent

Fired **after** the metadata is saved to database:

```php
// Execution order:
// 1. Fire MetadataStoringEvent
// 2. Create/update metadata record
// 3. Save to database
// 4. Fire MetadataStoredEvent ← Event fired here
// 5. Return model instance
```

### MetadataDeletingEvent / MetadataDeletedEvent

- `MetadataDeletingEvent`: Fired **before** the deletion operation
- `MetadataDeletedEvent`: Fired **after** the deletion operation completes

```php
// Execution order:
// 1. Find metadata record(s)
// 2. Fire MetadataDeletingEvent ← Before deletion
// 3. Delete metadata record
// 4. Fire MetadataDeletedEvent ← After deletion
// 5. Return model instance
```

**Important Notes**:
- The metadata is **saved** to database before `MetadataStoredEvent` fires
- You can access **fresh metadata data** in listeners
- Database transaction is **committed** before events fire
- Events are **synchronous** by default (can be queued)
- `MetadataStoringEvent` allows you to **validate** or **prevent** storage
- `MetadataDeletingEvent` allows you to **prevent** deletion if needed
- Batch operations (`storeMetadataBatch`) fire events for **each** metadata item

## Queued Events

You can queue events for asynchronous processing:

```php
namespace App\Listeners\Metadata;

use Illuminate\Contracts\Queue\ShouldQueue;
use JobMetric\Metadata\Events\MetadataStoredEvent;

class ProcessMetadataAsync implements ShouldQueue
{
    public function handle(MetadataStoredEvent $event): void
    {
        $model = $event->model;
        $meta = $event->meta;
        
        // Heavy processing that doesn't block the request
        $this->updateSearchIndex($model, $meta);
        $this->syncWithExternalService($model, $meta);
        $this->generateAnalyticsReport($model, $meta);
    }

    protected function updateSearchIndex($model, $meta): void
    {
        // Update search index
    }

    protected function syncWithExternalService($model, $meta): void
    {
        // Sync with external API
    }

    protected function generateAnalyticsReport($model, $meta): void
    {
        // Generate analytics
    }
}
```

## Event Payload Details

### MetadataStoringEvent

```php
readonly class MetadataStoringEvent implements DomainEvent
{
    public function __construct(
        public Model $model,                    // Model instance
        public string $key,                      // Metadata key
        public array|string|bool|null $value     // Metadata value (before storage)
    ) {}
}
```

**Available Properties**:
- `$model`: The model instance that will receive the metadata
- `$key`: The metadata key being stored
- `$value`: The metadata value (raw, before JSON encoding if array)

### MetadataStoredEvent

```php
readonly class MetadataStoredEvent implements DomainEvent
{
    public function __construct(
        public Model $model,    // Model instance
        public Meta $meta        // Meta model instance (saved to database)
    ) {}
}
```

**Available Properties**:
- `$model`: The model instance that received the metadata
- `$meta`: The `Meta` model instance with:
  - `id`: Meta ID
  - `metaable_type`: Type of parent model
  - `metaable_id`: ID of parent model
  - `key`: Metadata key
  - `value`: Metadata value (string, decoded from JSON if `is_json` is true)
  - `is_json`: Whether value is JSON-encoded
  - `created_at`: Creation timestamp
  - `updated_at`: Update timestamp

### MetadataDeletingEvent / MetadataDeletedEvent

```php
readonly class MetadataDeletedEvent implements DomainEvent
{
    public function __construct(
        public Meta $meta  // Meta model instance (deleted)
    ) {}
}
```

**Available Properties**:
- `$meta`: The `Meta` model instance with all properties (still accessible after deletion)
- All properties from `Meta` model are available
- `metaable`: Access parent model via `$meta->metaable`

## When to Use Events

Use events when you need to:

- **Cache Management**: Invalidate or update cached metadata
- **Search Indexing**: Update search index when metadata changes
- **Notifications**: Send notifications when critical metadata changes
- **Analytics**: Track metadata operations for analytics
- **Audit Logging**: Log metadata changes for compliance
- **Validation**: Validate metadata before storing
- **Synchronization**: Sync metadata with external systems
- **Business Rules**: Enforce business rules on metadata operations
- **Integration**: Integrate with external services
- **Side Effects**: Perform side effects without coupling

## Related Documentation

- <Link to="/packages/laravel-metadata/deep-diving/has-meta">HasMeta</Link>
- <Link to="/packages/laravel-metadata/deep-diving/models/meta">Meta Model</Link>
- <Link to="/packages/laravel-event-system/deep-diving/event-system">Event System</Link>

