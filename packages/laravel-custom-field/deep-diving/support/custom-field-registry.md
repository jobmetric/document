---
sidebar_position: 1
sidebar_label: CustomFieldRegistry
---

import Link from "@docusaurus/Link";

# CustomFieldRegistry

The `CustomFieldRegistry` class holds and manages all available custom field type instances at runtime. It provides a single source of truth for resolving field implementations by their unique type.

## Namespace

```php
JobMetric\CustomField\Support\CustomFieldRegistry
```

## Overview

The registry acts as an in-memory catalog for all registered fields. It ensures each field type is unique and provides predictable lookups for field instances. This is essential for the package's extensibility, allowing you to register custom field types that can be used throughout your application.

## Available Methods

### Register

Register a field instance by its type:

```php
$registry->register(FieldContract $field): static
```

**Parameters:**
- `$field` (`FieldContract`): The field instance to be registered. Its `type()` must be unique.

**Returns:** `static` - Returns the registry instance for method chaining.

**Throws:** `InvalidArgumentException` - If a field with the same type is already registered.

**Example:**

```php
use JobMetric\CustomField\Support\CustomFieldRegistry;
use JobMetric\CustomField\Contracts\FieldContract;

$registry = app('CustomFieldRegistry');

$customField = new MyCustomField();
$registry->register($customField);
```

### Get

Resolve and return a field instance by its type:

```php
$registry->get(string $type): FieldContract
```

**Parameters:**
- `$type` (`string`): The unique type of the field (e.g., "text", "color").

**Returns:** `FieldContract` - The corresponding field instance.

**Throws:** `InvalidArgumentException` - If the type has not been registered.

**Example:**

```php
$textField = $registry->get('text');
```

### All

Return all registered field instances indexed by their types:

```php
$registry->all(): array
```

**Returns:** `array<string, FieldContract>` - Map of type => field instance.

**Example:**

```php
$allFields = $registry->all();
// Returns: [
//     'text' => TextField instance,
//     'select' => SelectField instance,
//     ...
// ]
```

## Complete Examples

### Register Custom Field Type

```php
use JobMetric\CustomField\Support\CustomFieldRegistry;
use JobMetric\CustomField\Contracts\FieldContract;
use JobMetric\CustomField\Core\BaseCustomField;

class CustomTextField extends BaseCustomField implements FieldContract
{
    public static function type(): string
    {
        return 'custom-text';
    }
    
    // ... implementation
}

// Register in service provider
$registry = app('CustomFieldRegistry');
$registry->register(new CustomTextField());
```

### List All Available Field Types

```php
$registry = app('CustomFieldRegistry');
$allFields = $registry->all();

foreach ($allFields as $type => $field) {
    echo "Field type: {$type}\n";
    echo "Class: " . get_class($field) . "\n";
}
```

## Registering Custom Fields

To use a custom field in your application, you must register it with the `CustomFieldRegistry`. Registration typically happens in a service provider's `boot()` method, ensuring fields are available when the application starts.

### Registration Process

The registration process involves:

1. **Creating the Field Class**: Create a custom field class that extends `BaseCustomField` and implements `FieldContract`
2. **Defining the Type**: Implement the `type()` method to return a unique field type identifier
3. **Registering in Service Provider**: Register the field instance in a service provider's `boot()` method
4. **Automatic Initialization**: The package automatically initializes registered fields, registering Blade namespaces and making them available through `CustomFieldBuilder`

### Step-by-Step Registration

#### Step 1: Create Your Custom Field

First, create your custom field class:

```php
<?php

namespace App\CustomFields\ColorPicker;

use JobMetric\CustomField\Contracts\FieldContract;
use JobMetric\CustomField\Core\BaseCustomField;

class ColorPicker extends BaseCustomField implements FieldContract
{
    /**
     * Get the type of the field.
     *
     * @return string
     */
    public static function type(): string
    {
        return 'color-picker';
    }
}
```

Or use the `custom-field:make` command:

```bash
php artisan custom-field:make ColorPicker
```

#### Step 2: Register in Service Provider

Register your custom field in a service provider. You can use `AppServiceProvider` or create a dedicated service provider.

**Option 1: Using AppServiceProvider**

```php
<?php

namespace App\Providers;

use App\CustomFields\ColorPicker;
use Illuminate\Support\ServiceProvider;
use JobMetric\CustomField\Support\CustomFieldRegistry;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(): void
    {
        $registry = app('CustomFieldRegistry');
        
        // Register your custom field
        $registry->register(new ColorPicker);
    }
}
```

**Option 2: Creating a Dedicated Service Provider**

Create a dedicated service provider for custom fields:

```bash
php artisan make:provider CustomFieldServiceProvider
```

```php
<?php

namespace App\Providers;

use App\CustomFields\ColorPicker;
use App\CustomFields\RichTextEditor;
use App\CustomFields\FileUpload;
use Illuminate\Support\ServiceProvider;
use JobMetric\CustomField\Support\CustomFieldRegistry;

class CustomFieldServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot(): void
    {
        $registry = app('CustomFieldRegistry');
        
        // Register all custom fields
        $registry->register(new ColorPicker);
        $registry->register(new RichTextEditor);
        $registry->register(new FileUpload);
    }
}
```

Don't forget to register the service provider in `config/app.php`:

