---
sidebar_position: 2
sidebar_label: Installation
---

import Link from "@docusaurus/Link";

# Installation

This guide will walk you through installing and configuring Laravel Location in your Laravel application.

## Requirements

- PHP >= 8.1
- Laravel >= 10.0
- Database (MySQL, PostgreSQL, SQLite, or SQL Server)

## Installation Steps

### Step 1: Install via Composer

```bash
composer require jobmetric/laravel-location
```

### Step 2: Publish Configuration (optional)

If you need to override the default table names, publish the configuration file:

```bash
php artisan vendor:publish --tag=location-config
```

This will create `config/location.php`.

### Step 3: Publish Migrations (optional) and migrate

Publish migrations:

```bash
php artisan vendor:publish --tag=location-migrations
```

Then run:

```bash
php artisan migrate
```

### Step 4: Import datasets (recommended)

Laravel Location ships with a dataset workflow to generate and import countries and subdivisions.

Generate/update `countries.json`:

```bash
php artisan location:generate-countries --pretty
```

Import data:

```bash
php artisan location:import
```

You can also import a single country:

```bash
php artisan location:import ir --force
```

## Configuration

After publishing the configuration, you can customize the package behavior in `config/location.php`:

```php
return [
    "tables" => [
        'country' => 'location_countries',
        'province' => 'location_provinces',
        'city' => 'location_cities',
        'district' => 'location_districts',
        'location' => 'locations',
        'location_relation' => 'location_relations',
        'geo_area' => 'location_geo_areas',
        'geo_area_relation' => 'location_geo_area_relations',
        'address' => 'location_addresses',
        'address_relation' => 'location_address_relations',
    ],
];
```

## Next Steps

Now that you have Laravel Location installed, you can:

- <Link to="/packages/laravel-location/deep-diving/has-location">Use HasLocation</Link> to attach locations to your models
- <Link to="/packages/laravel-location/deep-diving/has-address">Use HasAddress</Link> to attach addresses to your models
- <Link to="/packages/laravel-location/deep-diving/services/country">Explore services</Link> to manage countries/provinces/cities/districts
- <Link to="/packages/laravel-location/deep-diving/datasets">Learn the dataset workflow</Link> for importing countries and subdivisions

