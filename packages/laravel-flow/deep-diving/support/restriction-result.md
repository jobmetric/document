---
sidebar_position: 5
sidebar_label: RestrictionResult
---

# RestrictionResult

The `RestrictionResult` class represents the outcome of a restriction task evaluation. It indicates whether a workflow transition is allowed to proceed and provides machine-readable codes and human-readable messages to explain the decision.

## Namespace

```php
JobMetric\Flow\Support\RestrictionResult
```

## Overview

`RestrictionResult` encapsulates:
- **Allowed Flag**: Boolean indicating if the operation is allowed
- **Code**: Machine-readable code identifying the reason
- **Message**: Human-readable explanation for UI or logging

## Static Factory Methods

### allow()

Create a result that allows the operation:

```php
use JobMetric\Flow\Support\RestrictionResult;

$result = RestrictionResult::allow();
```

**Returns:** `RestrictionResult` with `allowed=true`, `code=null`, `message=null`

### deny()

Create a result that denies the operation:

```php
// With code only
$result = RestrictionResult::deny('PERMISSION_DENIED');

// With code and message
$result = RestrictionResult::deny(
    'ORDER_SHIPPED',
    'Cannot cancel shipped orders'
);
```

**Parameters:**
- `string $code`: Machine-readable code (required)
- `?string $message = null`: Human-readable message (optional)

**Returns:** `RestrictionResult` with `allowed=false`

## Query Methods

### allowed()

Determine if the operation is allowed:

```php
$result = RestrictionResult::allow();
$result->allowed(); // true

$result = RestrictionResult::deny('ERROR_CODE');
$result->allowed(); // false
```

**Returns:** `bool`

### code()

Get the machine-readable code:

```php
$result = RestrictionResult::deny('PERMISSION_DENIED', 'Message');
$result->code(); // 'PERMISSION_DENIED'

$result = RestrictionResult::allow();
$result->code(); // null
```

**Returns:** `?string`

### message()

Get the human-readable message:

```php
$result = RestrictionResult::deny('ERROR', 'Error message');
$result->message(); // 'Error message'

$result = RestrictionResult::allow();
$result->message(); // null
```

**Returns:** `?string`

## Understanding RestrictionResult in Workflow Execution

### How RestrictionResult Works

When a transition is executed, restriction tasks are evaluated **first**:

```php
// Inside FlowTransition::runner()
// 1. Execute all restriction tasks
foreach ($restrictionTasks as $task) {
    $result = $task->restriction($context);
    
    if (!$result->allowed()) {
        // Transition is DENIED - stop immediately
        throw new TaskRestrictionException(
            $result->code(),
            $result->message()
        );
    }
}

// 2. If all restrictions pass, continue with validation tasks
// 3. Then execute action tasks
```

**Key Points:**
- Restriction tasks run **before** validation and action tasks
- If **any** restriction denies, the transition stops immediately
- The code and message are used for error handling and user feedback
- Multiple restriction tasks can exist - all must allow

## Complete Examples

### Example 1: Basic Allow - Simple Pass-Through

A simple restriction that always allows (useful for testing or optional restrictions):

```php
namespace App\Flows\Order;

use JobMetric\Flow\Contracts\AbstractRestrictionTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\FlowTaskDefinition;
use JobMetric\Flow\Support\RestrictionResult;
use JobMetric\Form\FormBuilder;

class BasicAllowRestrictionTask extends AbstractRestrictionTask
{
    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.basic_allow.title',
            description: 'Always allows the transition',
        );
    }

    public function form(): FormBuilder
    {
        return new FormBuilder;
    }

    public function restriction(FlowTaskContext $context): RestrictionResult
    {
        // Always allow - no restrictions
        return RestrictionResult::allow();
    }
}
```

**Use Cases:**
- Testing scenarios
- Optional restrictions that can be enabled/disabled
- Placeholder restrictions

### Example 2: Advanced Permission Check - Multi-Level Authorization

A comprehensive permission check that handles multiple authorization scenarios:

```php
namespace App\Flows\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use JobMetric\Flow\Contracts\AbstractRestrictionTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\FlowTaskDefinition;
use JobMetric\Flow\Support\RestrictionResult;
use JobMetric\Form\FormBuilder;

class PermissionRestrictionTask extends AbstractRestrictionTask
{
    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.permission_check.title',
            description: 'Checks user permissions before allowing transition',
        );
    }

    public function form(): FormBuilder
    {
        return (new FormBuilder)
            ->hiddenCustomField('require_authentication', 'boolean', true, 'Require user authentication')
            ->hiddenCustomField('allowed_roles', 'array', ['admin', 'manager'], 'Allowed roles')
            ->hiddenCustomField('check_ownership', 'boolean', true, 'Check resource ownership')
            ->hiddenCustomField('require_specific_permission', 'string', 'cancel', 'Required permission');
    }

    public function restriction(FlowTaskContext $context): RestrictionResult
    {
        $order = $context->subject();
        $user = $context->user();
        $config = $context->config();

        // Extract configuration
        $requireAuth = $config['require_authentication'] ?? true;
        $allowedRoles = $config['allowed_roles'] ?? [];
        $checkOwnership = $config['check_ownership'] ?? true;
        $requiredPermission = $config['require_specific_permission'] ?? 'cancel';

        // 1. Check authentication
        if ($requireAuth && !$user) {
            return RestrictionResult::deny(
                'USER_NOT_AUTHENTICATED',
                'You must be logged in to perform this action'
            );
        }

        // 2. Check role-based access
        if (!empty($allowedRoles)) {
            $userRoles = $user?->roles->pluck('name')->toArray() ?? [];
            $hasAllowedRole = !empty(array_intersect($userRoles, $allowedRoles));

            if (!$hasAllowedRole) {
                return RestrictionResult::deny(
                    'INSUFFICIENT_ROLE',
                    'You do not have the required role to perform this action'
                );
            }
        }

        // 3. Check policy/permission
        if ($requiredPermission && $user) {
            if (!Gate::allows($requiredPermission, $order)) {
                return RestrictionResult::deny(
                    'PERMISSION_DENIED',
                    "You do not have permission to {$requiredPermission} this order"
                );
            }
        }

        // 4. Check ownership (if enabled)
        if ($checkOwnership && $user) {
            // Admin can access any order
            if (!$user->hasRole('admin')) {
                if ($order->user_id !== $user->id) {
                    return RestrictionResult::deny(
                        'OWNERSHIP_MISMATCH',
                        'You can only perform this action on your own orders'
                    );
                }
            }
        }

        // 5. Check account status
        if ($user && $user->account_status === 'suspended') {
            return RestrictionResult::deny(
                'ACCOUNT_SUSPENDED',
                'Your account is suspended. Please contact support.'
            );
        }

        // All permission checks passed
        return RestrictionResult::allow();
    }
}
```

**Key Points:**
- Multiple permission checks in sequence
- Configurable permission requirements
- Role-based and policy-based authorization
- Ownership verification
- Account status checks

### Example 3: Comprehensive Business Rule Check - Order State Machine

A complete business rule check that validates order state transitions:

