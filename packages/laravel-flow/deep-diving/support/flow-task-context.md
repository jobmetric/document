---
sidebar_position: 4
sidebar_label: FlowTaskContext
---

# FlowTaskContext

The `FlowTaskContext` class provides runtime context for flow task execution. It carries all relevant data needed by tasks during transition execution, including the subject model, transition result, payload, user, and task configuration.

## Namespace

```php
JobMetric\Flow\Support\FlowTaskContext
```

## Overview

The context provides access to:
- **Subject**: The main model instance the flow is operating on
- **Result**: The `TransitionResult` for collecting messages, errors, and data
- **Payload**: Arbitrary input data from form or API request
- **User**: The authenticated user who triggered the transition
- **Config**: Cached task configuration (avoiding database calls)

## Constructor

### Basic Usage

```php
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\DTO\TransitionResult;

$subject = Order::find(1);
$result = TransitionResult::success();
$payload = ['reason' => 'Customer request'];
$user = auth()->user();

$context = new FlowTaskContext($subject, $result, $payload, $user);
```

### Parameters

- `Model $subject`: The main model instance
- `TransitionResult $result`: The transition result object
- `array $payload = []`: Input payload (optional)
- `Authenticatable|null $user = null`: Authenticated user (optional)

## Accessing Context Data

### subject()

Get the main subject model:

```php
$order = $context->subject();
// Returns: Order model instance
```

**Returns:** `Model` - The model the flow is operating on

### result()

Get the transition result:

```php
$result = $context->result();
$result->addMessage('Task completed');
$result->setData('key', 'value');
```

**Returns:** `TransitionResult` - The result object for this transition

### payload()

Get the input payload:

```php
$payload = $context->payload();
$reason = $payload['reason'] ?? null;
```

**Returns:** `array<string, mixed>` - Input payload from request

### user()

Get the authenticated user:

```php
$user = $context->user();
if ($user) {
    $userId = $user->id;
}
```

**Returns:** `Authenticatable|null` - The user who triggered the transition

### config()

Get the task configuration:

```php
$config = $context->config();
$emailTo = $config['email_to'] ?? null;
```

**Returns:** `array<string, mixed>` - Task configuration (empty array if not set)

**Note:** No database calls are performed; returns cached configuration

### replaceConfig()

Replace the in-memory configuration:

```php
$context->replaceConfig([
    'email_to' => 'user@example.com',
    'template' => 'order-status',
]);
```

**Use Cases:**
- Inject configuration from outside
- Override configuration for testing
- Avoid database calls

**Returns:** `$this` (fluent interface)

## Understanding the Context Flow

### How Context is Created and Passed

When a transition is executed, `FlowTransition` service automatically creates a `FlowTaskContext` and passes it to each task:

```php
// Inside FlowTransition::runner()
$transitionResult = TransitionResult::success();
$context = new FlowTaskContext(
    $subject,           // The model (Order, Invoice, etc.)
    $transitionResult,  // Shared result object
    $payload,           // Request data
    $user               // Authenticated user
);

// Tasks receive the same context instance
$restrictionTask->restriction($context);  // First: Restriction checks
$validationTask->rules($context);          // Second: Validation
$actionTask->handle($context);             // Third: Actions
```

**Key Point:** All tasks in a transition share the **same** `TransitionResult` object. This means:
- Messages/errors from one task are visible to others
- Data set by one task can be read by subsequent tasks
- The final result aggregates all task outcomes

## Complete Examples

### Example 1: Advanced Action Task - Order Processing

A comprehensive action task that demonstrates using all context components:

