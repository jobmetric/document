---
sidebar_position: 1
sidebar_label: Package Bootstrap Guide
---

# Package Bootstrap Guide

`PackageCoreServiceProvider` is the main package bootstrap abstraction in `laravel-package-core`.  
Instead of repeating logic in `register()` and `boot()`, you define package capabilities through a fluent `PackageCore` configuration API.

---

## Why This Layer Matters

- Standardizes package setup (config/migrations/routes/lang/views/assets)
- Reduces provider boilerplate significantly
- Keeps publish tags and container bindings consistent
- Exposes explicit lifecycle hooks for extension

---

## Recommended Provider Structure

```php
use JobMetric\PackageCore\PackageCore;
use JobMetric\PackageCore\PackageCoreServiceProvider;
use JobMetric\PackageCore\Enums\RegisterClassTypeEnum;

class ExampleServiceProvider extends PackageCoreServiceProvider
{
    public function configuration(PackageCore $package): void
    {
        $package
            ->name('laravel-example')
            ->hasConfig()
            ->hasMigration()
            ->hasRoute()
            ->hasTranslation()
            ->hasView()
            ->hasAsset()
            ->registerCommand(\JobMetric\Example\Commands\MakeExample::class)
            ->registerClass('example', \JobMetric\Example\Services\ExampleService::class, RegisterClassTypeEnum::SINGLETON());
    }
}
```

---

## Core Methods

### name

Defines the canonical package name used by the core bootstrap logic.  
Use a stable, predictable name because it affects publish groups, internal naming conventions, and developer expectations.

```php
$package->name('laravel-workflow');
```

### hasConfig

Registers package configuration for loading and publishing.  
This is typically used when your package has defaults that consumers may override.

```php
$package->hasConfig();

// Custom config file name (if your package uses a non-default convention)
$package->hasConfig('workflow.php');
```

### hasMigration

Registers migration files from your package migration directory.  
Use this when your package ships tables required for core functionality.

```php
$package->hasMigration();
```

### hasRoute

Loads package routes into the host application.  
This keeps route definitions inside the package while making them available at runtime.

```php
$package->hasRoute();
```

### hasTranslation

Registers package translation files so translation keys can be resolved via Laravel's translator.  
Use this for messages, validation labels, and UI text shipped by the package.

```php
$package->hasTranslation();
```

### hasView

Loads package Blade views and optionally publishes them for override.  
Enable publishing when you want consumers to customize package UI templates.

```php
$package->hasView();

// Publishable views for customization in host app
$package->hasView(true);
```

### hasAsset

Registers package assets for publishing (JS/CSS/images).  
Use this when your package includes frontend resources.

```php
$package->hasAsset();
```

### hasComponent

Registers Blade components provided by the package.  
This is useful for reusable UI primitives distributed with package views.

```php
$package->hasComponent();
```

### registerCommand

Registers an artisan command class so it becomes available in the host app.  
Use this for scaffolding tools, maintenance commands, or package-specific operations.

```php
$package->registerCommand(\JobMetric\Flow\Commands\MakeTask::class);
```

### registerClass

Registers a class in Laravel's container under a custom alias.  
The third argument controls binding mode (`bind`, `singleton`, or `instance` depending on enum/value usage).

```php
use JobMetric\PackageCore\Enums\RegisterClassTypeEnum;

$package->registerClass(
    'flow',
    \JobMetric\Flow\Services\Flow::class,
    RegisterClassTypeEnum::SINGLETON()
);
```

### registerPublishable

Registers custom publish paths manually.  
Use this when files should be publishable but are outside standard conventions.

```php
$package->registerPublishable([
    __DIR__ . '/../resources/stubs' => base_path('stubs/vendor/workflow'),
], ['workflow-stubs']);
```

### registerDependencyPublishable

Registers publishable resources from a dependency package provider.  
Use this when your package relies on another package's publish step.

```php
$package->registerDependencyPublishable(\JobMetric\Translation\TranslationServiceProvider::class);
```

---

## Lifecycle Hooks

You can override these hooks:

- `beforeRegisterPackage`
- `afterRegisterPackage`
- `beforeNewInstancePackage`
- `afterNewInstancePackage`
- `beforeBootPackage`
- `afterBootPackage`
- `runInConsolePackage`
- `runInTestPackage`
- `runInWebPackage`

**Practical Example**

```php
public function afterBootPackage(): void
{
    if ($this->app->bound('EventRegistry')) {
        $registry = $this->app->make('EventRegistry');
        $registry->register(\App\Events\SomethingHappened::class);
    }
}
```

---

## Best Practices

- Keep aliases short and stable (`flow`, `example-service`)
- Keep publish configuration centralized in `configuration`
- Use `singleton` only when shared state/lifecycle is intended
- Keep hooks lightweight (avoid expensive DB work)

## Common Pitfalls

- Mismatch between `name()` and actual package naming
- Wrong file/folder conventions for config/routes/migrations
- Overusing `instance` and increasing coupling
- Running heavy logic in boot hooks
