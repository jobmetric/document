---
sidebar_position: 1
sidebar_label: Overview
---

import Link from "@docusaurus/Link";

# Rule Evaluators Overview

Role rules are rows in `role_rules` with a `driver` name and JSON `payload`. During permission resolution, `HasRole` loads each role (and its ancestors) and runs every attached rule. **All rules must pass** or that role is excluded from the effective set.

Evaluators implement `JobMetric\Rolix\Contracts\RuleEvaluatorContract` and are typically subclasses of `JobMetric\Rolix\Contracts\AbstractRuleEvaluator`. Drivers are registered by **`name()`** (not `driver()`).

## How Evaluation Works

1. `HasRole::getRoleWithAncestorsIfValid()` collects the role plus ancestors.
2. For each role, `evaluateRoleRules()` loads `rules` and resolves the driver via `RuleEvaluatorRegistry::get($rule->driver)`.
3. It calls `$driver->evaluate($payload, $this)` where `$this` is the personable model (the user / entity using `HasRole`).
4. If any rule returns `false`, or the driver is missing, the role is filtered out.

```php
// Conceptual flow inside HasRole
foreach ($role->rules as $rule) {
    $driver = RuleEvaluatorRegistry::get($rule->driver);
    $payload = is_array($rule->payload) ? $rule->payload : [];

    if (! $driver->evaluate($payload, $this)) {
        return false; // role excluded
    }
}
```

## Contract & Abstract Base

### `RuleEvaluatorContract`

| Method | Signature | Purpose |
|--------|-----------|---------|
| `name()` | `string` | Unique driver key stored on `role_rules.driver` and used for registry lookup |
| `evaluate()` | `(array $rule, mixed $context): bool` | Return `true` to keep the role |
| `form()` | `FormBuilder` | UI form for configuring the payload |
| `fields()` | `array` | Built form array (`form()->build()->toArray()`) for UI consumers |

### `AbstractRuleEvaluator`

Provides helpers used by built-ins:

| Helper | Purpose |
|--------|---------|
| `string($rule, $key, $default)` | Trimmed string from payload |
| `int($rule, $key, $default)` | Integer from payload |
| `list($rule, $key)` | Array or CSV/` `;`/`-separated list |
| `request()` | Current HTTP request when available |
| `contextValue($context, $key)` | Attribute from model / array / object |
| `settingsForm($callback)` | Single-tab FormBuilder named after `name()` |
| `fields()` | Default implementation via `form()->build()->toArray()` |

## Attaching Rules to Roles

Pass a `rules` array when storing or updating a role through the Role service (validated by `StoreRoleRequest` / `UpdateRoleRequest`):

```php
use JobMetric\Rolix\Facades\Role;

Role::store([
    'name' => 'Office Hours Admin',
    'type' => 'system',
    'allow' => ['users.view'],
    'rules' => [
        [
            'driver' => 'time',
            'payload' => [
                'from' => '09:00',
                'to' => '18:00',
                'timezone' => 'Asia/Tehran',
            ],
        ],
        [
            'driver' => 'weekday',
            'payload' => [
                'days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            ],
        ],
    ],
]);
```

### Sync behavior (`Role::syncRules`)

| Call | Behavior |
|------|----------|
| Store with `rules` | After create, deletes existing rows for the role and inserts the provided list |
| Update with `rules` key present | Same replace semantics |
| Update **without** `rules` key | Existing rules are left unchanged (`syncRules(..., null)` returns early) |
| `rules: []` | Clears all rules for the role |

Each item becomes a `RoleRule` row:

| Column | Source |
|--------|--------|
| `role_id` | Parent role |
| `driver` | `$rule['driver']` — must match an evaluator `name()` |
| `payload` | `$rule['payload'] ?? null` (JSON) |

Payload field validation is taken from each evaluator’s `form()` field `validation` strings (`Role::validateRulesPayload`).

See also <Link to="/packages/rolix/deep-diving/support/rule-evaluator-registry">RuleEvaluatorRegistry</Link> and <Link to="/packages/rolix/deep-diving/resources/role-rule-resource">RoleRuleResource</Link>.

---

## Built-in Drivers

