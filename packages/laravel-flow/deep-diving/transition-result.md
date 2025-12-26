---
sidebar_position: 5
sidebar_label: TransitionResult DTO
---

# TransitionResult DTO

The `TransitionResult` class is a Data Transfer Object (DTO) that represents the outcome of running workflow transitions and their associated tasks. It provides a standardized way to carry both machine-readable and human-readable data through the workflow pipeline, making it ideal for API responses, logging, and error handling.

## Namespace

```php
JobMetric\Flow\DTO\TransitionResult
```

## Overview

`TransitionResult` encapsulates:
- **Success/Failure State**: Boolean flag indicating overall success
- **Status**: Machine-readable status string (e.g., "ok", "failed")
- **Code**: Optional machine-readable code for clients or logs
- **Messages**: Human-readable informational messages
- **Errors**: Human-readable error messages
- **Data**: Arbitrary data payload for consumers (controllers, API responses)
- **Meta**: Arbitrary metadata for debugging, tracing, or internal usage

## Properties

### Protected Properties

```php
protected bool $success = true;              // Overall success flag
protected string $status = 'ok';             // Machine-readable status
protected array $messages = [];              // Informational messages
protected array $errors = [];               // Error messages
protected array $data = [];                 // Data payload
protected array $meta = [];                // Metadata payload
protected ?string $code = null;             // Optional result code
```

## Constructor

### Basic Usage

```php
use JobMetric\Flow\DTO\TransitionResult;

// Default: success=true, status='ok', code=null
$result = new TransitionResult();

// Custom success state
$result = new TransitionResult(false);

// Custom status
$result = new TransitionResult(true, 'custom_status');

// With code
$result = new TransitionResult(true, 'ok', 'CUSTOM_CODE');
```

### Constructor Parameters

- `bool $success = true`: Overall success flag
- `string $status = 'ok'`: Machine-readable status string
- `?string $code = null`: Optional machine-readable code

## Static Factory Methods

### success()

Create a successful `TransitionResult` with optional initial data.

```php
// Simple success
$result = TransitionResult::success();

// With initial data
$result = TransitionResult::success([
    'order_id' => 123,
    'status' => 'processed',
]);
```

**Returns:** `TransitionResult` instance with `success=true`, `status='ok'`

### failure()

Create a failed `TransitionResult` with optional error message and code.

```php
// Simple failure
$result = TransitionResult::failure();

// With error message
$result = TransitionResult::failure('Payment processing failed');

// With code
$result = TransitionResult::failure(null, 'PAYMENT_ERROR');

// With both message and code
$result = TransitionResult::failure('Payment processing failed', 'PAYMENT_ERROR');
```

**Returns:** `TransitionResult` instance with `success=false`, `status='failed'`

## State Management

### markSuccess()

Mark the result as successful and optionally update the status.

```php
$result = new TransitionResult(false);
$result->markSuccess(); // success=true, status='ok'

// With custom status
$result->markSuccess('completed'); // success=true, status='completed'
```

**Returns:** `$this` (fluent interface)

### markFailed()

Mark the result as failed and optionally update the status and code.

```php
$result = new TransitionResult(true);
$result->markFailed(); // success=false, status='failed'

// With custom status
$result->markFailed('error_status');

// With status and code
$result->markFailed('error_status', 'ERROR_CODE');
```

**Returns:** `$this` (fluent interface)

## Message Management

### addMessage()

Add an informational message to the result.

```php
$result = new TransitionResult();
$result->addMessage('Order processed successfully');
$result->addMessage('Email notification sent');

// Chaining
$result->addMessage('Message 1')
    ->addMessage('Message 2')
    ->addMessage('Message 3');
```

**Returns:** `$this` (fluent interface)

**Use Cases:**
- Success notifications
- Informational logs
- User-friendly messages
- Debug information

### addError()

Add an error message to the result. By default, this marks the result as failed.

```php
$result = new TransitionResult();
$result->addError('Payment gateway timeout'); // Marks as failed by default

// Add error without marking as failed
$result->addError('Warning: Low balance', false); // Keeps success state

// Chaining
$result->addError('Error 1')
    ->addError('Error 2')
    ->addError('Error 3');
```

**Parameters:**
- `string $error`: Error message
- `bool $markFailed = true`: Whether to mark result as failed

**Returns:** `$this` (fluent interface)

**Behavior:**
- When `$markFailed = true` (default): Sets `success=false` and `status='failed'`
- When `$markFailed = false`: Only adds error to collection, preserves success state

