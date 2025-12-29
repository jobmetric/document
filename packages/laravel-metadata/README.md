---
sidebar_position: 0
sidebar_label: Laravel Metadata
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/laravel-metadata.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/laravel-metadata/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/laravel-metadata.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/laravel-metadata/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/laravel-metadata.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/laravel-metadata/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/laravel-metadata.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/laravel-metadata/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# Metadata for Laravel

This package is for managing metadata in different Laravel projects.

Laravel Metadata is a powerful package that provides a robust and flexible metadata system for Laravel Eloquent models. It enables you to attach dynamic key-value data to any model through a polymorphic relationship, perfect for storing custom fields, settings, options, and user-defined attributes without modifying your database schema.

> **Package:** `jobmetric/laravel-metadata`  
> **PHP:** 8.0.1+ (8.1+ recommended) · **Laravel:** 9.19+ (9/10/11 supported)  
> **Provider:** `JobMetric\Metadata\MetadataServiceProvider`

## Highlights

**Dynamic Key-Value Storage:** Store arbitrary key-value pairs for any Eloquent model without modifying the model's table structure. Perfect for custom fields, user preferences, and extensible data.

**Polymorphic Relationships:** Uses Laravel's polymorphic relationships, allowing a single `metas` table to store metadata for multiple model types. Keeps your database schema clean and maintainable.

**Key Whitelisting:** Control which metadata keys are allowed for each model. Define a whitelist to prevent typos and ensure data integrity, or use `['*']` to allow all keys.

**Automatic JSON Handling:** Arrays and objects are automatically JSON-encoded when stored and decoded when retrieved. The package tracks which values are JSON for proper type handling.

**Event System Integration:** Integrates with Laravel Event System, firing events when metadata is stored or deleted. Listen to these events for custom logic, logging, or notifications.

**Query Scopes:** Filter models based on their metadata using query scopes. Find all models with a specific metadata key or value, making it easy to build dynamic filtering systems.

## What is Metadata?

Undergoing continuous enhancements, this package evolves each day, integrating an array of diverse features. It stands as an indispensable asset for enthusiasts of Laravel, offering a seamless way to manage dynamic metadata for Eloquent models.

In traditional Laravel applications, storing additional information about models often requires adding columns to tables or creating separate tables for each model type. This approach becomes limiting when you need flexible, extensible data storage that doesn't require schema changes.

Laravel Metadata solves these challenges by providing a polymorphic metadata system where a single table stores key-value pairs for any model type. You can store custom fields, user preferences, product attributes, and any other extensible data without modifying your main table structures.

Consider an e-commerce system where products need different attributes based on their category. With Laravel Metadata, you can store category-specific attributes dynamically, query products by these attributes, and manage them through a simple API. The power of metadata management lies not only in flexible storage but also in making it easy to query, filter, and manage throughout your application.