| Name (`name()`) | Class | Summary |
|-----------------|-------|---------|
| `time` | `TimeEvaluator` | Current time within `from`–`to` window |
| `weekday` | `WeekdayEvaluator` | Current weekday in allowed list |
| `user_status` | `UserStatusEvaluator` | Personable attribute equals expected value |
| `ip_range` | `IpRangeEvaluator` | Request IP matches exact IP or IPv4 CIDR |
| `location` | `LocationEvaluator` | Country / city from context or headers |
| `env` | `EnvEvaluator` | App environment in allowed list |
| `role_count` | `RoleCountEvaluator` | Active membership count within min/max |
| `quota` | `QuotaEvaluator` | Active memberships in a collection ≤ limit |
| `custom_expression` | `CustomExpressionEvaluator` | Safe comparison over context/request keys |

---

### `time` — TimeEvaluator

Restricts the role to a daily time window. Supports overnight ranges when `from` > `to`.

**Payload fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | string (`H:i`) | yes | Start time |
| `to` | string (`H:i`) | yes | End time |
| `timezone` | string | no | Defaults to `config('app.timezone')` or `UTC` |

**Behavior**

- Missing `from` or `to` → `false`
- Same-day window (`from <= to`): `now` must be between inclusive bounds
- Overnight (`from > to`): `now >= from` **or** `now <= to`

**Example**

```json
{
  "driver": "time",
  "payload": {
    "from": "09:00",
    "to": "17:30",
    "timezone": "Asia/Tehran"
  }
}
```

---

### `weekday` — WeekdayEvaluator

Allows the role only on selected weekdays.

**Payload fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `days` | array\|CSV string | yes | Day names (`monday`…`sunday`) and/or Carbon `dayOfWeek` numbers (`0`–`6`) |
| `timezone` | string | no | Defaults to app timezone |

**Behavior**

- Empty `days` → `false`
- Matches lowercase English day name **or** numeric day of week

**Example**

```json
{
  "driver": "weekday",
  "payload": {
    "days": ["monday", "wednesday", "friday"],
    "timezone": "UTC"
  }
}
```

---

### `user_status` — UserStatusEvaluator

Compares an attribute on the personable context to an expected string.

**Payload fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `attribute` | string | no | Attribute name; default `status` |
| `expected` | string | yes | Expected value (string comparison) |

**Behavior**

- Missing `expected` → `false`
- Boolean attributes are normalized to `'1'` / `'0'`
- Comparison is `(string) $actual === $expected`

**Example**

```json
{
  "driver": "user_status",
  "payload": {
    "attribute": "status",
    "expected": "active"
  }
}
```

---

### `ip_range` — IpRangeEvaluator

Checks the current request IP against a list of exact addresses or IPv4 CIDR ranges.

