---
sidebar_position: 1
sidebar_label: CheckStatusInDriverRule
---

# CheckStatusInDriverRule

The `CheckStatusInDriverRule` is a Laravel validation rule that ensures a given status value is allowed for the subject model bound to a Flow. It validates that the status value exists in the model's status enum values, which are detected through the `HasWorkflow` trait.

## Namespace

```php
JobMetric\Flow\Rules\CheckStatusInDriverRule
```

## Overview

This validation rule is used when creating or updating Flow States to ensure that the provided status value is valid for the Flow's subject model. It:

- Loads the Flow by ID and resolves its subject model class
- Ensures the subject model uses the `HasWorkflow` trait
- Detects status enum values from the model using `HasWorkflow` helpers
- Validates the incoming status value exists among those enum values
- Provides clear error messages for various failure scenarios

## When to Use

This rule is primarily used in:

- **FlowState Creation**: Validating status when creating new flow states
- **FlowState Updates**: Validating status when updating existing flow states
- **Form Requests**: Ensuring status values match the model's enum

## Constructor

### Basic Usage

```php
use JobMetric\Flow\Rules\CheckStatusInDriverRule;

$rule = new CheckStatusInDriverRule($flowId);
```

**Parameters:**
- `int $flowId`: The Flow ID used to resolve the subject model class

## How It Works

### Validation Process

The rule follows this validation process:

1. **Null/Empty Check**: If value is `null` or empty string, validation passes (allows optional status)
2. **Flow Lookup**: Loads the Flow from database using the provided Flow ID
3. **Subject Model Resolution**: Extracts `subject_type` from the Flow
4. **Model Validation**: Ensures the subject class exists and extends `Model`
5. **Trait Check**: Verifies the model uses `HasWorkflow` trait
6. **Enum Detection**: Calls `flowStatusEnumValues()` on the model instance
7. **Value Matching**: Checks if the provided value matches any enum value (strict or stringified)

### Status Enum Detection

The rule uses `HasWorkflow::flowStatusEnumValues()` to detect allowed status values:

```php
// Inside the rule
$subject = new $subjectClass();
$allowed = $subject->flowStatusEnumValues();
```

This method:
- Detects the status column name from model configuration
- Resolves the enum class from the status column
- Returns array of enum values

### Value Matching

The rule performs flexible matching:

```php
// Strict matching
in_array($value, $allowed, true)

// Stringified matching (for form submissions)
in_array((string)$value, array_map('strval', $allowed), true)
```

**Supported Value Types:**
- String values (e.g., `'pending'`, `'shipped'`)
- Enum instances (e.g., `OrderStatus::PENDING`)
- Numeric strings (e.g., `'1'`, `'2'`)
- Boolean values (converted to `'1'` or `'0'`)

## Usage in Form Requests

### StoreFlowStateRequest

```php
namespace App\Http\Requests\FlowState;

use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Flow\Rules\CheckStatusInDriverRule;

class StoreFlowStateRequest extends FormRequest
{
    public function rules(): array
    {
        $flowId = $this->input('flow_id');

        return [
            'flow_id' => 'required|exists:flows,id',
            'status' => [
                'present',
                'nullable',
                new CheckStatusInDriverRule($flowId),
            ],
            // ... other rules
        ];
    }
}
```

### UpdateFlowStateRequest

```php
namespace App\Http\Requests\FlowState;

use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Flow\Rules\CheckStatusInDriverRule;

class UpdateFlowStateRequest extends FormRequest
{
    public function rules(): array
    {
        $flow = $this->route('flowState')->flow;
        $flowId = $flow->id;

        return [
            'status' => [
                'present',
                'nullable',
                new CheckStatusInDriverRule($flowId),
            ],
            // ... other rules
        ];
    }
}
```

## Validation Scenarios

### Valid Status Values

The rule accepts status values that match the model's enum:

```php
// Model with status enum
class Order extends Model
{
    use HasWorkflow;

    protected $fillable = ['status'];

    // Status enum: pending, processing, shipped, delivered
}

// Valid status values
'pending'      // ✅ Valid
'processing'   // ✅ Valid
'shipped'      // ✅ Valid
'delivered'    // ✅ Valid
```

### Invalid Status Values

The rule rejects values not in the enum:

```php
'invalid_status'  // ❌ Not in enum
'PENDING'         // ❌ Case-sensitive (unless enum has it)
' pending'         // ❌ Whitespace
'1'                // ❌ Numeric string (unless enum has it)
```

### Null and Empty Values

Null and empty strings pass validation (allows optional status):

```php
null   // ✅ Passes (optional)
''     // ✅ Passes (optional)
```

## Error Messages

The rule provides specific error messages for different failure scenarios:

### Flow Not Found

```php
trans('workflow::base.validation.flow_not_found')
```

**Triggered when:** Flow ID doesn't exist in database

### Invalid Subject Model

```php
trans('workflow::base.validation.subject_model_invalid')
```

