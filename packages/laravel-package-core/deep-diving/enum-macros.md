---
sidebar_position: 2
sidebar_label: Working with Enums
---

# Working with Enums

`EnumMacros` provides helper methods for enum-to-array conversions and common mappings.

---

## What Problem It Solves

In forms, validation rules, and APIs, you often need:

- A list of case names
- A list of case values
- Two-way mappings (`name => value`, `value => name`)

`EnumMacros` makes these operations consistent and reusable.

---

## Methods

### names

Returns an indexed array containing all enum case names.  
Use this when you need symbolic names for UI labels, logging, or diagnostics.

```php
Status::names(); // ['ACTIVE', 'INACTIVE']
```

### values

Returns an indexed array of enum values.  
This is commonly used in validation rules or filtering logic where values are persisted in the database.

```php
Status::values(); // [1, 2]
```

### array

Returns a name-to-value associative mapping.  
This is useful when building select options where the key and value need to be clearly mapped.

```php
Status::array(); // ['ACTIVE' => 1, 'INACTIVE' => 2]
```

### arrayValues

Returns a value-to-name associative mapping.  
Use this for reverse lookups when you have a stored value and need its semantic name.

```php
Status::arrayValues(); // [1 => 'ACTIVE', 2 => 'INACTIVE']
```

---

## Example

```php
enum Status: int
{
    case ACTIVE = 1;
    case INACTIVE = 2;
}
```

**Validation Example**

```php
Rule::in(Status::values())
```

**Select Options Example**

```php
collect(Status::array())->map(fn ($value, $label) => [
    'label' => $label,
    'value' => $value,
]);
```

---

## Best Practices

- Treat enums as your source of truth (not scattered config arrays)
- Prefer `values()` for APIs and `array()` for UI options
- Use `arrayValues()` for quick reverse lookups
