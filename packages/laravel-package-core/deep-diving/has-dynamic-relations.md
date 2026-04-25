---
sidebar_position: 6
sidebar_label: Runtime Relation Mapping
---

# Runtime Relation Mapping

`HasDynamicRelations` lets you register model relations at runtime.  
It is ideal for reusable packages where consumers need project-specific relations without modifying package source code.

---

## What Problem It Solves

In package-first architecture, package models should not hardcode every relation needed by every host project.  
This trait allows relation injection from the app layer.

---

## Basic Setup

```php
use JobMetric\PackageCore\Models\HasDynamicRelations;

class Tag extends Model
{
    use HasDynamicRelations;
}
```

---

## Register Dynamic Relations

```php
Tag::addDynamicRelation('posts', function ($model) {
    return $model
        ? $model->morphedByMany(Post::class, 'taggable')
        : (new Post)->morphedByMany(Tag::class, 'taggable');
});
```

```php
Tag::addDynamicRelation('products', function ($model) {
    return $model
        ? $model->morphedByMany(Product::class, 'taggable')
        : (new Product)->morphedByMany(Tag::class, 'taggable');
});
```

Real project pattern (application layer):

```php
Member::addDynamicRelation('orders', function ($model) {
    return $model
        ? $model->morphedByMany(Order::class, 'memberable')
        : (new Order)->morphedByMany(Member::class, 'memberable');
});
```

---

## Usage

```php
$tags = Tag::with(['posts', 'products'])->get();
```

---

## Best Practices

- Register dynamic relations in model `boot()` or a service provider
- Use clear relation names (`orders`, `products`, etc.)
- Keep relation closures idempotent and deterministic
- Plan eager loading for heavy polymorphic relation graphs

## Common Pitfalls

- Re-registering the same relation name unintentionally
- Registering dynamic relations from multiple scattered places
- Ignoring performance implications for polymorphic relations