```php
namespace App\Flows\Order;

use App\Mail\OrderStatusChanged;
use App\Notifications\OrderProcessed;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use JobMetric\Flow\Contracts\AbstractActionTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\FlowTaskDefinition;
use JobMetric\Form\FormBuilder;

class ProcessOrderActionTask extends AbstractActionTask
{
    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.process_order.title',
            description: 'Processes order and sends notifications',
            icon: null,
            tags: null,
        );
    }

    public function form(): FormBuilder
    {
        return (new FormBuilder)
            ->hiddenCustomField('send_email', 'boolean', true, 'Send email notification')
            ->hiddenCustomField('send_sms', 'boolean', false, 'Send SMS notification')
            ->hiddenCustomField('email_template', 'string', 'order-status', 'Email template name')
            ->hiddenCustomField('queue_notifications', 'boolean', true, 'Queue notifications')
            ->hiddenCustomField('log_activity', 'boolean', true, 'Log activity');
    }

    protected function handle(FlowTaskContext $context): void
    {
        // Get all context components
        $order = $context->subject();        // Order model
        $result = $context->result();       // Shared TransitionResult
        $config = $context->config();        // Task configuration
        $user = $context->user();            // User who triggered transition
        $payload = $context->payload();      // Request payload

        // Extract configuration with defaults
        $sendEmail = $config['send_email'] ?? true;
        $sendSms = $config['send_sms'] ?? false;
        $emailTemplate = $config['email_template'] ?? 'order-status';
        $queueNotifications = $config['queue_notifications'] ?? true;
        $logActivity = $config['log_activity'] ?? true;

        // Extract payload data
        $reason = $payload['reason'] ?? 'Status changed';
        $notes = $payload['notes'] ?? '';
        $metadata = $payload['metadata'] ?? [];

        try {
            DB::beginTransaction();

            // 1. Update order with payload data
            if (isset($payload['notes'])) {
                $order->notes = $notes;
                $order->save();
            }

            // 2. Log activity if enabled
            if ($logActivity) {
                $this->logActivity($order, $user, $reason, $result);
            }

            // 3. Send email notification
            if ($sendEmail) {
                $this->sendEmailNotification($order, $user, $emailTemplate, $result);
            }

            // 4. Send SMS notification
            if ($sendSms) {
                $this->sendSmsNotification($order, $user, $result);
            }

            // 5. Queue additional notifications
            if ($queueNotifications) {
                $this->queueNotifications($order, $user, $result);
            }

            // 6. Update result with success information
            $result->addMessage('Order processed successfully')
                ->addMessage('Notifications sent')
                ->setData('order_id', $order->id)
                ->setData('new_status', $order->status)
                ->setData('processed_at', now()->toIso8601String())
                ->setMeta('email_sent', $sendEmail)
                ->setMeta('sms_sent', $sendSms)
                ->setMeta('execution_time', microtime(true) - LARAVEL_START);

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();

            // Add error to shared result
            $result->addError('Failed to process order: ' . $e->getMessage())
                ->setMeta('error_class', get_class($e))
                ->setMeta('error_trace', $e->getTraceAsString());

            // Log error
            Log::error('Order processing failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'user_id' => $user?->id,
            ]);
        }
    }

    protected function logActivity($order, $user, $reason, $result): void
    {
        activity()
            ->performedOn($order)
            ->causedBy($user)
            ->withProperties([
                'reason' => $reason,
                'old_status' => $order->getOriginal('status'),
                'new_status' => $order->status,
            ])
            ->log('Order status changed');

        $result->addMessage('Activity logged')
            ->setMeta('activity_logged', true);
    }

    protected function sendEmailNotification($order, $user, $template, $result): void
    {
        try {
            $recipient = $user?->email ?? $order->customer_email;

            if ($queueNotifications ?? true) {
                Mail::to($recipient)->queue(new OrderStatusChanged($order, $template));
            } else {
                Mail::to($recipient)->send(new OrderStatusChanged($order, $template));
            }

            $result->addMessage("Email notification sent to {$recipient}")
                ->setMeta('email_recipient', $recipient)
                ->setMeta('email_template', $template);

        } catch (\Exception $e) {
            // Don't fail the entire task, just log the error
            $result->addError('Email notification failed: ' . $e->getMessage(), false)
                ->setMeta('email_error', $e->getMessage());
        }
    }

    protected function sendSmsNotification($order, $user, $result): void
    {
        try {
            $phone = $user?->phone ?? $order->customer_phone;

            if ($phone) {
                // Send SMS logic here
                $result->addMessage("SMS notification sent to {$phone}")
                    ->setMeta('sms_sent_to', $phone);
            }

        } catch (\Exception $e) {
            $result->addError('SMS notification failed: ' . $e->getMessage(), false);
        }
    }

    protected function queueNotifications($order, $user, $result): void
    {
        try {
            // Queue additional notifications
            if ($user) {
                $user->notify(new OrderProcessed($order));
            }

            $result->setMeta('notifications_queued', true);

        } catch (\Exception $e) {
            $result->addError('Failed to queue notifications: ' . $e->getMessage(), false);
        }
    }
}
```

**Key Points:**
- Uses all context components (subject, result, config, user, payload)
- Reads configuration from `config()`
- Extracts data from `payload()`
- Updates shared `result()` object
- Handles errors gracefully without breaking the transition
- Uses user information for logging and notifications

### Example 2: Advanced Restriction Task - Multi-Condition Order Cancellation

A comprehensive restriction task that checks multiple conditions using all context components:

