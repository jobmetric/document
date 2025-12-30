---
sidebar_position: 1
sidebar_label: MakeCustomField Command
---

import Link from "@docusaurus/Link";

# MakeCustomField Command

The `custom-field:make` artisan command is a powerful tool for generating custom field classes and their associated Blade view templates. It automatically creates properly structured field classes that extend `BaseCustomField` and implement `FieldContract`, saving you time and ensuring consistency across your custom field implementations.

## Namespace

```php
JobMetric\CustomField\Commands\MakeCustomField
```

## Command Signature

```bash
php artisan custom-field:make
    {name : Field name (e.g., Text, ColorPicker, RichText)}
    {--t|--template=default : Blade template name or comma-separated list}
    {--f|--force : Overwrite if exists}
```

## Basic Usage

### Simple Field Creation

Create a new custom field with default template:

```bash
php artisan custom-field:make ColorPicker
```

This will create:
- Field class: `app/CustomFields/ColorPicker/ColorPicker.php`
- View template: `app/CustomFields/ColorPicker/views/default.blade.php`

### Multiple Templates

Create a field with multiple view templates:

```bash
php artisan custom-field:make RichText --template=default,bootstrap,tailwind
```

This creates:
- Field class: `app/CustomFields/RichText/RichText.php`
- View templates:
  - `app/CustomFields/RichText/views/default.blade.php`
  - `app/CustomFields/RichText/views/bootstrap.blade.php`
  - `app/CustomFields/RichText/views/tailwind.blade.php`

### Force Overwrite

Overwrite existing files without prompting:

```bash
php artisan custom-field:make Text --force
```

## Command Arguments

### Name

The name of the custom field. This will be converted to StudlyCase automatically.

**Examples:**
- `color-picker` → `ColorPicker`
- `rich_text` → `RichText`
- `dateTimePicker` → `DateTimePicker`
- `TEXT_FIELD` → `TextField`

**Validation Rules:**
- Must start with a letter
- Can contain letters, numbers, underscores, and hyphens
- Invalid characters will result in an error

**Valid Examples:**
```bash
php artisan custom-field:make ColorPicker
php artisan custom-field:make RichText
php artisan custom-field:make DateRangePicker
php artisan custom-field:make FileUpload
```

**Invalid Examples:**
```bash
# ❌ Starts with number
php artisan custom-field:make 123Field

# ❌ Contains special characters
php artisan custom-field:make Field@Name

# ❌ Empty name
php artisan custom-field:make ""
```

## Command Options

### Template (`--template` or `-t`)

Specify one or more Blade template names. Multiple templates can be provided as a comma-separated list. The `default` template is always included, even if not specified.

**Default:** `default`

**Single Template:**
```bash
php artisan custom-field:make ColorPicker --template=bootstrap
```

**Multiple Templates:**
```bash
php artisan custom-field:make RichText --template=default,bootstrap,tailwind
```

**Behavior:**
- If you specify templates without `default`, it will be automatically prepended
- Templates are deduplicated automatically
- Empty template names are filtered out

**Example:**
```bash
# These are equivalent:
php artisan custom-field:make Field --template=default,bootstrap
php artisan custom-field:make Field --template=bootstrap
# Both create: default.blade.php and bootstrap.blade.php
```

### Force (`--force` or `-f`)

Overwrite existing files without prompting.

**Without Force:**
If files exist, the command will:
- Show an error for the class file
- Show a warning for view files and skip them

**With Force:**
All existing files will be overwritten without confirmation.

```bash
php artisan custom-field:make Text --force
```

## Generated File Structure

### Directory Structure

Custom fields are generated in the following structure:

```
app/
└── CustomFields/
    └── {FieldName}/
        ├── {FieldName}.php
        └── views/
            ├── default.blade.php
            └── {other-templates}.blade.php
```

**Example:**
```
app/
└── CustomFields/
    ├── ColorPicker/
    │   ├── ColorPicker.php
    │   └── views/
    │       ├── default.blade.php
    │       └── bootstrap.blade.php
    └── RichText/
        ├── RichText.php
        └── views/
            ├── default.blade.php
            ├── bootstrap.blade.php
            └── tailwind.blade.php
```

### Namespace

The generated class will use the namespace based on your application namespace:

```php
{AppNamespace}\CustomFields\{FieldName}
```

**Example with default namespace:**
```php
namespace App\CustomFields\ColorPicker;
```

**Example with custom namespace:**
```php
namespace MyApp\CustomFields\ColorPicker;
```

