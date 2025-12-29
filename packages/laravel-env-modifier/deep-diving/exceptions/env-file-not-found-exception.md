---
sidebar_position: 1
sidebar_label: EnvFileNotFoundException
---

import Link from "@docusaurus/Link";

# EnvFileNotFoundException

The `EnvFileNotFoundException` exception is thrown when the package attempts to access a `.env` file that doesn't exist or when the file path hasn't been set.

## Namespace

```php
JobMetric\EnvModifier\Exceptions\EnvFileNotFoundException
```

## Overview

This exception is thrown in the following scenarios:

- When `setPath()` is called with a path to a non-existent file
- When operations are attempted before setting a file path
- When the bound file path is missing during operations

## Exception Details

### Constructor

```php
public function __construct(string $path, int $code = 400, ?Throwable $previous = null)
```

**Parameters:**
- `string $path` - The file path that was not found
- `int $code` - Exception code (default: `400`)
- `Throwable|null $previous` - Previous exception for chaining

### Message Format

The exception message follows this format:

```
Env file path: {path} not found!
```

## When It's Thrown

### 1. Setting Non-Existent Path

```php
use JobMetric\EnvModifier\Facades\EnvModifier as EnvMod;
use JobMetric\EnvModifier\Exceptions\EnvFileNotFoundException;

try {
    EnvMod::setPath(base_path('.env.nonexistent'));
} catch (EnvFileNotFoundException $e) {
    // Handle: File doesn't exist
}
```

### 2. Operations Without Path

```php
try {
    $all = EnvMod::all(); // Path not set
} catch (EnvFileNotFoundException $e) {
    // Handle: File path not set
}
```

### 3. File Deleted During Operation

```php
try {
    EnvMod::setPath(base_path('.env'));
    // File gets deleted by another process
    $all = EnvMod::all();
} catch (EnvFileNotFoundException $e) {
    // Handle: File was deleted
}
```

## Handling the Exception

### Check Before Setting Path

```php
use JobMetric\EnvModifier\Facades\EnvModifier as EnvMod;
use JobMetric\EnvModifier\Exceptions\EnvFileNotFoundException;

$path = base_path('.env.custom');

if (file_exists($path)) {
    EnvMod::setPath($path);
} else {
    // Create file first
    EnvMod::createFile($path, [], bindToPath: true);
}
```

### Create File If Missing

```php
try {
    EnvMod::setPath(base_path('.env.staging'));
} catch (EnvFileNotFoundException $e) {
    // Create file if it doesn't exist
    EnvMod::createFile(base_path('.env.staging'), [
        'APP_ENV' => 'staging',
    ], bindToPath: true);
}
```

### Graceful Fallback

```php
try {
    $values = EnvMod::get('APP_NAME', 'APP_ENV');
} catch (EnvFileNotFoundException $e) {
    // Fallback to default values
    $values = [
        'APP_NAME' => 'Default App',
        'APP_ENV' => 'local',
    ];
}
```

## Related Documentation

- <Link to="/packages/laravel-env-modifier/deep-diving/env-modifier">EnvModifier Service</Link>
- <Link to="/packages/laravel-env-modifier/showcase">Showcase Examples</Link>