```php
namespace App\Flows\Order;

use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use JobMetric\Flow\Contracts\AbstractRestrictionTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\FlowTaskDefinition;
use JobMetric\Flow\Support\RestrictionResult;
use JobMetric\Form\FormBuilder;

class OrderStateRestrictionTask extends AbstractRestrictionTask
{
    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.order_state_check.title',
            description: 'Validates order state transitions',
        );
    }

    public function form(): FormBuilder
    {
        return (new FormBuilder)
            ->hiddenCustomField('allowed_from_statuses', 'array', ['pending', 'processing'], 'Allowed source statuses')
            ->hiddenCustomField('blocked_statuses', 'array', ['cancelled', 'refunded'], 'Blocked statuses')
            ->hiddenCustomField('check_payment_status', 'boolean', true, 'Check payment status')
            ->hiddenCustomField('check_inventory', 'boolean', true, 'Check inventory availability');
    }

    public function restriction(FlowTaskContext $context): RestrictionResult
    {
        $order = $context->subject();
        $payload = $context->payload();
        $config = $context->config();

        // Extract configuration
        $allowedFromStatuses = $config['allowed_from_statuses'] ?? [];
        $blockedStatuses = $config['blocked_statuses'] ?? ['cancelled', 'refunded'];
        $checkPayment = $config['check_payment_status'] ?? true;
        $checkInventory = $config['check_inventory'] ?? true;

        // Get target status from payload
        $targetStatus = $payload['status'] ?? null;

        // 1. Check if order is in a blocked state
        if (in_array($order->status, $blockedStatuses)) {
            return RestrictionResult::deny(
                'ORDER_IN_BLOCKED_STATE',
                "Cannot transition from '{$order->status}' status"
            );
        }

        // 2. Check if current status allows transition
        if (!empty($allowedFromStatuses) && !in_array($order->status, $allowedFromStatuses)) {
            return RestrictionResult::deny(
                'INVALID_SOURCE_STATUS',
                "Cannot transition from '{$order->status}' status. Allowed statuses: " . implode(', ', $allowedFromStatuses)
            );
        }

        // 3. Check state machine rules
        $stateMachineRules = $this->getStateMachineRules();
        if (isset($stateMachineRules[$order->status])) {
            $allowedTransitions = $stateMachineRules[$order->status];
            
            if ($targetStatus && !in_array($targetStatus, $allowedTransitions)) {
                return RestrictionResult::deny(
                    'INVALID_STATE_TRANSITION',
                    "Cannot transition from '{$order->status}' to '{$targetStatus}'"
                );
            }
        }

        // 4. Check payment status
        if ($checkPayment) {
            if ($order->payment_status === 'refunded' && $targetStatus !== 'cancelled') {
                return RestrictionResult::deny(
                    'PAYMENT_ALREADY_REFUNDED',
                    'Payment has already been refunded. Order must remain cancelled.'
                );
            }

            if ($order->payment_status === 'pending' && in_array($targetStatus, ['shipped', 'delivered'])) {
                return RestrictionResult::deny(
                    'PAYMENT_PENDING',
                    'Cannot ship or deliver order with pending payment'
                );
            }
        }

        // 5. Check inventory availability (for shipping)
        if ($checkInventory && $targetStatus === 'shipped') {
            foreach ($order->items as $item) {
                if ($item->product->stock < $item->quantity) {
                    return RestrictionResult::deny(
                        'INSUFFICIENT_INVENTORY',
                        "Insufficient inventory for product: {$item->product->name}"
                    );
                }
            }
        }

        // 6. Check if order has active disputes
        if ($this->hasActiveDispute($order)) {
            return RestrictionResult::deny(
                'ACTIVE_DISPUTE',
                'Cannot modify order with active dispute'
            );
        }

        // 7. Check if order is locked
        if ($order->is_locked) {
            return RestrictionResult::deny(
                'ORDER_LOCKED',
                'Order is currently locked and cannot be modified'
            );
        }

        // All business rule checks passed
        return RestrictionResult::allow();
    }

    protected function getStateMachineRules(): array
    {
        return [
            'pending' => ['processing', 'cancelled'],
            'processing' => ['shipped', 'cancelled'],
            'shipped' => ['delivered', 'returned'],
            'delivered' => ['returned', 'completed'],
            'cancelled' => [], // Terminal state
            'completed' => [], // Terminal state
        ];
    }

    protected function hasActiveDispute(Order $order): bool
    {
        return $order->disputes()
            ->where('status', 'open')
            ->exists();
    }
}
```

**Key Points:**
- State machine validation
- Configurable business rules
- Multiple validation layers
- Terminal state protection
- Payment and inventory checks

### Example 4: Enterprise-Level Multi-Condition Restriction

A comprehensive restriction that checks multiple business conditions with detailed error reporting:

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

