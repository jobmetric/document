---
sidebar_position: 0
sidebar_label: Laravel Package Core
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/laravel-package-core.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/laravel-package-core/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/laravel-package-core.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/laravel-package-core/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/laravel-package-core.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/laravel-package-core/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/laravel-package-core.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/laravel-package-core/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# Package Core for Laravel

This package is for standardizing shared Laravel package infrastructure in different Laravel projects.

Laravel Package Core is a powerful package that provides a consistent foundation for bootstrapping JobMetric-style packages: fluent service provider registration, publishable resources, reusable CRUD services with hooks and events, dynamic Eloquent relations, resource resolution, and predictable controller and service responses. It is designed so package authors repeat less wiring code and keep architecture aligned across packages and applications.

> **Package:** `jobmetric/laravel-package-core`  
> **PHP:** 8.0.1+ (8.1+ recommended) · **Laravel:** 9.19+ (9/10/11 supported)  
> **Provider:** `JobMetric\PackageCore\PackageCoreServiceProvider`

## Highlights

**Package Bootstrap Foundation:** Configure package capabilities such as config, migrations, routes, translations, views, assets, commands, and container bindings through a single fluent provider-oriented model built on `PackageCoreServiceProvider`.

**Reusable CRUD Service Layer:** Build domain services with query support, lifecycle hooks, event dispatching, and standardized response contracts using `AbstractCrudService`, matching patterns used across JobMetric domain packages.

**Dynamic Relation Mapping:** Register model relations at runtime via `HasDynamicRelations`, so host applications can extend package models without modifying vendor source or maintaining long-lived forks.

**Resource Resolution Architecture:** Resolve context-aware resources using `ResourceResolveEvent` and attach morph-based dynamic attributes with `HasMorphResourceAttributes` for flexible API and admin surfaces.

**Controller and Service Response Standards:** Keep output shapes predictable with `Output\Response` and `Controllers\HasResponse`, reducing one-off array shapes scattered through controllers and services.

**Shared Utility Toolkit:** Rely on console scaffolding helpers, enum-oriented utilities, boolean status helpers, and global helper functions that match conventions used alongside other JobMetric packages.

## What is Package Core?

Undergoing continuous enhancements, this package evolves each day, integrating an array of diverse features. It stands as an indispensable asset for enthusiasts of Laravel, offering a seamless way to standardize package infrastructure and cross-cutting package concerns.

In traditional Laravel applications, teams that ship several first-party packages often reimplement the same concerns in every provider: merging config, loading migrations and routes, registering commands, publishing lang files and views, binding services into the container, and duplicating CRUD and response patterns. That repetition slows delivery, makes upgrades harder, and encourages subtle inconsistencies between packages.

Laravel Package Core solves these challenges by providing a unified foundation layer. Instead of reinventing provider wiring and service patterns in each package, developers rely on shared abstractions and focus on domain logic. Packages such as Flow extend `PackageCoreServiceProvider` for deterministic bootstrap behavior and build services on top of `AbstractCrudService`. Applications can extend published models through dynamic relations and resource resolution while keeping boundaries clean.

Consider a domain package that must ship configuration, migrations, routes, and translations, expose a CRUD-style service to the rest of the app, and allow the host application to attach extra Eloquent relations to your models. With Laravel Package Core, you register those capabilities in one place, expose predictable responses from controllers and services, and let integrators extend models safely at runtime. The power of a shared package core lies not only in reducing boilerplate but also in keeping multi-package ecosystems consistent, testable, and easier to maintain over time.