**Triggered when:**
- `subject_type` is not a string
- Class doesn't exist
- Class doesn't extend `Model`

### Model Must Use HasWorkflow

```php
trans('workflow::base.validation.model_must_use_has_workflow', [
    'model' => $subjectClass
])
```

**Triggered when:** Subject model doesn't use `HasWorkflow` trait

### Status Column Missing

```php
trans('workflow::base.validation.status_column_missing')
```

**Triggered when:** Model doesn't have a status column configured

### Status Enum Error

```php
trans('workflow::base.validation.status_enum_error')
```

**Triggered when:** Error occurs while detecting enum values

### Status Enum Missing

```php
trans('workflow::base.validation.status_enum_missing')
```

**Triggered when:** No enum values are detected

### Invalid Status Value

```php
trans('workflow::base.validation.check_status_in_driver', [
    'status' => implode(', ', $allowedString),
])
```

**Triggered when:** Provided status value doesn't match any enum value

## Complete Examples

### Example 1: Basic Usage in Form Request

```php
namespace App\Http\Requests\FlowState;

use Illuminate\Foundation\Http\FormRequest;
use JobMetric\Flow\Rules\CheckStatusInDriverRule;

class StoreFlowStateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $flowId = $this->input('flow_id');

        return [
            'flow_id' => 'required|exists:flows,id',
            'translation' => 'required|array',
            'status' => [
                'present',
                'nullable',
                new CheckStatusInDriverRule($flowId),
            ],
            'config' => 'sometimes|array',
            'color' => 'sometimes|nullable|hex_color',
            'icon' => 'sometimes|nullable|string',
            'is_terminal' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'flow_id.required' => 'Flow ID is required',
            'flow_id.exists' => 'Selected flow does not exist',
            'status.*' => 'Invalid status value for this flow',
        ];
    }
}
```

### Example 2: Dynamic Flow ID Resolution

```php
class UpdateFlowStateRequest extends FormRequest
{
    public function rules(): array
    {
        // Get flow ID from route model binding
        $flowState = $this->route('flowState');
        $flowId = $flowState->flow_id;

        return [
            'status' => [
                'sometimes',
                'nullable',
                new CheckStatusInDriverRule($flowId),
            ],
            // ... other rules
        ];
    }
}
```

### Example 3: Conditional Validation

```php
class StoreFlowStateRequest extends FormRequest
{
    public function rules(): array
    {
        $flowId = $this->input('flow_id');
        $rules = [
            'flow_id' => 'required|exists:flows,id',
        ];

        // Only validate status if provided
        if ($this->has('status')) {
            $rules['status'] = [
                'required',
                new CheckStatusInDriverRule($flowId),
            ];
        }

        return $rules;
    }
}
```

### Example 4: Custom Error Handling

```php
use Illuminate\Validation\ValidationException;
use JobMetric\Flow\Rules\CheckStatusInDriverRule;

try {
    $request->validate([
        'status' => new CheckStatusInDriverRule($flowId),
    ]);
} catch (ValidationException $e) {
    // Custom error handling
    if ($e->errors()['status'][0] === trans('workflow::base.validation.flow_not_found')) {
        // Handle flow not found
    } elseif ($e->errors()['status'][0] === trans('workflow::base.validation.check_status_in_driver')) {
        // Handle invalid status
    }
}
```

## Model Requirements

### Required Setup

For the rule to work, your model must:

1. **Use HasWorkflow Trait:**
```php
use JobMetric\Flow\HasWorkflow;

class Order extends Model
{
    use HasWorkflow;
}
```

2. **Have Status Column:**
```php
// Migration
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->string('status')->nullable();
    // ...
});
```

3. **Configure Status Enum:**
```php
class Order extends Model
{
    use HasWorkflow;

    protected $fillable = ['status'];

    // Status enum is detected automatically from the status column
    // Or configure explicitly in HasWorkflow trait
}
```

### Status Enum Detection

The rule automatically detects status enum values using:

```php
$model = new Order();
$allowedStatuses = $model->flowStatusEnumValues();
```

This method:
- Looks for status column configuration
- Resolves enum class from column definition
- Returns array of enum values

## Edge Cases and Behavior

### Case Sensitivity

Status values are **case-sensitive**:

```php
// Enum: ['pending', 'processing']
'pending'    // ✅ Valid
'PENDING'    // ❌ Invalid (case mismatch)
'Pending'    // ❌ Invalid (case mismatch)
```

### Whitespace Handling

Whitespace in values causes validation failure:

```php
'pending'     // ✅ Valid
' pending'    // ❌ Invalid (leading space)
'pending '    // ❌ Invalid (trailing space)
' pending '   // ❌ Invalid (both)
```

### Type Coercion

The rule performs type coercion for matching:

```php
// Enum: [OrderStatus::PENDING, OrderStatus::PROCESSING]

'pending'           // ✅ Valid (string match)
OrderStatus::PENDING // ✅ Valid (strict match)
1                    // ❌ Invalid (unless enum has numeric value)
```