## Data Management

### setData()

Set a single data key-value pair.

```php
$result = new TransitionResult();
$result->setData('order_id', 123);
$result->setData('total', 99.99);
$result->setData('items', ['item1', 'item2']);

// Overwrites existing key
$result->setData('order_id', 456); // Replaces 123 with 456
```

**Parameters:**
- `string $key`: Data key
- `mixed $value`: Data value (any type)

**Returns:** `$this` (fluent interface)

**Supported Value Types:**
- Strings
- Integers
- Floats
- Booleans
- Arrays
- Objects
- Null

### mergeData()

Merge an array of data into the existing data payload.

```php
$result = new TransitionResult();
$result->setData('key1', 'value1');
$result->mergeData([
    'key2' => 'value2',
    'key3' => 'value3',
]);

// Existing keys are overwritten
$result->mergeData(['key1' => 'new_value']); // Replaces 'value1'
```

**Parameters:**
- `array<string, mixed> $data`: Data to merge

**Returns:** `$this` (fluent interface)

**Use Cases:**
- Merging task results
- Combining multiple data sources
- Building response payloads

## Metadata Management

### setMeta()

Set a single metadata key-value pair.

```php
$result = new TransitionResult();
$result->setMeta('execution_time', 0.5);
$result->setMeta('task_count', 3);
$result->setMeta('debug_info', ['step' => 1, 'action' => 'process']);
```

**Parameters:**
- `string $key`: Metadata key
- `mixed $value`: Metadata value (any type)

**Returns:** `$this` (fluent interface)

**Use Cases:**
- Debugging information
- Performance metrics
- Tracing data
- Internal processing details

### mergeMeta()

Merge an array of metadata into the existing metadata payload.

```php
$result = new TransitionResult();
$result->setMeta('meta1', 'value1');
$result->mergeMeta([
    'meta2' => 'value2',
    'meta3' => 'value3',
]);
```

**Parameters:**
- `array<string, mixed> $meta`: Metadata to merge

**Returns:** `$this` (fluent interface)

## Merging Results

### merge()

Merge another `TransitionResult` into the current instance.

```php
$result1 = TransitionResult::success(['key1' => 'value1']);
$result1->addMessage('Message 1');

$result2 = TransitionResult::failure('Error occurred');
$result2->addMessage('Message 2');
$result2->setData('key2', 'value2');

$result1->merge($result2);
```

**Merge Behavior:**
- **Messages**: Combined into single array
- **Errors**: Combined into single array
- **Data**: Merged (existing keys overwritten)
- **Meta**: Merged (existing keys overwritten)
- **Success**: If other result is failed, current becomes failed
- **Status**: If other result is failed, current status becomes other's status
- **Code**: If other result is failed, current code becomes other's code

**Parameters:**
- `TransitionResult $other`: Result to merge

**Returns:** `$this` (fluent interface)

**Use Cases:**
- Combining multiple task results
- Aggregating transition outcomes
- Building comprehensive responses

## Query Methods

### isSuccess()

Determine whether the result is successful.

```php
$result = TransitionResult::success();
$result->isSuccess(); // true

$result = TransitionResult::failure();
$result->isSuccess(); // false
```

**Returns:** `bool`

### hasErrors()

Determine whether the result contains any error messages.

```php
$result = new TransitionResult();
$result->hasErrors(); // false

$result->addError('Error message');
$result->hasErrors(); // true
```

**Returns:** `bool`

### getStatus()

Get the current status string.

```php
$result = new TransitionResult(true, 'custom_status');
$result->getStatus(); // 'custom_status'
```

**Returns:** `string`

### getCode()

Get the machine-readable result code, if any.

```php
$result = new TransitionResult(true, 'ok', 'CUSTOM_CODE');
$result->getCode(); // 'CUSTOM_CODE'

$result = new TransitionResult();
$result->getCode(); // null
```

**Returns:** `?string`

### getMessages()

Get all informational messages.

```php
$result = new TransitionResult();
$result->addMessage('Message 1');
$result->addMessage('Message 2');

$messages = $result->getMessages(); // ['Message 1', 'Message 2']
```

**Returns:** `array<int, string>`

### getErrors()

Get all error messages.

```php
$result = new TransitionResult();
$result->addError('Error 1');
$result->addError('Error 2');

$errors = $result->getErrors(); // ['Error 1', 'Error 2']
```

