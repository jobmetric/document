---
sidebar_position: 2
sidebar_label: Installation
---

import Link from "@docusaurus/Link";

# Installation

## Requirements

Before installing Laravel Form, make sure you have:

- **PHP** >= 8.0.1 (8.1+ recommended)
- **Laravel** >= 9.19 (9/10/11 supported)
- **Composer**
- **jobmetric/laravel-package-core** ^1.34
- **jobmetric/laravel-custom-field** ^2.1

## Install via Composer

Run the following command to pull in the latest version:

```bash
composer require jobmetric/laravel-form
```

## Service Provider

Laravel Package Auto-Discovery will automatically register the service provider. If you're using Laravel < 5.5 or have disabled auto-discovery, manually register the provider in `config/app.php`:

```php
'providers' => [
    // ...
    JobMetric\Form\FormServiceProvider::class,
],
```

## Publish Configuration

After installation, publish the configuration file (optional):

```bash
php artisan vendor:publish --provider="JobMetric\Form\FormServiceProvider" --tag="form-config"
```

This will create a `config/form.php` file where you can customize package settings.

## Publish Views

If you want to customize the form rendering views, publish them:

```bash
php artisan vendor:publish --provider="JobMetric\Form\FormServiceProvider" --tag="form-views"
```

This will copy the form views to `resources/views/vendor/form/` where you can customize them.

## Verify Installation

To verify the package is installed correctly, you can test building a form:

```php
use JobMetric\Form\FormBuilder;

$form = FormBuilder::make()
    ->action('/test')
    ->method('POST')
    ->tab(function ($tab) {
        $tab->id('test')
            ->label('Test Tab')
            ->group(function ($group) {
                $group->label('Test Group')
                    ->customField(function ($field) {
                        $field->text()
                            ->name('test')
                            ->label('Test Field')
                            ->build();
                    })
                    ->build();
            })
            ->build();
    })
    ->build();

$html = $form->toHtml();
// If no errors occurred, installation is successful!
```

## Next Steps

Now that you've installed Laravel Form, you can:

- Learn about <Link to="/packages/laravel-form/deep-diving/form-builder">building forms</Link>
- Explore <Link to="/packages/laravel-form/showcase">real-world examples</Link>
- Check out the <Link to="/packages/laravel-form/deep-diving/form-builder">complete API reference</Link>

## Troubleshooting

### FormBuilder Methods Not Found

If you get "Method not found" errors:

1. Make sure the package is properly installed via Composer
2. Run `composer dump-autoload`
3. Clear any opcode cache (OPcache) if enabled
4. Ensure `laravel-custom-field` is properly installed

### Custom Fields Not Available

If custom field methods are not available:

1. Verify `laravel-custom-field` is installed: `composer show jobmetric/laravel-custom-field`
2. Ensure custom fields are registered in their service provider
3. Run `php artisan custom-field:ide` to regenerate IDE helpers

### Views Not Found

If you get "View not found" errors:

1. Make sure the service provider is registered
2. Check that blade views are published (if using custom templates)
3. Verify the package views are accessible

### Validation Not Working

If validation doesn't work with `FormBuilderRequest`:

1. Ensure the form builder is properly set: `$request->setFormBuilder($formBuilder)`
2. Check that custom fields have validation rules configured
3. Verify the request is using `FormBuilderRequest` as the base class