## Generated Field Class

### Class Structure

The generated field class extends `BaseCustomField` and implements `FieldContract`:

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

### Key Components

**Namespace:**
- Automatically uses your application namespace
- Follows pattern: `{AppNamespace}\CustomFields\{FieldName}`

**Class Name:**
- Converted to StudlyCase from the provided name
- Example: `color-picker` → `ColorPicker`

**Type Method:**
- Returns the field type as kebab-case
- Example: `ColorPicker` → `color-picker`
- This type is used for registration and builder methods

**Base Class:**
- Extends `BaseCustomField` which provides:
  - Template resolution
  - Asset management (scripts/styles)
  - View rendering
  - Option and data attribute support

## Generated View Template

### Default Template

The generated Blade view template is minimal and ready for customization:

```blade
{{-- Default view template for {{field-name}} --}}
```

### Template Customization

After generation, customize the template to render your field:

```blade
<div class="custom-field {{ $field->type }}">
    <label for="{{ $field->attributes['id'] ?? $field->attributes['name'] }}">
        {{ $field->label }}
    </label>
    
    <input 
        type="text" 
        name="{{ $field->attributes['name'] }}"
        id="{{ $field->attributes['id'] ?? $field->attributes['name'] }}"
        value="{{ $field->attributes['value'] ?? '' }}"
        @if($field->properties['required'] ?? false) required @endif
        @if($field->properties['disabled'] ?? false) disabled @endif
        class="{{ $field->attributes['class'] ?? '' }}"
        placeholder="{{ $field->attributes['placeholder'] ?? '' }}"
    >
    
    @if($field->info)
        <small class="field-info">{{ $field->info }}</small>
    @endif
</div>
```

### Multiple Templates

When creating multiple templates, each template can have different styling:

**default.blade.php:**
```blade
<div class="field">
    <input type="text" name="{{ $field->attributes['name'] }}">
</div>
```

**bootstrap.blade.php:**
```blade
<div class="form-group">
    <label class="form-label">{{ $field->label }}</label>
    <input type="text" class="form-control" name="{{ $field->attributes['name'] }}">
</div>
```

**tailwind.blade.php:**
```blade
<div class="mb-4">
    <label class="block text-sm font-medium">{{ $field->label }}</label>
    <input type="text" class="mt-1 block w-full rounded-md" name="{{ $field->attributes['name'] }}">
</div>
```

## Complete Examples

### Example 1: Creating a Color Picker Field

```bash
php artisan custom-field:make ColorPicker
```

**Generated Class:**
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

**Customization:**
```php
<?php

namespace App\CustomFields\ColorPicker;

use JobMetric\CustomField\Attribute\HasClass;
use JobMetric\CustomField\Attribute\HasId;
use JobMetric\CustomField\Attribute\HasName;
use JobMetric\CustomField\Attribute\HasValue;
use JobMetric\CustomField\Contracts\FieldContract;
use JobMetric\CustomField\Core\BaseCustomField;

class ColorPicker extends BaseCustomField implements FieldContract
{
    use HasName, HasId, HasClass, HasValue;

    /**
     * The scripts to be included for the custom field.
     *
     * @var array
     */
    public array $scripts = [
        'default' => [
            'color-picker.js',
        ]
    ];

    /**
     * The styles to be included for the custom field.
     *
     * @var array
     */
    public array $styles = [
        'default' => [
            'color-picker.css',
        ]
    ];

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

**View Template:**
```blade
<div class="color-picker-field">
    @if($field->label)
        <label for="{{ $field->attributes['id'] ?? $field->attributes['name'] }}">
            {{ $field->label }}
            @if($field->properties['required'] ?? false)
                <span class="required">*</span>
            @endif
        </label>
    @endif
    
    <input 
        type="color" 
        name="{{ $field->attributes['name'] }}"
        id="{{ $field->attributes['id'] ?? $field->attributes['name'] }}"
        value="{{ $field->attributes['value'] ?? '#000000' }}"
        class="color-picker {{ $field->attributes['class'] ?? '' }}"
        @if($field->properties['required'] ?? false) required @endif
        @if($field->properties['disabled'] ?? false) disabled @endif
    >
    
    @if($field->info)
        <small class="field-info">{{ $field->info }}</small>
    @endif
</div>
```

### Example 2: Creating a Rich Text Editor Field

```bash
php artisan custom-field:make RichTextEditor --template=default,admin
```

**Generated Structure:**
```
app/CustomFields/RichTextEditor/
├── RichTextEditor.php
└── views/
    ├── default.blade.php
    └── admin.blade.php