```php
namespace App\Flows\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use JobMetric\Flow\Contracts\AbstractRestrictionTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\FlowTaskDefinition;
use JobMetric\Flow\Support\RestrictionResult;
use JobMetric\Form\FormBuilder;

class RestrictOrderCancellationRestrictionTask extends AbstractRestrictionTask
{
    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.restrict_cancellation.title',
            description: 'Restricts order cancellation based on multiple conditions',
            icon: null,
            tags: null,
        );
    }

    public function form(): FormBuilder
    {
        return (new FormBuilder)
            ->hiddenCustomField('allow_cancellation_after_shipping', 'boolean', false, 'Allow cancellation after shipping')
            ->hiddenCustomField('max_cancellation_hours', 'integer', 24, 'Maximum hours after creation to allow cancellation')
            ->hiddenCustomField('require_cancellation_reason', 'boolean', true, 'Require cancellation reason')
            ->hiddenCustomField('check_payment_status', 'boolean', true, 'Check payment status')
            ->hiddenCustomField('check_inventory', 'boolean', true, 'Check inventory impact');
    }

    public function restriction(FlowTaskContext $context): RestrictionResult
    {
        // Get all context components
        $order = $context->subject();
        $user = $context->user();
        $payload = $context->payload();
        $config = $context->config();
        $result = $context->result(); // Can add messages for debugging

        // Extract configuration
        $allowAfterShipping = $config['allow_cancellation_after_shipping'] ?? false;
        $maxCancellationHours = $config['max_cancellation_hours'] ?? 24;
        $requireReason = $config['require_cancellation_reason'] ?? true;
        $checkPayment = $config['check_payment_status'] ?? true;
        $checkInventory = $config['check_inventory'] ?? true;

        // 1. Check user authentication
        if (!$user) {
            $result->addMessage('Restriction check: No authenticated user');
            return RestrictionResult::deny(
                'USER_NOT_AUTHENTICATED',
                'You must be logged in to cancel orders'
            );
        }

        // 2. Check user permission
        if (!$user->can('cancel', $order)) {
            $result->addMessage("Restriction check: User {$user->id} lacks cancel permission");
            return RestrictionResult::deny(
                'PERMISSION_DENIED',
                'You do not have permission to cancel this order'
            );
        }

        // 3. Check order ownership (if applicable)
        if ($order->user_id !== $user->id && !$user->hasRole('admin')) {
            $result->addMessage("Restriction check: User {$user->id} does not own order {$order->id}");
            return RestrictionResult::deny(
                'ORDER_OWNERSHIP_MISMATCH',
                'You can only cancel your own orders'
            );
        }

        // 4. Check order status
        if ($order->status === 'shipped' && !$allowAfterShipping) {
            $result->addMessage("Restriction check: Order {$order->id} is shipped");
            return RestrictionResult::deny(
                'ORDER_SHIPPED',
                'Cannot cancel shipped orders'
            );
        }

        if ($order->status === 'delivered') {
            $result->addMessage("Restriction check: Order {$order->id} is delivered");
            return RestrictionResult::deny(
                'ORDER_DELIVERED',
                'Cannot cancel delivered orders'
            );
        }

        if ($order->status === 'cancelled') {
            $result->addMessage("Restriction check: Order {$order->id} is already cancelled");
            return RestrictionResult::deny(
                'ORDER_ALREADY_CANCELLED',
                'Order is already cancelled'
            );
        }

        // 5. Check time limit
        $hoursSinceCreated = $order->created_at->diffInHours(now());
        if ($hoursSinceCreated > $maxCancellationHours) {
            $result->addMessage("Restriction check: Order {$order->id} exceeds time limit ({$hoursSinceCreated}h > {$maxCancellationHours}h)");
            return RestrictionResult::deny(
                'TIME_LIMIT_EXCEEDED',
                "Orders can only be cancelled within {$maxCancellationHours} hours of creation"
            );
        }

        // 6. Check cancellation reason (from payload)
        if ($requireReason && empty($payload['reason'])) {
            $result->addMessage("Restriction check: Cancellation reason required but not provided");
            return RestrictionResult::deny(
                'REASON_REQUIRED',
                'Cancellation reason is required'
            );
        }

        // 7. Check payment status
        if ($checkPayment) {
            if ($order->payment_status === 'refunded') {
                return RestrictionResult::deny(
                    'PAYMENT_ALREADY_REFUNDED',
                    'Payment has already been refunded'
                );
            }

            if ($order->payment_status === 'pending') {
                // Allow cancellation if payment not yet processed
                $result->addMessage("Restriction check: Payment pending, cancellation allowed");
            }
        }

        // 8. Check inventory impact (from payload or config)
        if ($checkInventory) {
            $restockInventory = $payload['restock_inventory'] ?? $config['restock_inventory'] ?? true;
            
            if ($restockInventory) {
                // Check if inventory can be restocked
                $canRestock = $this->canRestockInventory($order);
                if (!$canRestock) {
                    return RestrictionResult::deny(
                        'INVENTORY_RESTOCK_FAILED',
                        'Cannot cancel order: inventory cannot be restocked'
                    );
                }
            }
        }

        // 9. Check for active disputes (custom business logic)
        if ($this->hasActiveDispute($order)) {
            $result->addMessage("Restriction check: Order {$order->id} has active dispute");
            return RestrictionResult::deny(
                'ACTIVE_DISPUTE',
                'Cannot cancel order with active dispute'
            );
        }

        // 10. Check rate limiting (prevent abuse)
        $cancellationCount = $this->getRecentCancellationCount($user);
        if ($cancellationCount >= 5) {
            return RestrictionResult::deny(
                'RATE_LIMIT_EXCEEDED',
                'Too many cancellations. Please contact support.'
            );
        }

        // All checks passed
        $result->addMessage("Restriction check: All conditions met for order {$order->id}")
            ->setMeta('cancellation_allowed', true)
            ->setMeta('time_since_creation', $hoursSinceCreated)
            ->setMeta('user_id', $user->id);

        return RestrictionResult::allow();
    }

    protected function canRestockInventory(Order $order): bool
    {
        // Check if inventory items can be restocked
        foreach ($order->items as $item) {
            if (!$item->product->canRestock()) {
                return false;
            }
        }
        return true;
    }

    protected function hasActiveDispute(Order $order): bool
    {
        return $order->disputes()
            ->where('status', 'open')
            ->exists();
    }

    protected function getRecentCancellationCount(User $user): int
    {
        $cacheKey = "user_cancellations_{$user->id}";
        
        return Cache::remember($cacheKey, 3600, function () use ($user) {
            return $user->orders()
                ->where('status', 'cancelled')
                ->where('updated_at', '>=', now()->subDays(30))
                ->count();
        });
    }
}
```

**Key Points:**
- Uses all context components for comprehensive checks
- Reads configuration to make restrictions configurable
- Uses payload data for dynamic checks
- Adds messages to result for debugging
- Implements complex business logic
- Handles edge cases and rate limiting

### Example 3: Advanced Validation Task - Dynamic Payment Validation

A comprehensive validation task that demonstrates dynamic rule generation based on context:

