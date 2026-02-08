---
sidebar_position: 1
sidebar_label: UnitStoreEvent
---

# UnitStoreEvent

Dispatched after a new unit has been successfully created and stored in the database.

## Namespace

```php
JobMetric\UnitConverter\Events\UnitStoreEvent
```

## Event Key

```
unit.stored
```

## Class Definition

```php
readonly class UnitStoreEvent implements DomainEvent
{
    public function __construct(
        public Unit $unit,
        public array $data
    ) {
    }
}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `$unit` | `Unit` | The newly created Unit model instance |
| `$data` | `array` | The original data array used to create the unit |

## When Is It Dispatched?

This event is dispatched by the `UnitConverter::store()` method after:

1. Input data has been validated
2. The unit record has been created in the database
3. Translations have been stored

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

$response = UnitConverter::store([
    'type' => 'weight',
    'value' => 1000,
    'status' => true,
    'translation' => [
        'en' => ['name' => 'Kilogram', 'code' => 'kg'],
    ],
]);

// UnitStoreEvent is dispatched here with:
// - $unit: The created Unit model
// - $data: The input array above
```

## Accessing Event Data

In your listener, you can access the event properties:

```php
use JobMetric\UnitConverter\Events\UnitStoreEvent;

class HandleUnitCreation
{
    public function handle(UnitStoreEvent $event): void
    {
        // Access the created unit
        $unit = $event->unit;
        
        echo $unit->id;        // e.g., 5
        echo $unit->type;      // e.g., 'weight'
        echo $unit->value;     // e.g., 1000
        echo $unit->status;    // e.g., true
        
        // Access the original input data
        $data = $event->data;
        
        $translations = $data['translation'];
        // ['en' => ['name' => 'Kilogram', 'code' => 'kg']]
    }
}
```

## Registering Listeners

### Using EventServiceProvider

```php
// app/Providers/EventServiceProvider.php

use JobMetric\UnitConverter\Events\UnitStoreEvent;
use App\Listeners\LogUnitCreation;
use App\Listeners\NotifyAdminNewUnit;
use App\Listeners\SyncUnitToExternalService;

protected $listen = [
    UnitStoreEvent::class => [
        LogUnitCreation::class,
        NotifyAdminNewUnit::class,
        SyncUnitToExternalService::class,
    ],
];
```

### Using Closure

```php
// app/Providers/AppServiceProvider.php

use Illuminate\Support\Facades\Event;
use JobMetric\UnitConverter\Events\UnitStoreEvent;

public function boot(): void
{
    Event::listen(UnitStoreEvent::class, function (UnitStoreEvent $event) {
        \Log::info("New unit created: {$event->unit->id}");
    });
}
```

### Using Attribute (Laravel 11+)

```php
use Illuminate\Events\Attribute\AsEventListener;
use JobMetric\UnitConverter\Events\UnitStoreEvent;

#[AsEventListener]
class LogUnitCreation
{
    public function __invoke(UnitStoreEvent $event): void
    {
        \Log::info("Unit created", [
            'id' => $event->unit->id,
            'type' => $event->unit->type,
        ]);
    }
}
```

## Example Listeners

### Audit Logging

```php
namespace App\Listeners;

use App\Models\AuditLog;
use JobMetric\UnitConverter\Events\UnitStoreEvent;

class LogUnitCreation
{
    public function handle(UnitStoreEvent $event): void
    {
        AuditLog::create([
            'action' => 'unit.created',
            'model_type' => 'Unit',
            'model_id' => $event->unit->id,
            'user_id' => auth()->id(),
            'data' => [
                'type' => $event->unit->type,
                'value' => $event->unit->value,
                'translations' => $event->data['translation'] ?? [],
            ],
            'ip_address' => request()->ip(),
        ]);
    }
}
```

### Cache Invalidation

```php
namespace App\Listeners;

use Illuminate\Support\Facades\Cache;
use JobMetric\UnitConverter\Events\UnitStoreEvent;

class InvalidateUnitCache
{
    public function handle(UnitStoreEvent $event): void
    {
        // Clear type-specific cache
        Cache::forget("units:type:{$event->unit->type}");
        
        // Clear all units cache
        Cache::forget('units:all');
        
        // Clear unit count cache
        Cache::forget('units:count');
    }
}
```

### External API Sync

```php
namespace App\Listeners;

use App\Jobs\SyncUnitToExternalApi;
use JobMetric\UnitConverter\Events\UnitStoreEvent;

class SyncNewUnit
{
    public function handle(UnitStoreEvent $event): void
    {
        // Dispatch job to sync to external system
        SyncUnitToExternalApi::dispatch($event->unit, 'create');
    }
}
```

### Admin Notification

```php
namespace App\Listeners;

use App\Models\User;
use App\Notifications\NewUnitCreated;
use Illuminate\Support\Facades\Notification;
use JobMetric\UnitConverter\Events\UnitStoreEvent;

class NotifyAdminNewUnit
{
    public function handle(UnitStoreEvent $event): void
    {
        $admins = User::role('admin')->get();
        
        Notification::send($admins, new NewUnitCreated($event->unit));
    }
}
```

## Queued Listeners

For time-consuming operations, use queued listeners:

```php
namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use JobMetric\UnitConverter\Events\UnitStoreEvent;

class ProcessNewUnit implements ShouldQueue
{
    use InteractsWithQueue;

    public $queue = 'units';
    
    public $delay = 10; // Delay in seconds

    public function handle(UnitStoreEvent $event): void
    {
        // Heavy processing that runs in background
        $this->generateUnitReport($event->unit);
        $this->syncToDataWarehouse($event->unit);
    }
    
    public function failed(UnitStoreEvent $event, \Throwable $exception): void
    {
        // Handle failure
        \Log::error("Failed to process unit: {$event->unit->id}", [
            'exception' => $exception->getMessage(),
        ]);
    }
}
```

## Event Definition

The event implements `DomainEvent` interface with metadata:

```php
public static function definition(): DomainEventDefinition
{
    return new DomainEventDefinition(
        key: 'unit.stored',
        entityName: 'unit-converter::base.entity_names.unit',
        title: 'unit-converter::base.events.unit_stored.title',
        description: 'unit-converter::base.events.unit_stored.description',
        icon: 'fas fa-save',
        tags: ['unit', 'storage', 'management']
    );
}
```

This metadata can be used for:
- Event discovery and documentation
- Admin panel event listings
- Filtering and categorizing events

## Related Events

- [UnitUpdateEvent](./unit-update-event) - Dispatched when a unit is updated
- [UnitDeleteEvent](./unit-delete-event) - Dispatched when a unit is deleted