class EnterpriseOrderCancellationRestrictionTask extends AbstractRestrictionTask
{
    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.enterprise_cancellation_restriction.title',
            description: 'Comprehensive order cancellation restrictions',
        );
    }

    public function form(): FormBuilder
    {
        return (new FormBuilder)
            ->hiddenCustomField('max_cancellation_hours', 'integer', 24, 'Maximum hours after creation')
            ->hiddenCustomField('max_cancellation_amount', 'decimal', 1000, 'Maximum order amount for cancellation')
            ->hiddenCustomField('require_reason', 'boolean', true, 'Require cancellation reason')
            ->hiddenCustomField('check_rate_limit', 'boolean', true, 'Check user rate limit')
            ->hiddenCustomField('max_cancellations_per_month', 'integer', 5, 'Maximum cancellations per month')
            ->hiddenCustomField('allow_admin_override', 'boolean', true, 'Allow admin override');
    }

    public function restriction(FlowTaskContext $context): RestrictionResult
    {
        $order = $context->subject();
        $user = $context->user();
        $payload = $context->payload();
        $config = $context->config();

        // Extract configuration
        $maxHours = $config['max_cancellation_hours'] ?? 24;
        $maxAmount = $config['max_cancellation_amount'] ?? 1000;
        $requireReason = $config['require_reason'] ?? true;
        $checkRateLimit = $config['check_rate_limit'] ?? true;
        $maxPerMonth = $config['max_cancellations_per_month'] ?? 5;
        $allowAdminOverride = $config['allow_admin_override'] ?? true;

        // Admin override check (early exit)
        if ($allowAdminOverride && $user && $user->hasRole('admin')) {
            return RestrictionResult::allow();
        }

        // 1. User authentication check
        if (!$user) {
            return RestrictionResult::deny(
                'USER_NOT_AUTHENTICATED',
                'You must be logged in to cancel orders'
            );
        }

        // 2. Permission check
        if (!$user->can('cancel', $order)) {
            return RestrictionResult::deny(
                'PERMISSION_DENIED',
                'You do not have permission to cancel this order'
            );
        }

        // 3. Ownership check
        if ($order->user_id !== $user->id && !$user->hasRole('admin')) {
            return RestrictionResult::deny(
                'OWNERSHIP_MISMATCH',
                'You can only cancel your own orders'
            );
        }

        // 4. Order status check
        $blockedStatuses = ['shipped', 'delivered', 'cancelled', 'refunded'];
        if (in_array($order->status, $blockedStatuses)) {
            return RestrictionResult::deny(
                'ORDER_STATUS_INVALID',
                "Cannot cancel order with status: {$order->status}"
            );
        }

        // 5. Time limit check
        $hoursSinceCreated = $order->created_at->diffInHours(now());
        if ($hoursSinceCreated > $maxHours) {
            return RestrictionResult::deny(
                'TIME_LIMIT_EXCEEDED',
                "Orders can only be cancelled within {$maxHours} hours of creation. " .
                "Order was created {$hoursSinceCreated} hours ago."
            );
        }

        // 6. Amount limit check
        if ($order->total > $maxAmount) {
            return RestrictionResult::deny(
                'AMOUNT_EXCEEDED',
                "Orders over {$maxAmount} cannot be cancelled automatically. Please contact support."
            );
        }

        // 7. Reason requirement check
        if ($requireReason && empty($payload['reason'])) {
            return RestrictionResult::deny(
                'REASON_REQUIRED',
                'Cancellation reason is required'
            );
        }

        if ($requireReason && strlen($payload['reason'] ?? '') < 10) {
            return RestrictionResult::deny(
                'REASON_TOO_SHORT',
                'Cancellation reason must be at least 10 characters'
            );
        }

        // 8. Rate limiting check
        if ($checkRateLimit) {
            $cancellationCount = $this->getRecentCancellationCount($user);
            if ($cancellationCount >= $maxPerMonth) {
                return RestrictionResult::deny(
                    'RATE_LIMIT_EXCEEDED',
                    "You have exceeded the maximum of {$maxPerMonth} cancellations per month. Please contact support."
                );
            }
        }

        // 9. Payment status check
        if ($order->payment_status === 'refunded') {
            return RestrictionResult::deny(
                'PAYMENT_ALREADY_REFUNDED',
                'Payment has already been refunded. Order cannot be cancelled again.'
            );
        }

        // 10. Active dispute check
        if ($this->hasActiveDispute($order)) {
            return RestrictionResult::deny(
                'ACTIVE_DISPUTE',
                'Cannot cancel order with active dispute. Please resolve the dispute first.'
            );
        }

        // 11. Inventory restock check
        $restockInventory = $payload['restock_inventory'] ?? true;
        if ($restockInventory && !$this->canRestockInventory($order)) {
            return RestrictionResult::deny(
                'INVENTORY_RESTOCK_FAILED',
                'Cannot cancel order: some items cannot be restocked to inventory'
            );
        }

        // 12. Shipping status check
        if ($order->shipping_status === 'in_transit') {
            return RestrictionResult::deny(
                'ORDER_IN_TRANSIT',
                'Cannot cancel order that is already in transit. Please contact shipping department.'
            );
        }

        // 13. Subscription order check
        if ($order->is_subscription && $order->subscription->is_active) {
            return RestrictionResult::deny(
                'ACTIVE_SUBSCRIPTION',
                'Cannot cancel order with active subscription. Please cancel the subscription first.'
            );
        }

        // All checks passed
        return RestrictionResult::allow();
    }

    protected function getRecentCancellationCount(User $user): int
    {
        $cacheKey = "user_cancellations_{$user->id}_" . now()->format('Y-m');
        
        return Cache::remember($cacheKey, 3600, function () use ($user) {
            return $user->orders()
                ->where('status', 'cancelled')
                ->where('cancelled_at', '>=', now()->startOfMonth())
                ->count();
        });
    }

    protected function hasActiveDispute(Order $order): bool
    {
        return $order->disputes()
            ->where('status', 'open')
            ->exists();
    }

    protected function canRestockInventory(Order $order): bool
    {
        foreach ($order->items as $item) {
            if (!$item->product->canRestock()) {
                return false;
            }
        }
        return true;
    }
}
```

**Key Points:**
- Multiple validation layers
- Early exit for admin override
- Detailed error messages with context
- Rate limiting with caching
- Complex business logic
- Configurable restrictions

### Example 5: Advanced Configurable Restrictions - Dynamic Business Rules

A sophisticated restriction system that uses configuration for flexible business rules:

```php
namespace App\Flows\Order;

use App\Models\Order;
use Illuminate\Support\Facades\DB;
use JobMetric\Flow\Contracts\AbstractRestrictionTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\FlowTaskDefinition;
use JobMetric\Flow\Support\RestrictionResult;
use JobMetric\Form\FormBuilder;

class ConfigurableBusinessRulesRestrictionTask extends AbstractRestrictionTask
{
    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.configurable_rules.title',
            description: 'Configurable business rules restriction',
        );
    }

    public function form(): FormBuilder
    {
        return (new FormBuilder)
            ->hiddenCustomField('allowed_statuses', 'array', ['pending', 'processing'], 'Allowed source statuses')
            ->hiddenCustomField('blocked_statuses', 'array', ['cancelled'], 'Blocked statuses')
            ->hiddenCustomField('allowed_user_roles', 'array', ['customer', 'admin'], 'Allowed user roles')
            ->hiddenCustomField('min_order_amount', 'decimal', 0, 'Minimum order amount')
            ->hiddenCustomField('max_order_amount', 'decimal', 10000, 'Maximum order amount')
            ->hiddenCustomField('allowed_payment_methods', 'array', ['credit_card', 'paypal'], 'Allowed payment methods')
            ->hiddenCustomField('require_verification', 'boolean', false, 'Require email verification')
            ->hiddenCustomField('business_hours_only', 'boolean', false, 'Only allow during business hours')
            ->hiddenCustomField('business_hours_start', 'integer', 9, 'Business hours start')
            ->hiddenCustomField('business_hours_end', 'integer', 17, 'Business hours end');
    }

    public function restriction(FlowTaskContext $context): RestrictionResult
    {
        $order = $context->subject();
        $user = $context->user();
        $payload = $context->payload();
        $config = $context->config();

        // Extract all configuration
        $allowedStatuses = $config['allowed_statuses'] ?? [];
        $blockedStatuses = $config['blocked_statuses'] ?? [];
        $allowedRoles = $config['allowed_user_roles'] ?? [];
        $minAmount = $config['min_order_amount'] ?? 0;
        $maxAmount = $config['max_order_amount'] ?? 10000;
        $allowedPaymentMethods = $config['allowed_payment_methods'] ?? [];
        $requireVerification = $config['require_verification'] ?? false;
        $businessHoursOnly = $config['business_hours_only'] ?? false;
        $businessHoursStart = $config['business_hours_start'] ?? 9;
        $businessHoursEnd = $config['business_hours_end'] ?? 17;

        // 1. Status validation
        if (!empty($allowedStatuses) && !in_array($order->status, $allowedStatuses)) {
            return RestrictionResult::deny(
                'STATUS_NOT_ALLOWED',
                "Order status '{$order->status}' is not allowed. Allowed statuses: " . implode(', ', $allowedStatuses)
            );
        }

        if (!empty($blockedStatuses) && in_array($order->status, $blockedStatuses)) {
            return RestrictionResult::deny(
                'STATUS_BLOCKED',
                "Order status '{$order->status}' is blocked for this transition"
            );
        }

        // 2. User role validation
        if (!empty($allowedRoles) && $user) {
            $userRoles = $user->roles->pluck('name')->toArray();
            $hasAllowedRole = !empty(array_intersect($userRoles, $allowedRoles));

            if (!$hasAllowedRole) {
                return RestrictionResult::deny(
                    'ROLE_NOT_ALLOWED',
                    'Your role is not allowed for this transition'
                );
            }
        }

        // 3. Amount validation
        if ($order->total < $minAmount) {
            return RestrictionResult::deny(
                'AMOUNT_TOO_LOW',
                "Order amount {$order->total} is below minimum {$minAmount}"
            );
        }

        if ($order->total > $maxAmount) {
            return RestrictionResult::deny(
                'AMOUNT_TOO_HIGH',
                "Order amount {$order->total} exceeds maximum {$maxAmount}"
            );
        }

        // 4. Payment method validation
        if (!empty($allowedPaymentMethods) && !in_array($order->payment_method, $allowedPaymentMethods)) {
            return RestrictionResult::deny(
                'PAYMENT_METHOD_NOT_ALLOWED',
                "Payment method '{$order->payment_method}' is not allowed"
            );
        }

        // 5. Email verification check
        if ($requireVerification && $user && !$user->email_verified_at) {
            return RestrictionResult::deny(
                'EMAIL_NOT_VERIFIED',
                'Email verification is required for this transition'
            );
        }

        // 6. Business hours check
        if ($businessHoursOnly) {
            $currentHour = now()->hour;
            if ($currentHour < $businessHoursStart || $currentHour >= $businessHoursEnd) {
                return RestrictionResult::deny(
                    'OUTSIDE_BUSINESS_HOURS',
                    "This operation is only available during business hours ({$businessHoursStart}:00 - {$businessHoursEnd}:00)"
                );
            }
        }

        // All configurable checks passed
        return RestrictionResult::allow();
    }
}
```

**Key Points:**
- Fully configurable restrictions
- Multiple validation layers from config
- Flexible business rules
- Easy to adjust without code changes

### Example 6: Advanced Time-Based Restrictions - Scheduling and Windows

A comprehensive time-based restriction system with multiple time windows and scheduling:

```php
namespace App\Flows\Order;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use JobMetric\Flow\Contracts\AbstractRestrictionTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\FlowTaskDefinition;
use JobMetric\Flow\Support\RestrictionResult;
use JobMetric\Form\FormBuilder;

