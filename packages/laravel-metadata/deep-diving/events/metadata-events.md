---
sidebar_position: 1
sidebar_label: Metadata Events
---

import Link from "@docusaurus/Link";

# Metadata Events

Laravel Metadata fires events during metadata operations, allowing you to hook into the metadata lifecycle for custom logic, logging, or notifications.

## Available Events

| Event | Description | Fired When |
|-------|-------------|------------|
| `MetadataStoringEvent` | Before metadata is stored | Before `storeMetadata()` or `storeMetadataBatch()` saves to database |
| `MetadataStoredEvent` | After metadata is stored | After metadata is successfully saved |
| `MetadataDeletingEvent` | Before metadata is deleted | Before `forgetMetadata()` deletes from database |
| `MetadataDeletedEvent` | After metadata is deleted | After metadata is successfully deleted |

## Event Classes

### MetadataStoringEvent

Fired before storing metadata.

```php
use JobMetric\Metadata\Events\MetadataStoringEvent;

// Event properties:
// - $model: The model instance
// - $key: The metadata key
// - $value: The metadata value
```

### MetadataStoredEvent

Fired after storing metadata.

```php
use JobMetric\Metadata\Events\MetadataStoredEvent;

// Event properties:
// - $model: The model instance
// - $meta: The Meta model instance that was created/updated
```

### MetadataDeletingEvent

Fired before deleting metadata.

```php
use JobMetric\Metadata\Events\MetadataDeletingEvent;

// Event properties:
// - $meta: The Meta model instance being deleted
```

### MetadataDeletedEvent

Fired after deleting metadata.

```php
use JobMetric\Metadata\Events\MetadataDeletedEvent;

// Event properties:
// - $meta: The Meta model instance that was deleted
```

## Registering Event Listeners

### In EventServiceProvider

```php
namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use JobMetric\Metadata\Events\MetadataStoredEvent;
use JobMetric\Metadata\Events\MetadataDeletedEvent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        MetadataStoredEvent::class => [
            \App\Listeners\LogMetadataStored::class,
        ],
        MetadataDeletedEvent::class => [
            \App\Listeners\LogMetadataDeleted::class,
        ],
    ];
}
```

### Using Event System

Since Laravel Metadata integrates with Laravel Event System, you can also register listeners dynamically:

```php
use JobMetric\EventSystem\Facades\EventSystem;

addEventSystem(
    'metadata.stored',
    \JobMetric\Metadata\Events\MetadataStoredEvent::class,
    \App\Listeners\LogMetadataStored::class
);
```

## Example Listeners

### Log Metadata Operations

```php
namespace App\Listeners;

use JobMetric\Metadata\Events\MetadataStoredEvent;
use Illuminate\Support\Facades\Log;

class LogMetadataStored
{
    public function handle(MetadataStoredEvent $event): void
    {
        Log::info('Metadata stored', [
            'model' => get_class($event->model),
            'model_id' => $event->model->id,
            'key' => $event->meta->key,
            'value' => $event->meta->value,
        ]);
    }
}
```

### Update Search Index

```php
namespace App\Listeners;

use JobMetric\Metadata\Events\MetadataStoredEvent;

class UpdateSearchIndex
{
    public function handle(MetadataStoredEvent $event): void
    {
        // Update search index when metadata changes
        if (in_array($event->meta->key, ['title', 'description', 'tags'])) {
            // Re-index the model
            SearchService::index($event->model);
        }
    }
}
```

### Send Notifications

```php
namespace App\Listeners;

use JobMetric\Metadata\Events\MetadataStoredEvent;
use App\Notifications\MetadataChanged;

class NotifyMetadataChange
{
    public function handle(MetadataStoredEvent $event): void
    {
        if ($event->meta->key === 'status' && $event->meta->value === 'published') {
            $event->model->user->notify(new MetadataChanged($event->model, $event->meta));
        }
    }
}
```

## Related Documentation

- <Link to="/packages/laravel-metadata/deep-diving/has-meta">HasMeta Trait</Link>
- <Link to="/packages/laravel-event-system/deep-diving/event-system">Event System</Link>

