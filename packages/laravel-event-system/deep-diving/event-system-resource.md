---
sidebar_position: 7
sidebar_label: EventSystemResource
---

import Link from "@docusaurus/Link";

# EventSystemResource

The `EventSystemResource` transforms an `Event` model into a JSON-serializable array suitable for API responses. It ensures that all relevant fields from the model are exposed in a consistent format, including formatted timestamps and key configuration values.

## Namespace

```php
JobMetric\EventSystem\Http\Resources\EventSystemResource
```

## Overview

`EventSystemResource` is a Laravel JSON resource that:

- **Transforms Event models** into consistent JSON structures
- **Formats timestamps** in a standardized format (`Y-m-d H:i:s`)
- **Exposes all model fields** in a predictable structure
- **Supports collections** for multiple events
- **Works with pagination** for large datasets
- **Integrates seamlessly** with EventSystem service responses

## Resource Structure

The resource transforms the `Event` model into the following JSON structure:

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

## Field Details

### Complete Field Reference

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | integer | Unique identifier of the event-listener entry | `1` |
| `name` | string | Human-readable unique name for the event binding | `"user.created"` |
| `description` | string\|null | Optional description for the entry | `"Send welcome email"` |
| `event` | string | Fully qualified class name of the event | `"App\\Events\\UserCreated"` |
| `listener` | string | Fully qualified class name of the listener | `"App\\Listeners\\SendWelcomeEmail"` |
| `priority` | integer | Listener execution priority (lower = earlier) | `10` |
| `status` | boolean | Whether the listener is active (`true`) or disabled (`false`) | `true` |
| `created_at` | string | Timestamp when the record was created (formatted) | `"2024-01-01 12:00:00"` |
| `updated_at` | string | Timestamp when the record was last updated (formatted) | `"2024-01-01 12:00:00"` |

### Field Descriptions

#### `id` (integer)

Unique identifier of the event-listener entry in the database.

```json
{
    "id": 1
}
```

#### `name` (string)

Human-readable unique name for the event binding. Used for identification and reference.

```json
{
    "name": "user.created"
}
```

**Common naming patterns:**
- `{entity}.{action}` - `"user.created"`, `"order.completed"`
- `{module}.{entity}.{action}` - `"shop.order.completed"`
- `{feature}.{action}` - `"notification.send"`

#### `description` (string|null)

Optional description for the entry. Provides context about what the event binding does.

```json
{
    "description": "Send welcome email when user registers"
}
```

**When null:**

```json
{
    "description": null
}
```

#### `event` (string)

Fully qualified class name of the event class. This is the event that will be dispatched.

```json
{
    "event": "App\\Events\\UserCreated"
}
```

**Examples:**
- `"App\\Events\\UserCreated"`
- `"App\\Events\\OrderCompleted"`
- `"JobMetric\\EventSystem\\Events\\EventSystemStoredEvent"`

#### `listener` (string)

Fully qualified class name of the listener class. This is the class that handles the event.

```json
{
    "listener": "App\\Listeners\\SendWelcomeEmail"
}
```

**Examples:**
- `"App\\Listeners\\SendWelcomeEmail"`
- `"App\\Listeners\\ProcessOrder"`
- `"App\\Listeners\\NotifyAdmin"`

#### `priority` (integer)

Listener execution priority. Lower values execute earlier, higher values execute later.

```json
{
    "priority": 10
}
```

**Priority behavior:**
- Priority `0` executes first
- Priority `10` executes after priority `0-9`
- Priority `100` executes last

#### `status` (boolean)

Whether the listener is active (`true`) or disabled (`false`). Disabled listeners are not executed.

```json
{
    "status": true
}
```

**Values:**
- `true` - Listener is active and will be executed
- `false` - Listener is disabled and will not be executed

#### `created_at` (string)

Timestamp when the record was created, formatted as `Y-m-d H:i:s`.

```json
{
    "created_at": "2024-01-01 12:00:00"
}
```

**Format:** `YYYY-MM-DD HH:MM:SS` (24-hour format)

#### `updated_at` (string)

Timestamp when the record was last updated, formatted as `Y-m-d H:i:s`.

```json
{
    "updated_at": "2024-01-01 12:00:00"
}
```

**Format:** `YYYY-MM-DD HH:MM:SS` (24-hour format)

## Basic Usage

### Single Resource

Transform a single `Event` model:

```php
use JobMetric\EventSystem\Models\Event;
use JobMetric\EventSystem\Http\Resources\EventSystemResource;

$event = Event::find(1);

return EventSystemResource::make($event);
```

**Response:**

```json
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
}
```

### Resource Collection

Transform multiple `Event` models:

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

## Complete Examples

### Example 1: Controller - Index (List All)

List all event bindings:

