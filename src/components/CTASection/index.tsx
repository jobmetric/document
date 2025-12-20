import React from 'react';
import Link from '@docusaurus/Link';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary-dark dark:from-primary-dark dark:to-primary-darker">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of developers who are building amazing applications with our packages
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/packages/intro"
            className="px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
          >
            Browse Packages
          </Link>
          <Link
            to="/projects/intro"
            className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            View Projects
          </Link>
        </div>
      </div>
    </section>
  );
}

