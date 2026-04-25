---
sidebar_position: 4
sidebar_label: Global Helper Utilities
---

# Global Helper Utilities

This package ships global helper functions in `src/helpers.php` and autoloads them through Composer.

---

## Important Notes Before Use

- These helpers are global; naming collisions are possible
- For complex domain logic, prefer service classes over helpers
- Keep helper behavior deterministic and side-effect free whenever possible

---

## Common Helpers

### appNamespace

Returns the application namespace.

```php
appNamespace(); // 'App\\'
```

### queryToSql

Converts a query builder instance to SQL (useful for debugging).

```php
$query = DB::table('users')->where('votes', '>', 100);
queryToSql($query);
```

> Useful for query inspection and debugging filter behavior.

### checkDatabaseConnection

Checks current database connectivity.

```php
checkDatabaseConnection(); // true|false
```

### shortFormatNumber

Formats large numbers into compact notation (`K`, `M`, `B`, `T`).

```php
shortFormatNumber(1000); // 1K
shortFormatNumber(1200000); // 1.2M
```

---

## Best Practices

- Keep helpers as pure as possible
- Validate external inputs before helper usage
- Move domain-specific helpers to dedicated services
- Consider naming collision risk in shared package ecosystems
