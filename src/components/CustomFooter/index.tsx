import React from 'react';
import Link from '@docusaurus/Link';

export default function CustomFooter() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black text-gray-300 overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
      
      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      
      <div className="container mx-auto px-4 py-16 max-w-7xl relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-primary via-primary-light to-primary-lighter rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30">
                <span className="text-white font-bold text-xl">JM</span>
              </div>
              <h3 className="text-white font-bold text-2xl">JobMetric</h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed text-sm">
              Powerful Laravel packages and tools designed to boost your development productivity and streamline your workflow.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/jobmetric"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800/50 hover:bg-primary rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/40 backdrop-blur-sm"
                aria-label="GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://x.com/jobmetric"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800/50 hover:bg-primary rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/40 backdrop-blur-sm"
                aria-label="X (Twitter)"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/jobmetric"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800/50 hover:bg-primary rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/40 backdrop-blur-sm"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-primary-light rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Home</span>
                </Link>
              </li>
              <li>
                <Link to="/projects/intro" className="text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Projects</span>
                </Link>
              </li>
              <li>
                <Link to="/packages/intro" className="text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Packages</span>
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Blog</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Resources */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
              Resources
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-primary-light rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/packages/intro" className="text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Documentation</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/jobmetric"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">GitHub</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <Link to="/team" className="text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Team</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: About Company */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
              About JobMetric
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-primary-light rounded-full"></span>
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              JobMetric is a leading provider of high-quality Laravel packages and development tools. We are committed to empowering developers with robust, well-documented, and production-ready solutions that accelerate development workflows and enhance application performance.
            </p>
          </div>
        </div>
        
        {/* Mission Statement - Full Width */}
        <div className="border-t border-gray-800/50 pt-8 pb-6">
          <p className="text-gray-400 text-sm leading-relaxed">
            Our mission is to simplify complex development tasks and provide the Laravel community with tools that make building exceptional applications faster and more efficient.
          </p>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} <span className="text-primary font-semibold">JobMetric</span>. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors duration-200">
                Privacy Policy
              </a>
              <span className="text-gray-700">•</span>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors duration-200">
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
