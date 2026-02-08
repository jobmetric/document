---
sidebar_position: 2
sidebar_label: UnitUpdateEvent
---

# UnitUpdateEvent

Dispatched after an existing unit has been successfully updated in the database.

## Namespace

```php
JobMetric\UnitConverter\Events\UnitUpdateEvent
```

## Event Key

```
unit.updated
```

## Class Definition

```php
readonly class UnitUpdateEvent implements DomainEvent
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
| `$unit` | `Unit` | The updated Unit model instance (with new values) |
| `$data` | `array` | The data array used for the update |

## When Is It Dispatched?

This event is dispatched by the `UnitConverter::update()` method after:

1. Input data has been validated
2. The unit record has been updated in the database
3. Translations have been updated (if provided)

```php
use JobMetric\UnitConverter\Facades\UnitConverter;

$response = UnitConverter::update($unitId, [
    'value' => 1001.5,
    'status' => false,
    'translation' => [
        'en' => ['name' => 'Kilogram (updated)'],
    ],
]);

// UnitUpdateEvent is dispatched here with:
// - $unit: The updated Unit model (refreshed from DB)
// - $data: The update array above
```

## Accessing Event Data

In your listener, you can access both the updated unit and the change data:

```php
use JobMetric\UnitConverter\Events\UnitUpdateEvent;

class HandleUnitUpdate
{
    public function handle(UnitUpdateEvent $event): void
    {
        // Access the updated unit (current state)
        $unit = $event->unit;
        
        echo $unit->id;        // e.g., 5
        echo $unit->type;      // e.g., 'weight'
        echo $unit->value;     // e.g., 1001.5 (new value)
        echo $unit->status;    // e.g., false (new status)
        
        // Access the update data (what was changed)
        $data = $event->data;
        
        // Check what was updated
        if (isset($data['value'])) {
            echo "Value was updated to: {$data['value']}";
        }
        
        if (isset($data['status'])) {
            echo "Status was updated to: " . ($data['status'] ? 'active' : 'inactive');
        }
    }
}
```

## Tracking Changes

To track what changed, you can use Eloquent's dirty tracking before the event, or compare in your listener:

```php
use JobMetric\UnitConverter\Events\UnitUpdateEvent;

class TrackUnitChanges
{
    public function handle(UnitUpdateEvent $event): void
    {
        $unit = $event->unit;
        $updateData = $event->data;
        
        $changes = [];
        
        // Check each possible field
        foreach (['value', 'status', 'type'] as $field) {
            if (array_key_exists($field, $updateData)) {
                $changes[$field] = $updateData[$field];
            }
        }
        
        if (!empty($changes)) {
            \Log::info("Unit {$unit->id} updated", [
                'unit_id' => $unit->id,
                'changes' => $changes,
            ]);
        }
    }
}
```

## Registering Listeners

### Using EventServiceProvider

```php
// app/Providers/EventServiceProvider.php

use JobMetric\UnitConverter\Events\UnitUpdateEvent;
use App\Listeners\LogUnitUpdate;
use App\Listeners\SyncUnitChanges;
use App\Listeners\InvalidateUnitCache;

protected $listen = [
    UnitUpdateEvent::class => [
        LogUnitUpdate::class,
        SyncUnitChanges::class,
        InvalidateUnitCache::class,
    ],
];
```

### Using Closure

```php
use Illuminate\Support\Facades\Event;
use JobMetric\UnitConverter\Events\UnitUpdateEvent;

Event::listen(UnitUpdateEvent::class, function (UnitUpdateEvent $event) {
    \Log::info("Unit updated: {$event->unit->id}");
});
```

## Example Listeners

### Audit Trail

```php
namespace App\Listeners;

use App\Models\AuditLog;
use JobMetric\UnitConverter\Events\UnitUpdateEvent;