```php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use JobMetric\EventSystem\Facades\EventSystem;
use JobMetric\EventSystem\Http\Resources\EventSystemResource;

class EventSystemController extends Controller
{
    public function index()
    {
        $events = EventSystem::query()->get();

        return EventSystemResource::collection($events);
    }
}
```

### Example 2: Controller - Show (Single)

Get a single event binding:

```php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use JobMetric\EventSystem\Facades\EventSystem;
use JobMetric\EventSystem\Http\Resources\EventSystemResource;

class EventSystemController extends Controller
{
    public function show(int $id)
    {
        $event = EventSystem::query()->findOrFail($id);

        return EventSystemResource::make($event);
    }
}
```

### Example 3: Controller - Store (Create)

Create a new event binding and return resource:

```php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use JobMetric\EventSystem\Facades\EventSystem;
use JobMetric\EventSystem\Http\Resources\EventSystemResource;
use JobMetric\EventSystem\Http\Requests\StoreEventSystemRequest;

class EventSystemController extends Controller
{
    public function store(StoreEventSystemRequest $request)
    {
        $response = EventSystem::store($request->validated());

        if ($response->isSuccess()) {
            return EventSystemResource::make($response->getData())
                ->response()
                ->setStatusCode(201);
        }

        return response()->json([
            'success' => false,
            'message' => $response->getMessage(),
            'errors' => $response->getErrors(),
        ], 422);
    }
}
```

### Example 4: Controller - With Pagination

Paginated event bindings:

```php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use JobMetric\EventSystem\Facades\EventSystem;
use JobMetric\EventSystem\Http\Resources\EventSystemResource;

class EventSystemController extends Controller
{
    public function index()
    {
        $events = EventSystem::query()
            ->where('status', true)
            ->paginate(15);

        return EventSystemResource::collection($events);
    }
}
```

**Response with pagination:**

```json
{
    "data": [
        {
            "id": 1,
            "name": "user.created",
            ...
        }
    ],
    "links": {
        "first": "http://example.com/api/events?page=1",
        "last": "http://example.com/api/events?page=10",
        "prev": null,
        "next": "http://example.com/api/events?page=2"
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 10,
        "path": "http://example.com/api/events",
        "per_page": 15,
        "to": 15,
        "total": 150
    }
}
```

### Example 5: API Response with Status Code

Return resource with custom status code:

```php
use JobMetric\EventSystem\Http\Resources\EventSystemResource;
use JobMetric\EventSystem\Models\Event;

$event = Event::find(1);

return EventSystemResource::make($event)
    ->response()
    ->setStatusCode(200);
```

### Example 6: Filtered Collection

Filter events before transforming:

```php
use JobMetric\EventSystem\Models\Event;
use JobMetric\EventSystem\Http\Resources\EventSystemResource;

$events = Event::where('status', true)
    ->where('priority', '>', 5)
    ->orderBy('priority', 'asc')
    ->get();

return EventSystemResource::collection($events);
```

### Example 7: Service Response Integration

Use with EventSystem service responses:

```php
use JobMetric\EventSystem\Facades\EventSystem;
use JobMetric\EventSystem\Http\Resources\EventSystemResource;

$response = EventSystem::store([
    'name' => 'user.created',
    'event' => App\Events\UserCreated::class,
    'listener' => App\Listeners\SendWelcomeEmail::class,
    'priority' => 10,
    'status' => true,
]);

if ($response->isSuccess()) {
    $resource = EventSystemResource::make($response->getData());
    
    return response()->json([
        'success' => true,
        'message' => $response->getMessage(),
        'data' => $resource->toArray(request()),
    ], 201);
}
```

### Example 8: Conditional Fields

Extend resource for conditional fields:

```php
namespace App\Http\Resources;

use JobMetric\EventSystem\Http\Resources\EventSystemResource as BaseResource;

class EventSystemResource extends BaseResource
{
    public function toArray($request): array
    {
        $data = parent::toArray($request);

        // Add additional fields based on user permissions
        if ($request->user()->can('view-details')) {
            $data['additional_info'] = [
                'registered_at' => $this->created_at->toIso8601String(),
                'is_active' => $this->status,
            ];
        }

        return $data;
    }
}
```

### Example 9: API Resource Wrapper

Wrap resource in API response format:

```php
use JobMetric\EventSystem\Http\Resources\EventSystemResource;
use JobMetric\EventSystem\Models\Event;

$event = Event::find(1);

return response()->json([
    'success' => true,
    'data' => EventSystemResource::make($event)->toArray(request()),
    'meta' => [
        'timestamp' => now()->toIso8601String(),
    ],
]);
```

### Example 10: Export Functionality

Export events as JSON:

```php
use JobMetric\EventSystem\Models\Event;
use JobMetric\EventSystem\Http\Resources\EventSystemResource;

$events = Event::all();

$export = EventSystemResource::collection($events)
    ->toArray(request());

return response()->json($export)
    ->header('Content-Disposition', 'attachment; filename="events.json"');
```