**Payload fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ranges` | array\|CSV string | yes | e.g. `127.0.0.1`, `10.0.0.0/8` |

**Behavior**

- No request IP or empty ranges → `false`
- First matching range wins
- Non-CIDR entries require exact string match
- CIDR matching is **IPv4 only**

**Example**

```json
{
  "driver": "ip_range",
  "payload": {
    "ranges": "127.0.0.1, 10.0.0.0/8, 192.168.1.0/24"
  }
}
```

---

### `location` — LocationEvaluator

Restricts by country and/or city. Values come from the personable context, then request headers.

**Payload fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `countries` | array\|CSV | no* | ISO-style country codes (compared uppercase) |
| `cities` | array\|CSV | no* | City names (compared lowercase) |

\* At least one of `countries` or `cities` must be non-empty, otherwise evaluation returns `false`.

**Resolution order**

| Dimension | Sources (first non-empty) |
|-----------|---------------------------|
| Country | `$context->country`, header `CF-IPCountry`, header `X-Country` |
| City | `$context->city`, header `X-City` |

Both configured dimensions must pass (AND). An empty list for a dimension means “do not constrain that dimension”.

**Example**

```json
{
  "driver": "location",
  "payload": {
    "countries": "IR,DE",
    "cities": "tehran,berlin"
  }
}
```

---

### `env` — EnvEvaluator

Allows the role only when `app()->environment()` is in the allowed list.

**Payload fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `environments` | array\|CSV | yes | e.g. `local`, `staging`, `production` |

**Example**

```json
{
  "driver": "env",
  "payload": {
    "environments": ["local", "staging"]
  }
}
```

---

### `role_count` — RoleCountEvaluator

Counts the personable’s **non-expired** memberships (optionally filtered by role `type`) and checks min/max bounds.

**Payload fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | no | Limit count to memberships whose role has this `type` |
| `min` | int | no | Minimum count (default `0`) |
| `max` | int | no | Maximum count (inclusive); omit for no upper bound |

**Behavior**

- Context must be an Eloquent `Model`; otherwise `false`
- Memberships with `expired_at` null or in the future are counted

**Example**

```json
{
  "driver": "role_count",
  "payload": {
    "type": "tenant",
    "min": 1,
    "max": 3
  }
}
```

---

### `quota` — QuotaEvaluator

Ensures the personable’s active memberships in a given `collection` do not exceed a limit.

**Payload fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | string | yes | Membership `collection` value to count |
| `limit` | int | yes | Maximum allowed count (inclusive) |

**Behavior**

- Context must be a `Model`
- Missing `key` or `limit` → `false`
- Counts non-expired memberships where `collection = key`
- Passes when `$count <= $limit`

**Example**

```json
{
  "driver": "quota",
  "payload": {
    "key": "projects",
    "limit": 5
  }
}
```

---

### `custom_expression` — CustomExpressionEvaluator

Safe comparisons over whitelisted context/request keys. **Does not use `eval`.**

**Payload fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `left_key` | string | yes | Attribute path; see resolution below |
| `operator` | string | yes | One of: `eq`, `neq`, `in`, `not_in`, `gt`, `gte`, `lt`, `lte` |
| `right_value` | mixed | yes | Scalar or list (CSV for `in` / `not_in`) |

**`left_key` resolution**

| Key pattern | Resolves to |
|-------------|-------------|
| `request.ip` | Current request IP |
| `request.*` | Value from `request()->all()` (after the `request.` prefix) |
| other safe path | `contextValue($context, $key)` (model attribute / array key) |

Safe keys must match `/^[a-zA-Z_][a-zA-Z0-9_.]*$/`.

**Example**

```json
{
  "driver": "custom_expression",
  "payload": {
    "left_key": "account_tier",
    "operator": "in",
    "right_value": "pro,enterprise"
  }
}
```

```json
{
  "driver": "custom_expression",
  "payload": {
    "left_key": "request.ip",
    "operator": "eq",
    "right_value": "127.0.0.1"
  }
}
```

---

## Custom Evaluator

Extend `AbstractRuleEvaluator`, implement `name()`, `evaluate()`, and `form()`, then register the class.

```php
namespace App\Rolix\Evaluators;

use JobMetric\CustomField\CustomFieldBuilder;
use JobMetric\Form\FormBuilder;
use JobMetric\Rolix\Contracts\AbstractRuleEvaluator;
use JobMetric\Rolix\Facades\RuleEvaluatorRegistry;

class BusinessHoursEvaluator extends AbstractRuleEvaluator
{
    public function name(): string
    {
        return 'business_hours';
    }

    public function evaluate(array $rule, mixed $context): bool
    {
        $open = $this->string($rule, 'open') ?? '09:00';
        $close = $this->string($rule, 'close') ?? '17:00';

        // Reuse TimeEvaluator semantics or custom logic
        return app(\JobMetric\Rolix\RuleEvaluators\TimeEvaluator::class)
            ->evaluate(['from' => $open, 'to' => $close], $context);
    }

    public function form(): FormBuilder
    {
        return $this->settingsForm(function ($tab) {
            $tab->customField(function (CustomFieldBuilder $field) {
                $field::time()
                    ->name('open')
                    ->label('Open')
                    ->validation('required|date_format:H:i');
            })->customField(function (CustomFieldBuilder $field) {
                $field::time()
                    ->name('close')
                    ->label('Close')
                    ->validation('required|date_format:H:i');
            });
        });
    }
}

// In a service provider boot method:
RuleEvaluatorRegistry::register(BusinessHoursEvaluator::class);
```

After registration, attach rules with `"driver": "business_hours"`. The registry keys evaluators by `$instance->name()`.

### UI form metadata

```php
RuleEvaluatorRegistry::formFor('time');
// [
//   'driver' => TimeEvaluator::class,
//   'name'   => 'time',
//   'form'   => [...built FormBuilder array...],
// ]
```

## Related Documentation

- <Link to="/packages/rolix/deep-diving/support/rule-evaluator-registry">RuleEvaluatorRegistry</Link>
- <Link to="/packages/rolix/deep-diving/requests/store-role-request">StoreRoleRequest</Link>
- <Link to="/packages/rolix/deep-diving/resources/role-rule-resource">RoleRuleResource</Link>
