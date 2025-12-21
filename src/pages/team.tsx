import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import CustomFooter from '@site/src/components/CustomFooter';

interface TeamMember {
  name: string;
  role: string;
  email: string;
  social: {
    github?: string;
    instagram?: string;
    telegram?: string;
    linkedin?: string;
  };
  isLead?: boolean;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Majid Mohammadian',
    role: 'Team Lead',
    email: 'majeedmohammadian@gmail.com',
    social: {
      github: 'https://github.com/MajidMohammadian',
      instagram: 'https://instagram.com/majeedmohammadian',
      telegram: 'https://t.me/majeedmohammadian',
    },
    isLead: true,
  },
  {
    name: 'Matin Bagheri',
    role: 'Developer',
    email: '',
    social: {},
  },
];

export default function Team(): ReactNode {
  return (
    <Layout
      title="Team"
      description="Team members and contacts.">
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Our Team
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Meet the talented individuals behind JobMetric
          </p>
        </div>

        {/* Team Lead Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <span className="w-1 h-8 bg-primary rounded-full"></span>
            Team Lead
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers
              .filter(member => member.isLead)
              .map((member, index) => (
                <TeamMemberCard key={index} member={member} />
              ))}
          </div>
        </div>

        {/* Developers Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <span className="w-1 h-8 bg-primary rounded-full"></span>
            Developers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers
              .filter(member => !member.isLead)
              .map((member, index) => (
                <TeamMemberCard key={index} member={member} />
              ))}
          </div>
        </div>
      </main>
      <CustomFooter />
    </Layout>
  );
}

function TeamMemberCard({member}: {member: TeamMember}) {
  const initials = member.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-primary-dark/10 dark:from-primary-dark/20 dark:to-primary-darker/20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Avatar */}
      <div className="relative mb-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary via-primary-dark to-primary-darker dark:from-primary-light dark:via-primary dark:to-primary-dark flex items-center justify-center text-white text-3xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
          {initials}
        </div>
        {member.isLead && (
          <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Lead
          </div>
        )}
      </div>

      {/* Name and Role */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
          {member.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {member.role}
        </p>
      </div>

      {/* Email */}
      {member.email && (
        <div className="mb-6 text-center">
          <a
            href={`mailto:${member.email}`}
            className="text-sm text-primary dark:text-primary-light hover:underline inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {member.email}
          </a>
        </div>
      )}

      {/* Social Links */}
      {(member.social.github || member.social.instagram || member.social.telegram || member.social.linkedin) && (
        <div className="flex justify-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {member.social.github && (
            <a
              href={member.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition-all duration-200 hover:scale-110"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          )}
          {member.social.instagram && (
            <a
              href={member.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-200 hover:scale-110"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.22-7.221 6.73-.057 1.281-.073 1.689-.073 5.239 0 3.54.016 3.958.073 5.239.442 4.494 2.863 6.518 7.221 6.73 1.28.058 1.689.072 4.947.072 3.259 0 3.668-.014 4.948-.072 4.354-.212 6.782-2.22 7.221-6.73.057-1.28.073-1.699.073-5.239 0-3.54-.016-3.958-.073-5.239-.44-4.494-2.867-6.52-7.221-6.73-1.281-.058-1.69-.072-4.949-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162 0 3.403 2.759 6.162 6.162 6.162 3.403 0 6.162-2.759 6.162-6.162 0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4 2.209 0 4 1.791 4 4 0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          )}
          {member.social.telegram && (
            <a
              href={member.social.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white transition-all duration-200 hover:scale-110"
              aria-label="Telegram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
          )}
          {member.social.linkedin && (
            <a
              href={member.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition-all duration-200 hover:scale-110"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

