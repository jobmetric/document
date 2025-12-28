---
sidebar_position: 8
sidebar_label: Events
---

# Events

Laravel Translation provides a comprehensive event system that allows you to hook into translation operations and perform custom actions when translations are stored or forgotten.

## When to Use Events

**Use translation events when you need:**

- **Cache invalidation**: Clear caches when translations are updated
- **Search index updates**: Update search indices when translations change
- **Audit logging**: Track translation changes for compliance
- **Notification systems**: Notify translators or administrators of changes
- **Integration hooks**: Sync translations with external systems
- **Analytics tracking**: Monitor translation activity and usage

**Example scenarios:**
- Invalidating Redis caches when product translations are updated
- Updating Elasticsearch indices when blog post translations change
- Sending notifications to content managers when translations are modified
- Logging translation changes for audit purposes
- Syncing translations with a CDN or external CMS
- Tracking translation metrics and analytics

## Available Events

| Event                        | When                                                    |
|-----------------------------|----------------------------------------------------------|
| `TranslationStoredEvent`    | After storing or updating a translation for a locale     |
| `TranslationForgetEvent`    | After forgetting a translation (field or per-locale)     |

## Example listener

```php
// app/Providers/EventServiceProvider.php
protected $listen = [
    JobMetric\Translation\Events\TranslationStoredEvent::class => [
        App\Listeners\InvalidateCaches::class,
    ],
];
```

```php
namespace App\Listeners;

class InvalidateCaches
{
    public function handle($event): void
    {
        // Example: flush a tag for the translatable model
        // Cache::tags([$event->model::class])->flush();
    }
}
```

## Related Documentation

- [HasTranslation](/packages/laravel-translation/deep-diving/has-translation) - Core trait for multilingual models
- [TranslationResource](/packages/laravel-translation/deep-diving/resources/translation-resource) - JSON resource for single translation rows
- [TranslationCollectionResource](/packages/laravel-translation/deep-diving/resources/translation-collection-resource) - JSON resource for translation collections
