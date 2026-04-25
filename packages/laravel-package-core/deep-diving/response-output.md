---
sidebar_position: 10
sidebar_label: Standard Service Responses
---

# Standard Service Responses

`JobMetric\PackageCore\Output\Response` is a standardized service-level response wrapper that keeps output contracts consistent across application layers.

## Data Structure

```php
new Response(
    ok: true,
    message: 'Operation successful',
    data: $payload,
    status: 200,
    errors: []
);
```

## Factory Method

```php
Response::make(true, 'Done', $data, 200);
```

## When To Use

- Domain/application service outputs
- Standardizing CRUD method results
- Passing message/status/data to controllers/facades

## Practical Notes

- Keep `ok` explicit even when `status` exists
- Use `errors` only for real failure scenarios
- Keep `message` clear and deterministic