```

**Customization:**
```php
<?php

namespace App\CustomFields\RichTextEditor;

use JobMetric\CustomField\Contracts\FieldContract;
use JobMetric\CustomField\Core\BaseCustomField;

class RichTextEditor extends BaseCustomField implements FieldContract
{
    public array $scripts = [
        'default' => ['tinymce.js'],
        'admin' => ['ckeditor.js'],
    ];

    public array $styles = [
        'default' => ['tinymce.css'],
        'admin' => ['ckeditor.css'],
    ];

    public static function type(): string
    {
        return 'rich-text-editor';
    }
}
```

### Example 3: Creating a File Upload Field

```bash
php artisan custom-field:make FileUpload --force
```

**Customization:**
```php
<?php

namespace App\CustomFields\FileUpload;

use JobMetric\CustomField\Attribute\HasAccept;
use JobMetric\CustomField\Attribute\HasMultiple;
use JobMetric\CustomField\Contracts\FieldContract;
use JobMetric\CustomField\Core\BaseCustomField;

class FileUpload extends BaseCustomField implements FieldContract
{
    use HasAccept, HasMultiple;

    public static function type(): string
    {
        return 'file-upload';
    }
}
```

## Field Registration

After creating a custom field, you must register it in a service provider. Registration makes your field available through `CustomFieldBuilder` and enables automatic initialization of views and assets.

> **📖 Complete Guide:** For detailed information about field registration, including step-by-step instructions, best practices, and troubleshooting, see the <Link to="/packages/laravel-custom-field/deep-diving/support/custom-field-registry#registering-custom-fields">Registering Custom Fields</Link> section.

### Quick Registration Example

**In AppServiceProvider:**

```php
<?php

namespace App\Providers;

use App\CustomFields\ColorPicker;
use Illuminate\Support\ServiceProvider;
use JobMetric\CustomField\Support\CustomFieldRegistry;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $registry = app('CustomFieldRegistry');
        $registry->register(new ColorPicker);
    }
}
```

**In a Dedicated Service Provider:**

```php
<?php

namespace App\Providers;

use App\CustomFields\ColorPicker;
use App\CustomFields\RichTextEditor;
use Illuminate\Support\ServiceProvider;
use JobMetric\CustomField\Support\CustomFieldRegistry;

class CustomFieldServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $registry = app('CustomFieldRegistry');
        
        $registry->register(new ColorPicker);
        $registry->register(new RichTextEditor);
    }
}
```

### Using the Registered Field

Once registered, use your custom field through the builder:

```php
use JobMetric\CustomField\CustomFieldBuilder;

$field = CustomFieldBuilder::colorPicker()
    ->name('theme_color')
    ->label('Theme Color')
    ->value('#3498db')
    ->build();