```php
namespace App\Flows\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use JobMetric\Flow\Contracts\AbstractValidationTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\FlowTaskDefinition;
use JobMetric\Form\FormBuilder;

class ValidatePaymentValidationTask extends AbstractValidationTask
{
    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.validate_payment.title',
            description: 'Validates payment information before processing',
            icon: null,
            tags: null,
        );
    }

    public function form(): FormBuilder
    {
        return (new FormBuilder)
            ->hiddenCustomField('require_cvv', 'boolean', true, 'Require CVV for credit cards')
            ->hiddenCustomField('require_billing_address', 'boolean', true, 'Require billing address')
            ->hiddenCustomField('min_amount', 'decimal', 0, 'Minimum payment amount')
            ->hiddenCustomField('max_amount', 'decimal', null, 'Maximum payment amount')
            ->hiddenCustomField('allowed_payment_methods', 'array', ['credit_card', 'paypal'], 'Allowed payment methods');
    }

    public function rules(FlowTaskContext $context): array
    {
        // Get all context components
        $order = $context->subject();
        $user = $context->user();
        $payload = $context->payload();
        $config = $context->config();

        // Extract configuration
        $requireCvv = $config['require_cvv'] ?? true;
        $requireBillingAddress = $config['require_billing_address'] ?? true;
        $minAmount = $config['min_amount'] ?? 0;
        $maxAmount = $config['max_amount'] ?? $order->total;
        $allowedMethods = $config['allowed_payment_methods'] ?? ['credit_card', 'paypal'];

        // Base rules
        $rules = [
            'payment_method' => [
                'required',
                'string',
                'in:' . implode(',', $allowedMethods),
            ],
            'amount' => [
                'required',
                'numeric',
                "min:{$minAmount}",
                "max:{$maxAmount}",
            ],
        ];

        // Dynamic rules based on payment method
        $paymentMethod = $payload['payment_method'] ?? null;

        if ($paymentMethod === 'credit_card') {
            $rules['card_number'] = [
                'required',
                'string',
                'regex:/^[0-9]{13,19}$/',
            ];

            $rules['card_holder_name'] = [
                'required',
                'string',
                'max:255',
            ];

            $rules['expiry_month'] = [
                'required',
                'integer',
                'min:1',
                'max:12',
            ];

            $rules['expiry_year'] = [
                'required',
                'integer',
                'min:' . date('Y'),
                'max:' . (date('Y') + 10),
            ];

            if ($requireCvv) {
                $rules['cvv'] = [
                    'required',
                    'string',
                    'regex:/^[0-9]{3,4}$/',
                ];
            }

            if ($requireBillingAddress) {
                $rules['billing_address'] = 'required|string|max:500';
                $rules['billing_city'] = 'required|string|max:100';
                $rules['billing_country'] = 'required|string|size:2';
                $rules['billing_postal_code'] = 'required|string|max:20';
            }
        }

        if ($paymentMethod === 'paypal') {
            $rules['paypal_email'] = [
                'required',
                'email',
            ];

            // Verify PayPal account exists
            $rules['paypal_email'][] = function ($attribute, $value, $fail) use ($user) {
                if (!$this->isValidPayPalAccount($value, $user)) {
                    $fail('The PayPal account is not valid or not linked to your account.');
                }
            };
        }

        // Dynamic amount validation based on order
        $rules['amount'][] = function ($attribute, $value, $fail) use ($order, $user) {
            // Check if amount matches order total (with tolerance for fees)
            $tolerance = 0.01; // 1 cent tolerance
            if (abs($value - $order->total) > $tolerance) {
                $fail("Payment amount must match order total of {$order->total}");
            }

            // Check if user has sufficient balance (for wallet payments)
            if ($order->payment_method === 'wallet' && $user) {
                if ($user->wallet_balance < $value) {
                    $fail('Insufficient wallet balance');
                }
            }
        };

        // Currency validation
        if (isset($payload['currency'])) {
            $rules['currency'] = [
                'required',
                'string',
                'in:' . implode(',', $order->supported_currencies ?? ['USD']),
            ];
        }

        return $rules;
    }

    public function messages(FlowTaskContext $context): array
    {
        $config = $context->config();
        $order = $context->subject();

        return [
            'payment_method.required' => 'Payment method is required',
            'payment_method.in' => 'Selected payment method is not allowed',
            'amount.required' => 'Payment amount is required',
            'amount.numeric' => 'Payment amount must be a number',
            'amount.min' => "Payment amount must be at least {$config['min_amount']}",
            'amount.max' => "Payment amount cannot exceed {$order->total}",
            'card_number.required' => 'Card number is required',
            'card_number.regex' => 'Card number format is invalid',
            'cvv.required' => 'CVV is required for credit card payments',
            'cvv.regex' => 'CVV must be 3 or 4 digits',
            'paypal_email.required' => 'PayPal email is required',
            'paypal_email.email' => 'PayPal email must be a valid email address',
        ];
    }

    public function attributes(FlowTaskContext $context): array
    {
        return [
            'payment_method' => 'payment method',
            'amount' => 'payment amount',
            'card_number' => 'card number',
            'card_holder_name' => 'cardholder name',
            'expiry_month' => 'expiry month',
            'expiry_year' => 'expiry year',
            'cvv' => 'CVV',
            'paypal_email' => 'PayPal email',
            'billing_address' => 'billing address',
        ];
    }

    protected function isValidPayPalAccount(string $email, ?User $user): bool
    {
        if (!$user) {
            return false;
        }

        // Check if PayPal account is linked to user
        return $user->paypalAccounts()
            ->where('email', $email)
            ->where('verified', true)
            ->exists();
    }
}
```

**Key Points:**
- Dynamic rule generation based on payment method
- Uses configuration to make validation flexible
- Uses subject (order) to get context-specific rules
- Custom validation closures for complex logic
- Custom messages and attributes for better UX

### Example 4: Complex Payload Processing - Order Status Update

Demonstrates comprehensive payload processing with validation and transformation:

