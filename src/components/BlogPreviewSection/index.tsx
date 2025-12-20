import React from 'react';
import Link from '@docusaurus/Link';

interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  link: string;
}

const blogPosts: BlogPost[] = [
  {
    title: 'Business from the brink of ruin by optimizing our website',
    excerpt: 'Learn how we helped a business recover by optimizing their website performance and user experience.',
    date: '08 Nov 2024',
    category: 'Pricing',
    link: '/blog',
  },
  {
    title: 'The work is top-notch and I consistently outrank all my competitors',
    excerpt: 'Discover how our packages helped developers achieve better results and outperform their competition.',
    date: '08 Nov 2024',
    category: 'Pricing',
    link: '/blog',
  },
  {
    title: 'Grow my business through organic search and marketing strategies',
    excerpt: 'Explore effective strategies for growing your business using organic search and modern marketing techniques.',
    date: '08 Nov 2024',
    category: 'Pricing',
    link: '/blog',
  },
];

export default function BlogPreviewSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Latest Blog & News
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Stay updated with the latest insights, tutorials, and updates from our team
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <Link
              key={index}
              to={post.link}
              className="group block bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              <div className="h-48 bg-gradient-to-br from-primary/20 to-primary-dark/20 dark:from-primary-dark/30 dark:to-primary-darker/30 flex items-center justify-center">
                <div className="text-6xl opacity-50">📝</div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary dark:bg-primary-light/20 dark:text-primary-light">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {post.date}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                <div className="text-primary dark:text-primary-light font-semibold group-hover:underline">
                  Read more →
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link
            to="/blog"
            className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors duration-200"
          >
            View More
          </Link>
        </div>
      </div>
    </section>
  );
}