class LogUnitUpdate
{
    public function handle(UnitUpdateEvent $event): void
    {
        AuditLog::create([
            'action' => 'unit.updated',
            'model_type' => 'Unit',
            'model_id' => $event->unit->id,
            'user_id' => auth()->id(),
            'data' => [
                'changes' => $event->data,
                'current_state' => [
                    'type' => $event->unit->type,
                    'value' => $event->unit->value,
                    'status' => $event->unit->status,
                ],
            ],
            'ip_address' => request()->ip(),
        ]);
    }
}
```

### Sync to External System

```php
namespace App\Listeners;

use App\Services\ExternalApiService;
use JobMetric\UnitConverter\Events\UnitUpdateEvent;

class SyncUnitChanges
{
    public function __construct(
        private ExternalApiService $api
    ) {
    }

    public function handle(UnitUpdateEvent $event): void
    {
        $this->api->updateUnit($event->unit->id, [
            'type' => $event->unit->type,
            'value' => $event->unit->value,
            'status' => $event->unit->status,
            'updated_at' => $event->unit->updated_at->toIso8601String(),
        ]);
    }
}
```

### Cache Invalidation

```php
namespace App\Listeners;

use Illuminate\Support\Facades\Cache;
use JobMetric\UnitConverter\Events\UnitUpdateEvent;

class InvalidateUnitCache
{
    public function handle(UnitUpdateEvent $event): void
    {
        $unit = $event->unit;
        
        // Clear specific unit cache
        Cache::forget("unit:{$unit->id}");
        
        // Clear type-specific cache
        Cache::forget("units:type:{$unit->type}");
        
        // Clear all units cache
        Cache::forget('units:all');
        
        // If value changed, clear conversion caches
        if (isset($event->data['value'])) {
            Cache::tags(['conversions', $unit->type])->flush();
        }
    }
}
```

### Notify on Status Change

```php
namespace App\Listeners;

use App\Notifications\UnitStatusChanged;
use Illuminate\Support\Facades\Notification;
use JobMetric\UnitConverter\Events\UnitUpdateEvent;

class NotifyOnStatusChange
{
    public function handle(UnitUpdateEvent $event): void
    {
        // Only notify if status was changed
        if (!isset($event->data['status'])) {
            return;
        }
        
        $unit = $event->unit;
        $newStatus = $unit->status ? 'activated' : 'deactivated';
        
        // Notify users who use this unit
        $affectedUsers = $this->getUsersUsingUnit($unit->id);
        
        Notification::send($affectedUsers, new UnitStatusChanged(
            $unit,
            $newStatus
        ));
    }
    
    private function getUsersUsingUnit(int $unitId): Collection
    {
        // Logic to find users affected by this unit
    }
}
```

### Recalculate Dependent Data

```php
namespace App\Listeners;

use App\Jobs\RecalculateProductWeights;
use JobMetric\UnitConverter\Events\UnitUpdateEvent;

class RecalculateOnValueChange
{
    public function handle(UnitUpdateEvent $event): void
    {
        // Only recalculate if value changed
        if (!isset($event->data['value'])) {
            return;
        }
        
        // Dispatch job to recalculate all products using this unit
        RecalculateProductWeights::dispatch($event->unit->id);
    }
}
```

## Queued Listeners

For heavy operations, use queued listeners:

```php
namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use JobMetric\UnitConverter\Events\UnitUpdateEvent;

class SyncUnitToDataWarehouse implements ShouldQueue
{
    public $queue = 'sync';

    public function handle(UnitUpdateEvent $event): void
    {
        // Sync to data warehouse
        DataWarehouse::upsert('units', [
            'id' => $event->unit->id,
            'type' => $event->unit->type,
            'value' => $event->unit->value,
            'status' => $event->unit->status,
            'synced_at' => now(),
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
        key: 'unit.updated',
        entityName: 'unit-converter::base.entity_names.unit',
        title: 'unit-converter::base.events.unit_updated.title',
        description: 'unit-converter::base.events.unit_updated.description',
        icon: 'fas fa-edit',
        tags: ['unit', 'storage', 'management']
    );
}
```

## Related Events

- [UnitStoreEvent](./unit-store-event) - Dispatched when a unit is created
- [UnitDeleteEvent](./unit-delete-event) - Dispatched when a unit is deleted

