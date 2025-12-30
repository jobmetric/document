---
sidebar_position: 1
sidebar_label: Language
---

import Link from "@docusaurus/Link";

# Language Model

The `Language` model represents a language entry used for i18n/L10n, including locale identity, UI direction, calendar system preference, and first day of week.

## Namespace

```php
JobMetric\Language\Models\Language
```

## Overview

The Language model stores language configuration data including name, flag, locale, direction, calendar, first day of week, and status. It includes query scopes for filtering and uses the `HasBooleanStatus` trait for status management.

## Properties

### Name

```php
public string $name;
```

Human-readable display name of the language (e.g., "Persian", "English").

### Flag

```php
public string|null $flag;
```

Optional visual representation of the language flag (e.g., "ir", "us").

### Locale

```php
public string $locale;
```

Locale identifier (two-letter code like "fa", "en", "ar"). Must be unique.

### Direction

```php
public string $direction;
```

Text direction: `'ltr'` (left-to-right) or `'rtl'` (right-to-left).

### Calendar

```php
public string $calendar;
```

Calendar system identifier (e.g., "gregorian", "jalali", "hijri").

### First Day of Week

```php
public int $first_day_of_week;
```

First day of week (0-6): 0=Sunday, 1=Monday, ..., 6=Saturday.

### Status

```php
public bool $status;
```

Activation toggle: `true` = active, `false` = inactive.

## Query Scopes

### Of Locale

Filter by locale:

```php
Language::ofLocale('fa')->first();
```

### Of LTR

Filter left-to-right languages:

```php
Language::ofLtr()->get();
```

### Of RTL

Filter right-to-left languages:

```php
Language::ofRtl()->get();
```

### Of Calendar

Filter by calendar system:

```php
Language::ofCalendar('jalali')->get();
```

## Constants

### Direction Constants

```php
Language::DIRECTION_LTR = 'ltr';
Language::DIRECTION_RTL = 'rtl';
```

## Complete Examples

### Querying Languages

```php
use JobMetric\Language\Models\Language;

// Get by locale
$language = Language::ofLocale('fa')->first();

// Get RTL languages
$rtlLanguages = Language::ofRtl()->get();

// Get Jalali calendar languages
$jalaliLanguages = Language::ofCalendar('jalali')->get();

// Get active languages
$active = Language::where('status', true)->get();
```

### Creating Languages

```php
$language = Language::create([
    'name' => 'Persian',
    'flag' => 'ir',
    'locale' => 'fa',
    'direction' => 'rtl',
    'calendar' => 'jalali',
    'first_day_of_week' => 0,
    'status' => true,
]);
```

## When to Use Language Model

Use the Language model directly when you need to:

- **Direct Queries**: Query languages directly without going through the service
- **Custom Logic**: Implement custom language-related logic
- **Relationships**: Define relationships with other models
- **Scopes**: Use query scopes for filtering

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/language-service">Language Service</Link>
- <Link to="/packages/laravel-language/deep-diving/calendar-type-enum">CalendarTypeEnum</Link>
- <Link to="/packages/laravel-language/deep-diving/support/current-language">CurrentLanguage</Link>
- <Link to="/packages/laravel-language/deep-diving/events">Events</Link>

