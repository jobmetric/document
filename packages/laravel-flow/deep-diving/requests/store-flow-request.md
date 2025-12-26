---
sidebar_position: 1
sidebar_label: StoreFlowRequest
---

# StoreFlowRequest

Form request class for validating Flow creation data. This request handles validation for creating new workflow flows with multi-language support, date ranges, and cross-field validation.

## Namespace

`JobMetric\Flow\Http\Requests\Flow\StoreFlowRequest`

## Overview

The `StoreFlowRequest` validates incoming data when creating a new Flow entity. It ensures:

- Required fields are present
- Multi-language translations are valid
- Date ranges are logical (active_from before or equal to active_to)
- Field types and constraints are correct
- Translation uniqueness across flows

## Validation Rules

### Required Fields

| Field | Rule | Description |
|-------|------|-------------|
| `translation` | `required\|array` | Multi-language translation data |
| `translation.{locale}` | `required\|array` | Translation data for each active locale |
| `translation.{locale}.name` | `required\|string` | Flow name in each locale (must be unique) |
| `subject_type` | `required\|string\|max:255` | Model class name that uses this flow |

### Optional Fields

| Field | Rule | Description |
|-------|------|-------------|
| `subject_scope` | `nullable\|string\|max:255` | Optional scope identifier |
| `subject_collection` | `nullable\|string\|max:255` | Optional collection identifier |
| `version` | `sometimes\|integer\|min:1` | Flow version number (defaults to 1) |
| `is_default` | `sometimes\|boolean` | Whether this is the default flow |
| `status` | `sometimes\|boolean` | Active/inactive status |
| `active_from` | `nullable\|date` | Start date for active window |
| `active_to` | `nullable\|date` | End date for active window |
| `channel` | `nullable\|string\|max:64` | Channel identifier |
| `ordering` | `sometimes\|integer\|min:0` | Display order |
| `rollout_pct` | `nullable\|integer\|between:0,100` | Rollout percentage (0-100) |
| `environment` | `nullable\|string\|max:64` | Environment identifier |
| `translation.{locale}.description` | `nullable\|string` | Optional description in each locale |

## Cross-Field Validation

The request includes custom validation in `withValidator()`:

### Active Window Validation

If both `active_from` and `active_to` are provided, `active_from` must be before or equal to `active_to`:

```php
// ✅ Valid
'active_from' => '2024-01-01',
'active_to' => '2024-12-31',

// ❌ Invalid
'active_from' => '2024-12-31',
'active_to' => '2024-01-01',
```

## Translation Validation

### Name Uniqueness

The `translation.{locale}.name` field is validated for uniqueness using `TranslationFieldExistRule`:

- Checks if a flow with the same name already exists in the same locale
- Prevents duplicate flow names within the same language
- Trims whitespace before validation

### Required Locales

All active locales (from `Language::getActiveLocales()`) must have translation data:

```php
// If active locales are ['en', 'fa']
// Both must be provided:
'translation' => [
    'en' => ['name' => 'Order Processing'],
    'fa' => ['name' => 'پردازش سفارش'],
]
```

## Usage Examples

### Basic Flow Creation

```php
use JobMetric\Flow\Http\Requests\Flow\StoreFlowRequest;
use JobMetric\Flow\Facades\Flow;

// In controller
public function store(StoreFlowRequest $request)
{
    $validated = $request->validated();
    
    $flow = Flow::store($validated);
    
    return response()->json($flow);
}
```

### Complete Request Data

```php
$requestData = [
    'translation' => [
        'en' => [
            'name' => 'Order Processing Workflow',
            'description' => 'Handles order processing from creation to delivery',
        ],
        'fa' => [
            'name' => 'گردش کار پردازش سفارش',
            'description' => 'پردازش سفارش از ایجاد تا تحویل',
        ],
    ],
    'subject_type' => 'App\Models\Order',
    'subject_scope' => 'ecommerce',
    'version' => 1,
    'is_default' => true,
    'status' => true,
    'active_from' => '2024-01-01',
    'active_to' => '2024-12-31',
    'channel' => 'web',
    'ordering' => 0,
    'rollout_pct' => 100,
    'environment' => 'production',
];
```

### Minimal Request Data

```php
$requestData = [
    'translation' => [
        'en' => ['name' => 'Simple Workflow'],
    ],
    'subject_type' => 'App\Models\Document',
];
```

### With Active Window

```php
$requestData = [
    'translation' => [
        'en' => ['name' => 'Seasonal Workflow'],
    ],
    'subject_type' => 'App\Models\Product',
    'active_from' => '2024-06-01',
    'active_to' => '2024-08-31', // Summer season
];
```

## Custom Attributes

The request provides custom attribute names for validation error messages:

```php
// Error messages will use these labels:
'translation' => 'Translation'
'translation.*.name' => 'Name'
'subject_type' => 'Subject Type'
'active_from' => 'Active From'
// ... etc
```

## Authorization

The `authorize()` method returns `true` by default. Override in your application if you need custom authorization logic:

```php
// In your custom request class extending StoreFlowRequest
public function authorize(): bool
{
    return $this->user()->can('create', Flow::class);
}
```

## Integration with Flow Service

The request is automatically used by the `Flow::store()` method:

```php
use JobMetric\Flow\Facades\Flow;

// The service automatically validates using StoreFlowRequest
$flow = Flow::store([
    'translation' => [...],
    'subject_type' => 'App\Models\Order',
    // ... other fields
]);
```

## Error Handling

### Validation Errors

When validation fails, Laravel returns a JSON response with error messages:

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "translation.en.name": [
            "The translation.en.name field is required."
        ],
        "subject_type": [
            "The subject type field is required."
        ],
        "active_from": [
            "The active from must be before active to."
        ]
    }
}
```

### Handling in Controllers

```php
public function store(StoreFlowRequest $request)
{
    try {
        $flow = Flow::store($request->validated());
        return response()->json($flow, 201);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to create flow',
            'error' => $e->getMessage()
        ], 500);
    }
}
```

## Best Practices

1. **Always provide all active locales**: Ensure translation data exists for all active locales
   ```php
   // ✅ Good
   $locales = Language::getActiveLocales();
   foreach ($locales as $locale) {
       $data['translation'][$locale] = ['name' => '...'];
   }
   ```

2. **Validate date ranges**: Always ensure `active_from` is before or equal to `active_to` when both are provided
   ```php
   // ✅ Good
   if ($from && $to && strtotime($from) > strtotime($to)) {
       // Handle error
   }
   ```

3. **Use meaningful names**: Flow names should be descriptive and unique
   ```php
   // ✅ Good
   'name' => 'Order Processing Workflow v2'
   
   // ❌ Bad
   'name' => 'Flow 1'
   ```

4. **Set appropriate defaults**: Use `is_default` and `status` appropriately
   ```php
   // Only one flow per subject_type should be default
   'is_default' => true, // Only for the primary flow
   'status' => true, // Active flows only
   ```

## Related Documentation

- [Flow Service](/packages/laravel-flow/deep-diving/services/flow) - Flow management
- [UpdateFlowRequest](/packages/laravel-flow/deep-diving/requests/update-flow-request) - Flow update validation
- [FlowResource](/packages/laravel-flow/deep-diving/resources/flow-resource) - Flow JSON resource
- [FlowPickerBuilder](/packages/laravel-flow/deep-diving/support/flow-picker-builder) - Flow selection logic
- [Events](/packages/laravel-flow/deep-diving/events) - Flow lifecycle events