class TimeBasedRestrictionTask extends AbstractRestrictionTask
{
    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.time_based_restriction.title',
            description: 'Time-based restrictions for transitions',
        );
    }

    public function form(): FormBuilder
    {
        return (new FormBuilder)
            ->hiddenCustomField('business_hours_start', 'integer', 9, 'Business hours start (24h format)')
            ->hiddenCustomField('business_hours_end', 'integer', 17, 'Business hours end (24h format)')
            ->hiddenCustomField('allowed_days', 'array', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 'Allowed days of week')
            ->hiddenCustomField('blocked_dates', 'array', [], 'Blocked dates (YYYY-MM-DD)')
            ->hiddenCustomField('time_window_start', 'string', null, 'Time window start (HH:MM)')
            ->hiddenCustomField('time_window_end', 'string', null, 'Time window end (HH:MM)')
            ->hiddenCustomField('max_operations_per_hour', 'integer', 10, 'Maximum operations per hour')
            ->hiddenCustomField('timezone', 'string', 'UTC', 'Timezone for time checks');
    }

    public function restriction(FlowTaskContext $context): RestrictionResult
    {
        $order = $context->subject();
        $user = $context->user();
        $config = $context->config();

        // Extract configuration
        $businessHoursStart = $config['business_hours_start'] ?? 9;
        $businessHoursEnd = $config['business_hours_end'] ?? 17;
        $allowedDays = $config['allowed_days'] ?? [];
        $blockedDates = $config['blocked_dates'] ?? [];
        $timeWindowStart = $config['time_window_start'] ?? null;
        $timeWindowEnd = $config['time_window_end'] ?? null;
        $maxPerHour = $config['max_operations_per_hour'] ?? 10;
        $timezone = $config['timezone'] ?? 'UTC';

        $now = Carbon::now($timezone);

        // 1. Business hours check
        $currentHour = $now->hour;
        if ($currentHour < $businessHoursStart || $currentHour >= $businessHoursEnd) {
            return RestrictionResult::deny(
                'OUTSIDE_BUSINESS_HOURS',
                "This operation is only available during business hours ({$businessHoursStart}:00 - {$businessHoursEnd}:00 {$timezone})"
            );
        }

        // 2. Day of week check
        if (!empty($allowedDays)) {
            $currentDay = strtolower($now->format('l'));
            if (!in_array($currentDay, $allowedDays)) {
                return RestrictionResult::deny(
                    'DAY_NOT_ALLOWED',
                    "This operation is not available on {$currentDay}. Allowed days: " . implode(', ', $allowedDays)
                );
            }
        }

        // 3. Blocked dates check
        if (!empty($blockedDates)) {
            $currentDate = $now->format('Y-m-d');
            if (in_array($currentDate, $blockedDates)) {
                return RestrictionResult::deny(
                    'DATE_BLOCKED',
                    "This operation is blocked on {$currentDate}"
                );
            }
        }

        // 4. Time window check
        if ($timeWindowStart && $timeWindowEnd) {
            $windowStart = Carbon::parse($timeWindowStart, $timezone);
            $windowEnd = Carbon::parse($timeWindowEnd, $timezone);
            $currentTime = $now->copy()->setDate($windowStart->year, $windowStart->month, $windowStart->day);

            if ($currentTime->lt($windowStart) || $currentTime->gt($windowEnd)) {
                return RestrictionResult::deny(
                    'OUTSIDE_TIME_WINDOW',
                    "This operation is only available between {$timeWindowStart} and {$timeWindowEnd} {$timezone}"
                );
            }
        }

        // 5. Rate limiting per hour
        if ($maxPerHour > 0 && $user) {
            $rateLimitKey = "operation_rate_limit_{$user->id}_" . $now->format('Y-m-d-H');
            $currentCount = Cache::get($rateLimitKey, 0);

            if ($currentCount >= $maxPerHour) {
                return RestrictionResult::deny(
                    'RATE_LIMIT_EXCEEDED',
                    "You have exceeded the maximum of {$maxPerHour} operations per hour. Please try again later."
                );
            }

            // Increment counter
            Cache::put($rateLimitKey, $currentCount + 1, 3600);
        }

        // 6. Order age check (time since creation)
        $hoursSinceCreation = $order->created_at->diffInHours($now);
        if ($hoursSinceCreation > 48) {
            return RestrictionResult::deny(
                'ORDER_TOO_OLD',
                "This operation is not available for orders older than 48 hours. Order was created {$hoursSinceCreation} hours ago."
            );
        }

        // All time-based checks passed
        return RestrictionResult::allow();
    }
}
```

**Key Points:**
- Multiple time-based validations
- Business hours and days
- Time windows
- Rate limiting with caching
- Timezone support
- Order age restrictions

### Example 7: Resource Locking and Concurrency Control

A restriction that prevents concurrent modifications and handles resource locking:

```php
namespace App\Flows\Order;

use App\Models\Order;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use JobMetric\Flow\Contracts\AbstractRestrictionTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\FlowTaskDefinition;
use JobMetric\Flow\Support\RestrictionResult;
use JobMetric\Form\FormBuilder;

