---
sidebar_position: 8
sidebar_label: Morph Resource Attributes
---

# Morph Resource Attributes

`HasMorphResourceAttributes` adds dynamic `<relation>_resource` attributes for `MorphTo` relations and resolves them through `ResourceResolveEvent`.

---

## Main Idea

If your model has a `MorphTo` relation (for example `slugable()`), this trait lets you access:

```php
$slug->slugable_resource;
```

The trait:

1. Checks whether relation is already loaded
2. Builds context/hints/includes configuration
3. Dispatches `ResourceResolveEvent`
4. Returns resolved resource (or `null`)

---

## Setup Example

```php
class Slug extends Model
{
    use \JobMetric\PackageCore\Traits\HasMorphResourceAttributes;

    protected array $resourceMorphRelations = ['slugable'];
    protected ?string $resourceMorphDefaultContext = 'api.list';
    protected array $resourceMorphDefaultHints = ['forbid_db' => true];

    protected array $resourceMorphIncludes = [
        'slugable' => [
            \App\Models\Post::class => ['category'],
            \App\Models\Product::class => ['brand'],
        ],
    ];
}
```

---

## Optional Configuration

- `$resourceMorphRelations`
- `$resourceMorphAutoDiscover`
- `$resourceMorphDiscoveryExcept`
- `$resourceMorphIncludes`
- `$resourceMorphContexts`
- `$resourceMorphHintsByRelation`
- `$resourceMorphDefaultContext`
- `$resourceMorphDefaultHints`

Suggested baseline configuration:

```php
protected ?string $resourceMorphDefaultContext = 'api.list';
protected array $resourceMorphDefaultHints = ['forbid_db' => true];
```

---

## Eager Loading Pattern

```php
$items = Slug::query()
    ->with([
        'slugable' => function (\Illuminate\Database\Eloquent\Relations\MorphTo $morphTo) {
            $morphTo->morphWith([
                \App\Models\Post::class => ['category'],
                \App\Models\Product::class => ['brand'],
            ]);
        },
    ])
    ->get();

$resources = $items->map->slugable_resource;
```

---

## Important Notes

- The trait does not trigger additional lazy loading
- If the relation is not loaded, output is `null`
- Use `morphWith`/`loadMorph` for performance
- Ensure listeners are wired to `ResourceResolveEvent`

## Common Pitfalls

- Expecting non-null output without eager loading
- Missing listener coverage for a subject type
- Context mismatch between caller and listener
