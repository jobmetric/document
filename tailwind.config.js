/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,md,mdx}',
    './docusaurus.config.ts',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#078669',
          dark: '#06795e',
          darker: '#067259',
          darkest: '#055e49',
          light: '#089373',
          lighter: '#089a79',
          lightest: '#09ae88',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable Tailwind's base styles to avoid conflicts with Infima
  },
};

