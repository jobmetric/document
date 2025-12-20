import React from 'react';

interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

const features: FeatureItem[] = [
  {
    title: 'Fast & Efficient',
    description: 'Our packages are designed with high performance and optimization in mind',
    icon: '⚡',
  },
  {
    title: 'Comprehensive Docs',
    description: 'Complete documentation and practical examples for each package',
    icon: '📚',
  },
  {
    title: 'Active Support',
    description: 'Our team is always ready to answer your questions',
    icon: '💬',
  },
];

export default function FeatureSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why JobMetric?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We provide the best tools and packages for Laravel developers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
            >
              <div className="text-4xl mb-4 text-center">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

