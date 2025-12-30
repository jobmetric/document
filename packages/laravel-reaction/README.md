---
sidebar_position: 0
sidebar_label: Laravel Reaction
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/laravel-reaction.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/laravel-reaction/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/laravel-reaction.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/laravel-reaction/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/laravel-reaction.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/laravel-reaction/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/laravel-reaction.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/laravel-reaction/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# Reaction Management for Laravel

This package is for creating reaction management in different Laravel projects.

Laravel Reaction is a modern, flexible package that allows your Eloquent models to handle reaction functionality (like, dislike, love, etc.). It provides a clean API for both **reactable** models (e.g., articles, posts) and **reactor** models (e.g., users, devices), making it easy to implement social interaction features in your Laravel applications.

> **Package:** `jobmetric/laravel-reaction`  
> **PHP:** 8.0.1+ (8.1+ recommended) · **Laravel:** 9.19+ (9/10/11 supported)  
> **Provider:** `JobMetric\Reaction\ReactionServiceProvider`  
> **Dependencies:** `jobmetric/laravel-event-system` ^2.7

## Highlights

**Simple API:** Clean, intuitive API for managing reactions. Add, remove, toggle, and query reactions with simple method calls—no complex queries or manual relationship management.

**Flexible Reaction Types:** Support any reaction type you need: like, dislike, love, heart, thumbs up, and more. The package doesn't limit you to predefined reaction types—use whatever makes sense for your application.

**Anonymous Reactions:** Support both authenticated user reactions and anonymous device-based reactions. Perfect for applications where users can react without logging in, or where you need to track reactions by device.

**Polymorphic Relationships:** Use reactions on any Eloquent model through polymorphic relationships. Articles, posts, comments, products—anything can be reactable, and any model can be a reactor.

**Event System:** Built-in events for reaction lifecycle: `ReactionAddEvent`, `ReactionRemovingEvent`, and `ReactionRemovedEvent`. Integrate with notification systems, analytics, or any custom logic.

**Rich Querying:** Query reactions by type, reactor, reactable, device, and more. Get reaction summaries, counts, and lists with simple method calls.

## What is Reaction Management?

Undergoing continuous enhancements, this package evolves each day, integrating an array of diverse features. It stands as an indispensable asset for enthusiasts of Laravel, offering a seamless way to manage social interactions and user engagement.

In traditional Laravel applications, implementing reaction systems often involves creating separate tables for each reaction type, writing complex queries to check reaction status, and managing reaction state manually. This approach becomes limiting when you need flexible reaction types, anonymous reactions, or reactions across multiple model types.

Laravel Reaction solves these challenges by providing a unified system that works with any Eloquent model through polymorphic relationships. You can add reactions to articles, posts, comments, products, or any model—all with the same simple API. The package handles both authenticated user reactions and anonymous device-based reactions, making it perfect for public-facing content where users don't need to log in.

Consider a social media platform where users can like, love, or react to posts, comments, and media. With Laravel Reaction, you can implement this functionality quickly and easily, with built-in support for reaction counting, summaries, and event-driven notifications. The power of reaction management lies not only in flexible reaction types but also in making it easy to query, analyze, and extend reaction functionality throughout your application.