```php
namespace App\Flows\Order;

use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use JobMetric\Flow\Contracts\AbstractActionTask;
use JobMetric\Flow\Support\FlowTaskContext;

class UpdateOrderStatusActionTask extends AbstractActionTask
{
    protected function handle(FlowTaskContext $context): void
    {
        $order = $context->subject();
        $result = $context->result();
        $payload = $context->payload();
        $user = $context->user();

        // Extract and validate payload structure
        $newStatus = $payload['status'] ?? null;
        $reason = $payload['reason'] ?? 'Status updated';
        $notes = $payload['notes'] ?? '';
        $metadata = $payload['metadata'] ?? [];
        $notifyCustomer = $payload['notify_customer'] ?? true;
        $updateInventory = $payload['update_inventory'] ?? true;
        $sendEmail = $payload['send_email'] ?? true;

        // Validate payload structure
        $validator = Validator::make($payload, [
            'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
            'reason' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'metadata' => 'nullable|array',
            'notify_customer' => 'boolean',
            'update_inventory' => 'boolean',
        ]);

        if ($validator->fails()) {
            $result->addError('Invalid payload: ' . $validator->errors()->first());
            return;
        }

        // Store old status for audit
        $oldStatus = $order->status;

        try {
            DB::beginTransaction();

            // Update order status
            $order->status = $newStatus;
            $order->status_changed_at = now();
            $order->status_changed_by = $user?->id;

            // Update notes if provided
            if (!empty($notes)) {
                $order->notes = ($order->notes ? $order->notes . "\n\n" : '') . 
                    now()->format('Y-m-d H:i:s') . " - {$notes}";
            }

            // Store metadata
            if (!empty($metadata)) {
                $existingMetadata = $order->metadata ?? [];
                $order->metadata = array_merge($existingMetadata, $metadata);
            }

            $order->save();

            // Update inventory if needed
            if ($updateInventory && $newStatus === 'cancelled') {
                $this->restockInventory($order, $result);
            }

            // Send notifications
            if ($notifyCustomer && $sendEmail) {
                $this->sendStatusUpdateEmail($order, $user, $reason, $result);
            }

            // Log status change
            $this->logStatusChange($order, $oldStatus, $newStatus, $user, $reason, $result);

            // Update result with complete information
            $result->addMessage("Order status updated from {$oldStatus} to {$newStatus}")
                ->addMessage("Reason: {$reason}")
                ->setData('order_id', $order->id)
                ->setData('old_status', $oldStatus)
                ->setData('new_status', $newStatus)
                ->setData('status_changed_at', $order->status_changed_at->toIso8601String())
                ->setData('status_changed_by', $user?->id)
                ->setMeta('inventory_updated', $updateInventory)
                ->setMeta('customer_notified', $notifyCustomer && $sendEmail)
                ->setMeta('metadata', $metadata);

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            $result->addError('Failed to update order status: ' . $e->getMessage());
        }
    }

    protected function restockInventory(Order $order, $result): void
    {
        foreach ($order->items as $item) {
            $item->product->increment('stock', $item->quantity);
            $result->addMessage("Restocked {$item->quantity} units of {$item->product->name}");
        }
    }

    protected function sendStatusUpdateEmail(Order $order, $user, $reason, $result): void
    {
        // Email sending logic
        $result->addMessage('Status update email sent');
    }

    protected function logStatusChange($order, $oldStatus, $newStatus, $user, $reason, $result): void
    {
        activity()
            ->performedOn($order)
            ->causedBy($user)
            ->withProperties([
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'reason' => $reason,
            ])
            ->log('Order status changed');

        $result->setMeta('activity_logged', true);
    }
}
```

**Key Points:**
- Comprehensive payload extraction with defaults
- Payload validation before processing
- Uses payload data to control task behavior
- Stores payload data in result for tracking
- Handles nested payload structures

### Example 5: Advanced User Context Usage - Audit and Authorization

Demonstrates comprehensive user context usage for audit trails, authorization, and personalization:

