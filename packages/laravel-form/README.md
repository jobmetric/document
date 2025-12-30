---
sidebar_position: 0
sidebar_label: Laravel Form
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/laravel-form.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/laravel-form/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/laravel-form.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/laravel-form/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/laravel-form.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/laravel-form/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/laravel-form.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/laravel-form/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# Form Builder for Laravel

This package is for creating generic forms that allows you to create all kinds of forms in your application in code.

Laravel Form is a powerful package that provides a fluent builder API to create complex, structured forms programmatically. Built on top of Laravel Custom Field, it allows you to organize forms with tabs, groups, and custom fields—all through a clean, chainable interface. Perfect for building dynamic admin panels, configuration forms, and API-driven form builders.

> **Package:** `jobmetric/laravel-form`  
> **PHP:** 8.0.1+ (8.1+ recommended) · **Laravel:** 9.19+ (9/10/11 supported)  
> **Provider:** `JobMetric\Form\FormServiceProvider`  
> **Dependencies:** `jobmetric/laravel-custom-field` ^2.1

## Highlights

**Fluent Builder API:** Clean, chainable API for building forms. Set form attributes, organize fields into tabs and groups, and configure validation—all through a single fluent chain. No more scattered HTML or inconsistent form structures.

**Tab-Based Organization:** Organize complex forms into logical tabs. Each tab can contain multiple groups, and each group can contain multiple fields. This hierarchical structure makes it easy to build sophisticated forms while keeping code organized and maintainable.

**Group-Based Field Organization:** Group related fields together with labels and descriptions. Groups provide visual separation and logical organization, making forms easier to understand and fill out.

**Custom Fields Integration:** Built on top of Laravel Custom Field, you can use all available field types (text, select, radio, image, etc.) and create custom field types. The form builder seamlessly integrates with the custom field system.

**Automatic Validation:** Forms can automatically generate validation rules from field configurations. Use `FormBuilderRequest` to drive validation directly from your form definition, eliminating the need to manually write validation rules.

**HTML Rendering:** Forms can be rendered to HTML with a single method call. The package handles all the boilerplate, including CSRF tokens, form attributes, and field rendering.

## What is Form Building?

Undergoing continuous enhancements, this package evolves each day, integrating an array of diverse features. It stands as an indispensable asset for enthusiasts of Laravel, offering a seamless way to manage form creation and rendering.

In traditional Laravel applications, creating forms often involves writing HTML manually, using form builders with limited flexibility, or creating custom components that are time-consuming to maintain. This approach becomes limiting when you need consistent, maintainable, and extensible form management with complex structures like tabs and groups.

Laravel Form solves these challenges by providing a fluent builder API that allows you to programmatically create, configure, and render forms with consistent HTML output. You can build complex forms with tabs, groups, custom fields, and automatic validation—all through a clean, chainable interface.

Consider a dynamic form builder where administrators can create forms with different structures, tabs, and field types. With Laravel Form, you can build forms programmatically, render them consistently, and serialize them for storage or API responses. The power of form building lies not only in flexible form creation but also in making it easy to extend, customize, and maintain throughout your application.

