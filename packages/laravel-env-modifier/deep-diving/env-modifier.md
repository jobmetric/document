---
sidebar_position: 1
sidebar_label: EnvModifier
---

import Link from "@docusaurus/Link";

# EnvModifier

The `EnvModifier` class is the core service for managing `.env` files in Laravel applications. It provides methods for file operations (create, backup, restore, delete, merge) and key operations (get, set, rename, delete, has).

## Namespace

```php
JobMetric\EnvModifier\EnvModifier
```

## Facade

```php
use JobMetric\EnvModifier\Facades\EnvModifier as EnvMod;
```

## Overview

The `EnvModifier` class provides a comprehensive API for working with `.env` files:

- **File Operations**: Create, backup, restore, delete, and merge `.env` files
- **Key Operations**: Read, write, rename, delete, and check existence of keys
- **Value Normalization**: Automatically handles quoting, escaping, and type conversion
- **Atomic Writes**: Uses `LOCK_EX` to prevent race conditions
- **Comment Preservation**: Preserves comments and blank lines during operations

## Basic Usage

### Set File Path

Before performing operations, you need to set the target `.env` file path:

```php
use JobMetric\EnvModifier\Facades\EnvModifier as EnvMod;

// Set path to existing file
EnvMod::setPath(base_path('.env'));

// Or use helper function
env_modifier_use(base_path('.env'));
```

**Throws:** `EnvFileNotFoundException` if the file doesn't exist

## File Operations

### Create File

Create a new `.env` file with initial content:

```php
// Create with array content
EnvMod::createFile(base_path('.env.staging'), [
    'APP_NAME' => 'My Staging App',
    'APP_ENV' => 'staging',
    'APP_DEBUG' => false,
], overwrite: false, bindToPath: true);

// Create with string content
EnvMod::createFile(base_path('.env.custom'), "APP_NAME=My App\nAPP_ENV=local\n");

// Create empty file
EnvMod::createFile(base_path('.env.empty'), null);
```

**Parameters:**
- `string $path` - Absolute or relative path to create
- `array|string|null $content` - Initial content (array renders to KEY=VALUE lines)
- `bool $overwrite` - Overwrite if file exists (default: `false`)
- `bool $bindToPath` - Bind instance to created path (default: `true`)

**Returns:** `static` - Fluent interface

**Throws:** `RuntimeException` if file exists and `overwrite=false`

### Backup File

Create a timestamped backup of the current file:

```php
$backupPath = EnvMod::backup('.bak');
// => /path/to/.env.bak.20250911_101530
```

**Parameters:**
- `string $suffix` - Suffix to append before timestamp (default: `.bak`)

**Returns:** `string` - Absolute path of backup file

**Throws:** `EnvFileNotFoundException` if file path not set

### Restore File

Restore content from a backup file:

```php
// Restore to current bound path
EnvMod::restore($backupPath);

// Restore and rebind to backup file
EnvMod::restore($backupPath, bindToPath: true);
```

**Parameters:**
- `string $backupPath` - Absolute path to backup file
- `bool $bindToPath` - Bind to backup path after restore (default: `false`)

**Returns:** `static` - Fluent interface

**Throws:** `RuntimeException` if backup file not found

### Delete File

Delete the bound `.env` file with optional main `.env` protection:

```php
// Delete with protection
EnvMod::deleteFile(force: false, mainEnvAbsolutePath: base_path('.env'));

// Force delete (bypasses protection)
EnvMod::deleteFile(force: true, mainEnvAbsolutePath: base_path('.env'));
```

**Parameters:**
- `bool $force` - Allow deletion of main `.env` (default: `false`)
- `string|null $mainEnvAbsolutePath` - Protected main `.env` path (default: `null`)

**Throws:** 
- `EnvFileNotFoundException` if file not found
- `RuntimeException` if trying to delete main `.env` without `force=true`

### Merge From Path

Merge keys from another `.env` file:

```php
// Merge all keys
EnvMod::mergeFromPath(base_path('.env.template'));

// Merge only specific keys
EnvMod::mergeFromPath(base_path('.env.template'), only: ['APP_NAME', 'APP_ENV']);

// Merge all except specific keys
EnvMod::mergeFromPath(base_path('.env.shared'), except: ['APP_KEY']);
```

**Parameters:**
- `string $path` - Source `.env` file path
- `array $only` - Only merge these keys (empty = all)
- `array $except` - Exclude these keys from merge

**Returns:** `static` - Fluent interface

**Throws:** `RuntimeException` if source file not found

## Key Operations

### Get All Keys

Read all key/value pairs from the file:

```php
$all = EnvMod::all();
// => ['APP_NAME' => 'My App', 'APP_ENV' => 'local', ...]
```

**Returns:** `array<string,string>` - Associative array of all keys