class ResourceLockingRestrictionTask extends AbstractRestrictionTask
{
    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.resource_locking.title',
            description: 'Prevents concurrent modifications',
        );
    }

    public function form(): FormBuilder
    {
        return (new FormBuilder)
            ->hiddenCustomField('lock_timeout', 'integer', 300, 'Lock timeout in seconds')
            ->hiddenCustomField('check_concurrent_edits', 'boolean', true, 'Check for concurrent edits')
            ->hiddenCustomField('require_lock', 'boolean', true, 'Require resource lock');
    }

    public function restriction(FlowTaskContext $context): RestrictionResult
    {
        $order = $context->subject();
        $user = $context->user();
        $config = $context->config();

        $lockTimeout = $config['lock_timeout'] ?? 300;
        $checkConcurrent = $config['check_concurrent_edits'] ?? true;
        $requireLock = $config['require_lock'] ?? true;

        // 1. Check if resource is locked
        $lockKey = "order_lock_{$order->id}";
        $lockedBy = Cache::get($lockKey);

        if ($lockedBy && $lockedBy !== $user?->id) {
            $lockedUser = \App\Models\User::find($lockedBy);
            return RestrictionResult::deny(
                'RESOURCE_LOCKED',
                "Order is currently being edited by {$lockedUser?->name}. Please try again later."
            );
        }

        // 2. Check for concurrent edits (optimistic locking)
        if ($checkConcurrent) {
            $lastModified = $order->updated_at;
            $payloadVersion = $context->payload()['version'] ?? null;

            if ($payloadVersion && $order->version !== $payloadVersion) {
                return RestrictionResult::deny(
                    'CONCURRENT_MODIFICATION',
                    'Order has been modified by another user. Please refresh and try again.'
                );
            }
        }

        // 3. Acquire lock if required
        if ($requireLock && $user) {
            $lockAcquired = Cache::add($lockKey, $user->id, $lockTimeout);
            
            if (!$lockAcquired) {
                return RestrictionResult::deny(
                    'LOCK_ACQUISITION_FAILED',
                    'Could not acquire lock on resource. Please try again.'
                );
            }
        }

        // 4. Check if order is in a transaction
        if (DB::transactionLevel() > 0) {
            // Order is already in a transaction, might be locked
            return RestrictionResult::deny(
                'RESOURCE_IN_TRANSACTION',
                'Order is currently being processed in another transaction'
            );
        }

        // All locking checks passed
        return RestrictionResult::allow();
    }
}
```

### Example 8: Quota and Limit Restrictions

A restriction that enforces quotas and usage limits:

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

class QuotaRestrictionTask extends AbstractRestrictionTask
{
    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.quota_restriction.title',
            description: 'Enforces quotas and usage limits',
        );
    }

    public function form(): FormBuilder
    {
        return (new FormBuilder)
            ->hiddenCustomField('max_orders_per_day', 'integer', 10, 'Maximum orders per day')
            ->hiddenCustomField('max_orders_per_month', 'integer', 100, 'Maximum orders per month')
            ->hiddenCustomField('max_total_amount_per_day', 'decimal', 5000, 'Maximum total amount per day')
            ->hiddenCustomField('check_user_tier', 'boolean', true, 'Check user tier limits')
            ->hiddenCustomField('allow_unlimited_tier', 'string', 'premium', 'Tier with unlimited access');
    }

    public function restriction(FlowTaskContext $context): RestrictionResult
    {
        $order = $context->subject();
        $user = $context->user();
        $config = $context->config();

        if (!$user) {
            return RestrictionResult::deny(
                'USER_REQUIRED',
                'User is required for quota checks'
            );
        }

        $maxPerDay = $config['max_orders_per_day'] ?? 10;
        $maxPerMonth = $config['max_orders_per_month'] ?? 100;
        $maxAmountPerDay = $config['max_total_amount_per_day'] ?? 5000;
        $checkTier = $config['check_user_tier'] ?? true;
        $unlimitedTier = $config['allow_unlimited_tier'] ?? 'premium';

        // Check if user has unlimited tier
        if ($checkTier && $user->tier === $unlimitedTier) {
            return RestrictionResult::allow();
        }

        // 1. Daily order count check
        $dailyCount = $this->getDailyOrderCount($user);
        if ($dailyCount >= $maxPerDay) {
            return RestrictionResult::deny(
                'DAILY_QUOTA_EXCEEDED',
                "You have reached the daily limit of {$maxPerDay} orders. Please try again tomorrow."
            );
        }

        // 2. Monthly order count check
        $monthlyCount = $this->getMonthlyOrderCount($user);
        if ($monthlyCount >= $maxPerMonth) {
            return RestrictionResult::deny(
                'MONTHLY_QUOTA_EXCEEDED',
                "You have reached the monthly limit of {$maxPerMonth} orders."
            );
        }

        // 3. Daily amount check
        $dailyAmount = $this->getDailyOrderAmount($user);
        $newTotal = $dailyAmount + $order->total;
        if ($newTotal > $maxAmountPerDay) {
            return RestrictionResult::deny(
                'DAILY_AMOUNT_EXCEEDED',
                "This order would exceed your daily spending limit of {$maxAmountPerDay}. " .
                "Current daily total: {$dailyAmount}, Order amount: {$order->total}"
            );
        }

        // All quota checks passed
        return RestrictionResult::allow();
    }

    protected function getDailyOrderCount(User $user): int
    {
        $cacheKey = "user_daily_orders_{$user->id}_" . now()->format('Y-m-d');
        
        return Cache::remember($cacheKey, 3600, function () use ($user) {
            return $user->orders()
                ->whereDate('created_at', today())
                ->count();
        });
    }

    protected function getMonthlyOrderCount(User $user): int
    {
        $cacheKey = "user_monthly_orders_{$user->id}_" . now()->format('Y-m');
        
        return Cache::remember($cacheKey, 3600, function () use ($user) {
            return $user->orders()
                ->whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->count();
        });
    }

    protected function getDailyOrderAmount(User $user): float
    {
        $cacheKey = "user_daily_amount_{$user->id}_" . now()->format('Y-m-d');
        
        return Cache::remember($cacheKey, 3600, function () use ($user) {
            return $user->orders()
                ->whereDate('created_at', today())
                ->sum('total');
        });
    }
}
```

### Example 9: Complete Real-World System - Order Cancellation Workflow

A complete example showing all restriction patterns working together:

