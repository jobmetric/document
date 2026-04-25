---
sidebar_position: 3
sidebar_label: Command Scaffolding Tools
---

# Command Scaffolding Tools

`ConsoleTools` is a lightweight abstraction for generator-style artisan commands, especially commands that create files from stubs.

---

## When To Use

- Building custom `make:*` commands
- Generating classes/resources/requests from stubs
- Validating paths safely before writing files

---

## Methods

### getStub

Reads a stub file and replaces tokens with runtime values.  
Use it to generate class files, config files, or boilerplate templates with deterministic structure.

```php
$content = $this->getStub(__DIR__ . '/../stubs/service', [
    '{{ class }}' => 'OrderService',
    '{{ namespace }}' => 'App\\Services',
]);
```

### putFile

Writes generated content to a destination file path.  
Call this only after validating path existence and overwrite behavior.

```php
$this->putFile(app_path('Services/OrderService.php'), $content);
```

### isDir

Checks whether a directory exists before generation.  
This prevents invalid writes and keeps command execution safe.

```php
if (! $this->isDir(app_path('Services'))) {
    // ...
}
```

### makeDir

Creates a missing directory required by your generator output.  
It is typically paired with `isDir` in make commands.

```php
$this->makeDir(app_path('Services'));
```

### isFile

Checks whether the target file already exists.  
Use it to prevent accidental overwrites or to offer a `--force` branch.

```php
if ($this->isFile($targetFile)) {
    return $this->message('File already exists.', 'error');
}
```

### message

Prints standardized command output for success, errors, and informational states.  
Consistent command messaging improves DX and debugging.

```php
$this->message('Service created successfully.', 'success');
$this->message('Service already exists.', 'error');
```

---

## End-to-End Command Flow Example

```php
$targetDir = app_path('Services');
$targetFile = $targetDir . '/OrderService.php';

if (! $this->isDir($targetDir)) {
    $this->makeDir($targetDir);
}

if ($this->isFile($targetFile)) {
    return $this->message('Service already exists.', 'error');
}

$content = $this->getStub(__DIR__ . '/../stubs/service', [
    '{{ class }}' => 'OrderService',
    '{{ namespace }}' => 'App\\Services',
]);

$this->putFile($targetFile, $content);
$this->message('Service created successfully.', 'success');
```

---

## Best Practices

- Validate paths before writing files
- Keep command output deterministic and clear
- Keep stub placeholders explicit and minimal
- Check file existence before overwriting
