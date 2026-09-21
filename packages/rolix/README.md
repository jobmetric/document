---
sidebar_position: 0
sidebar_label: Rolix
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/rolix.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/rolix/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/rolix.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/rolix/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/rolix.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/rolix/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/rolix.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/rolix/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# Rolix for Laravel

This package is for building advanced role, membership, and permission systems in different Laravel projects.

Rolix provides hierarchical roles, scoped memberships, file-based permission catalogs, Gate/middleware/Blade integration, rule evaluators, DomainEvent registration, and activity logging—designed for large-scale, multi-tenant, and modular applications.

> **Package:** `jobmetric/rolix`  
> **PHP:** 8.0.1+ (8.1+ recommended) · **Laravel:** 9.19+ (9/10/11 supported)  
> **Provider:** `JobMetric\Rolix\RolixServiceProvider`

## Highlights

**Hierarchical Roles:** Define role trees per type with parent/child paths, flat and nested tree APIs, and inheritance of permissions through ancestors when role rules pass.

**Scoped Memberships:** Link personable models to roles in system scope or a memberable context (tenant, department, …), with collections, owner flags, soft deletes, and allow/deny overrides.

**Permission Catalog:** Load permission keys from PHP files by context and optional model. Packages can register paths through `RegisterPathPermissionEvent` at boot.

**Authorization Surfaces:** Use `HasRole` / `HasMembers`, Laravel Gate `before`, `rolix.permission` middleware, `@rolixCan` Blade directive, and the `rolix_has_permission()` helper.

**Rule Evaluators & Cache:** Attach runtime drivers (time, weekday, IP, location, env, quota, …) to roles. Permission snapshots are memoized per request and optionally cached with versioned invalidation.

**Domain Events & Audit:** All domain events implement `DomainEvent` and register with `EventRegistry`. Role and membership mutations are written to `role_activity_logs`.

## What is Rolix?

Undergoing continuous enhancements, this package evolves each day as a complete access-control foundation for Laravel.

In traditional applications, teams scatter permission checks across policies, middleware, and ad-hoc queries. Multi-tenant and modular products need scoped memberships, hierarchical roles, plugin-contributed permission files, and auditability without reinventing the same patterns in every module.

Rolix solves these challenges by modeling **roles**, **memberships**, and **permissions** as first-class domain concepts, with registries for role types and rule evaluators, and integration hooks for Gate, Blade, DomainEvent, and Activity Log.

## Next

Start with [Getting Started](/packages/rolix/intro), then move to [Installation](/packages/rolix/installation), and explore the [Showcase](/packages/rolix/showcase) and [Deep Diving](/packages/rolix/deep-diving/has-role) sections.
