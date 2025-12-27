---
sidebar_position: 2
sidebar_label: UpdateFlowRequest
---

# UpdateFlowRequest

Form request class for validating Flow update data. This request handles partial updates with context-aware validation, ensuring translation uniqueness while allowing selective field updates.

## Namespace

`JobMetric\Flow\Http\Requests\Flow\UpdateFlowRequest`

## Overview

The `UpdateFlowRequest` validates incoming data when updating an existing Flow entity. Unlike `StoreFlowRequest`, all fields are optional (`sometimes`), allowing partial updates while maintaining data integrity.

## Key Features

- **Partial Updates**: All fields are optional, allowing selective updates
- **Context-Aware Validation**: Uses `flow_id` from context to validate uniqueness
- **Static Rules Method**: Provides `rulesFor()` for programmatic validation
- **Translation Uniqueness**: Validates translation names excluding current flow

## Validation Rules

### Optional Fields

All fields use `sometimes` rule, meaning they're only validated if present:

| Field | Rule | Description |
|-------|------|-------------|
| `translation` | `sometimes\|array` | Multi-language translation data |
| `translation.{locale}` | `sometimes\|array` | Translation data for specific locale |
| `translation.{locale}.name` | `required\|string` | Flow name (validated if locale provided) |
| `subject_type` | `sometimes\|string\|max:255` | Model class name |
| `subject_scope` | `sometimes\|nullable\|string\|max:255` | Scope identifier |
| `subject_collection` | `sometimes\|nullable\|string\|max:255` | Collection identifier |
| `version` | `sometimes\|integer\|min:1` | Version number |
| `is_default` | `sometimes\|boolean` | Default flow flag |
| `status` | `sometimes\|boolean` | Active/inactive status |
| `active_from` | `sometimes\|nullable\|date` | Start date |
| `active_to` | `sometimes\|nullable\|date` | End date |
| `channel` | `sometimes\|nullable\|string\|max:64` | Channel identifier |
| `ordering` | `sometimes\|integer\|min:0` | Display order |
| `rollout_pct` | `sometimes\|nullable\|integer\|between:0,100` | Rollout percentage |
| `environment` | `sometimes\|nullable\|string\|max:64` | Environment identifier |
| `translation.{locale}.description` | `nullable\|string` | Optional description |

## Context Management

The request supports external context injection via `setContext()`:

```php
$request = new UpdateFlowRequest();
$request->setContext(['flow_id' => 123]);
```

This allows validation to exclude the current flow from uniqueness checks.

## Static Rules Method

### rulesFor()

Provides programmatic validation without instantiating the request:

```php
$input = [
    'translation' => [
        'en' => ['name' => 'Updated Name'],
    ],
    'status' => false,
];

$context = ['flow_id' => 123];

$rules = UpdateFlowRequest::rulesFor($input, $context);
```

**Parameters:**
- `array $input`: Input data to validate
- `array $context = []`: Context data (e.g., `flow_id`)

**Returns:** `array` Validation rules

## Cross-Field Validation

Same as `StoreFlowRequest`, validates that `active_from` is before or equal to `active_to`:

```php
// ✅ Valid
'active_from' => '2024-01-01',
'active_to' => '2024-12-31',

// ❌ Invalid
'active_from' => '2024-12-31',
'active_to' => '2024-01-01',
```

## Translation Validation

### Name Uniqueness with Context

When updating translation names, the validation excludes the current flow:

```php
// If updating flow ID 123
// The name "My Flow" is valid even if another flow has it
// UNLESS flow 123 already has "My Flow" in that locale
```

The `TranslationFieldExistRule` uses the `flow_id` from context to exclude the current record.

## Usage Examples

### Basic Update

```php
use JobMetric\Flow\Http\Requests\Flow\UpdateFlowRequest;
use JobMetric\Flow\Facades\Flow;

public function update(UpdateFlowRequest $request, $id)
{
    $validated = $request->validated();
    
    $flow = Flow::update($id, $validated);
    
    return response()->json($flow);
}
```

