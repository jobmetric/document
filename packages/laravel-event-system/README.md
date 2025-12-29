---
sidebar_position: 0
sidebar_label: Laravel Event System
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/laravel-event-system.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/laravel-event-system/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/laravel-event-system.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/laravel-event-system/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/laravel-event-system.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/laravel-event-system/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/laravel-event-system.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/laravel-event-system/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# Event System for Laravel

This package is for creating dynamic event management systems in different Laravel projects.

Laravel Event System is a powerful package that simplifies dynamic event management in Laravel applications. It provides a flexible layer on top of Laravel's native event system, enabling dynamic event registration, domain event architecture, and runtime event management—perfect for modular applications, plugin-based systems, and event-driven architectures.

> **Package:** `jobmetric/laravel-event-system`  
> **PHP:** 8.1+ (8.2+ recommended) · **Laravel:** 9.19+ (9/10/11 supported)  
> **Provider:** `JobMetric\EventSystem\EventSystemServiceProvider`

## Highlights

**Dynamic Event Registration:** Register and manage event-listener bindings at runtime without code changes. Perfect for plugin systems and modular applications where events need to be configured dynamically.

**Domain Event Architecture:** Implement domain-driven design patterns with stable event keys, rich metadata, and consistent structure. Create events with titles, descriptions, icons, and tags for UI integration.

**Event Bus & Registry:** Dispatch events by stable keys instead of hard-coding class names. The `EventBus` and `EventRegistry` provide clean abstractions that decouple your code from concrete event classes.

**Database-Driven Management:** Store event-listener bindings in the database, allowing administrators to manage events through UI or API. Enable or disable listeners without removing them.

**Priority Control:** Control listener execution order with priority values. Lower priority values execute earlier, giving you fine-grained control over event handling.

**Query & Filter Support:** Use Spatie QueryBuilder for advanced filtering, sorting, and pagination. Build powerful admin interfaces for managing your event system.

## What is Event System?

Undergoing continuous enhancements, this package evolves each day, integrating an array of diverse features. It stands as an indispensable asset for enthusiasts of Laravel, offering a seamless way to manage dynamic event configurations and implement event-driven architectures.

In traditional Laravel applications, events are registered statically in service providers. This approach works well for simple applications, but becomes limiting when you need plugin systems, modular applications, admin interfaces, feature flags, or A/B testing capabilities.

Laravel Event System solves these challenges by providing a database-driven, runtime-configurable event management system. You can register events at runtime, manage them through an API or UI, and control their execution without code changes.

Consider a plugin system that needs to register its own events. With Laravel Event System, you can register events with stable keys, dispatch them by key without hard-coding class names, build UI components that list available events with their metadata, enable or disable event handlers through an admin interface, and track event usage and analytics.

The power of event system management lies not only in registering events dynamically but also in making them easily manageable, discoverable, and configurable throughout your application.