### Get Keys

Read one or more keys:

```php
// Single key
$values = EnvMod::get('APP_NAME');
// => ['APP_NAME' => 'My App']

// Multiple keys (variadic)
$values = EnvMod::get('APP_NAME', 'APP_ENV', 'APP_DEBUG');
// => ['APP_NAME' => 'My App', 'APP_ENV' => 'local', 'APP_DEBUG' => 'true']

// Mixed variadic and array
$values = EnvMod::get('APP_NAME', ['APP_ENV', 'APP_DEBUG']);
// => ['APP_NAME' => 'My App', 'APP_ENV' => 'local', 'APP_DEBUG' => 'true']
```

**Parameters:**
- `mixed ...$keys` - One or more keys or arrays of keys

**Returns:** `array<string,string>` - Associative array (missing keys return empty string)

### Set Keys

Upsert one or more keys:

```php
EnvMod::set([
    'APP_NAME' => 'My App',
    'APP_ENV' => 'local',
    'APP_DEBUG' => true,        // Stored as "true"
    'JSON_DATA' => ['a' => 1],  // Stored as JSON string
]);
```

**Parameters:**
- `array<string,mixed> $data` - Associative array of key => value

**Returns:** `static` - Fluent interface

### Set If Missing

Set keys only if they are missing or empty:

```php
EnvMod::setIfMissing([
    'APP_URL' => 'http://localhost',
    'APP_TIMEZONE' => 'UTC',
]);
```

**Parameters:**
- `array<string,mixed> $data` - Default values to apply

**Returns:** `static` - Fluent interface

### Rename Key

Rename a key to a new name:

```php
// Rename without overwrite
EnvMod::rename('OLD_KEY', 'NEW_KEY', overwrite: false);

// Rename with overwrite
EnvMod::rename('OLD_KEY', 'NEW_KEY', overwrite: true);
```

**Parameters:**
- `string $from` - Source key
- `string $to` - Target key
- `bool $overwrite` - Allow overwriting if target exists (default: `false`)

**Returns:** `static` - Fluent interface

**Throws:** `RuntimeException` if target exists and `overwrite=false`

### Delete Keys

Delete one or more keys:

```php
// Single key
EnvMod::delete('APP_DEBUG');

// Multiple keys (variadic)
EnvMod::delete('APP_DEBUG', 'OLD_FEATURE', 'LEGACY_KEY');

// Mixed variadic and array
EnvMod::delete('APP_DEBUG', ['OLD_FEATURE', 'LEGACY_KEY']);
```

**Parameters:**
- `mixed ...$keys` - One or more keys or arrays of keys

**Returns:** `static` - Fluent interface

### Has Key

Check if a key exists:

```php
if (EnvMod::has('APP_NAME')) {
    // Key exists
}
```

**Parameters:**
- `string $key` - Key to check

**Returns:** `bool` - `true` if key exists, `false` otherwise

## Value Normalization

The package automatically normalizes values when writing:

- **Booleans**: `true` → `"true"`, `false` → `"false"`
- **Null**: `null` → empty string
- **Arrays/Objects**: JSON-encoded automatically
- **Quoting**: Auto-quotes values containing:
  - Spaces
  - `#` character
  - `=` character
  - Leading/trailing whitespace
- **Newlines**: Escaped as `\n` for storage, restored on read

When reading, surrounding quotes are stripped and escaped sequences are unescaped.

## Complete Examples

### Initialize Environment from Template

```php
use JobMetric\EnvModifier\Facades\EnvModifier as EnvMod;

// Create staging environment
EnvMod::createFile(base_path('.env.staging'), [], bindToPath: true);

// Merge selected keys from template
EnvMod::mergeFromPath(base_path('.env.template'), only: [
    'APP_NAME',
    'APP_ENV',
    'CACHE_DRIVER',
    'SESSION_DRIVER',
]);

// Set environment-specific defaults
EnvMod::setIfMissing([
    'APP_ENV' => 'staging',
    'APP_NAME' => 'My Staging App',
]);
```

### Safe Key Refactoring

```php
// Rename legacy key if new key doesn't exist
if (!EnvMod::has('APP_URL')) {
    EnvMod::rename('LEGACY_URL', 'APP_URL');
}
```

### Backup Before Risky Operations

```php
// Create backup
$backup = EnvMod::backup('.bak');

try {
    // Perform risky operations
    EnvMod::set(['APP_KEY' => $newKey]);
} catch (\Exception $e) {
    // Restore on error
    EnvMod::restore($backup);
    throw $e;
}
```

## Related Documentation

- <Link to="/packages/laravel-env-modifier/deep-diving/exceptions/env-file-not-found-exception">EnvFileNotFoundException</Link>
- <Link to="/packages/laravel-env-modifier/showcase">Showcase Examples</Link>