### Partial Update - Status Only

```php
$requestData = [
    'status' => false, // Deactivate flow
];
```

### Partial Update - Translation Only

```php
$requestData = [
    'translation' => [
        'en' => [
            'name' => 'Updated Workflow Name',
            'description' => 'New description',
        ],
    ],
];
```

### Update Multiple Fields

```php
$requestData = [
    'translation' => [
        'en' => ['name' => 'Updated Name'],
    ],
    'status' => true,
    'is_default' => false,
    'ordering' => 5,
    'rollout_pct' => 50,
];
```

### Update Active Window

```php
$requestData = [
    'active_from' => '2024-06-01',
    'active_to' => '2024-08-31',
];
```

### Using Static Method

```php
use JobMetric\Flow\Http\Requests\Flow\UpdateFlowRequest;

// Validate programmatically
$input = ['status' => false];
$context = ['flow_id' => 123];

$rules = UpdateFlowRequest::rulesFor($input, $context);

// Use with validator
$validator = Validator::make($input, $rules);
if ($validator->fails()) {
    // Handle errors
}
```

## Context Injection

### In Controller

```php
public function update(UpdateFlowRequest $request, $id)
{
    // Context is automatically set by Flow service
    // But you can also set it manually:
    $request->setContext(['flow_id' => $id]);
    
    $flow = Flow::update($id, $request->validated());
    
    return response()->json($flow);
}
```

### In Service Layer

```php
use JobMetric\Flow\Http\Requests\Flow\UpdateFlowRequest;

public function updateFlow($id, array $data)
{
    $request = new UpdateFlowRequest();
    $request->setContext(['flow_id' => $id]);
    $request->merge($data);
    
    $validated = $request->validated();
    
    // Update flow...
}
```

## Error Handling

### Validation Errors

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "translation.en.name": [
            "A flow with this name already exists."
        ],
        "active_from": [
            "The active from must be before active to."
        ]
    }
}
```

### Handling in Controllers

```php
public function update(UpdateFlowRequest $request, $id)
{
    try {
        $flow = Flow::update($id, $request->validated());
        return response()->json($flow);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    }
}
```

## Differences from StoreFlowRequest

| Feature | StoreFlowRequest | UpdateFlowRequest |
|---------|------------------|-------------------|
| Field Rules | `required` for translations | `sometimes` for all fields |
| Context Support | No | Yes (`flow_id` in context) |
| Static Method | No | Yes (`rulesFor()`) |
| Uniqueness Check | Checks all flows | Excludes current flow |
| Use Case | Creating new flows | Updating existing flows |

## Best Practices

1. **Use Context for Uniqueness**: Always provide `flow_id` in context
   ```php
   $request->setContext(['flow_id' => $id]);
   ```

2. **Validate Only Changed Fields**: Only send fields that need updating
   ```php
   // ✅ Good - Only update what changed
   ['status' => false]
   
   // ❌ Bad - Sending all fields
   ['translation' => [...], 'status' => false, 'ordering' => 0, ...]
   ```

3. **Handle Partial Translations**: Only provide locales you're updating
   ```php
   // ✅ Good - Only update English
   ['translation' => ['en' => ['name' => 'New Name']]]
   ```

4. **Validate Date Ranges**: Ensure logical date ranges when updating
   ```php
   // ✅ Good
   ['active_from' => '2024-01-01', 'active_to' => '2024-12-31']
   ```

## Related Documentation

- [Flow Service](/packages/laravel-flow/deep-diving/services/flow) - Flow management
- [StoreFlowRequest](/packages/laravel-flow/deep-diving/requests/store-flow-request) - Flow creation validation
- [FlowResource](/packages/laravel-flow/deep-diving/resources/flow-resource) - Flow JSON resource
- [Events](/packages/laravel-flow/deep-diving/events) - Flow lifecycle events

