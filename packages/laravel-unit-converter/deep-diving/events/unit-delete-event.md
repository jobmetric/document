---
sidebar_position: 3
sidebar_label: UnitDeleteEvent
---

# UnitDeleteEvent

Dispatched after a unit has been successfully deleted from the database.

## Namespace

```php
JobMetric\UnitConverter\Events\UnitDeleteEvent
```

## Event Key

```
unit.deleted
```

## Class Definition

```php
readonly class UnitDeleteEvent implements DomainEvent
{
    public function __construct(
        public Unit $unit
    ) {
    }
}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `$unit` | `Unit` | The Unit model instance that was deleted |

:::note
The `$unit` property contains the unit data **before deletion**. After the event is dispatched, the record no longer exists in the database, but you still have access to all its properties through this object.
:::

## When Is It Dispatched?

This event is dispatched by the `UnitConverter::destroy()` method after:

1. Validation checks have passed (unit not in use, not base unit with siblings)
2. The unit's translations have been deleted
3. The unit record has been deleted from the database

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

$response = UnitConverter::destroy($unitId);

// UnitDeleteEvent is dispatched here with:
// - $unit: The deleted Unit model (data preserved in memory)
```

## Accessing Event Data

In your listener, you can access the deleted unit's data:

```php
use JobMetric\UnitConverter\Events\UnitDeleteEvent;

class HandleUnitDeletion
{
    public function handle(UnitDeleteEvent $event): void
    {
        // Access the deleted unit data
        $unit = $event->unit;
        
        echo $unit->id;        // e.g., 5
        echo $unit->type;      // e.g., 'weight'
        echo $unit->value;     // e.g., 1000
        echo $unit->status;    // e.g., true
        
        // Note: The unit no longer exists in DB at this point
        // Unit::find($unit->id) would return null
    }
}
```

## Registering Listeners

### Using EventServiceProvider

```php
// app/Providers/EventServiceProvider.php

use JobMetric\UnitConverter\Events\UnitDeleteEvent;
use App\Listeners\LogUnitDeletion;
use App\Listeners\CleanupAfterUnitDelete;
use App\Listeners\NotifyUnitDeleted;

protected $listen = [
    UnitDeleteEvent::class => [
        LogUnitDeletion::class,
        CleanupAfterUnitDelete::class,
        NotifyUnitDeleted::class,
    ],
];
```

### Using Closure

```php
use Illuminate\Support\Facades\Event;
use JobMetric\UnitConverter\Events\UnitDeleteEvent;

Event::listen(UnitDeleteEvent::class, function (UnitDeleteEvent $event) {
    \Log::warning("Unit deleted: {$event->unit->id} ({$event->unit->type})");
});
```

## Example Listeners

### Audit Logging

```php
namespace App\Listeners;

use App\Models\AuditLog;
use JobMetric\UnitConverter\Events\UnitDeleteEvent;

class LogUnitDeletion
{
    public function handle(UnitDeleteEvent $event): void
    {
        $unit = $event->unit;
        
        AuditLog::create([
            'action' => 'unit.deleted',
            'model_type' => 'Unit',
            'model_id' => $unit->id,
            'user_id' => auth()->id(),
            'data' => [
                'deleted_unit' => [
                    'id' => $unit->id,
                    'type' => $unit->type,
                    'value' => $unit->value,
                    'status' => $unit->status,
                    'created_at' => $unit->created_at?->toIso8601String(),
                ],
            ],
            'ip_address' => request()->ip(),
        ]);
    }
}
```

### Cache Cleanup

```php
namespace App\Listeners;

use Illuminate\Support\Facades\Cache;
use JobMetric\UnitConverter\Events\UnitDeleteEvent;

class CleanupUnitCache
{
    public function handle(UnitDeleteEvent $event): void
    {
        $unit = $event->unit;
        
        // Clear specific unit cache
        Cache::forget("unit:{$unit->id}");
        
        // Clear type-specific cache
        Cache::forget("units:type:{$unit->type}");
        
        // Clear all units cache
        Cache::forget('units:all');
        Cache::forget('units:count');
        
        // Clear conversion caches for this type
        Cache::tags(['conversions', $unit->type])->flush();
        
        // Clear any unit-by-code cache
        Cache::forget("unit:code:{$unit->code}");
    }
}
```

### External System Sync

