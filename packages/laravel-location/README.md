---
sidebar_position: 0
sidebar_label: Laravel Location
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/laravel-location.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/laravel-location/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/laravel-location.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/laravel-location/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/laravel-location.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/laravel-location/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/laravel-location.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/laravel-location/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# Location Management for Laravel

Laravel Location helps you model and manage geographic data in a clean, consistent way—from **Countries** and **Provinces** to **Cities**, **Districts**, **Locations**, **Geo Areas**, and **Addresses**.

It is designed to be used as a reusable package in real-world Laravel applications where location data needs to be normalized and shared across multiple models.

> **Package:** `jobmetric/laravel-location`  
> **PHP:** 8.1+ · **Laravel:** 10.0+  
> **Provider:** `JobMetric\Location\LocationServiceProvider`

## Highlights

**Clean geography hierarchy:** Model a normalized structure of Country → Province → City → District.

**Unique Locations:** Store unique location combinations (country/province/city/district) once and reuse them across other entities.

**Reusable Geo Areas:** Group multiple locations under reusable Geo Areas (polymorphic attachment supported).

**Polymorphic Addresses:** Attach addresses to any Eloquent model via `HasAddress`, with optional collection categorization.

**Service-first API + Facades:** Keep controllers thin using dedicated services and facades like `Country`, `Province`, `City`, `District`, `Location`, `GeoArea`, and `Address`.

**Datasets + Import tooling:** Maintain a master countries dataset and optionally add country-specific subdivisions, then import them into the database via Artisan commands.

## What is “Location” in this package?

The package uses multiple layers:

- **Country / Province / City / District**: Master data for geography.
- **Location**: A unique combination of `country_id`, `province_id`, `city_id`, `district_id`.
- **Geo Area**: A reusable grouping of multiple locations.
- **Address**: A stored address that is linked to a location.

This separation keeps your data normalized, makes searching/filtering easier, and prevents duplication across your application.

## Next steps

- Read the [Getting Started](/packages/laravel-location/intro) guide.
- Install the package via [Installation](/packages/laravel-location/installation).
- Dive into traits and APIs under [Deep Diving](/packages/laravel-location/deep-diving/has-location).

