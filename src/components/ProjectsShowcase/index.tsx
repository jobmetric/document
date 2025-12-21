import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

interface Project {
  name: string;
  description: string;
  link: string;
  badge: string;
  image: string;
}

const projects: Project[] = [
  {
    name: 'Findr',
    description: 'A powerful search and discovery platform for finding the best solutions',
    link: '/projects/findr',
    badge: 'Popular',
    image: 'img/docusaurus-social-card.jpg',
  },
  {
    name: 'Hero',
    description: 'Build amazing hero sections and landing pages with ease',
    link: '/projects/hero',
    badge: 'New',
    image: 'img/docusaurus-social-card.jpg',
  },
  {
    name: 'Huma',
    description: 'Comprehensive human resource management system',
    link: '/projects/huma',
    badge: 'Featured',
    image: 'img/docusaurus-social-card.jpg',
  },
  {
    name: 'Selora',
    description: 'Elegant e-commerce platform for modern businesses',
    link: '/projects/selora',
    badge: 'Popular',
    image: 'img/docusaurus-social-card.jpg',
  },
  {
    name: 'Vibe',
    description: 'Create engaging and interactive user experiences',
    link: '/projects/vibe',
    badge: 'New',
    image: 'img/docusaurus-social-card.jpg',
  },
  {
    name: 'Pax',
    description: 'Streamlined payment and transaction management system',
    link: '/projects/pax',
    badge: 'Featured',
    image: 'img/docusaurus-social-card.jpg',
  },
];

export default function ProjectsShowcase() {
  const baseUrl = useBaseUrl('/');
  
  const projectsWithImages = projects.map(project => ({
    ...project,
    imageUrl: useBaseUrl(project.image),
  }));
  
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Projects
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our portfolio of innovative projects and solutions built with cutting-edge technology
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectsWithImages.map((project, index) => (
            <Link
              key={index}
              to={project.link}
              className="group block bg-white dark:bg-gray-900 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
            >
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary-dark/20 dark:from-primary-dark/30 dark:to-primary-darker/30 overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/90 text-white backdrop-blur-sm">
                    {project.badge}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                  {project.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="text-primary dark:text-primary-light font-semibold flex items-center gap-2">
                  Learn more
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link
            to="/projects/intro"
            className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors duration-200"
          >
            View All Projects
          </Link>
        </div>
      </div>
    </section>
  );
}