```php
namespace App\Flows\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use JobMetric\Flow\Contracts\AbstractActionTask;
use JobMetric\Flow\Support\FlowTaskContext;

class AuditOrderActionTask extends AbstractActionTask
{
    protected function handle(FlowTaskContext $context): void
    {
        $order = $context->subject();
        $user = $context->user();
        $result = $context->result();
        $payload = $context->payload();

        // Always check if user exists
        if (!$user) {
            $result->addError('User context is required for audit logging');
            return;
        }

        // 1. User-based audit logging
        $this->logUserAction($order, $user, $payload, $result);

        // 2. User permission verification
        $this->verifyUserPermissions($order, $user, $result);

        // 3. User-specific notifications
        $this->sendUserNotifications($order, $user, $result);

        // 4. User preference handling
        $this->applyUserPreferences($order, $user, $payload, $result);

        // 5. User activity tracking
        $this->trackUserActivity($order, $user, $result);

        // 6. User-based rate limiting
        $this->checkUserRateLimit($user, $result);
    }

    protected function logUserAction(Order $order, User $user, array $payload, $result): void
    {
        // Comprehensive audit log
        $auditData = [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'user_name' => $user->name,
            'user_roles' => $user->roles->pluck('name')->toArray(),
            'order_id' => $order->id,
            'action' => $payload['action'] ?? 'unknown',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ];

        // Log to database
        DB::table('audit_logs')->insert($auditData);

        // Log to file
        Log::info('Order action performed', $auditData);

        // Store in result
        $result->setMeta('audit_logged', true)
            ->setMeta('performed_by', $user->id)
            ->setMeta('performed_by_email', $user->email)
            ->setData('audit_id', DB::getPdo()->lastInsertId());
    }

    protected function verifyUserPermissions(Order $order, User $user, $result): void
    {
        // Check ownership
        if ($order->user_id !== $user->id && !$user->hasRole('admin')) {
            $result->addError('User does not have permission to perform this action');
            return;
        }

        // Check role-based permissions
        $requiredRole = $result->getData()['required_role'] ?? null;
        if ($requiredRole && !$user->hasRole($requiredRole)) {
            $result->addError("User must have {$requiredRole} role");
            return;
        }

        $result->addMessage("User {$user->id} has required permissions")
            ->setMeta('permission_verified', true);
    }

    protected function sendUserNotifications(Order $order, User $user, $result): void
    {
        // Get user notification preferences
        $preferences = $user->notificationPreferences ?? [];

        // Email notification
        if ($preferences['email'] ?? true) {
            Mail::to($user->email)->send(new OrderStatusChanged($order));
            $result->addMessage("Email sent to {$user->email}");
        }

        // SMS notification
        if (($preferences['sms'] ?? false) && $user->phone) {
            // Send SMS
            $result->addMessage("SMS sent to {$user->phone}");
        }

        // In-app notification
        $user->notify(new OrderStatusChanged($order));
        $result->addMessage("In-app notification sent");

        $result->setMeta('notifications_sent', true)
            ->setMeta('user_notification_preferences', $preferences);
    }

    protected function applyUserPreferences(Order $order, User $user, array $payload, $result): void
    {
        // Apply user's language preference
        $userLanguage = $user->language ?? 'en';
        app()->setLocale($userLanguage);

        // Apply user's timezone
        $userTimezone = $user->timezone ?? 'UTC';
        $result->setMeta('user_timezone', $userTimezone);

        // Apply user's currency preference
        $userCurrency = $user->currency ?? 'USD';
        $result->setMeta('user_currency', $userCurrency);

        // Store user preferences in result
        $result->setData('applied_language', $userLanguage)
            ->setData('applied_timezone', $userTimezone)
            ->setData('applied_currency', $userCurrency);
    }

    protected function trackUserActivity(Order $order, User $user, $result): void
    {
        // Track user activity for analytics
        $activityKey = "user_activity_{$user->id}";
        
        $activities = Cache::get($activityKey, []);
        $activities[] = [
            'order_id' => $order->id,
            'action' => 'order_processed',
            'timestamp' => now()->toIso8601String(),
        ];

        // Keep last 100 activities
        $activities = array_slice($activities, -100);
        Cache::put($activityKey, $activities, 3600);

        $result->setMeta('activity_tracked', true)
            ->setMeta('total_activities', count($activities));
    }

    protected function checkUserRateLimit(User $user, $result): void
    {
        $rateLimitKey = "user_rate_limit_{$user->id}";
        $currentCount = Cache::get($rateLimitKey, 0);

        // Check if user exceeded rate limit
        $maxActions = 100; // per hour
        if ($currentCount >= $maxActions) {
            $result->addError('Rate limit exceeded. Please try again later.');
            return;
        }

        // Increment counter
        Cache::put($rateLimitKey, $currentCount + 1, 3600);

        $result->setMeta('rate_limit_checked', true)
            ->setMeta('rate_limit_remaining', $maxActions - $currentCount - 1);
    }
}
```

**Key Points:**
- Always checks if user exists before use
- Uses user information for audit trails
- Applies user preferences and settings
- Tracks user activity
- Implements user-based rate limiting
- Personalizes experience based on user data

### Example 6: Comprehensive Result Management - Multi-Task Coordination

Demonstrates how multiple tasks coordinate through the shared result object:

```php
namespace App\Flows\Order;

use App\Models\Order;
use Illuminate\Support\Facades\DB;
use JobMetric\Flow\Contracts\AbstractActionTask;
use JobMetric\Flow\Support\FlowTaskContext;

class CoordinateOrderProcessingActionTask extends AbstractActionTask
{
    protected function handle(FlowTaskContext $context): void
    {
        $order = $context->subject();
        $result = $context->result(); // Shared across all tasks
        $config = $context->config();
        $user = $context->user();
        $payload = $context->payload();

        // Check if previous tasks succeeded
        if ($result->hasErrors()) {
            // Previous task failed, log but continue
            $result->addMessage('Continuing despite previous errors');
        }

        // Read data from previous tasks
        $previousTaskData = $result->getData();
        $emailSent = $previousTaskData['email_sent'] ?? false;
        $inventoryUpdated = $previousTaskData['inventory_updated'] ?? false;

        try {
            // 1. Add informational messages
            $result->addMessage('Starting order coordination')
                ->addMessage("Order ID: {$order->id}")
                ->addMessage("User: {$user?->name}");

            // 2. Set initial data
            $result->setData('coordination_started_at', now()->toIso8601String())
                ->setData('order_id', $order->id)
                ->setData('order_total', $order->total)
                ->setData('order_status', $order->status);

            // 3. Merge data from payload
            if (!empty($payload)) {
                $result->mergeData([
                    'payload_reason' => $payload['reason'] ?? null,
                    'payload_notes' => $payload['notes'] ?? null,
                ]);
            }

            // 4. Process based on previous task results
            if ($emailSent) {
                $result->addMessage('Email was sent by previous task');
            } else {
                $result->addMessage('Email was not sent, sending now');
                $this->sendEmail($order, $user, $result);
            }

            // 5. Add execution metadata
            $startTime = microtime(true);
            
            // Perform operations
            $this->performOperations($order, $result);

            $executionTime = microtime(true) - $startTime;
            $result->setMeta('execution_time', round($executionTime, 4))
                ->setMeta('memory_usage', memory_get_peak_usage(true))
                ->setMeta('tasks_coordinated', true);

            // 6. Aggregate all messages for final summary
            $allMessages = $result->getMessages();
            $result->addMessage("Coordination complete. Total messages: " . count($allMessages));

            // 7. Final data aggregation
            $allData = $result->getData();
            $result->setData('total_data_points', count($allData))
                ->setData('coordination_completed_at', now()->toIso8601String());

        } catch (\Exception $e) {
            // Add error but don't fail entire transition
            $result->addError('Coordination failed: ' . $e->getMessage(), false)
                ->setMeta('coordination_error', $e->getMessage())
                ->setMeta('coordination_error_class', get_class($e));
        }
    }

    protected function sendEmail(Order $order, $user, $result): void
    {
        // Email sending logic
        $result->setData('email_sent', true)
            ->addMessage('Email sent during coordination');
    }

    protected function performOperations(Order $order, $result): void
    {
        // Operations that update result
        $result->addMessage('Operations performed')
            ->setData('operations_completed', true);
    }
}
```

