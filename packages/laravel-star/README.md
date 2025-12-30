---
sidebar_position: 0
sidebar_label: Laravel Star
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/laravel-star.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/laravel-star/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/laravel-star.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/laravel-star/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/laravel-star.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/laravel-star/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/laravel-star.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/laravel-star/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# Star Rating Management for Laravel

This package is for creating star rating management in different Laravel projects.

Laravel Star is a modern, flexible package that allows your Eloquent models to handle star rating functionality (e.g., 1 to 5 stars). It provides a clean API for both **starable** models (e.g., articles, products) and **starrer** models (e.g., users, devices), making it easy to implement rating systems in your Laravel applications.

> **Package:** `jobmetric/laravel-star`  
> **PHP:** 8.0.1+ (8.1+ recommended) · **Laravel:** 9.19+ (9/10/11 supported)  
> **Provider:** `JobMetric\Star\StarServiceProvider`  
> **Dependencies:** `jobmetric/laravel-event-system` ^2.7

## Highlights

**Simple API:** Clean, intuitive API for managing star ratings. Add, update, remove, and query ratings with simple method calls—no complex queries or manual relationship management.

**Flexible Rating Scale:** Support any rating scale you need: 1-5 stars, 0-10, or any custom range. The package is fully configurable to match your application's requirements.

**Anonymous Ratings:** Support both authenticated user ratings and anonymous device-based ratings. Perfect for applications where users can rate without logging in, or where you need to track ratings by device.

**Polymorphic Relationships:** Use star ratings on any Eloquent model through polymorphic relationships. Products, articles, reviews, services—anything can be starable, and any model can be a starrer.

**Event System:** Built-in events for rating lifecycle: `StarAddEvent`, `StarUpdatingEvent`, `StarUpdatedEvent`, `StarRemovingEvent`, and `StarRemovedEvent`. Integrate with notification systems, analytics, or any custom logic.

**Rich Querying:** Query ratings by value, starrer, starable, device, and more. Get rating summaries, averages, counts, and lists with simple method calls.

## What is Star Rating Management?

Undergoing continuous enhancements, this package evolves each day, integrating an array of diverse features. It stands as an indispensable asset for enthusiasts of Laravel, offering a seamless way to manage user ratings and content quality assessment.

In traditional Laravel applications, implementing star rating systems often involves creating separate tables for each rating type, writing complex queries to calculate averages, and managing rating state manually. This approach becomes limiting when you need flexible rating scales, anonymous ratings, or ratings across multiple model types.

Laravel Star solves these challenges by providing a unified system that works with any Eloquent model through polymorphic relationships. You can add star ratings to products, articles, reviews, services, or any model—all with the same simple API. The package handles both authenticated user ratings and anonymous device-based ratings, making it perfect for public-facing content where users don't need to log in.

Consider an e-commerce platform where customers can rate products, or a content platform where users can rate articles. With Laravel Star, you can implement this functionality quickly and easily, with built-in support for rating averages, summaries, and event-driven notifications. The power of star rating management lies not only in flexible rating scales but also in making it easy to query, analyze, and extend rating functionality throughout your application.

