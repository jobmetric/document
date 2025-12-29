---
sidebar_position: 3
sidebar_label: EventSystemResource
---

# EventSystemResource

The `EventSystemResource` transforms an `Event` model into a JSON-serializable array suitable for API responses. It ensures that all relevant fields from the model are exposed in a consistent format, including formatted timestamps and key configuration values.

## When to Use EventSystemResource

**Use `EventSystemResource` when you need:**

- **API responses**: Transform event models for JSON API responses
- **Consistent formatting**: Ensure all event data follows the same structure
- **Timestamp formatting**: Format timestamps in a consistent format
- **Data transformation**: Expose only necessary fields in API responses
- **Resource collections**: Use with resource collections for paginated responses

**Example scenarios:**
- REST API endpoints returning event data
- Admin panel APIs for event management
- Event listing and detail endpoints
- Export functionality for event configurations

## Overview

`EventSystemResource` provides:

- **Field mapping**: Maps all model fields to JSON structure
- **Timestamp formatting**: Formats dates in `Y-m-d H:i:s` format
- **Consistent structure**: Ensures all responses follow the same format
- **Type safety**: Properly casts all field types

## Namespace

```php
JobMetric\EventSystem\Http\Resources\EventSystemResource
```

## Quick Start

Use the resource in controllers or service classes:

```php
use JobMetric\EventSystem\Http\Resources\EventSystemResource;
use JobMetric\EventSystem\Models\Event;

// Single resource
$event = Event::find(1);
return EventSystemResource::make($event);

// Resource collection
$events = Event::all();
return EventSystemResource::collection($events);
```

## Resource Structure

The resource transforms the model into the following JSON structure:

```json
{
    "id": 1,
    "name": "user.created",
    "description": "Send welcome email when user registers",
    "event": "App\\Events\\UserCreated",
    "listener": "App\\Listeners\\SendWelcomeEmail",
    "priority": 10,
    "status": true,
    "created_at": "2024-01-01 12:00:00",
    "updated_at": "2024-01-01 12:00:00"
}
```

## Fields

### `id` (integer)

Unique identifier of the event-listener entry.

### `name` (string)

Human-readable unique name for the event binding.

### `description` (string|null)

Optional description for the entry.

### `event` (string)

Fully qualified class name of the event.

### `listener` (string)

Fully qualified class name of the listener.

### `priority` (integer)

Listener execution priority. Lower values execute earlier.

### `status` (boolean)

Whether the listener is active (`true`) or disabled (`false`).

### `created_at` (string)

Timestamp when the record was created, formatted as `Y-m-d H:i:s`.

### `updated_at` (string)

Timestamp when the record was last updated, formatted as `Y-m-d H:i:s`.

## Complete Example

### In Controller

```php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use JobMetric\EventSystem\Facades\EventSystem;
use JobMetric\EventSystem\Http\Resources\EventSystemResource;

class EventSystemController extends Controller
{
    public function index()
    {
        $events = EventSystem::paginate();

        return EventSystemResource::collection($events);
    }

    public function show(int $id)
    {
        $event = EventSystem::query()->findOrFail($id);

        return EventSystemResource::make($event);
    }

    public function store(Request $request)
    {
        $response = EventSystem::store($request->all());

        if ($response->isSuccess()) {
            return EventSystemResource::make($response->getData())
                ->response()
                ->setStatusCode(201);
        }

        return response()->json($response->toArray(), 422);
    }
}
```

### With Pagination

```php
use JobMetric\EventSystem\Facades\EventSystem;
use JobMetric\EventSystem\Http\Resources\EventSystemResource;

$paginatedEvents = EventSystem::paginate(['status' => true], 15);

return EventSystemResource::collection($paginatedEvents)
    ->response()
    ->getData();
```

### In Service Response

```php
use JobMetric\EventSystem\Facades\EventSystem;
use JobMetric\EventSystem\Http\Resources\EventSystemResource;

$response = EventSystem::store([
    'name' => 'user.created',
    'event' => App\Events\UserCreated::class,
    'listener' => App\Listeners\SendWelcomeEmail::class,
]);

if ($response->isSuccess()) {
    $resource = EventSystemResource::make($response->getData());
    return response()->json($resource->toArray(request()));
}
```

## Resource Collection

Use with collections for multiple events:

```php
use JobMetric\EventSystem\Models\Event;
use JobMetric\EventSystem\Http\Resources\EventSystemResource;

$events = Event::where('status', true)->get();

return EventSystemResource::collection($events);
```

**Response:**

```json
{
    "data": [
        {
            "id": 1,
            "name": "user.created",
            "description": "Send welcome email",
            "event": "App\\Events\\UserCreated",
            "listener": "App\\Listeners\\SendWelcomeEmail",
            "priority": 10,
            "status": true,
            "created_at": "2024-01-01 12:00:00",
            "updated_at": "2024-01-01 12:00:00"
        },
        {
            "id": 2,
            "name": "order.completed",
            "description": "Send order confirmation",
            "event": "App\\Events\\OrderCompleted",
            "listener": "App\\Listeners\\SendOrderConfirmation",
            "priority": 5,
            "status": true,
            "created_at": "2024-01-01 12:00:00",
            "updated_at": "2024-01-01 12:00:00"
        }
    ]
}
```

## Related Documentation

- [EventSystem](/packages/laravel-event-system/deep-diving/event-system) - Service for managing event bindings

