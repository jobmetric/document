---
sidebar_position: 0
sidebar_label: Typeify
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/typeify.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/typeify/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/typeify.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/typeify/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/typeify.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/typeify/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/typeify.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/typeify/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# Type Registry for Laravel

Define types once, attach behavior with traits, and use them everywhere. Typeify gives you a single registry per concern (post types, product types, etc.) with a fluent API and Laravel container as the source of truth.

> **Package:** `jobmetric/typeify`  
> **PHP:** 8.0+ · **Laravel:** 9.19+  
> **Namespace:** `JobMetric\Typeify`

## Highlights

**One Registry Per Concern:** Each subclass of `BaseType` is a single registry (e.g. post types, product types). Define types with unique keys and attach parameters via fluent methods. No duplicated config arrays or scattered conditionals.

**Composable Traits:** Add only what you need: `HasLabelType`, `HasDescriptionType`, `HasImportType`, `HasExportType`, `HasHierarchicalType`, `HasListOptionType`, `HasDriverNamespaceType`. Labels and descriptions go through `trans()` for localization.

**Laravel Container Storage:** All type data lives in the Laravel service container under the key returned by `typeName()`. Same definitions everywhere: controllers, APIs, admin panels, CLI.

**Type Safety:** `ensureTypeExists()`, `hasType()`, `getTypes()` for validation and listing. Exceptions: `TypeifyTypeNotFoundException`, `TypeifyTypeNotMatchException`.

## What is a Type?

A **type** in Typeify is a named key (e.g. `blog`, `product`, `page`) inside a single registry—your subclass of `BaseType`. Each type holds parameters: label, description, and any flags or options you attach via traits.

- **Define** – Call `define('key')` to register a type, then chain methods to set parameters.
- **Select** – Call `type('key')` to switch the current type and read or update its parameters.
- **Store** – Data is stored in the Laravel container under `typeName()`, so it is global and consistent for the request.

Consider a content system with post types (blog, news, page) and product types (physical, digital). With Typeify you create a `PostType` and a `ProductType` registry, define each type with labels and descriptions, enable import/export or hierarchical where needed, and reuse the same definitions everywhere.
