---
sidebar_position: 0
sidebar_label: Laravel Translation
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/laravel-translation.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/laravel-translation/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/laravel-translation.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/laravel-translation/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/laravel-translation.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/laravel-translation/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/laravel-translation.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/laravel-translation/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# Translation for laravel

This package is for creating different translations in different Laravel projects.

Laravel-Translation is a powerful package that simplifies the management of multilingual content within Laravel applications. It offers dynamic translation storage, retrieval, and updates, seamlessly integrating with your models through the HasTranslation trait. The core features include:

> **Package:** `jobmetric/laravel-translation`  
> **PHP:** 8.1+ (8.2+ recommended) · **Laravel:** 9/10/11  
> **Provider:** `JobMetric\Translation\TranslationServiceProvider`

## Highlights

**Custom Validation:** Ensures translation data integrity with flexible rules and error handling.

**Model Integration:** Supports multi-language attributes with versioning, soft deletes, and event-driven updates.

**API Resources:** Provides structured serialization for translation data, facilitating API responses.

**Extensible Architecture:** Includes custom exceptions, event handling, and dynamic translation management for scalable localization.

**Query Support:** Enables scope queries and relationship management for efficient multilingual data handling.

**Language Files:** Centralized language files for consistent, maintainable multilingual user communication.

## What is Translation?

Undergoing continuous enhancements, this package evolves each day, integrating an array of diverse features. It stands as an indispensable asset for enthusiasts of Laravel, offering a seamless way to harmonize their projects with translation database models.

In this package, you can employ it seamlessly with any model requiring database translation. Now, let's delve into the core functionality.

Meet the `HasTranslation` trait, meticulously designed for integration into your model. This trait automates essential tasks, ensuring a streamlined process for managing multilingual content. In the first step, you need to connect this trait to your main model.

Consider a blog post that needs to be available in multiple languages. With Laravel Translation, you can store the title, summary, and body in different locales, retrieve the appropriate translation based on the user's locale, track version history if content changes over time, and search for posts by their translated titles or content. The power of translation management lies not only in storing multiple language versions but also in making them easily accessible, searchable, and manageable throughout your application.

Moreover, in the realm of translations, the concept of versioning becomes pivotal. A translation may have multiple versions, reflecting different edits or updates over time. This flexibility caters to the diverse needs of content management, allowing you to track changes, restore previous versions, and maintain a complete history of your multilingual content.

In essence, leveraging this robust translation system empowers your program to efficiently handle multilingual content, providing a structured and automated approach to translation management. By incorporating this package into your development toolkit, you can streamline translation processes, enhance productivity, and navigate the intricate web of multilingual content with ease.
