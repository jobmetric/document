---
sidebar_position: 0
sidebar_label: Laravel Unit Converter
---

[contributors-shield]: https://img.shields.io/github/contributors/jobmetric/laravel-unit-converter.svg?style=for-the-badge
[contributors-url]: https://github.com/jobmetric/laravel-unit-converter/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jobmetric/laravel-unit-converter.svg?style=for-the-badge&label=Fork
[forks-url]: https://github.com/jobmetric/laravel-unit-converter/network/members
[stars-shield]: https://img.shields.io/github/stars/jobmetric/laravel-unit-converter.svg?style=for-the-badge
[stars-url]: https://github.com/jobmetric/laravel-unit-converter/stargazers
[license-shield]: https://img.shields.io/github/license/jobmetric/laravel-unit-converter.svg?style=for-the-badge
[license-url]: https://github.com/jobmetric/laravel-unit-converter/blob/master/LICENCE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/majidmohammadian

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# Unit Converter for Laravel

This package is for managing measurement units and conversions in different Laravel projects.

Laravel Unit Converter is a comprehensive package that provides a powerful and flexible unit conversion system for Laravel applications. It enables you to define, manage, and convert between different measurement units—from weight and length to currency and temperature—with seamless model integration through the `HasUnit` trait.

> **Package:** `jobmetric/laravel-unit-converter`  
> **PHP:** 8.1+ · **Laravel:** 10.0+  
> **Provider:** `JobMetric\UnitConverter\UnitConverterServiceProvider`

## Highlights

**30+ Unit Types:** Support for weight, length, volume, temperature, currency, area, pressure, speed, energy, power, data storage, and many more measurement types out of the box.

**Base Unit System:** Each unit type has a base unit with value = 1. All other units are defined relative to this base unit, ensuring accurate and consistent conversions.

**Model Integration:** Uses the `HasUnit` trait to seamlessly integrate units with any Eloquent model. Store unit values, retrieve them with automatic conversion, and query models by their unit attributes.

**Polymorphic Relations:** Uses Laravel's polymorphic relationships, allowing a single `unit_relations` table to store unit data for multiple model types.

**Translation Support:** Full multilingual support for unit names, codes, positions, and descriptions. Perfect for international applications.

**Artisan Commands:** Built-in commands for listing units, converting values from CLI, seeding default units, and exporting unit data.

## What is Unit Conversion?

Unit conversion is the process of transforming a measurement from one unit to another within the same type of measurement. Laravel Unit Converter simplifies this process by providing a base-unit-relative system where all conversions are calculated using a simple formula: `result = value * from_unit.value / to_unit.value`.

This package empowers your application to handle complex measurement requirements professionally, whether you're building an e-commerce platform with product dimensions, a scientific application with precise measurements, or a multi-currency financial system.

