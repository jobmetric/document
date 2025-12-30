---
sidebar_position: 2
sidebar_label: FieldFactory
---

import Link from "@docusaurus/Link";

# FieldFactory

The `FieldFactory` class provides a static method to create field instances based on their type. It uses the `CustomFieldRegistry` to resolve field types and returns fresh clones to avoid shared state.

## Namespace

```php
JobMetric\CustomField\FieldFactory
```

## Overview

The factory pattern is used to create field instances dynamically. When you call `FieldFactory::create()`, it looks up the field type in the registry and returns a fresh clone of the registered field instance. This ensures each field instance is independent and doesn't share state with other instances.

## Available Methods

### Create

Create a field instance based on the type:

```php
FieldFactory::create(string $type): FieldContract
```

**Parameters:**
- `$type` (`string`): The field type (e.g., "text", "select", "radio").

**Returns:** `FieldContract` - A fresh clone of the registered field instance.

**Throws:** `Exception` - If the field type is not supported (not found in registry).

**Example:**

```php
use JobMetric\CustomField\FieldFactory;

$textField = FieldFactory::create('text');
$selectField = FieldFactory::create('select');
```

## Complete Examples

### Dynamic Field Creation

```php
use JobMetric\CustomField\FieldFactory;

function createFieldByType(string $type, array $config): FieldContract
{
    $field = FieldFactory::create($type);
    
    // Configure the field based on config array
    // ... configuration logic
    
    return $field;
}

// Usage
$field = createFieldByType('text', [
    'name' => 'email',
    'label' => 'Email',
    'required' => true,
]);
```

### Building Fields from Database Configuration

```php
use JobMetric\CustomField\FieldFactory;
use JobMetric\CustomField\CustomFieldBuilder;

class DynamicFormBuilder
{
    public function buildField(array $fieldConfig)
    {
        $type = $fieldConfig['type'];
        
        try {
            // Verify field type exists
            $prototype = FieldFactory::create($type);
            
            // Build using CustomFieldBuilder
            $builder = CustomFieldBuilder::{$type}();
            // ... configure builder
            
            return $builder->build();
        } catch (Exception $e) {
            throw new Exception("Unsupported field type: {$type}");
        }
    }
}
```

## When to Use FieldFactory

Use the factory when you need to:

- **Dynamic Field Creation**: Create fields based on runtime type strings
- **Type Validation**: Verify that a field type exists before building
- **Prototype Access**: Get a prototype instance for introspection
- **Programmatic Field Building**: Build fields from configuration arrays or database records

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/support/custom-field-registry">CustomFieldRegistry</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link>