**Key Points:**
- Reads data from previous tasks via shared result
- Coordinates multiple tasks through result object
- Aggregates information from all tasks
- Handles errors gracefully
- Tracks execution metrics

### Example 7: Configuration Management - Testing and Overrides

Demonstrates advanced configuration usage, including testing scenarios and dynamic configuration:

```php
namespace App\Flows\Order;

use App\Models\Order;
use JobMetric\Flow\Contracts\AbstractActionTask;
use JobMetric\Flow\Support\FlowTaskContext;

class ConfigurableEmailActionTask extends AbstractActionTask
{
    protected function handle(FlowTaskContext $context): void
    {
        $order = $context->subject();
        $result = $context->result();
        $config = $context->config(); // Cached, no DB call

        // Get configuration with intelligent defaults
        $emailTo = $config['email_to'] ?? $order->customer_email;
        $template = $config['template'] ?? 'order-status';
        $subject = $config['subject'] ?? "Order #{$order->id} Status Update";
        $cc = $config['cc'] ?? [];
        $bcc = $config['bcc'] ?? [];
        $attachInvoice = $config['attach_invoice'] ?? false;
        $priority = $config['priority'] ?? 'normal';

        // Use configuration
        Mail::to($emailTo)
            ->cc($cc)
            ->bcc($bcc)
            ->send(new OrderStatusChanged($order, $template, $subject));

        $result->addMessage("Email sent to {$emailTo}")
            ->setData('email_config', [
                'to' => $emailTo,
                'template' => $template,
                'subject' => $subject,
            ]);
    }
}

// Usage in Production
// Configuration is loaded from database (task config)
$context = new FlowTaskContext($order, $result, $payload, $user);
// Config is automatically loaded from FlowTask model

// Usage in Tests
$context = new FlowTaskContext($order, $result, $payload, $user);
$context->replaceConfig([
    'email_to' => 'test@example.com',
    'template' => 'test-template',
    'subject' => 'Test Email',
    'attach_invoice' => false,
]);
$task->handle($context);

// Usage with Dynamic Configuration
$context = new FlowTaskContext($order, $result, $payload, $user);

// Override config based on order type
$config = $context->config();
if ($order->is_premium) {
    $config['template'] = 'premium-order-status';
    $config['priority'] = 'high';
}
$context->replaceConfig($config);

$task->handle($context);
```

**Key Points:**
- Configuration is cached (no DB calls during execution)
- Can be overridden for testing
- Supports intelligent defaults
- Can be modified dynamically based on context

## Real-World Complete System Example

### Complete Order Cancellation Workflow

A complete example showing how all context components work together in a real workflow:

**1. Restriction Task - Check if cancellation is allowed:**
```php
class RestrictCancellationRestrictionTask extends AbstractRestrictionTask
{
    public function restriction(FlowTaskContext $context): RestrictionResult
    {
        $order = $context->subject();
        $user = $context->user();
        $payload = $context->payload();
        $config = $context->config();
        $result = $context->result();

        // Check user
        if (!$user) {
            return RestrictionResult::deny('USER_REQUIRED', 'User must be authenticated');
        }

        // Check permission
        if (!$user->can('cancel', $order)) {
            $result->addMessage("User {$user->id} lacks cancel permission");
            return RestrictionResult::deny('PERMISSION_DENIED', 'No permission');
        }

        // Check reason from payload
        if (($config['require_reason'] ?? true) && empty($payload['reason'])) {
            return RestrictionResult::deny('REASON_REQUIRED', 'Reason required');
        }

        // Check order status
        if ($order->status === 'shipped') {
            $result->addMessage("Order {$order->id} is shipped, cannot cancel");
            return RestrictionResult::deny('ORDER_SHIPPED', 'Cannot cancel shipped orders');
        }

        $result->addMessage("Cancellation allowed for order {$order->id}");
        return RestrictionResult::allow();
    }
}
```

**2. Validation Task - Validate cancellation data:**
```php
class ValidateCancellationValidationTask extends AbstractValidationTask
{
    public function rules(FlowTaskContext $context): array
    {
        $payload = $context->payload();
        $order = $context->subject();
        $config = $context->config();

        return [
            'reason' => [
                'required',
                'string',
                'min:10',
                'max:500',
            ],
            'refund_method' => [
                'required',
                'string',
                'in:original,store_credit',
            ],
            'restock_inventory' => [
                'boolean',
            ],
        ];
    }

    public function messages(FlowTaskContext $context): array
    {
        return [
            'reason.required' => 'Cancellation reason is required',
            'reason.min' => 'Reason must be at least 10 characters',
            'refund_method.required' => 'Refund method must be selected',
        ];
    }
}
```