**Returns:** `array<int, string>`

### getData()

Get the data payload.

```php
$result = TransitionResult::success(['key' => 'value']);
$data = $result->getData(); // ['key' => 'value']
```

**Returns:** `array<string, mixed>`

### getMeta()

Get the metadata payload.

```php
$result = new TransitionResult();
$result->setMeta('key', 'value');
$meta = $result->getMeta(); // ['key' => 'value']
```

**Returns:** `array<string, mixed>`

## Array Conversion

### toArray()

Convert the result into a plain array structure suitable for responses.

```php
$result = TransitionResult::success(['order_id' => 123]);
$result->addMessage('Order processed');
$result->setMeta('execution_time', 0.5);

$array = $result->toArray();
```

**Returns:**
```php
[
    'success' => true,
    'status' => 'ok',
    'code' => null,
    'messages' => ['Order processed'],
    'errors' => [],
    'data' => ['order_id' => 123],
    'meta' => ['execution_time' => 0.5],
]
```

**Use Cases:**
- API responses
- JSON serialization
- Logging
- Frontend consumption

## Complete Examples

### Example 1: Successful Transition

```php
use JobMetric\Flow\DTO\TransitionResult;

$result = TransitionResult::success([
    'order_id' => 123,
    'new_status' => 'processing',
]);

$result->addMessage('Order transition completed successfully')
    ->addMessage('Email notification sent')
    ->setMeta('execution_time', 0.25)
    ->setMeta('tasks_executed', 3);

// Use in API response
return response()->json($result->toArray());
```

**Output:**
```json
{
    "success": true,
    "status": "ok",
    "code": null,
    "messages": [
        "Order transition completed successfully",
        "Email notification sent"
    ],
    "errors": [],
    "data": {
        "order_id": 123,
        "new_status": "processing"
    },
    "meta": {
        "execution_time": 0.25,
        "tasks_executed": 3
    }
}
```

### Example 2: Failed Transition

```php
$result = TransitionResult::failure('Payment validation failed', 'PAYMENT_ERROR');

$result->addError('Invalid payment method')
    ->addError('Insufficient funds')
    ->setData('order_id', 123)
    ->setMeta('validation_attempts', 3);

// Check result
if (!$result->isSuccess()) {
    logger()->error('Transition failed', $result->toArray());
    return response()->json($result->toArray(), 400);
}
```

**Output:**
```json
{
    "success": false,
    "status": "failed",
    "code": "PAYMENT_ERROR",
    "messages": [],
    "errors": [
        "Payment validation failed",
        "Invalid payment method",
        "Insufficient funds"
    ],
    "data": {
        "order_id": 123
    },
    "meta": {
        "validation_attempts": 3
    }
}
```

### Example 3: Merging Multiple Results

```php
// Task 1 result
$task1Result = TransitionResult::success(['task1' => 'completed']);
$task1Result->addMessage('Task 1 executed successfully');

// Task 2 result
$task2Result = TransitionResult::success(['task2' => 'completed']);
$task2Result->addMessage('Task 2 executed successfully');

// Task 3 result (failed)
$task3Result = TransitionResult::failure('Task 3 failed', 'TASK_ERROR');
$task3Result->addError('Database connection timeout');

// Merge all results
$finalResult = TransitionResult::success();
$finalResult->merge($task1Result)
    ->merge($task2Result)
    ->merge($task3Result);

// Final result is failed because task3 failed
$finalResult->isSuccess(); // false
$finalResult->getMessages(); // ['Task 1 executed successfully', 'Task 2 executed successfully']
$finalResult->getErrors(); // ['Task 3 failed', 'Database connection timeout']
$finalResult->getData(); // ['task1' => 'completed', 'task2' => 'completed']
```

### Example 4: Conditional Error Handling

```php
$result = TransitionResult::success();

try {
    // Process payment
    $paymentResult = processPayment($order);
    
    if (!$paymentResult->success) {
        $result->addError('Payment processing failed', true); // Marks as failed
    } else {
        $result->addMessage('Payment processed successfully')
            ->mergeData(['payment_id' => $paymentResult->id]);
    }
} catch (\Exception $e) {
    $result->addError($e->getMessage(), true)
        ->setMeta('exception', get_class($e))
        ->setMeta('trace', $e->getTraceAsString());
}

return $result;
```

### Example 5: Building Response with Warnings

