---
sidebar_position: 0
sidebar_label: Laravel Language
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/laravel-language.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/laravel-language/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/laravel-language.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/laravel-language/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/laravel-language.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/laravel-language/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/laravel-language.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/laravel-language/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# Language Management for Laravel

This package is for creating language management in different Laravel projects.

Laravel Language is a modern, flexible package that provides a clean, framework-native way to manage application languages with first-class validation rules, events, and a fluent query API. It supports multiple calendar systems, text directions, and provides comprehensive tools for internationalization and localization.

> **Package:** `jobmetric/laravel-language`  
> **PHP:** 8.2+ · **Laravel:** 9.19+ (10/11/12 supported)  
> **Provider:** `JobMetric\Language\LanguageServiceProvider`  
> **Dependencies:** `jobmetric/laravel-event-system` ^2.7, `spatie/laravel-query-builder` ^6.3, `jobmetric/multi-calendar` ^1.2

## Highlights

**Simple API:** Clean, intuitive API for managing languages. Store, update, delete, and query languages with simple method calls through the service or facade.

**Calendar Awareness:** Support for multiple calendar systems: Gregorian, Jalali, Hijri, Hebrew, Buddhist, Coptic, Ethiopian, and Chinese. Each language can have its own calendar preference.

**Validation Rules:** Built-in validation rules: `CheckLocaleRule` and `LanguageExistRule` ensure data integrity and validate locale codes.

**Event System:** Built-in events for language lifecycle: `LanguageStoredEvent`, `LanguageUpdatedEvent`, `LanguageDeletingEvent`, and `LanguageDeletedEvent`. Integrate with notification systems, caching, or any custom logic.

**Middleware Support:** Built-in middleware for setting language and timezone automatically based on user preferences or request parameters.

**Rich Querying:** Query languages with filters, sorts, and field selection using Spatie QueryBuilder under the hood.

## What is Language Management?

Undergoing continuous enhancements, this package evolves each day, integrating an array of diverse features. It stands as an indispensable asset for enthusiasts of Laravel, offering a seamless way to manage multiple languages, locales, calendar systems, and text directions in your application.

In traditional Laravel applications, implementing language management often involves creating custom language tables manually, writing complex queries to filter and sort languages, and managing locale settings manually. This approach becomes limiting when you need to support multiple calendar systems, handle RTL languages, or integrate with various internationalization features.

Laravel Language solves these challenges by providing a unified system that works seamlessly with Laravel's localization features. You can manage languages, locales, text directions, calendar systems, and formatting preferences—all with the same simple API. The package handles validation, events, middleware, and querying, making it perfect for applications that need comprehensive language management.

Consider a multi-language application that needs to support Persian (Jalali calendar, RTL), Arabic (Hijri calendar, RTL), and English (Gregorian calendar, LTR). With Laravel Language, you can implement this functionality quickly and easily, with built-in support for calendar systems, text directions, and event-driven caching. The power of language management lies not only in flexible calendar support but also in making it easy to query, validate, and extend language functionality throughout your application.