**3. Action Task - Execute cancellation:**
```php
class CancelOrderActionTask extends AbstractActionTask
{
    protected function handle(FlowTaskContext $context): void
    {
        $order = $context->subject();
        $user = $context->user();
        $payload = $context->payload();
        $config = $context->config();
        $result = $context->result();

        // Extract payload
        $reason = $payload['reason'];
        $refundMethod = $payload['refund_method'];
        $restockInventory = $payload['restock_inventory'] ?? true;

        try {
            DB::beginTransaction();

            // 1. Update order status
            $order->status = 'cancelled';
            $order->cancelled_at = now();
            $order->cancelled_by = $user->id;
            $order->cancellation_reason = $reason;
            $order->save();

            // 2. Process refund
            $this->processRefund($order, $refundMethod, $result);

            // 3. Restock inventory
            if ($restockInventory) {
                $this->restockInventory($order, $result);
            }

            // 4. Send notifications
            $this->sendNotifications($order, $user, $reason, $result);

            // 5. Update result
            $result->addMessage('Order cancelled successfully')
                ->addMessage("Reason: {$reason}")
                ->setData('order_id', $order->id)
                ->setData('cancelled_at', $order->cancelled_at->toIso8601String())
                ->setData('cancelled_by', $user->id)
                ->setData('refund_method', $refundMethod)
                ->setMeta('inventory_restocked', $restockInventory);

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            $result->addError('Cancellation failed: ' . $e->getMessage());
        }
    }

    protected function processRefund(Order $order, string $method, $result): void
    {
        // Refund logic
        $result->addMessage("Refund processed via {$method}");
    }

    protected function restockInventory(Order $order, $result): void
    {
        // Restock logic
        $result->addMessage('Inventory restocked');
    }

    protected function sendNotifications(Order $order, $user, string $reason, $result): void
    {
        // Notification logic
        $result->addMessage('Notifications sent');
    }
}
```

**4. Usage in Controller:**
```php
namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use JobMetric\Flow\Facades\FlowTransition;

class OrderController extends Controller
{
    public function cancel(Request $request, Order $order)
    {
        // Prepare payload
        $payload = [
            'reason' => $request->input('reason'),
            'refund_method' => $request->input('refund_method'),
            'restock_inventory' => $request->boolean('restock_inventory', true),
        ];

        // Execute transition
        $result = FlowTransition::runner('cancel_order', $order, $payload, auth()->user());

        if ($result->isSuccess()) {
            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => $result->getData(),
            ]);
        }

        return response()->json([
            'success' => false,
            'errors' => $result->getErrors(),
            'messages' => $result->getMessages(),
        ], 400);
    }
}
```

**Flow of Context Through Tasks:**

1. **Restriction Task** receives context:
   - Reads `subject()` (order)
   - Reads `user()` (permission check)
   - Reads `payload()` (reason check)
   - Reads `config()` (require_reason setting)
   - Writes to `result()` (messages for debugging)

2. **Validation Task** receives same context:
   - Reads `payload()` (validation rules)
   - Reads `subject()` (order for context)
   - Validation errors go to `result()`

3. **Action Task** receives same context:
   - Reads `subject()` (order to update)
   - Reads `user()` (who cancelled)
   - Reads `payload()` (reason, refund method)
   - Reads `config()` (task settings)
   - Writes to `result()` (success messages, data, metadata)

**Key Insight:** All tasks share the **same** `TransitionResult` object. This means:
- Messages from restriction task are visible in action task
- Data set by one task can be read by another
- Errors accumulate across all tasks
- Final result contains complete workflow outcome

## Integration with FlowTransition

The `FlowTransition` service creates `FlowTaskContext` instances automatically and passes the same context to all tasks:

```php
// Inside FlowTransition::runner()
$transitionResult = TransitionResult::success();
$context = new FlowTaskContext($subject, $transitionResult, $payload, $user);

// All tasks receive the SAME context instance
$restrictionTask->restriction($context);  // Can read/write result
$validationTask->rules($context);        // Can read result from restriction
$actionTask->handle($context);           // Can read result from all previous tasks
```

**Important:** The context is created once and shared. This allows tasks to coordinate and build upon each other's work.

## Best Practices

1. **Always Check User**: Check if user exists before accessing:
   ```php
   $user = $context->user();
   if ($user) {
       // Use user
   }
   ```

2. **Use Result Object**: Always use `$context->result()` to add messages/errors:
   ```php
   $context->result()->addMessage('Task completed');
   ```

3. **Validate Payload**: Always validate payload data:
   ```php
   $payload = $context->payload();
   $value = $payload['key'] ?? null;
   ```

4. **Cache Configuration**: Use `replaceConfig()` to avoid database calls in tests

5. **Type Hints**: Use proper type hints when accessing context:
   ```php
   /** @var Order $order */
   $order = $context->subject();
   ```

## Related Documentation

- [TransitionResult](/packages/laravel-flow/deep-diving/transition-result) - Transition result DTO
- [RestrictionResult](/packages/laravel-flow/deep-diving/support/restriction-result) - Restriction task results
- [FlowTransition Service](/packages/laravel-flow/deep-diving/services/flow-transition) - Transition execution
- [FlowTaskRegistry](/packages/laravel-flow/deep-diving/support/flow-task-registry) - Task driver registry
- [MakeTask Command](/packages/laravel-flow/deep-diving/make-task) - Generating task drivers
- [FlowTask Service](/packages/laravel-flow/deep-diving/services/flow-task) - Task management

