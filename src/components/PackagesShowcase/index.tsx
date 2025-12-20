import React from 'react';
import Link from '@docusaurus/Link';

interface Package {
  name: string;
  description: string;
  link: string;
  badge: string;
}

const packages: Package[] = [
  {
    name: 'JobMetric',
    description: 'A powerful job management system for Laravel applications',
    link: '/packages/jobmetric/intro',
    badge: 'Popular',
  },
  {
    name: 'State Machine',
    description: 'Elegant state machine implementation for Laravel models',
    link: '/packages/intro',
    badge: 'New',
  },
  {
    name: 'Metadata',
    description: 'Flexible metadata management for your Laravel models',
    link: '/packages/intro',
    badge: 'Featured',
  },
];

export default function PackagesShowcase() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Packages
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our collection of powerful Laravel packages designed to boost your productivity
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <Link
              key={index}
              to={pkg.link}
              className="group block bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                  {pkg.name}
                </h3>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary dark:bg-primary-light/20 dark:text-primary-light">
                  {pkg.badge}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {pkg.description}
              </p>
              <div className="text-primary dark:text-primary-light font-semibold group-hover:underline">
                Learn more →
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link
            to="/packages/intro"
            className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors duration-200"
          >
            View All Packages
          </Link>
        </div>
      </div>
    </section>
  );
}

