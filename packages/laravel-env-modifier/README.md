---
sidebar_position: 0
sidebar_label: Laravel Env Modifier
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/laravel-env-modifier.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/laravel-env-modifier/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/laravel-env-modifier.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/laravel-env-modifier/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/laravel-env-modifier.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/laravel-env-modifier/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/laravel-env-modifier.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/laravel-env-modifier/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# Env Modifier for Laravel

This package is for creating, reading, merging, updating, backing up, restoring, and deleting `.env` files in different Laravel projects.

Laravel Env Modifier is a lightweight, framework-friendly utility that simplifies working with `.env` files in Laravel applications. It provides a clean API to manage environment configuration files safely and predictably—perfect for deployment scripts, environment management, and configuration automation.

> **Package:** `jobmetric/laravel-env-modifier`  
> **PHP:** 8.0.1+ (8.1+ recommended) · **Laravel:** 9.19+ (9/10/11 supported)  
> **Provider:** `JobMetric\EnvModifier\EnvModifierServiceProvider`

## Highlights

**Safe File Operations:** Uses atomic writes with `LOCK_EX` to prevent race conditions. Includes protection mechanisms to prevent accidental deletion of your main application `.env` file.

**Smart Value Handling:** Automatically handles value normalization, escaping, and quoting. Intelligently quotes values containing spaces, special characters, or newlines, and properly handles booleans, arrays, and JSON data.

**Preserves Comments:** Unlike many `.env` manipulation tools, preserves comments and blank lines in your `.env` files. Only modifies the specific keys you target, leaving the rest of your file structure intact.

**Multiple File Support:** Work with multiple `.env` files simultaneously. Create environment-specific files, merge configurations from templates, and manage different environments without code changes.

**Helper Functions:** Includes convenient global helper functions that intentionally avoid naming conflicts with Laravel's built-in `env()` function.

**Regex Safety:** Keys are automatically escaped with `preg_quote` to prevent regex injection vulnerabilities when matching patterns.

## What is Env Modifier?

Undergoing continuous enhancements, this package evolves each day, integrating an array of diverse features. It stands as an indispensable asset for enthusiasts of Laravel, offering a seamless way to manage environment configuration files programmatically.

In traditional Laravel applications, managing `.env` files often involves manual editing or fragile string manipulation. This approach works well for simple cases, but becomes limiting when you need to automate deployments, manage multiple environments, or programmatically update configurations.

Laravel Env Modifier solves these challenges by providing a robust, safe API for `.env` file management. You can create environment files, update keys, merge configurations, create backups, and restore files—all programmatically with confidence.

Consider a deployment script that needs to update environment variables based on the deployment environment. With Laravel Env Modifier, you can create environment-specific files, merge configurations from templates, set defaults, create backups before risky operations, and restore if something goes wrong. The power of env file management lies not only in programmatic access but also in making it safe, predictable, and easy to use throughout your application.

