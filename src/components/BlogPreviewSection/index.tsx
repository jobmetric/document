import React from 'react';
import Link from '@docusaurus/Link';

// Simple date formatter
const formatDate = (date: Date | string, options?: {day?: 'numeric'; month?: 'short' | 'long'; year?: 'numeric'}) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
};

// Static blog posts data - manually maintained
// You can update this list when you add new blog posts
const staticBlogPosts = [
  {
    title: 'Welcome',
    description: '[Docusaurus blogging features](https://docusaurus.io/docs/blog) are powered by the [blog plugin](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog).',
    date: '2021-08-26',
    permalink: '/blog/welcome',
    slug: 'welcome',
    tags: ['facebook', 'hello', 'docusaurus'],
  },
  {
    title: 'MDX Blog Post',
    description: 'Blog posts support [Docusaurus Markdown features](https://docusaurus.io/docs/markdown-features), such as [MDX](https://mdxjs.com/).',
    date: '2021-08-01',
    permalink: '/blog/mdx-blog-post',
    slug: 'mdx-blog-post',
    tags: ['docusaurus'],
  },
  {
    title: 'Long Blog Post',
    description: 'This is the summary of a very long blog post...',
    date: '2019-05-29',
    permalink: '/blog/long-blog-post',
    slug: 'long-blog-post',
    tags: ['hello', 'docusaurus'],
  },
  {
    title: 'First Blog Post',
    description: 'Lorem ipsum dolor sit amet...',
    date: '2019-05-28',
    permalink: '/blog/first-blog-post',
    slug: 'first-blog-post',
    tags: ['hola', 'docusaurus'],
  },
];

export default function BlogPreviewSection() {
  const latestPosts = staticBlogPosts.slice(0, 3);

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
        
        {latestPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No blog posts available yet. Check back soon!
            </p>
            <Link
              to="/blog"
              className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Visit Blog
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.map((post) => {
            const metadata = post;
            const firstTag = metadata.tags && metadata.tags.length > 0 ? metadata.tags[0] : null;
            const formattedDate = metadata.date 
              ? formatDate(new Date(metadata.date), {day: 'numeric', month: 'short', year: 'numeric'})
              : '';
            
            return (
              <Link
                key={metadata.permalink || metadata.slug}
                to={metadata.permalink || `/blog/${metadata.slug}`}
                className="group block bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary-dark/20 dark:from-primary-dark/30 dark:to-primary-darker/30 flex items-center justify-center">
                  {metadata.frontMatter?.image || metadata.image ? (
                    <img
                      src={metadata.frontMatter?.image || metadata.image}
                      alt={metadata.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl opacity-50">📝</div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {firstTag && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary dark:bg-primary-light/20 dark:text-primary-light">
                        {typeof firstTag === 'string' ? firstTag : firstTag.label || firstTag}
                      </span>
                    )}
                    {formattedDate && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formattedDate}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-2">
                    {metadata.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                    {metadata.description || 'Read more about this post...'}
                  </p>
                  <div className="text-primary dark:text-primary-light font-semibold">
                    Read more →
                  </div>
                </div>
              </Link>
            );
          })}
            </div>
            
            <div className="text-center mt-12">
              <Link
                to="/blog"
                className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors duration-200"
              >
                View More
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

