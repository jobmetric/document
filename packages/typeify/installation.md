---
sidebar_position: 2
sidebar_label: Installation
---

import Link from "@docusaurus/Link";

# Installation

## Requirements

Before installing Typeify, make sure you have:

- **PHP** >= 8.0.1 (8.1+ recommended)
- **Laravel** >= 9.19 (9/10/11 supported)
- **Composer**
- **jobmetric/laravel-package-core** ^1.37 (installed automatically as dependency)

## Install via Composer

Run the following command to pull in the latest version:

```bash
composer require jobmetric/typeify
```

## Usage Overview

Typeify does not require configuration files or facades. You create type registries by extending `BaseType` and implementing `typeName()`.

### Create a Type Registry

```php
namespace App\Type;

use JobMetric\Typeify\BaseType;

class PostType extends BaseType
{
    protected function typeName(): string
    {
        return 'post-type';
    }
}
```

### Define Types

Typically you define types in a service provider or dedicated bootstrap class:

```php
$postType = new PostType();

$postType->define('blog')
    ->label('Blog Post')
    ->description('Posts for the blog section')
    ->hierarchical()
    ->import()
    ->export();

$postType->define('news')
    ->label('News')
    ->description('News articles');
```

### Use Types

```php
$postType = new PostType();
$postType->type('blog');

$label = $postType->getLabel();
$description = $postType->getDescription();
$allParams = $postType->get();

$postType->ensureTypeExists('blog');
$availableTypes = $postType->getTypes();
```

## Next Steps

- Learn about <Link to="/packages/typeify/deep-diving/base-type">BaseType</Link>
- Explore <Link to="/packages/typeify/deep-diving/traits/has-label-type">traits</Link> for labels, descriptions, import/export, and more
- Check <Link to="/packages/typeify/deep-diving/exceptions/typeify-type-not-found-exception">exceptions</Link> for validation and error handling