```php
namespace App\Listeners;

use App\Services\ExternalApiService;
use JobMetric\UnitConverter\Events\UnitDeleteEvent;

class SyncUnitDeletion
{
    public function __construct(
        private ExternalApiService $api
    ) {
    }

    public function handle(UnitDeleteEvent $event): void
    {
        // Notify external system about deletion
        $this->api->deleteUnit($event->unit->id);
    }
}
```

### Soft Delete Archive

If you want to keep a record of deleted units:

```php
namespace App\Listeners;

use App\Models\DeletedUnitArchive;
use JobMetric\UnitConverter\Events\UnitDeleteEvent;

class ArchiveDeletedUnit
{
    public function handle(UnitDeleteEvent $event): void
    {
        $unit = $event->unit;
        
        DeletedUnitArchive::create([
            'original_id' => $unit->id,
            'type' => $unit->type,
            'value' => $unit->value,
            'status' => $unit->status,
            'deleted_by' => auth()->id(),
            'deleted_at' => now(),
            'original_created_at' => $unit->created_at,
            'original_updated_at' => $unit->updated_at,
        ]);
    }
}
```

### Notify Affected Users

```php
namespace App\Listeners;

use App\Models\User;
use App\Notifications\UnitDeletedNotification;
use Illuminate\Support\Facades\Notification;
use JobMetric\UnitConverter\Events\UnitDeleteEvent;

class NotifyAffectedUsers
{
    public function handle(UnitDeleteEvent $event): void
    {
        $unit = $event->unit;
        
        // Notify admins about unit deletion
        $admins = User::role('admin')->get();
        
        Notification::send($admins, new UnitDeletedNotification(
            unitId: $unit->id,
            unitType: $unit->type,
            unitValue: $unit->value,
            deletedBy: auth()->user()
        ));
    }
}
```

### Cleanup Related Data

```php
namespace App\Listeners;

use Illuminate\Support\Facades\DB;
use JobMetric\UnitConverter\Events\UnitDeleteEvent;

class CleanupRelatedData
{
    public function handle(UnitDeleteEvent $event): void
    {
        $unitId = $event->unit->id;
        
        // Note: unit_relations are usually cleaned up automatically
        // But you might have other related data to clean
        
        // Clean up any custom caches or indexes
        DB::table('unit_search_index')
            ->where('unit_id', $unitId)
            ->delete();
        
        // Clean up any rate history
        DB::table('unit_rate_history')
            ->where('unit_id', $unitId)
            ->delete();
    }
}
```

## Queued Listeners

For non-critical cleanup operations:

```php
namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use JobMetric\UnitConverter\Events\UnitDeleteEvent;

class SyncDeletionToDataWarehouse implements ShouldQueue
{
    public $queue = 'sync';
    
    public $delay = 5; // Wait 5 seconds

    public function handle(UnitDeleteEvent $event): void
    {
        // Sync deletion to data warehouse
        DataWarehouse::delete('units', $event->unit->id);
    }
    
    public function failed(UnitDeleteEvent $event, \Throwable $exception): void
    {
        \Log::error("Failed to sync unit deletion to warehouse", [
            'unit_id' => $event->unit->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
```

## Event Definition

The event implements `DomainEvent` interface:

```php
public static function definition(): DomainEventDefinition
{
    return new DomainEventDefinition(
        key: 'unit.deleted',
        entityName: 'unit-converter::base.entity_names.unit',
        title: 'unit-converter::base.events.unit_deleted.title',
        description: 'unit-converter::base.events.unit_deleted.description',
        icon: 'fas fa-trash-alt',
        tags: ['unit', 'storage', 'management']
    );
}
```

## Important Notes

### Unit No Longer Exists

After this event is dispatched, the unit record no longer exists in the database:

```php
public function handle(UnitDeleteEvent $event): void
{
    $unit = $event->unit;
    
    // This will return null
    $fromDb = Unit::find($unit->id);
    // $fromDb === null
    
    // But you can still access the data through the event
    echo $unit->type; // Works fine
}
```

### Order of Operations

The deletion happens in this order:
1. Pre-delete validations (not in use, not protected base unit)
2. Translations deleted
3. Unit record deleted
4. **UnitDeleteEvent dispatched**

### Transaction Considerations

The deletion and event dispatch happen within a database transaction. If your listener throws an exception, the deletion will be rolled back (unless you're using a queued listener).

## Related Events

- [UnitStoreEvent](./unit-store-event) - Dispatched when a unit is created
- [UnitUpdateEvent](./unit-update-event) - Dispatched when a unit is updated

