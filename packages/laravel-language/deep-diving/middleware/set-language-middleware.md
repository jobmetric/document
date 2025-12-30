---
sidebar_position: 1
sidebar_label: SetLanguageMiddleware
---

import Link from "@docusaurus/Link";

# SetLanguageMiddleware

The `SetLanguageMiddleware` automatically sets the application locale for the current request, enabling seamless multi-language support without manual intervention.

## Namespace

```php
JobMetric\Language\Http\Middleware\SetLanguageMiddleware
```

## Overview

This middleware intelligently sets the application locale based on a priority system:

1. **Accept-Language Header**: Automatically detects user's preferred language from browser settings (q-weighted, cleaned)
2. **Session Value**: Uses locale stored in session if user has previously selected a language
3. **Config Fallback**: Falls back to `config('app.locale')` if no other source is available

## Why Use This Middleware?

### Problem Without Middleware

Without this middleware, you would need to:

- Manually check headers in every controller
- Write repetitive locale detection code
- Handle session management for language preferences
- Parse complex Accept-Language headers with q-values
- Normalize locale codes (e.g., 'fa-IR' → 'fa')
- Ensure consistency across all routes

### Solution With Middleware

The `SetLanguageMiddleware` handles all of this automatically:

- **Zero Configuration**: Works out of the box with sensible defaults
- **Automatic Detection**: Detects user's preferred language from browser
- **Session Persistence**: Remembers user's language choice
- **Smart Normalization**: Converts complex locale codes to base forms
- **Event Integration**: Fires events for extensibility
- **Route Awareness**: Skips processing on language switching routes

## Usage

### Basic Registration

Register in `app/Http/Kernel.php`:

```php
protected $middlewareGroups = [
    'web' => [
        // ... other middleware
        \JobMetric\Language\Http\Middleware\SetLanguageMiddleware::class,
    ],
];
```

### API Routes

For API routes, register in the `api` middleware group:

```php
protected $middlewareGroups = [
    'api' => [
        // ... other middleware
        \JobMetric\Language\Http\Middleware\SetLanguageMiddleware::class,
    ],
];
```

### Specific Routes

Apply to specific routes only:

```php
Route::middleware([
    \JobMetric\Language\Http\Middleware\SetLanguageMiddleware::class
])->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/blog', [BlogController::class, 'index']);
});
```

## How It Works

### Priority System

The middleware follows this priority order:

1. **Accept-Language Header** (Highest Priority)
   - Parses `Accept-Language` header with q-values
   - Example: `Accept-Language: en-US,en;q=0.9,fa;q=0.8`
   - Selects the highest priority language that exists in your system

2. **Session Value**
   - Checks for `session('language')` value
   - Used when user has explicitly selected a language
   - Persists across requests

3. **Config Fallback** (Lowest Priority)
   - Uses `config('app.locale')` as final fallback
   - Ensures a valid locale is always set

### Locale Normalization

The middleware automatically normalizes locale codes:

```php
// Input: 'fa-IR' (Persian - Iran)
// Output: 'fa' (Persian base locale)

// Input: 'en-US' (English - United States)
// Output: 'en' (English base locale)
```

This ensures consistency and simplifies language management.

### Route Skipping

The middleware intelligently skips processing on the language switching route:

```php
// Route named 'language.set' is skipped
Route::post('/language/set', [LanguageController::class, 'set'])
    ->name('language.set');
```

This prevents infinite loops when users change their language preference.

## Real-World Use Cases

### Use Case 1: E-Commerce Multi-Language Store

**Scenario**: An e-commerce platform serving customers worldwide needs to automatically display content in the user's preferred language.

**Solution**:

```php
// Register middleware globally
protected $middlewareGroups = [
    'web' => [
        \JobMetric\Language\Http\Middleware\SetLanguageMiddleware::class,
    ],
];

// Products automatically display in user's language
Route::get('/products/{id}', [ProductController::class, 'show']);

// In controller, translations are automatically loaded
public function show($id)
{
    $product = Product::find($id);
    
    // Translation is automatically in user's locale
    return view('products.show', [
        'name' => $product->translation('name'), // User's language
        'description' => $product->translation('description'), // User's language
    ]);
}
```

**Benefits**:
- Users see content in their native language immediately
- No manual language selection required for first-time visitors
- Improved user experience and conversion rates

### Use Case 2: Content Management System

**Scenario**: A CMS needs to serve content in multiple languages based on user preferences stored in session.

**Solution**:

```php
// User selects language from dropdown
Route::post('/language/switch', function (Request $request) {
    session(['language' => $request->input('locale')]);
    return redirect()->back();
})->name('language.set');

// Middleware automatically uses session value
// All subsequent requests use the selected language
```

