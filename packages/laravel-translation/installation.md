---
sidebar_position: 2
sidebar_label: Installation
---

# Installation

## Requirements

Before installing Laravel Translation, make sure you have:

- **PHP** >= 8.1 (8.2+ recommended)
- **Laravel** >= 9.0 (9/10/11 supported)
- **Composer**

## Install via Composer

Run the following command to pull in the latest version:

```bash
composer require jobmetric/laravel-translation
```

## Publish Configuration

After installation, publish the configuration file (optional):

```bash
php artisan vendor:publish --provider="JobMetric\Translation\TranslationServiceProvider" --tag="translation-config"
```

This will create a `config/translation.php` file where you can customize package settings.

## Run Migrations

**Important:** Before using the package, you must run the migrations to create the translations table:

```bash
php artisan migrate
```

This will create the `translations` table with the following structure:

- `id` - Primary key
- `translatable_type` - Model class name (polymorphic)
- `translatable_id` - Model ID (polymorphic)
- `locale` - Language code (e.g., 'en', 'fa', 'ar')
- `field` - Field name being translated
- `value` - Translated value
- `version` - Version number (for versioning)
- `deleted_at` - Soft delete timestamp
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

## Service Provider

The package automatically registers its service provider. If you're using Laravel's package discovery (default), no manual registration is needed.

If you need to manually register the provider, add it to `config/app.php`:

```php
'providers' => [
    // ...
    JobMetric\Translation\TranslationServiceProvider::class,
],
```

## Verify Installation

To verify the installation, you can check if the translations table was created:

```bash
php artisan migrate:status
```

You should see the `translations` table migration in the list.

## Quick Test

Create a simple test to verify everything works:

```php
use Illuminate\Database\Eloquent\Model;
use JobMetric\Translation\HasTranslation;

class TestModel extends Model
{
    use HasTranslation;
    
    protected array $translatables = ['name'];
}

// Create a test instance
$test = TestModel::create(['name' => 'Test']);

// Add a translation
$test->translate('en', ['name' => 'Test Name']);

// Retrieve translation
echo $test->getTranslation('name', 'en');  // Should output: Test Name
```

If this works without errors, your installation is successful!

## Next Steps

Now that you have Laravel Translation installed:

1. **[Learn HasTranslation](/packages/laravel-translation/deep-diving/has-translation)** - Start using the core trait
2. **Explore Examples** - See real-world usage patterns
3. **Read the Documentation** - Discover all available features

## Troubleshooting

### Migration Fails

If the migration fails, make sure:
- Your database connection is configured correctly
- You have the necessary permissions
- No conflicting table exists

### Trait Not Found

If you get a "Trait not found" error:
- Make sure you've run `composer install`
- Clear the autoload cache: `composer dump-autoload`
- Check that the package is listed in `composer.json`

### Translations Not Saving

If translations aren't being saved:
- Verify the migrations ran successfully
- Check that `translation` is in your model's `$fillable` array (the trait handles this automatically)
- Ensure you're using the correct locale codes

## Support

If you encounter any issues during installation:

- Check the [GitHub Issues](https://github.com/jobmetric/laravel-translation/issues)
- Review the documentation
- Ensure you're using a supported Laravel version