```php
namespace App\Flows\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use JobMetric\Flow\Contracts\AbstractRestrictionTask;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\FlowTaskDefinition;
use JobMetric\Flow\Support\RestrictionResult;
use JobMetric\Form\FormBuilder;

class CompleteOrderCancellationRestrictionTask extends AbstractRestrictionTask
{
    public static function subject(): string
    {
        return \App\Models\Order::class;
    }

    public static function definition(): FlowTaskDefinition
    {
        return new FlowTaskDefinition(
            title: 'flow::base.task.complete_cancellation_restriction.title',
            description: 'Complete order cancellation restrictions',
        );
    }

    public function form(): FormBuilder
    {
        return (new FormBuilder)
            ->hiddenCustomField('max_cancellation_hours', 'integer', 24, 'Max hours after creation')
            ->hiddenCustomField('require_reason', 'boolean', true, 'Require cancellation reason')
            ->hiddenCustomField('check_rate_limit', 'boolean', true, 'Check rate limit')
            ->hiddenCustomField('max_cancellations_per_month', 'integer', 5, 'Max cancellations per month')
            ->hiddenCustomField('allow_admin_override', 'boolean', true, 'Allow admin override')
            ->hiddenCustomField('check_inventory', 'boolean', true, 'Check inventory restock')
            ->hiddenCustomField('check_payment', 'boolean', true, 'Check payment status')
            ->hiddenCustomField('check_disputes', 'boolean', true, 'Check active disputes');
    }

    public function restriction(FlowTaskContext $context): RestrictionResult
    {
        $order = $context->subject();
        $user = $context->user();
        $payload = $context->payload();
        $config = $context->config();

        // Log restriction check start
        Log::info('Order cancellation restriction check', [
            'order_id' => $order->id,
            'user_id' => $user?->id,
        ]);

        // Admin override (early exit)
        if (($config['allow_admin_override'] ?? true) && $user && $user->hasRole('admin')) {
            Log::info('Admin override granted', ['order_id' => $order->id, 'user_id' => $user->id]);
            return RestrictionResult::allow();
        }

        // 1. User checks
        if (!$user) {
            return $this->denyWithLog('USER_NOT_AUTHENTICATED', 'User must be authenticated', $order);
        }

        if (!$user->can('cancel', $order)) {
            return $this->denyWithLog('PERMISSION_DENIED', 'No permission to cancel', $order, $user);
        }

        if ($order->user_id !== $user->id && !$user->hasRole('admin')) {
            return $this->denyWithLog('OWNERSHIP_MISMATCH', 'Not your order', $order, $user);
        }

        // 2. Order status checks
        if (in_array($order->status, ['shipped', 'delivered', 'cancelled', 'refunded'])) {
            return $this->denyWithLog(
                'INVALID_STATUS',
                "Cannot cancel order with status: {$order->status}",
                $order,
                $user
            );
        }

        // 3. Time-based checks
        $maxHours = $config['max_cancellation_hours'] ?? 24;
        $hoursSinceCreated = $order->created_at->diffInHours(now());
        if ($hoursSinceCreated > $maxHours) {
            return $this->denyWithLog(
                'TIME_LIMIT_EXCEEDED',
                "Order is older than {$maxHours} hours",
                $order,
                $user
            );
        }

        // 4. Payload validation
        if (($config['require_reason'] ?? true) && empty($payload['reason'])) {
            return $this->denyWithLog('REASON_REQUIRED', 'Cancellation reason required', $order, $user);
        }

        // 5. Rate limiting
        if ($config['check_rate_limit'] ?? true) {
            $maxPerMonth = $config['max_cancellations_per_month'] ?? 5;
            $count = $this->getMonthlyCancellationCount($user);
            if ($count >= $maxPerMonth) {
                return $this->denyWithLog(
                    'RATE_LIMIT_EXCEEDED',
                    "Exceeded {$maxPerMonth} cancellations per month",
                    $order,
                    $user
                );
            }
        }

        // 6. Payment checks
        if ($config['check_payment'] ?? true) {
            if ($order->payment_status === 'refunded') {
                return $this->denyWithLog('PAYMENT_ALREADY_REFUNDED', 'Payment already refunded', $order, $user);
            }
        }

        // 7. Dispute checks
        if (($config['check_disputes'] ?? true) && $this->hasActiveDispute($order)) {
            return $this->denyWithLog('ACTIVE_DISPUTE', 'Order has active dispute', $order, $user);
        }

        // 8. Inventory checks
        if (($config['check_inventory'] ?? true)) {
            $restockInventory = $payload['restock_inventory'] ?? true;
            if ($restockInventory && !$this->canRestockInventory($order)) {
                return $this->denyWithLog('INVENTORY_RESTOCK_FAILED', 'Cannot restock inventory', $order, $user);
            }
        }

        // All checks passed
        Log::info('Order cancellation restriction passed', [
            'order_id' => $order->id,
            'user_id' => $user->id,
        ]);

        return RestrictionResult::allow();
    }

    protected function denyWithLog(string $code, string $message, Order $order, ?User $user = null): RestrictionResult
    {
        Log::warning('Order cancellation restriction denied', [
            'code' => $code,
            'message' => $message,
            'order_id' => $order->id,
            'user_id' => $user?->id,
        ]);

        return RestrictionResult::deny($code, $message);
    }

    protected function getMonthlyCancellationCount(User $user): int
    {
        $cacheKey = "user_cancellations_{$user->id}_" . now()->format('Y-m');
        
        return Cache::remember($cacheKey, 3600, function () use ($user) {
            return $user->orders()
                ->where('status', 'cancelled')
                ->whereYear('cancelled_at', now()->year)
                ->whereMonth('cancelled_at', now()->month)
                ->count();
        });
    }

    protected function hasActiveDispute(Order $order): bool
    {
        return $order->disputes()
            ->where('status', 'open')
            ->exists();
    }

    protected function canRestockInventory(Order $order): bool
    {
        foreach ($order->items as $item) {
            if (!$item->product->canRestock()) {
                return false;
            }
        }
        return true;
    }
}
```

**Key Points:**
- Comprehensive logging
- Early exit for admin override
- Multiple validation layers
- Caching for performance
- Detailed error messages
- Production-ready implementation

## Code Conventions

### Recommended Code Format

Use uppercase with underscores:

```php
// ✅ Good
RestrictionResult::deny('PERMISSION_DENIED', 'Message');
RestrictionResult::deny('ORDER_SHIPPED', 'Message');
RestrictionResult::deny('TIME_LIMIT_EXCEEDED', 'Message');

// ❌ Bad
RestrictionResult::deny('permission-denied', 'Message');
RestrictionResult::deny('PermissionDenied', 'Message');
```

### Common Code Patterns

- `PERMISSION_DENIED` - User lacks permission
- `STATUS_INVALID` - Invalid model status
- `TIME_LIMIT_EXCEEDED` - Time constraint violation
- `REQUIRED_FIELD_MISSING` - Required field not provided
- `BUSINESS_RULE_VIOLATION` - Business rule violation
- `RESOURCE_LOCKED` - Resource is locked
- `QUOTA_EXCEEDED` - Quota limit exceeded

## Error Handling and Integration

### How Restriction Failures Work

When a restriction denies a transition, the `FlowTransition` service will:

