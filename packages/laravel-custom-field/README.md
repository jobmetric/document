---
sidebar_position: 0
sidebar_label: Laravel Custom Field
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/laravel-custom-field.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/laravel-custom-field/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/laravel-custom-field.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/laravel-custom-field/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/laravel-custom-field.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/laravel-custom-field/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/laravel-custom-field.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/laravel-custom-field/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# Custom Field for Laravel

This package is for creating custom field management in different Laravel projects.

Laravel Custom Field is a powerful package that provides a fluent builder API to define, render, and serialize form fields with consistent HTML output. It supports all standard HTML input types with an extendable option/data system, making it perfect for building dynamic forms, admin panels, and API-driven form builders.

> **Package:** `jobmetric/laravel-custom-field`  
> **PHP:** 8.0.1+ (8.1+ recommended) · **Laravel:** 9.19+ (9/10/11 supported)  
> **Provider:** `JobMetric\CustomField\CustomFieldServiceProvider`

## Highlights

**Fluent Builder API:** Clean, chainable API for building form fields. Set attributes, properties, options, and data attributes in a single fluent chain—no more scattered HTML or inconsistent form rendering.

**Consistent HTML Output:** All fields render with consistent HTML structure, making it easy to style and maintain forms across your application. The package handles all the boilerplate, so you focus on your business logic.

**Extensible Architecture:** Create custom field types by extending the base classes. The package uses a registry system that makes it easy to add new field types and customize existing ones.

**Asset Management:** Fields can include their own JavaScript and CSS assets. The package automatically collects and provides asset paths, making it easy to include field-specific functionality.

**Option System:** Powerful option builder for select, radio, and checkbox fields. Build options via closures for bulk operations or arrays for simple cases.

**Data Attributes Support:** Easily add data attributes to fields for JavaScript integration, AJAX handling, or any custom functionality you need.

## What is Custom Field?

Undergoing continuous enhancements, this package evolves each day, integrating an array of diverse features. It stands as an indispensable asset for enthusiasts of Laravel, offering a seamless way to manage form field creation and rendering.

In traditional Laravel applications, creating form fields often involves writing HTML manually, using form builders with limited flexibility, or creating custom components that are time-consuming to maintain. This approach becomes limiting when you need consistent, maintainable, and extensible form field management.

Laravel Custom Field solves these challenges by providing a fluent builder API that allows you to programmatically create, configure, and render form fields with consistent HTML output. You can build complex forms with options, data attributes, images, and custom functionality—all through a clean, chainable interface.

Consider a dynamic form builder where administrators can create forms with different field types. With Laravel Custom Field, you can build fields programmatically, render them consistently, and serialize them for storage or API responses. The power of custom field management lies not only in flexible field creation but also in making it easy to extend, customize, and maintain throughout your application.




