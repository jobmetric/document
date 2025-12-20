import React from 'react';

const contactInfo = [
  {
    icon: '📞',
    title: 'Phone',
    content: '+323-25-8964',
    link: 'tel:+323258964',
  },
  {
    icon: '✉️',
    title: 'Email',
    content: 'info@jobmetric.com',
    link: 'mailto:info@jobmetric.com',
  },
  {
    icon: '📍',
    title: 'Location',
    content: 'Mark Avenue, Dalls Road, New York',
    link: '#',
  },
];

export default function ContactInfoSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Let's Discuss About Your Project
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get in touch with us and take your project to the next level
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contactInfo.map((info, index) => (
            <a
              key={index}
              href={info.link}
              className="group block bg-white dark:bg-gray-900 rounded-xl p-8 text-center hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
            >
              <div className="text-5xl mb-4">{info.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {info.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                {info.content}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