```php
'providers' => [
    // ...
    App\Providers\CustomFieldServiceProvider::class,
],
```

#### Step 3: Automatic Initialization

Once registered, the package automatically:

1. **Registers Blade Namespace**: Creates a namespace for your field's views (e.g., `custom-field-color-picker`)
2. **Initializes the Field**: Calls the `init()` method which registers the field as a macro on `CustomFieldBuilder`
3. **Makes Available in Builder**: Your field becomes available through `CustomFieldBuilder::colorPicker()`

### Complete Registration Example

Here's a complete example of registering multiple custom fields:

```php
<?php

namespace App\Providers;

use App\CustomFields\ColorPicker;
use App\CustomFields\RichTextEditor;
use App\CustomFields\DateRangePicker;
use App\CustomFields\FileUpload;
use Illuminate\Support\ServiceProvider;
use JobMetric\CustomField\Support\CustomFieldRegistry;

class CustomFieldServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot(): void
    {
        $registry = app('CustomFieldRegistry');
        
        // Register custom fields
        $this->registerCustomFields($registry);
    }

    /**
     * Register all custom fields.
     *
     * @param CustomFieldRegistry $registry
     * @return void
     */
    protected function registerCustomFields(CustomFieldRegistry $registry): void
    {
        $fields = [
            new ColorPicker,
            new RichTextEditor,
            new DateRangePicker,
            new FileUpload,
        ];

        foreach ($fields as $field) {
            $registry->register($field);
        }
    }
}
```

### Using Registered Fields

After registration, use your custom fields through `CustomFieldBuilder`:

```php
use JobMetric\CustomField\CustomFieldBuilder;

// Your custom field is now available
$field = CustomFieldBuilder::colorPicker()
    ->name('theme_color')
    ->label('Theme Color')
    ->value('#3498db')
    ->build();

$html = $field->toHtml();
```

### Registration Timing

**Important:** Fields must be registered in the `boot()` method, not `register()`. This is because:

1. The registry service is registered as a singleton in the `register()` phase
2. Field initialization requires the application to be fully booted
3. Blade namespaces are registered during the boot phase

**Correct:**
```php
public function boot(): void
{
    $registry = app('CustomFieldRegistry');
    $registry->register(new ColorPicker);
}
```

**Incorrect:**
```php
public function register(): void
{
    // ❌ Too early - registry may not be available
    $registry = app('CustomFieldRegistry');
    $registry->register(new ColorPicker);
}
```

### Registration Order

The order of registration matters if fields depend on each other. Register base fields before dependent fields:

```php
public function boot(): void
{
    $registry = app('CustomFieldRegistry');
    
    // Register base fields first
    $registry->register(new BaseField);
    
    // Then register fields that extend base fields
    $registry->register(new ExtendedField);
}
```

### Error Handling

#### Duplicate Type Registration

If you try to register a field with a type that's already registered:

```php
$registry->register(new ColorPicker); // type: 'color-picker'
$registry->register(new AnotherColorPicker); // type: 'color-picker' - ERROR!
```

**Error:**
```
InvalidArgumentException: Field type 'color-picker' already registered.
```

**Solution:** Ensure each field has a unique type identifier.

#### Missing View Directory

If your field doesn't have a `views` directory:

**Error:**
```
BladeViewNotFoundException: View directory not found
```

**Solution:** Ensure your field has a `views` directory with at least a `default.blade.php` file:

```
app/CustomFields/ColorPicker/
├── ColorPicker.php
└── views/
    └── default.blade.php
```

### Best Practices for Registration

1. **Use Dedicated Service Provider**: Create a separate service provider for custom fields to keep code organized

2. **Group Related Fields**: Register related fields together for better organization

3. **Document Field Types**: Document your custom field types for team members

4. **Validate Before Registration**: Ensure fields are properly configured before registration

5. **Handle Errors Gracefully**: Wrap registration in try-catch blocks if needed

```php
public function boot(): void
{
    $registry = app('CustomFieldRegistry');
    
    try {
        $registry->register(new ColorPicker);
    } catch (\InvalidArgumentException $e) {
        \Log::error('Failed to register ColorPicker: ' . $e->getMessage());
    }
}
```

6. **Use Conditional Registration**: Register fields conditionally based on environment or configuration

```php
public function boot(): void
{
    $registry = app('CustomFieldRegistry');
    
    if (config('app.enable_advanced_fields')) {
        $registry->register(new AdvancedField);
    }
}
```

### Package Integration

If you're developing a package that provides custom fields, register them in your package's service provider:

```php
<?php

namespace YourPackage\Providers;

use Illuminate\Support\ServiceProvider;
use JobMetric\CustomField\Support\CustomFieldRegistry;
use YourPackage\CustomFields\PackageField;

class YourPackageServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $registry = app('CustomFieldRegistry');
        $registry->register(new PackageField);
    }
}
```

## When to Use CustomFieldRegistry

Use the registry when you need to:

- **Register Custom Field Types**: Add new field types to the system
- **Introspect Available Fields**: List all available field types for UI pickers or documentation
- **Resolve Field Instances**: Get field instances by type for dynamic field creation
- **Ensure Type Uniqueness**: Prevent duplicate field type registrations

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/commands/make-custom-field">MakeCustomField Command</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/support/field-factory">FieldFactory</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field">CustomField</Link>

