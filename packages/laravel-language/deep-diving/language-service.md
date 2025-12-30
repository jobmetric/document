---
sidebar_position: 1
sidebar_label: Language Service
---

import Link from "@docusaurus/Link";

# Language Service

The `Language` service class provides methods for managing languages in your application. It can be used directly or through the `Language` facade.

## Namespace

```php
JobMetric\Language\Language
```

## Facade

```php
JobMetric\Language\Facades\Language
```

## Overview

The Language service provides a clean API for CRUD operations on languages, querying with filters, and managing language data. It uses Spatie QueryBuilder under the hood for flexible querying.

## Usage

### Using Facade

```php
use JobMetric\Language\Facades\Language;

$language = Language::store([...]);
```

### Using Service

```php
use JobMetric\Language\Language;

$languageService = app(Language::class);
$language = $languageService->store([...]);
```

## Available Methods

### Store

Store a new language:

```php
$response = Language::store([
    'name' => 'Persian',
    'flag' => 'ir',
    'locale' => 'fa',
    'direction' => 'rtl',
    'calendar' => 'jalali',
    'first_day_of_week' => 0,
    'status' => true,
]);
```

**Parameters:**
- `$input` (`array`): Language data array

**Returns:** `Response` - Package core response with language resource

**Events:**
- Fires `LanguageStoredEvent` after creation

### Update

Update an existing language:

```php
$response = Language::update($id, [
    'name' => 'فارسی',
    'status' => true,
]);
```

**Parameters:**
- `$language_id` (`int`): The language ID
- `$input` (`array`): Updated language data

**Returns:** `Response` - Package core response with language resource

**Events:**
- Fires `LanguageUpdatedEvent` after update

### Delete

Delete a language:

```php
$response = Language::delete($id);
```

**Parameters:**
- `$language_id` (`int`): The language ID

**Returns:** `Response` - Package core response with deleted language resource

**Events:**
- Fires `LanguageDeletingEvent` before deletion
- Fires `LanguageDeletedEvent` after deletion

### All

Get all languages matching the filter:

```php
$languages = Language::all();
// Or with filter
$languages = Language::all(['status' => true]);
```

**Parameters:**
- `$filter` (`array`): Key-value filter conditions (optional)

**Returns:** `Collection<LanguageModel>` - Collection of Language models

### Paginate

Paginate languages:

```php
$languages = Language::paginate(['status' => true], 15);
```

**Parameters:**
- `$filter` (`array`): Key-value filter conditions (optional)
- `$page_limit` (`int`): Number of results per page (default: 15)

**Returns:** `LengthAwarePaginator` - Paginated results

### Query

Build a query builder for languages:

```php
$query = Language::query(['status' => true]);
$languages = $query->where('direction', 'rtl')->get();
```

**Parameters:**
- `$filter` (`array`): Key-value filter conditions (optional)

**Returns:** `QueryBuilder` - Spatie QueryBuilder instance

**Allowed Fields:**
- `name`, `flag`, `locale`, `direction`, `calendar`, `first_day_of_week`, `status`, `created_at`, `updated_at`

### Add Language Data

Add a language from predefined data file:

```php
Language::addLanguageData('fa');
Language::addLanguageData('en');
```

**Parameters:**
- `$locale` (`string`): The locale code (e.g., "en", "fa")

**Returns:** `void`

**Exceptions:**
- `LanguageDataNotExist`: If locale doesn't exist in data file
- `RuntimeException`: If data file not found

### Get Flags

Get a list of available flag images:

```php
$flags = Language::getFlags();
// Returns: [
//     ['value' => 'ir', 'name' => 'Iran', 'url' => '/path/to/ir.svg'],
//     ...
// ]
```

**Returns:** `array` - Array of flag data with value, name, and URL

## Complete Examples

### Basic CRUD

```php
use JobMetric\Language\Facades\Language;

// Store
$response = Language::store([
    'name' => 'English',
    'flag' => 'us',
    'locale' => 'en',
    'direction' => 'ltr',
    'calendar' => 'gregorian',
    'first_day_of_week' => 1,
    'status' => true,
]);

// Update
Language::update($id, [
    'name' => 'English (US)',
]);

// Delete
Language::delete($id);

// Get all
$languages = Language::all();

// Get active languages
$active = Language::all(['status' => true]);
```

### Querying

```php
// Using query builder
$languages = Language::query(['status' => true])
    ->where('direction', 'rtl')
    ->orderBy('name')
    ->get();

// Pagination
$languages = Language::paginate(['status' => true], 20);

// With filters and sorts
$languages = Language::query()
    ->where('calendar', 'jalali')
    ->sort('name')
    ->get();
```

### Adding Predefined Languages

```php
// Add languages from data file
Language::addLanguageData('fa');
Language::addLanguageData('en');
Language::addLanguageData('ar');
```

## When to Use Language Service

Use the Language service when you need to:

- **CRUD Operations**: Create, read, update, or delete languages
- **Querying**: Filter, sort, and paginate languages
- **API Integration**: Build API endpoints for language management
- **Admin Panels**: Manage languages in admin interfaces
- **Data Seeding**: Add predefined languages to your database

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/models/language">Language Model</Link>
- <Link to="/packages/laravel-language/deep-diving/calendar-type-enum">CalendarTypeEnum</Link>
- <Link to="/packages/laravel-language/deep-diving/events">Events</Link>