```php
$result = TransitionResult::success(['order_id' => 123]);

// Add warnings without marking as failed
$result->addError('Low inventory warning', false)
    ->addError('Shipping delay expected', false)
    ->addMessage('Order created successfully');

// Result is still successful but has warnings
$result->isSuccess(); // true
$result->hasErrors(); // true (but doesn't affect success)
```

### Example 6: Using in Action Tasks

```php
use JobMetric\Flow\Contracts\AbstractActionTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\DTO\TransitionResult;

class SendEmailActionTask extends AbstractActionTask
{
    protected function handle(FlowTaskContext $context): void
    {
        $result = $context->result();
        $order = $context->subject();
        
        try {
            Mail::to($order->customer_email)->send(new OrderStatusChanged($order));
            
            $result->addMessage('Email notification sent successfully')
                ->setMeta('email_sent_at', now()->toIso8601String());
        } catch (\Exception $e) {
            $result->addError('Failed to send email: ' . $e->getMessage(), false)
                ->setMeta('email_error', $e->getMessage());
        }
    }
}
```

## Method Chaining

All methods that modify the result return `$this`, enabling fluent method chaining:

```php
$result = TransitionResult::success()
    ->addMessage('Step 1 completed')
    ->addMessage('Step 2 completed')
    ->setData('order_id', 123)
    ->setData('status', 'processing')
    ->mergeData(['additional' => 'data'])
    ->setMeta('execution_time', 0.5)
    ->setMeta('tasks_count', 3)
    ->mergeMeta(['debug' => true]);
```

## Best Practices

### 1. Use Static Factory Methods

Prefer static factory methods for clarity:

```php
// ✅ Good
$result = TransitionResult::success(['data' => 'value']);
$result = TransitionResult::failure('Error message', 'ERROR_CODE');

// ⚠️ Acceptable
$result = new TransitionResult(true, 'ok');
```

### 2. Distinguish Between Data and Meta

- **Data**: Information for API consumers (frontend, external systems)
- **Meta**: Internal information (debugging, tracing, performance)

```php
// ✅ Good
$result->setData('order_id', 123); // For API response
$result->setMeta('execution_time', 0.5); // For debugging

// ❌ Bad
$result->setData('debug_trace', $trace); // Should be meta
```

### 3. Use Appropriate Error Handling

```php
// ✅ Good: Critical errors mark as failed
$result->addError('Payment failed', true);

// ✅ Good: Warnings don't mark as failed
$result->addError('Low inventory', false);

// ❌ Bad: All errors mark as failed
$result->addError('Minor warning', true);
```

### 4. Merge Results Efficiently

When combining multiple task results:

```php
// ✅ Good: Merge in sequence
$finalResult = TransitionResult::success();
foreach ($taskResults as $taskResult) {
    $finalResult->merge($taskResult);
}

// ❌ Bad: Create new result for each merge
$finalResult = new TransitionResult();
$finalResult = $finalResult->merge($task1);
$finalResult = $finalResult->merge($task2);
```

### 5. Use Codes for Machine Readability

```php
// ✅ Good: Use codes for programmatic handling
$result = TransitionResult::failure('Payment failed', 'PAYMENT_ERROR');

// Frontend can check code
if ($result->getCode() === 'PAYMENT_ERROR') {
    // Handle payment error specifically
}

// ❌ Bad: Only use messages
$result = TransitionResult::failure('Payment failed');
```

### 6. Keep Messages User-Friendly

```php
// ✅ Good: User-friendly messages
$result->addMessage('Your order has been processed successfully');

// ❌ Bad: Technical messages
$result->addMessage('HTTP 200 OK - OrderService::process() completed');
```

## Integration with FlowTransition

`TransitionResult` is automatically created and passed to tasks during transition execution:

```php
use JobMetric\Flow\Facades\FlowTransition;

$result = FlowTransition::runner('process_order', $order);

// Result is a TransitionResult instance
if ($result->isSuccess()) {
    // Handle success
    $data = $result->getData();
    $messages = $result->getMessages();
} else {
    // Handle failure
    $errors = $result->getErrors();
    $code = $result->getCode();
}
```

## Related Documentation

- [FlowTransition Service](/packages/laravel-flow/deep-diving/services/flow-transition) - Learn about transition execution
- [FlowTask Service](/packages/laravel-flow/deep-diving/services/flow-task) - Learn about task management
- [FlowTaskContext](/packages/laravel-flow/deep-diving/flow-task-context) - Learn about task context

