---
sidebar_position: 4
sidebar_label: Image Field
---

import Link from "@docusaurus/Link";

# Image Field

The `image` field renders an HTML `<img>` element for displaying images in forms. It's perfect for submit buttons, icons, logos, and any visual elements that need to be displayed alongside form fields.

## Namespace

```php
JobMetric\CustomField\CustomFields\Image\Image
```

## Overview

The image field renders as an HTML `<img>` element with support for source, alt text, width, and height attributes. It's commonly used for image-based submit buttons, form icons, and visual elements in forms.

## When to Use

**Use the image field when you need:**

- **Image submit buttons** - Custom image-based submit buttons
- **Form icons** - Visual icons in forms
- **Logos and branding** - Company logos in forms
- **Visual elements** - Any image display in form context
- **Decorative images** - Images that enhance form appearance

**Example scenarios:**
- Image-based submit buttons
- Company logos in registration forms
- Product images in forms
- Icon displays
- Visual form elements

## Builder Method

```php
CustomFieldBuilder::image()
```

## Available Methods

### Image-Specific Attributes

- `src(?string $src)` - Set image source URL
- `alt(?string $alt)` - Set alt text for accessibility
- `width(?int $width)` - Set image width
- `height(?int $height)` - Set image height

### Common Attributes

- `name(string $name, ?string $uniq = null)` - Set field name (for submit buttons)
- `id(?string $id)` - Set field ID
- `class(?string $class)` - Set CSS class

### Field Labels

- `label(?string $label)` - Set field label (optional for images)
- `info(?string $info)` - Set help/info text

## Basic Example

```php
use JobMetric\CustomField\Facades\CustomFieldBuilder;

$image = CustomFieldBuilder::image()
    ->name('submitImage')
    ->src('/img/submit.png')
    ->alt('Submit Form')
    ->width(120)
    ->height(40)
    ->build();

$result = $image->toHtml();
echo $result['body'];
```

## Advanced Examples

### Submit Button Image

```php
$image = CustomFieldBuilder::image()
    ->name('submit')
    ->src('/img/buttons/submit.png')
    ->alt('Submit')
    ->width(150)
    ->height(50)
    ->class('submit-button')
    ->build();
```

### Logo Display

```php
$image = CustomFieldBuilder::image()
    ->src('/img/logo.png')
    ->alt('Company Logo')
    ->width(200)
    ->height(60)
    ->class('company-logo')
    ->build();
```

### Responsive Image

```php
$image = CustomFieldBuilder::image()
    ->src('/img/banner.jpg')
    ->alt('Banner Image')
    ->class('img-fluid')
    ->build();
```

### With Data Attributes

```php
$image = CustomFieldBuilder::image()
    ->src('/img/product.jpg')
    ->alt('Product Image')
    ->width(300)
    ->height(300)
    ->data('product-id', 123)
    ->data('zoom', 'enabled')
    ->build();
```

## Rendering

### HTML Output

```php
$result = $image->toHtml();

// $result contains:
// [
//     'body' => '<img ... />',
//     'scripts' => [],
//     'styles' => []
// ]

echo $result['body'];
```

### Array Output

```php
$array = $image->toArray();

// Returns complete field configuration
```

## HTML Output

The image field renders as:

```html
<img 
    src="/img/submit.png" 
    alt="Submit Form" 
    width="120" 
    height="40" 
    class="submit-button"
/>
```

For submit buttons:

```html
<input 
    type="image" 
    name="submitImage" 
    src="/img/submit.png" 
    alt="Submit" 
    width="120" 
    height="40"
/>
```

## Related Documentation

- <Link to="/packages/laravel-custom-field/deep-diving/attributes/field-attributes">Field Attributes</Link> - All available attributes
- <Link to="/packages/laravel-custom-field/deep-diving/data/data-builder">Data Builder</Link> - Adding data attributes
- <Link to="/packages/laravel-custom-field/deep-diving/custom-field-builder">CustomFieldBuilder</Link> - Builder API reference

