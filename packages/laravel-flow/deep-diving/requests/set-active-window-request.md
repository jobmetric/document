---
sidebar_position: 4
sidebar_label: SetActiveWindowRequest
---

# SetActiveWindowRequest

Form request class for validating active window (date range) updates for flows. This request ensures that date ranges are valid and logical.

## Namespace

`JobMetric\Flow\Http\Requests\Flow\SetActiveWindowRequest`

## Overview

The `SetActiveWindowRequest` validates date range inputs when setting or updating the active window for a flow. It ensures that `active_from` is before or equal to `active_to` when both dates are provided.

## Validation Rules

| Field | Rule | Description |
|-------|------|-------------|
| `active_from` | `nullable\|date` | Start date of active window |
| `active_to` | `nullable\|date` | End date of active window |

## Cross-Field Validation

The request includes custom validation in `withValidator()`:

### Date Range Validation

If both `active_from` and `active_to` are provided, `active_from` must be before or equal to `active_to`:

```php
// ✅ Valid
'active_from' => '2024-01-01',
'active_to' => '2024-12-31',

// ✅ Valid - Same date
'active_from' => '2024-06-01',
'active_to' => '2024-06-01',

// ❌ Invalid
'active_from' => '2024-12-31',
'active_to' => '2024-01-01',
```

## Usage Examples

### Set Active Window

```php
use JobMetric\Flow\Http\Requests\Flow\SetActiveWindowRequest;
use JobMetric\Flow\Facades\Flow;

public function setActiveWindow(SetActiveWindowRequest $request, $id)
{
    $validated = $request->validated();
    
    Flow::setActiveWindow($id, $validated['active_from'], $validated['active_to']);
    
    return response()->json(['message' => 'Active window updated']);
}
```

### Request Data Formats

#### Both Dates Provided

```php
$requestData = [
    'active_from' => '2024-01-01',
    'active_to' => '2024-12-31',
];
```

#### Only Start Date

```php
$requestData = [
    'active_from' => '2024-01-01',
    'active_to' => null, // No end date
];
```

#### Only End Date

```php
$requestData = [
    'active_from' => null, // No start date
    'active_to' => '2024-12-31',
];
```

#### Clear Active Window

```php
$requestData = [
    'active_from' => null,
    'active_to' => null,
];
```

### Complete Example

```php
// POST /api/flows/1/set-active-window
{
    "active_from": "2024-06-01",
    "active_to": "2024-08-31"
}

// This sets the flow to be active only during summer months
```

## Integration with Flow Service

The request is typically used with the `Flow::setActiveWindow()` method:

```php
use JobMetric\Flow\Facades\Flow;

public function setActiveWindow(SetActiveWindowRequest $request, $id)
{
    $data = $request->validated();
    
    Flow::setActiveWindow(
        $id,
        $data['active_from'] ?? null,
        $data['active_to'] ?? null
    );
    
    return response()->json(['message' => 'Active window updated']);
}
```

## Error Handling

### Validation Errors

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "active_from": [
            "The active from must be before active to."
        ],
        "active_to": [
            "The active to must be a valid date."
        ]
    }
}
```

## Use Cases

### Seasonal Flows

Set flows to be active only during specific seasons:

```php
// Summer campaign
'active_from' => '2024-06-01',
'active_to' => '2024-08-31',

// Winter campaign
'active_from' => '2024-12-01',
'active_to' => '2024-02-28',
```

### Limited Time Offers

Set flows for time-limited promotions:

```php
// Black Friday sale
'active_from' => '2024-11-25',
'active_to' => '2024-11-29',
```

### Open-Ended Flows

Set flows with no end date:

```php
'active_from' => '2024-01-01',
'active_to' => null, // Active indefinitely from start date
```

### Past-Dated Flows

Set flows that are no longer active:

```php
'active_from' => '2023-01-01',
'active_to' => '2023-12-31', // Historical flow
```

## Best Practices

1. **Validate Date Ranges**: Always ensure logical date ranges
   ```php
   // ✅ Good
   if ($from && $to && strtotime($from) > strtotime($to)) {
       // Handle error
   }
   ```

2. **Use Appropriate Formats**: Use standard date formats
   ```php
   // ✅ Good
   'active_from' => '2024-01-01',
   'active_from' => '2024-01-01 00:00:00',
   
   // ⚠️ Acceptable but less clear
   'active_from' => '01/01/2024',
   ```

3. **Handle Null Values**: Consider null values when both dates are optional
   ```php
   // Clear active window
   ['active_from' => null, 'active_to' => null]
   ```

## Related Documentation

- [Flow Service](/packages/laravel-flow/deep-diving/services/flow) - Learn about flow management
- [StoreFlowRequest](/packages/laravel-flow/deep-diving/requests/store-flow-request) - Flow creation with active window