$html = $field->toHtml();
```

### What Happens During Registration?

When you register a field, the package automatically:

1. **Registers Blade Namespace**: Creates a namespace for your field's views (e.g., `custom-field-color-picker`)
2. **Initializes the Field**: Calls the `init()` method which registers the field as a macro on `CustomFieldBuilder`
3. **Makes Available in Builder**: Your field becomes available through `CustomFieldBuilder::colorPicker()`
4. **Publishes Assets**: If your field has an `assets` directory, it's made available for publishing

## Naming Conventions

### Field Name Conversion

The command automatically converts field names:

**To Class Name (StudlyCase):**
- `color-picker` → `ColorPicker`
- `rich_text` → `RichText`
- `dateTimePicker` → `DateTimePicker`
- `FILE_UPLOAD` → `FileUpload`

**To Type (kebab-case):**
- `ColorPicker` → `color-picker`
- `RichText` → `rich-text`
- `DateTimePicker` → `date-time-picker`

**To Builder Method (camelCase):**
- `color-picker` → `colorPicker()`
- `rich-text` → `richText()`
- `date-time-picker` → `dateTimePicker()`

### File Naming

Files are named exactly as the class name:

```
{FieldName}.php
```

**Examples:**
- `ColorPicker.php`
- `RichTextEditor.php`
- `FileUpload.php`

## Error Handling

### Invalid Field Name

If an invalid field name is provided:

```bash
php artisan custom-field:make 123Field
```

**Error:**
```
Invalid field name. Use only letters, numbers, and underscores, starting with a letter.
```

**Solution:** Use a valid name that starts with a letter.

### File Already Exists

If the file already exists and `--force` is not used:

```bash
php artisan custom-field:make Text
```

**Error:**
```
Custom Field class already exists: [App\CustomFields\Text], Use --force to overwrite.
```

**For View Files:**
```
View already exists: [app/CustomFields/Text/views/default.blade.php]. Skipped (use --force to overwrite).
```

**Solution:** Use `--force` flag to overwrite existing files.

## Best Practices

1. **Use Descriptive Names**: Choose clear, descriptive field names
   ```bash
   # ✅ Good
   php artisan custom-field:make ColorPicker
   php artisan custom-field:make RichTextEditor
   
   # ❌ Bad
   php artisan custom-field:make Field1
   php artisan custom-field:make MyField
   ```

2. **Follow Naming Conventions**: Use StudlyCase for field names
   ```bash
   # ✅ Good
   php artisan custom-field:make DateRangePicker
   php artisan custom-field:make FileUpload
   
   # ⚠️ Acceptable (will be converted)
   php artisan custom-field:make date-range-picker
   ```

3. **Organize by Purpose**: Group related fields logically
   ```
   app/CustomFields/
   ├── ColorPicker/
   ├── DateRangePicker/
   └── FileUpload/
   ```

4. **Register Immediately**: Register fields in a service provider after creation

5. **Use Multiple Templates**: Create different templates for different contexts
   ```bash
   php artisan custom-field:make RichText --template=default,admin,public
   ```

6. **Add Assets**: Define scripts and styles in your field class
   ```php
   public array $scripts = [
       'default' => ['my-field.js'],
   ];
   
   public array $styles = [
       'default' => ['my-field.css'],
   ];
   ```

7. **Use Traits**: Leverage available traits for common functionality
   ```php
   use HasName, HasId, HasClass, HasValue, HasPlaceholder;
   ```

## Troubleshooting

### Class Not Found After Generation

If you get "Class not found" errors:

1. **Run Composer Dump-Autoload**: `composer dump-autoload`
2. **Check Namespace**: Ensure the namespace matches your app namespace
3. **Check File Location**: Ensure the file is in `app/CustomFields/{FieldName}/`
4. **Clear Cache**: Run `php artisan clear-compiled`

### Field Not Available in Builder

If your field is not available in `CustomFieldBuilder`:

1. **Check Registration**: Ensure the field is registered in a service provider
2. **Check Type Method**: Verify `type()` returns the correct kebab-case string
3. **Clear Cache**: Run `php artisan config:clear` and `php artisan cache:clear`
4. **Regenerate IDE Helpers**: Run `php artisan custom-field:ide`

### Template Not Found

If you get "View not found" errors:

1. **Check Template Name**: Ensure the template name matches exactly
2. **Check File Exists**: Verify the blade file exists in `views/` directory
3. **Check Template Resolution**: Ensure `resolvedTemplate` is set correctly

### Generated File Has Placeholders

If the generated file still contains placeholders like `{{namespace}}`:

1. **Check Stub Files**: Ensure stub files exist in `packages/laravel-custom-field/src/Commands/stub/`
2. **Check Permissions**: Ensure the command has write permissions
3. **Re-run Command**: Try running the command again with `--force`

## Advanced Usage

### Batch Field Creation

Create multiple fields using a script:

```php
$fields = [
    'ColorPicker',
    'RichTextEditor',
    'DateRangePicker',
    'FileUpload',
];

foreach ($fields as $field) {
    Artisan::call('custom-field:make', [
        'name' => $field,
        '--force' => true,
    ]);
}
```

### Custom Stub Files

To customize generated files, you can modify the stub files:

1. **Copy Stub Files**: Copy from `packages/laravel-custom-field/src/Commands/stub/`
2. **Modify Templates**: Edit the stub files to match your needs
3. **Update Command**: Modify `MakeCustomField` to use your custom stubs

### Integration with Package Development

When developing a package that uses custom fields:

```php
// In your package service provider
public function boot(): void
{
    // Register custom fields
    $registry = app('CustomFieldRegistry');
    $registry->register(new MyPackageCustomField);
    
    // Or publish stubs for users to customize
    $this->publishes([
        __DIR__.'/stubs' => base_path('stubs/custom-field'),
    ], 'custom-field-stubs');
}
```

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/commands/generate-ide-helpers">GenerateIdeHelpers Command</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/support/custom-field-registry">CustomFieldRegistry</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field">CustomField</Link>
- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Field Attributes</Link>

