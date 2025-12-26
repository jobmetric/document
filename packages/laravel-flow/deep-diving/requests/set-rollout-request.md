---
sidebar_position: 5
sidebar_label: SetRolloutRequest
---

# SetRolloutRequest

Form request class for validating rollout percentage updates for flows. This request ensures that rollout percentages are within valid range (0-100).

## Namespace

`JobMetric\Flow\Http\Requests\Flow\SetRolloutRequest`

## Overview

The `SetRolloutRequest` validates rollout percentage input when setting or updating the rollout percentage for a flow. Rollout percentage determines what percentage of subjects should use this flow.

## Validation Rules

| Field | Rule | Description |
|-------|------|-------------|
| `rollout_pct` | `nullable\|integer\|between:0,100` | Rollout percentage (0-100) |

## Usage Examples

### Set Rollout Percentage

```php
use JobMetric\Flow\Http\Requests\Flow\SetRolloutRequest;
use JobMetric\Flow\Facades\Flow;

public function setRollout(SetRolloutRequest $request, $id)
{
    $validated = $request->validated();
    
    Flow::setRollout($id, $validated['rollout_pct']);
    
    return response()->json(['message' => 'Rollout percentage updated']);
}
```

### Request Data Formats

#### Full Rollout (100%)

```php
$requestData = [
    'rollout_pct' => 100, // All subjects use this flow
];
```

#### Partial Rollout (50%)

```php
$requestData = [
    'rollout_pct' => 50, // Half of subjects use this flow
];
```

#### Gradual Rollout (10%)

```php
$requestData = [
    'rollout_pct' => 10, // Only 10% of subjects use this flow
];
```

#### Disable Rollout (0%)

```php
$requestData = [
    'rollout_pct' => 0, // No subjects use this flow
];
```

#### Clear Rollout (null)

```php
$requestData = [
    'rollout_pct' => null, // Rollout percentage removed
];
```

### Complete Example

```php
// POST /api/flows/1/set-rollout
{
    "rollout_pct": 25
}

// This sets the flow to be used by 25% of subjects
```

## Integration with Flow Service

The request is typically used with the `Flow::setRollout()` method:

```php
use JobMetric\Flow\Facades\Flow;

public function setRollout(SetRolloutRequest $request, $id)
{
    $rolloutPct = $request->validated()['rollout_pct'];
    
    Flow::setRollout($id, $rolloutPct);
    
    return response()->json(['message' => 'Rollout percentage updated']);
}
```

## Error Handling

### Validation Errors

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "rollout_pct": [
            "The rollout pct must be between 0 and 100."
        ]
    }
}
```

### Invalid Values

```php
// ❌ Invalid - Out of range
'rollout_pct' => 150, // Must be 100 or less
'rollout_pct' => -10, // Must be >= 0

// ❌ Invalid - Wrong type
'rollout_pct' => '50', // Must be integer
'rollout_pct' => 50.5, // Must be integer
```

## Use Cases

### A/B Testing

Gradually roll out a new flow to test its effectiveness:

```php
// Phase 1: 10% rollout
'rollout_pct' => 10,

// Phase 2: 25% rollout
'rollout_pct' => 25,

// Phase 3: 50% rollout
'rollout_pct' => 50,

// Phase 4: 100% rollout
'rollout_pct' => 100,
```

### Canary Deployments

Test new flows with a small percentage before full deployment:

```php
// Start with 5% canary
'rollout_pct' => 5,

// Gradually increase
'rollout_pct' => 20,
'rollout_pct' => 50,
'rollout_pct' => 100,
```

### Feature Flags

Control feature availability using rollout percentage:

```php
// Feature enabled for 30% of users
'rollout_pct' => 30,

// Disable feature
'rollout_pct' => 0,
```

### Regional Rollouts

Roll out flows to specific regions gradually:

```php
// Start with small region
'rollout_pct' => 10,

// Expand to more regions
'rollout_pct' => 50,
'rollout_pct' => 100,
```

## Best Practices

1. **Gradual Rollouts**: Start with small percentages and increase gradually
   ```php
   // ✅ Good - Gradual rollout
   10% → 25% → 50% → 100%
   
   // ⚠️ Risky - Immediate full rollout
   0% → 100%
   ```

2. **Monitor Performance**: Monitor flow performance at each rollout stage
   ```php
   // Monitor metrics before increasing
   if ($metrics->isHealthy()) {
       $rolloutPct = min($rolloutPct + 10, 100);
   }
   ```

3. **Use Integer Values**: Always use integer percentages
   ```php
   // ✅ Good
   'rollout_pct' => 25
   
   // ❌ Bad
   'rollout_pct' => 25.5
   ```

4. **Handle Null Values**: Consider null as "no rollout restriction"
   ```php
   // Null means no rollout percentage set
   'rollout_pct' => null
   ```

## Related Documentation

- [Flow Service](/packages/laravel-flow/deep-diving/services/flow) - Flow management and rollout
- [FlowPickerBuilder](/packages/laravel-flow/deep-diving/support/flow-picker-builder) - Flow selection with rollout
- [HasWorkflow](/packages/laravel-flow/deep-diving/has-workflow) - Workflow integration with rollout

