import React from 'react';

const stats = [
  {
    number: '50+',
    label: 'Packages',
    description: 'Open source packages',
  },
  {
    number: '1000+',
    label: 'Developers',
    description: 'Active users',
  },
  {
    number: '99%',
    label: 'Uptime',
    description: 'Service reliability',
  },
  {
    number: '24/7',
    label: 'Support',
    description: 'Always available',
  },
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-primary dark:bg-primary-dark">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-xl font-semibold text-white/90 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-white/70">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

