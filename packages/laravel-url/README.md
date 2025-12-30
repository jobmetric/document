---
sidebar_position: 0
sidebar_label: Laravel URL
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/laravel-url.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/laravel-url/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/laravel-url.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/laravel-url/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/laravel-url.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/laravel-url/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/laravel-url.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/laravel-url/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# URL Management for Laravel

This package is for creating URL and slug management in different Laravel projects.

Laravel URL is a powerful package that provides SEO-friendly URL and slug management for Laravel applications. It offers automatic URL versioning, intelligent conflict detection, cascading URL updates, and smart fallback routing—all designed to make URL management effortless while maintaining SEO best practices.

> **Package:** `jobmetric/laravel-url`  
> **PHP:** 8.1+ · **Laravel:** 10.0+  
> **Provider:** `JobMetric\Url\UrlServiceProvider`

## Highlights

**Automatic URL Versioning:** Track complete URL history with automatic versioning. Every URL change creates a new version while preserving old URLs for SEO-friendly redirects.

**Intelligent Conflict Detection:** Global uniqueness enforcement for active URLs ensures no duplicate URLs exist. The package automatically detects conflicts and provides clear error messages.

**Cascading URL Updates:** Automatically update child URLs when parent slugs change. Perfect for hierarchical structures like category/product relationships.

**Smart Fallback Routing:** Resolve unmatched paths with automatic 301 redirects. The package provides a fallback controller that matches URLs and redirects legacy URLs to their canonical versions.

**Soft Delete Support:** Handle URL conflicts on restore with built-in validation. The package gracefully handles soft deletes and ensures URL uniqueness when restoring models.

**Collection Support:** Organize slugs by collections for better management. Group related slugs together for easier organization and querying.

**SEO-Friendly Redirects:** Automatic 301 redirects preserve link equity. When URLs change, old URLs automatically redirect to new ones, maintaining SEO value.

## What is URL Management?

Undergoing continuous enhancements, this package evolves each day, integrating an array of diverse features. It stands as an indispensable asset for enthusiasts of Laravel, offering a seamless way to manage URLs and slugs in your application.

In traditional Laravel applications, implementing URL management often involves creating custom slug tables manually, writing complex queries to handle URL conflicts, managing URL versioning for SEO, and implementing fallback routing for legacy URLs. This approach becomes limiting when you need to support hierarchical URLs, handle URL changes gracefully, or maintain SEO-friendly redirects.

Laravel URL solves these challenges by providing a unified system that works seamlessly with Laravel's routing and model system. You can manage slugs, track URL history, handle conflicts, and implement fallback routing—all with the same simple API. The package handles versioning, conflict detection, cascading updates, and redirects, making it perfect for applications that need comprehensive URL management.

Consider an e-commerce application with products organized by categories. When a category slug changes, all product URLs need to update automatically. With Laravel URL, you can implement this functionality quickly and easily, with built-in support for cascading updates, conflict detection, and automatic redirects. The power of URL management lies not only in flexible slug handling but also in making it easy to maintain SEO-friendly URLs, track URL history, and handle legacy URLs throughout your application.