**Benefits**:
- User preference is remembered across sessions
- Seamless language switching without page reloads
- Consistent experience throughout the application

### Use Case 3: API with Multi-Language Support

**Scenario**: A REST API needs to return responses in the client's preferred language.

**Solution**:

```php
// Register in API middleware group
protected $middlewareGroups = [
    'api' => [
        \JobMetric\Language\Http\Middleware\SetLanguageMiddleware::class,
    ],
];

// API automatically returns localized responses
Route::get('/api/products', function () {
    return Product::all()->map(function ($product) {
        return [
            'id' => $product->id,
            'name' => $product->translation('name'), // Client's language
            'description' => $product->translation('description'), // Client's language
        ];
    });
});
```

**Benefits**:
- API responses match client's language preference
- No need for language parameter in every API call
- Better developer experience for API consumers

### Use Case 4: Admin Panel with Language Override

**Scenario**: An admin panel needs to support multiple languages, but admins should be able to override the automatic detection.

**Solution**:

```php
// Middleware runs first (automatic detection)
// Admin can override via session
Route::post('/admin/language/override', function (Request $request) {
    if (auth()->user()->isAdmin()) {
        session(['language' => $request->input('locale')]);
    }
    return redirect()->back();
});

// Middleware respects session override
// Admin sees content in their chosen language
```

**Benefits**:
- Automatic detection for convenience
- Manual override for power users
- Flexible language management

## Behavior Details

### Accept-Language Header Parsing

The middleware intelligently parses complex Accept-Language headers:

```php
// Example header: "en-US,en;q=0.9,fa;q=0.8,de;q=0.7"

// Processing:
// 1. Parses q-values (quality factors)
// 2. Sorts by priority (highest q-value first)
// 3. Normalizes locale codes
// 4. Checks if locale exists in your system
// 5. Sets the first available locale
```

### Session Management

The middleware seamlessly integrates with Laravel's session system:

```php
// When user selects a language
session(['language' => 'fa']);

// Middleware automatically uses this value
// All subsequent requests use 'fa' locale
```

### Event Firing

After setting the locale, the middleware fires a `SetLocaleEvent`:

```php
// Listen to locale changes
Event::listen(SetLocaleEvent::class, function ($event) {
    // Log locale change
    Log::info('Locale changed', ['locale' => app()->getLocale()]);
    
    // Update user preference in database
    if (auth()->check()) {
        auth()->user()->update(['preferred_locale' => app()->getLocale()]);
    }
    
    // Invalidate locale-specific caches
    Cache::tags(['locale', app()->getLocale()])->flush();
});
```

## Integration Examples

### Example 1: Complete Setup

```php
// app/Http/Kernel.php
protected $middlewareGroups = [
    'web' => [
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \JobMetric\Language\Http\Middleware\SetLanguageMiddleware::class,
        // ... other middleware
    ],
];
```

### Example 2: With Custom Event Listener

```php
// app/Providers/EventServiceProvider.php
protected $listen = [
    SetLocaleEvent::class => [
        \App\Listeners\TrackLocaleChange::class,
        \App\Listeners\UpdateUserLocale::class,
    ],
];
```

### Example 3: Language Switcher Component

```php
// resources/views/components/language-switcher.blade.php
@foreach(Language::all(['status' => true]) as $language)
    <a href="{{ route('language.set', ['locale' => $language->locale]) }}"
       class="{{ app()->getLocale() === $language->locale ? 'active' : '' }}">
        {{ $language->name }}
    </a>
@endforeach
```

## When to Use SetLanguageMiddleware

Use this middleware when you need to:

- **Automatic Locale Detection**: Automatically detect and set locale from browser headers
- **Session-Based Locale**: Support locale stored in session for user preferences
- **Multi-Language Apps**: Support multiple languages in your application without manual handling
- **User Preferences**: Respect user language preferences automatically
- **API Localization**: Provide localized API responses based on client preferences
- **Content Management**: Serve content in user's preferred language
- **E-Commerce**: Display product information in customer's language
- **Internationalization**: Build truly international applications

## When NOT to Use

You might not need this middleware if:

- Your application is single-language only
- You handle locale detection manually in controllers
- You use a different localization strategy
- You need more complex locale detection logic

## Related Documentation

- <Link to="/packages/laravel-language/deep-diving/middleware/set-timezone-middleware">SetTimezoneMiddleware</Link>
- <Link to="/packages/laravel-language/deep-diving/events">Events</Link>
- <Link to="/packages/laravel-language/deep-diving/language-service">Language Service</Link>
- <Link to="/packages/laravel-language/deep-diving/models/language">Language Model</Link>

