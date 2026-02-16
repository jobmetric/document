---
sidebar_position: 6
sidebar_label: HasListOptionType
---

import Link from "@docusaurus/Link";

# HasListOptionType

Composes list-related type options: show description in list, remove filter in list, change status in list. Each option is a flag you can enable or check per type.

## Namespace

```php
JobMetric\Typeify\Traits\HasListOptionType
```

This trait uses:

- `List\ShowDescriptionInListType` – `showDescriptionInList()`, `hasShowDescriptionInList()`
- `List\RemoveFilterInListType` – `removeFilterInList()`, `hasRemoveFilterInList()`
- `List\ChangeStatusInListType` – `changeStatusInList()`, `hasChangeStatusInList()`

## Methods

### showDescriptionInList(): static

Enable show-description-in-list for the current type.

### hasShowDescriptionInList(): bool

Whether show-description-in-list is enabled.

### removeFilterInList(): static

Enable remove-filter-in-list for the current type.

### hasRemoveFilterInList(): bool

Whether remove-filter-in-list is enabled.

### changeStatusInList(): static

Enable change-status-in-list for the current type.

### hasChangeStatusInList(): bool

Whether change-status-in-list is enabled.

## Example

```php
$postType->define('blog')
    ->showDescriptionInList()
    ->changeStatusInList();

$postType->type('blog');
if ($postType->hasShowDescriptionInList()) {
    // show description column in list view
}
```

**Throws:** `TypeifyTypeNotMatchException` when no type is selected (for getters).

## Related

- <Link to="/packages/typeify/deep-diving/base-type">BaseType</Link>