### Null and Empty Values

Null and empty strings always pass (allows optional status):

```php
null  // ✅ Always passes
''    // ✅ Always passes
```

## Error Handling

### Flow Not Found

```php
$rule = new CheckStatusInDriverRule(999); // Non-existent flow
$rule->validate('status', 'pending', function ($message) {
    // $message = trans('workflow::base.validation.flow_not_found')
});
```

### Invalid Subject Model

```php
// Flow with invalid subject_type
$flow = Flow::create([
    'subject_type' => 'NonExistentClass',
    // ...
]);

$rule = new CheckStatusInDriverRule($flow->id);
$rule->validate('status', 'pending', function ($message) {
    // $message = trans('workflow::base.validation.subject_model_invalid')
});
```

### Model Without HasWorkflow

```php
// Flow with model that doesn't use HasWorkflow
$flow = Flow::create([
    'subject_type' => \App\Models\User::class, // User doesn't use HasWorkflow
    // ...
]);

$rule = new CheckStatusInDriverRule($flow->id);
$rule->validate('status', 'pending', function ($message) {
    // $message = trans('workflow::base.validation.model_must_use_has_workflow', ['model' => User::class])
});
```

### Invalid Status Value

```php
// Valid statuses: ['pending', 'processing', 'shipped']
$rule = new CheckStatusInDriverRule($flow->id);
$rule->validate('status', 'invalid', function ($message) {
    // $message = trans('workflow::base.validation.check_status_in_driver', [
    //     'status' => 'pending, processing, shipped'
    // ])
});
```

## Testing

### Unit Test Example

```php
namespace Tests\Unit\Rules;

use App\Models\Order;
use App\Models\Flow;
use JobMetric\Flow\Rules\CheckStatusInDriverRule;
use Tests\TestCase;

class CheckStatusInDriverRuleTest extends TestCase
{
    public function test_validates_status_against_enum(): void
    {
        $flow = Flow::factory()->create([
            'subject_type' => Order::class,
        ]);

        $rule = new CheckStatusInDriverRule($flow->id);
        $failCalled = false;

        // Valid status
        $rule->validate('status', 'pending', function ($message) use (&$failCalled) {
            $failCalled = true;
        });

        $this->assertFalse($failCalled);
    }

    public function test_rejects_invalid_status(): void
    {
        $flow = Flow::factory()->create([
            'subject_type' => Order::class,
        ]);

        $rule = new CheckStatusInDriverRule($flow->id);
        $failMessage = null;

        // Invalid status
        $rule->validate('status', 'invalid_status', function ($message) use (&$failMessage) {
            $failMessage = $message;
        });

        $this->assertNotNull($failMessage);
    }

    public function test_allows_null_value(): void
    {
        $flow = Flow::factory()->create([
            'subject_type' => Order::class,
        ]);

        $rule = new CheckStatusInDriverRule($flow->id);
        $failCalled = false;

        $rule->validate('status', null, function ($message) use (&$failCalled) {
            $failCalled = true;
        });

        $this->assertFalse($failCalled);
    }
}
```

## Best Practices

1. **Always Provide Flow ID**: Ensure Flow ID is valid before creating the rule
   ```php
   // ✅ Good
   $flowId = $request->input('flow_id');
   $request->validate([
       'flow_id' => 'required|exists:flows,id',
       'status' => new CheckStatusInDriverRule($flowId),
   ]);

   // ❌ Bad
   $rule = new CheckStatusInDriverRule($request->input('flow_id')); // May be null
   ```

2. **Use with Present/Nullable**: Combine with `present` and `nullable` for optional status
   ```php
   'status' => [
       'present',
       'nullable',
       new CheckStatusInDriverRule($flowId),
   ]
   ```

3. **Handle Errors Gracefully**: Provide user-friendly error messages
   ```php
   try {
       $request->validate($rules);
   } catch (ValidationException $e) {
       return back()->withErrors($e->errors());
   }
   ```

4. **Cache Flow Lookups**: If validating multiple fields, cache the Flow instance
   ```php
   $flow = Flow::findOrFail($flowId);
   $rules = [
       'status' => new CheckStatusInDriverRule($flow->id),
       // Other rules using $flow
   ];
   ```

## Integration with FlowState Service

The rule is automatically used in `FlowState` service when creating/updating states:

```php
use JobMetric\Flow\Facades\FlowState;

// Creating a state - status is validated automatically
FlowState::store($flowId, [
    'status' => 'pending', // Validated by CheckStatusInDriverRule
    'translation' => [...],
]);
```

## Related Documentation

- [FlowState Service](/packages/laravel-flow/deep-diving/services/flow-state) - Learn about flow state management
- [HasWorkflow Trait](/packages/laravel-flow/deep-diving/has-workflow) - Learn about workflow integration
- [Flow Service](/packages/laravel-flow/deep-diving/services/flow) - Learn about flow management