## Resource Methods

### `make()`

Create a resource instance from a model:

```php
EventSystemResource::make($event)
```

### `collection()`

Create a resource collection from multiple models:

```php
EventSystemResource::collection($events)
```

### `toArray()`

Convert resource to array:

```php
$resource = EventSystemResource::make($event);
$array = $resource->toArray(request());
```

### `response()`

Get HTTP response:

```php
$resource = EventSystemResource::make($event);
return $resource->response()->setStatusCode(201);
```

## Timestamp Formatting

The resource formats timestamps using Carbon's `format()` method:

```php
'created_at' => $this->created_at->format('Y-m-d H:i:s'),
'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
```

**Format:** `Y-m-d H:i:s`
- `Y` - 4-digit year
- `m` - 2-digit month (01-12)
- `d` - 2-digit day (01-31)
- `H` - 24-hour format hour (00-23)
- `i` - Minutes (00-59)
- `s` - Seconds (00-59)

**Example:** `2024-01-15 14:30:45`

## When to Use

Use `EventSystemResource` when you need to:

- **API Responses**: Transform event models for JSON API responses
- **Consistent Formatting**: Ensure all event data follows the same structure
- **Timestamp Formatting**: Format timestamps in a consistent format
- **Data Transformation**: Expose only necessary fields in API responses
- **Resource Collections**: Use with resource collections for paginated responses
- **Service Integration**: Integrate with EventSystem service responses
- **Export Functionality**: Export event configurations as JSON

## When NOT to Use

Avoid using this resource when:

- **Direct Model Access**: If you need direct model access without transformation
- **Custom Formatting**: If you need different timestamp formats or field structures
- **Internal Processing**: For internal processing that doesn't require JSON transformation

## Best Practices

### 1. Always Use Resource for API Responses

```php
// Good: Use resource
return EventSystemResource::make($event);

// Avoid: Direct model
return response()->json($event);
```

### 2. Use Collections for Multiple Items

```php
// Good: Use collection
return EventSystemResource::collection($events);

// Avoid: Manual array mapping
return response()->json($events->map(function ($event) {
    return [...];
}));
```

### 3. Set Appropriate Status Codes

```php
// Good: Set status code
return EventSystemResource::make($event)
    ->response()
    ->setStatusCode(201);

// Avoid: Default status code
return EventSystemResource::make($event);
```

### 4. Use with Service Responses

```php
// Good: Use with service response
$response = EventSystem::store($data);
if ($response->isSuccess()) {
    return EventSystemResource::make($response->getData());
}

// Avoid: Direct model access
$event = Event::create($data);
return EventSystemResource::make($event);
```

### 5. Extend for Custom Fields

```php
// Good: Extend for custom needs
class CustomEventSystemResource extends EventSystemResource
{
    public function toArray($request): array
    {
        $data = parent::toArray($request);
        // Add custom fields
        return $data;
    }
}
```

## Common Mistakes

### Mistake 1: Not Using Resource for API Responses

```php
// Bad: Direct model serialization
return response()->json($event);

// Good: Use resource
return EventSystemResource::make($event);
```

### Mistake 2: Manual Array Building

```php
// Bad: Manual array building
return response()->json([
    'id' => $event->id,
    'name' => $event->name,
    // ...
]);

// Good: Use resource
return EventSystemResource::make($event);
```

### Mistake 3: Not Handling Collections

```php
// Bad: Manual collection mapping
return response()->json($events->map(function ($event) {
    return EventSystemResource::make($event)->toArray(request());
}));

// Good: Use collection
return EventSystemResource::collection($events);
```

### Mistake 4: Forgetting Status Codes

```php
// Bad: Default status code for creation
return EventSystemResource::make($event);

// Good: Set appropriate status code
return EventSystemResource::make($event)
    ->response()
    ->setStatusCode(201);
```

## Performance Considerations

### Eager Loading

When using resources with relationships, use eager loading:

```php
// Good: Eager load relationships
$events = Event::with('relatedModel')->get();
return EventSystemResource::collection($events);

// Avoid: N+1 queries
$events = Event::all();
return EventSystemResource::collection($events);
```

### Pagination

Use pagination for large datasets:

```php
// Good: Paginate large datasets
$events = Event::paginate(15);
return EventSystemResource::collection($events);

// Avoid: Loading all records
$events = Event::all();
return EventSystemResource::collection($events);
```

## Related Documentation

- <Link to="/packages/laravel-event-system/deep-diving/event-system">EventSystem</Link>
- <Link to="/packages/laravel-event-system/deep-diving/store-event-system-request">StoreEventSystemRequest</Link>
- <Link to="/packages/laravel-event-system/deep-diving/domain-event">DomainEvent</Link>