1. Throw a `TaskRestrictionException`
2. Include the code and message from `RestrictionResult`
3. Prevent the transition from executing
4. Stop all subsequent tasks (validation and action tasks won't run)

### Basic Error Handling

```php
use JobMetric\Flow\Facades\FlowTransition;
use JobMetric\Flow\Exceptions\TaskRestrictionException;

try {
    $result = FlowTransition::runner('cancel_order', $order, $payload, $user);
    
    // Transition succeeded
    return response()->json([
        'success' => true,
        'data' => $result->getData(),
    ]);
    
} catch (TaskRestrictionException $e) {
    // Restriction denied
    $code = $e->getCode();
    $message = $e->getMessage();
    
    return response()->json([
        'success' => false,
        'error' => $code,
        'message' => $message,
    ], 403);
}
```

### Advanced Error Handling with Code-Based Responses

Handle different restriction codes with specific responses:

```php
namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use JobMetric\Flow\Facades\FlowTransition;
use JobMetric\Flow\Exceptions\TaskRestrictionException;

class OrderController extends Controller
{
    public function cancel(Request $request, Order $order): JsonResponse
    {
        $payload = [
            'reason' => $request->input('reason'),
            'restock_inventory' => $request->boolean('restock_inventory', true),
        ];

        try {
            $result = FlowTransition::runner('cancel_order', $order, $payload, auth()->user());

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => $result->getData(),
            ]);

        } catch (TaskRestrictionException $e) {
            return $this->handleRestrictionError($e, $order);
        }
    }

    protected function handleRestrictionError(TaskRestrictionException $e, Order $order): JsonResponse
    {
        $code = $e->getCode();
        $message = $e->getMessage();

        // Handle specific restriction codes
        return match ($code) {
            'USER_NOT_AUTHENTICATED' => response()->json([
                'success' => false,
                'error' => $code,
                'message' => $message,
                'action' => 'login_required',
            ], 401),

            'PERMISSION_DENIED' => response()->json([
                'success' => false,
                'error' => $code,
                'message' => $message,
                'action' => 'contact_support',
            ], 403),

            'ORDER_SHIPPED' => response()->json([
                'success' => false,
                'error' => $code,
                'message' => $message,
                'action' => 'contact_shipping',
                'shipping_info' => [
                    'tracking_number' => $order->tracking_number,
                    'shipped_at' => $order->shipped_at,
                ],
            ], 403),

            'TIME_LIMIT_EXCEEDED' => response()->json([
                'success' => false,
                'error' => $code,
                'message' => $message,
                'action' => 'contact_support',
                'order_age_hours' => $order->created_at->diffInHours(now()),
            ], 403),

            'RATE_LIMIT_EXCEEDED' => response()->json([
                'success' => false,
                'error' => $code,
                'message' => $message,
                'action' => 'wait_or_contact',
                'retry_after' => now()->addDay()->toIso8601String(),
            ], 429),

            'REASON_REQUIRED' => response()->json([
                'success' => false,
                'error' => $code,
                'message' => $message,
                'action' => 'provide_reason',
                'validation' => [
                    'reason' => ['required', 'string', 'min:10'],
                ],
            ], 422),

            default => response()->json([
                'success' => false,
                'error' => $code,
                'message' => $message,
                'action' => 'contact_support',
            ], 403),
        };
    }
}
```

### Frontend Integration Example

Handle restriction errors in frontend applications:

```javascript
// React/Vue/Angular example
async function cancelOrder(orderId, reason) {
    try {
        const response = await fetch(`/api/orders/${orderId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ reason }),
        });

        const data = await response.json();

        if (data.success) {
            // Show success message
            showNotification('Order cancelled successfully', 'success');
            return data;
        } else {
            // Handle restriction error
            handleRestrictionError(data);
        }
    } catch (error) {
        handleError(error);
    }
}

function handleRestrictionError(data) {
    const { error, message, action } = data;

    switch (error) {
        case 'USER_NOT_AUTHENTICATED':
            redirectToLogin();
            break;

        case 'PERMISSION_DENIED':
            showError(message);
            showContactSupportButton();
            break;

        case 'ORDER_SHIPPED':
            showError(message);
            showShippingInfo(data.shipping_info);
            break;

        case 'TIME_LIMIT_EXCEEDED':
            showError(message);
            showContactSupportButton();
            break;

        case 'RATE_LIMIT_EXCEEDED':
            showError(message);
            showRetryAfter(data.retry_after);
            break;

        case 'REASON_REQUIRED':
            showValidationError(data.validation);
            break;

        default:
            showError(message);
            showContactSupportButton();
    }
}
```

### Logging and Monitoring

Log restriction failures for monitoring and analytics:

```php
use Illuminate\Support\Facades\Log;
use JobMetric\Flow\Exceptions\TaskRestrictionException;

try {
    $result = FlowTransition::runner('cancel_order', $order, $payload, $user);
} catch (TaskRestrictionException $e) {
    // Log restriction failure
    Log::warning('Order cancellation restricted', [
        'order_id' => $order->id,
        'user_id' => $user?->id,
        'restriction_code' => $e->getCode(),
        'restriction_message' => $e->getMessage(),
        'order_status' => $order->status,
        'order_total' => $order->total,
        'payload' => $payload,
    ]);

    // Track in analytics
    analytics()->track('order_cancellation_restricted', [
        'restriction_code' => $e->getCode(),
        'order_id' => $order->id,
    ]);

    // Send to error tracking service
    if (app()->bound('sentry')) {
        app('sentry')->captureException($e, [
            'tags' => [
                'restriction_code' => $e->getCode(),
                'order_id' => $order->id,
            ],
        ]);
    }

    throw $e; // Re-throw to handle in controller
}
```

### Testing Restriction Results

Test restriction tasks and their results:

```php
namespace Tests\Feature\Flows;

use App\Flows\Order\RestrictCancellationRestrictionTask;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use JobMetric\Flow\DTO\TransitionResult;
use JobMetric\Flow\Support\FlowTaskContext;
use JobMetric\Flow\Support\RestrictionResult;
use Tests\TestCase;

class RestrictionTaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_allows_cancellation_when_all_conditions_met(): void
    {
        $order = Order::factory()->create(['status' => 'pending']);
        $user = User::factory()->create();
        $user->givePermissionTo('cancel', Order::class);

        $task = new RestrictCancellationRestrictionTask();
        $context = new FlowTaskContext(
            $order,
            TransitionResult::success(),
            ['reason' => 'Customer request'],
            $user
        );

        $result = $task->restriction($context);

        $this->assertTrue($result->allowed());
        $this->assertNull($result->code());
    }

    public function test_denies_cancellation_when_order_shipped(): void
    {
        $order = Order::factory()->create(['status' => 'shipped']);
        $user = User::factory()->create();

        $task = new RestrictCancellationRestrictionTask();
        $context = new FlowTaskContext($order, TransitionResult::success(), [], $user);

        $result = $task->restriction($context);

        $this->assertFalse($result->allowed());
        $this->assertEquals('ORDER_SHIPPED', $result->code());
        $this->assertNotNull($result->message());
    }

    public function test_denies_cancellation_without_permission(): void
    {
        $order = Order::factory()->create(['status' => 'pending']);
        $user = User::factory()->create();
        // User does NOT have permission

        $task = new RestrictCancellationRestrictionTask();
        $context = new FlowTaskContext($order, TransitionResult::success(), [], $user);

        $result = $task->restriction($context);

        $this->assertFalse($result->allowed());
        $this->assertEquals('PERMISSION_DENIED', $result->code());
    }

    public function test_denies_cancellation_without_reason(): void
    {
        $order = Order::factory()->create(['status' => 'pending']);
        $user = User::factory()->create();
        $user->givePermissionTo('cancel', Order::class);

        $task = new RestrictCancellationRestrictionTask();
        $context = new FlowTaskContext(
            $order,
            TransitionResult::success(),
            [], // No reason provided
            $user
        );

        $result = $task->restriction($context);

        $this->assertFalse($result->allowed());
        $this->assertEquals('REASON_REQUIRED', $result->code());
    }
}
```

## Best Practices

1. **Use Descriptive Codes**: Choose codes that clearly identify the restriction reason
   ```php
   // ✅ Good
   RestrictionResult::deny('ORDER_SHIPPED', 'Message');
   
   // ❌ Bad
   RestrictionResult::deny('ERROR', 'Message');
   ```

2. **Provide User-Friendly Messages**: Messages should be understandable by end users
   ```php
   // ✅ Good
   RestrictionResult::deny('ORDER_SHIPPED', 'Cannot cancel shipped orders');
   
   // ❌ Bad
   RestrictionResult::deny('ORDER_SHIPPED', 'Error code 42');
   ```

3. **Check Multiple Conditions**: Evaluate all conditions before allowing
   ```php
   // Check permission
   if (!$user->can('cancel', $order)) {
       return RestrictionResult::deny('PERMISSION_DENIED', '...');
   }
   
   // Check status
   if ($order->status === 'shipped') {
       return RestrictionResult::deny('ORDER_SHIPPED', '...');
   }
   
   return RestrictionResult::allow();
   ```

4. **Use Config for Flexibility**: Make restrictions configurable when possible
   ```php
   $allowedStatuses = $context->config()['allowed_statuses'] ?? [];
   ```

5. **Return Early**: Return deny results as soon as a condition fails
   ```php
   // ✅ Good: Early return
   if ($order->status === 'shipped') {
       return RestrictionResult::deny('ORDER_SHIPPED', '...');
   }
   
   // ❌ Bad: Nested conditions
   if ($order->status !== 'shipped') {
       if ($user->can('cancel', $order)) {
           return RestrictionResult::allow();
       }
   }
   ```

## Integration with FlowTransition

### Execution Order

Restriction tasks are executed **first** in the workflow transition:

```php
// FlowTransition execution order:
// 1. Restriction tasks (can deny) ← Executed FIRST
// 2. Validation tasks (can fail)   ← Only if restrictions pass
// 3. Action tasks (execute)        ← Only if restrictions pass AND validation passes
```

### How Restrictions Stop Transitions

If **any** restriction task returns `deny()`, the transition is stopped immediately:

```php
// Inside FlowTransition::runner()
foreach ($restrictionTasks as $task) {
    $result = $task->restriction($context);
    
    if (!$result->allowed()) {
        // Transition STOPS here
        // Validation tasks won't run
        // Action tasks won't run
        throw new TaskRestrictionException(
            $result->code(),
            $result->message()
        );
    }
}

