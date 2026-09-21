---
sidebar_position: 2
sidebar_label: RuleEvaluatorRegistry
---

# RuleEvaluatorRegistry

Registers and resolves role rule evaluator drivers used by `role_rules.driver`.

## Namespace

```php
JobMetric\Rolix\Support\RuleEvaluatorRegistry
```

## Facade

```php
use JobMetric\Rolix\Facades\RuleEvaluatorRegistry;
```

## Boot

Built-in evaluators are registered in `afterRegisterPackage` (time, weekday, user_status, ip_range, location, env, role_count, quota, custom_expression).

## Methods

### `register()`

```php
public function register(string $class): self
```

`$class` must implement `RuleEvaluatorContract`. The registry resolves `app($class)` and indexes by `$instance->name()`.

```php
RuleEvaluatorRegistry::register(BusinessHoursEvaluator::class);
```

**Throws:** `InvalidArgumentException` when the class does not implement the contract.

### `unregister()`

```php
public function unregister(string $name): self
```

### `has()` / `get()` / `resolveClass()`

```php
RuleEvaluatorRegistry::has('time');
$driver = RuleEvaluatorRegistry::get('time'); // ?RuleEvaluatorContract
$class = RuleEvaluatorRegistry::resolveClass('time'); // ?class-string
```

`get()` / `resolveClass()` also accept an FQCN that implements the contract.

### `all()` / `values()`

```php
RuleEvaluatorRegistry::all();    // name => class-string
RuleEvaluatorRegistry::values(); // list of names
```

### `formFor()`

```php
public function formFor(string $nameOrClass): ?FormBuilder
```

Returns the evaluator's settings form builder when available (for admin UIs).

### `clear()`

Clears the registry (tests).

## Contract Reminder

Evaluators expose:

- `name(): string` — stable driver key stored in DB
- `evaluate(array $rule, mixed $context): bool`
- `form(): FormBuilder` / `fields()` — UI metadata

See [Rule Evaluators Overview](/packages/rolix/deep-diving/evaluators/overview).

## Related Documentation

- [Rule Evaluators Overview](/packages/rolix/deep-diving/evaluators/overview)
- [Role Service](/packages/rolix/deep-diving/services/role) — `syncRules()`
