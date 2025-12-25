---
sidebar_position: 2
sidebar_label: Installation
---

# Installation

## Requirements

Before installing Laravel Flow, make sure you have:

- PHP >= 8.1
- Laravel >= 10.0
- Composer

## Install via Composer

Run the following command to pull in the latest version:

```bash
composer require jobmetric/laravel-flow
```

## Publish Configuration

After installation, publish the configuration file:

```bash
php artisan vendor:publish --provider="JobMetric\Flow\FlowServiceProvider" --tag="flow-config"
```

## Publish Migrations

Publish the migration files to create the necessary database tables:

```bash
php artisan vendor:publish --provider="JobMetric\Flow\FlowServiceProvider" --tag="flow-migrations"
```

Then run the migrations:

```bash
php artisan migrate
```

## Next Steps

After installation, you can:

- Check out the [Showcase](/packages/laravel-flow/showcase) to see real-world examples
- Start creating your first workflow by reading the documentation