// Only reached if ALL restrictions allow
// Continue with validation tasks...
```

### Multiple Restrictions

When multiple restriction tasks exist, **all** must allow:

```php
// Example: Three restriction tasks
$restriction1 = new PermissionRestrictionTask();
$restriction2 = new OrderStatusRestrictionTask();
$restriction3 = new TimeBasedRestrictionTask();

// All three must return RestrictionResult::allow()
// If ANY returns deny(), transition stops
```

### Real-World Workflow Example

Complete example showing restriction flow in a real system:

```php
namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use JobMetric\Flow\Facades\FlowTransition;
use JobMetric\Flow\Exceptions\TaskRestrictionException;

class OrderController extends Controller
{
    /**
     * Cancel an order with comprehensive restriction handling
     */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        // Validate request
        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:500',
            'restock_inventory' => 'boolean',
        ]);

        try {
            // Execute transition - restrictions are checked automatically
            $result = FlowTransition::runner(
                'cancel_order',
                $order,
                $validated,
                auth()->user()
            );

            // Transition succeeded (all restrictions passed)
            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => $result->getData(),
                'messages' => $result->getMessages(),
            ]);

        } catch (TaskRestrictionException $e) {
            // A restriction denied the transition
            return $this->handleRestrictionFailure($e, $order);
        }
    }

    protected function handleRestrictionFailure(TaskRestrictionException $e, Order $order): JsonResponse
    {
        $code = $e->getCode();
        $message = $e->getMessage();

        // Map restriction codes to HTTP status codes
        $statusCode = match ($code) {
            'USER_NOT_AUTHENTICATED' => 401,
            'PERMISSION_DENIED' => 403,
            'RATE_LIMIT_EXCEEDED' => 429,
            default => 403,
        };

        // Provide actionable error responses
        $response = [
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message,
            ],
            'order' => [
                'id' => $order->id,
                'status' => $order->status,
            ],
        ];

        // Add context-specific information
        switch ($code) {
            case 'TIME_LIMIT_EXCEEDED':
                $response['context'] = [
                    'order_created_at' => $order->created_at->toIso8601String(),
                    'hours_since_creation' => $order->created_at->diffInHours(now()),
                ];
                break;

            case 'ORDER_SHIPPED':
                $response['context'] = [
                    'shipped_at' => $order->shipped_at?->toIso8601String(),
                    'tracking_number' => $order->tracking_number,
                ];
                break;

            case 'RATE_LIMIT_EXCEEDED':
                $response['context'] = [
                    'retry_after' => now()->addDay()->toIso8601String(),
                ];
                break;
        }

        return response()->json($response, $statusCode);
    }
}
```

### Debugging Restrictions

Debug restriction failures during development:

```php
use JobMetric\Flow\Facades\FlowTransition;
use JobMetric\Flow\Exceptions\TaskRestrictionException;
use Illuminate\Support\Facades\Log;

try {
    $result = FlowTransition::runner('cancel_order', $order, $payload, $user);
} catch (TaskRestrictionException $e) {
    // Debug information
    Log::debug('Restriction failure', [
        'code' => $e->getCode(),
        'message' => $e->getMessage(),
        'order_id' => $order->id,
        'order_status' => $order->status,
        'user_id' => $user?->id,
        'payload' => $payload,
        'stack_trace' => $e->getTraceAsString(),
    ]);

    // In development, show detailed error
    if (app()->environment('local')) {
        return response()->json([
            'error' => $e->getCode(),
            'message' => $e->getMessage(),
            'debug' => [
                'order' => $order->toArray(),
                'user' => $user?->toArray(),
                'payload' => $payload,
            ],
        ], 403);
    }

    throw $e;
}
```

### Best Practices for Restriction Codes

**1. Use Consistent Naming:**
```php
// ✅ Good: Clear, descriptive codes
'PERMISSION_DENIED'
'ORDER_SHIPPED'
'TIME_LIMIT_EXCEEDED'
'RATE_LIMIT_EXCEEDED'

// ❌ Bad: Vague codes
'ERROR'
'FAILED'
'NOT_ALLOWED'
```

**2. Group Related Codes:**
```php
// Permission-related
'PERMISSION_DENIED'
'INSUFFICIENT_ROLE'
'OWNERSHIP_MISMATCH'

// Status-related
'ORDER_SHIPPED'
'ORDER_DELIVERED'
'ORDER_CANCELLED'

// Time-related
'TIME_LIMIT_EXCEEDED'
'OUTSIDE_BUSINESS_HOURS'
'DATE_BLOCKED'
```

**3. Provide Actionable Messages:**
```php
// ✅ Good: Tells user what to do
RestrictionResult::deny(
    'TIME_LIMIT_EXCEEDED',
    'Orders can only be cancelled within 24 hours. Please contact support for assistance.'
);

// ❌ Bad: Doesn't help user
RestrictionResult::deny(
    'TIME_LIMIT_EXCEEDED',
    'Time limit exceeded'
);
```

**4. Use Codes for Programmatic Handling:**
```php
// Frontend can handle specific codes
if (error.code === 'RATE_LIMIT_EXCEEDED') {
    showRetryAfterMessage(error.retry_after);
} else if (error.code === 'PERMISSION_DENIED') {
    showContactSupportButton();
}
```

## Related Documentation

- [FlowTaskContext](/packages/laravel-flow/deep-diving/support/flow-task-context) - Task execution context
- [TransitionResult](/packages/laravel-flow/deep-diving/transition-result) - Transition result DTO
- [FlowTransition Service](/packages/laravel-flow/deep-diving/services/flow-transition) - Transition execution
- [FlowTask Service](/packages/laravel-flow/deep-diving/services/flow-task) - Task management
- [MakeTask Command](/packages/laravel-flow/deep-diving/make-task) - Generating task drivers
- [FlowTaskRegistry](/packages/laravel-flow/deep-diving/support/flow-task-registry) - Task driver registry

