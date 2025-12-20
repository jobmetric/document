import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'JobMetric',
  tagline: 'Powerful Laravel packages and tools for developers',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://jobmetric.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'JobMetric', // Usually your GitHub org/user name.
  projectName: 'JobMetric', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/jobmetric/document/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  clientModules: [
    require.resolve('./src/clientModules/projectsDropdown.tsx'),
    require.resolve('./src/clientModules/customFooter.tsx'),
  ],
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'projects',
        path: 'projects',
        routeBasePath: 'projects',
        sidebarPath: './sidebars.ts',
        sidebarCollapsible: true,
        editUrl: 'https://github.com/jobmetric/document/blob/master/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'packages',
        path: 'packages',
        routeBasePath: 'packages',
        sidebarPath: './sidebars.ts',
        editUrl: 'https://github.com/jobmetric/document/blob/master/',
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'JobMetric',
      logo: {
        alt: 'JobMetric Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'html',
          position: 'left',
          value: '<div id="projects-dropdown-container"></div>',
        },
        {
          type: 'docSidebar',
          docsPluginId: 'packages',
          sidebarId: 'packagesSidebar',
          position: 'left',
          label: 'Packages',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/team', label: 'Team', position: 'right'},
        {
          href: 'https://github.com/jobmetric',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Projects',
              to: '/projects/intro',
            },
            {
              label: 'Packages',
              to: '/packages/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Github',
              href: 'https://github.com/jobmetric',
            },
            {
              label: 'X',
              href: 'https://x.com/jobmetric',
            },
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/jobmetric',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/jobmetric',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Job Metric.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
