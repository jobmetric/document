# JobMetric Documentation

This repository contains the complete documentation system for all JobMetric packages. Built with [Docusaurus](https://docusaurus.io/), a modern static website generator created by Facebook, this documentation site provides comprehensive guides, API references, and tutorials for each JobMetric package.

## About JobMetric Packages

JobMetric is a collection of independent Laravel packages designed to provide modular functionality for Laravel applications. Each package is self-contained and can be used independently or in combination with other JobMetric packages.

### Available Packages

The documentation covers all JobMetric packages including but not limited to:

- **Core Packages**: Package Core, Setting, Event System, Env Modifier
- **Content Management**: Metadata, Translation, Taxonomy, Language, URL, Custom Field
- **E-commerce**: Product, Order, Shopping Cart, Payment Method, Shipping Method, Tax, Coupon, Affiliate
- **Business Features**: Accounting, Marketing, Membership, Reminder
- **Media & Content**: Media, Post, Story, Tag, Comment, Reaction, Star
- **UI & Layout**: Layout, Form, Panelio
- **Utilities**: Barcode, Unit Converter, SMS, State Machine, Flow, Extension
- **Specialized**: Tron, Chat, Ticket, Toon, Multi Calendar
- **And many more...**

Each package has its own dedicated documentation section with installation guides, configuration options, usage examples, and API references.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.0 or higher
- **npm** or **yarn**: Package manager for installing dependencies

## Installation

1. Clone this repository or navigate to the `document` directory:

```bash
cd document
```

2. Install dependencies using npm:

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

## Local Development

To start the local development server:

```bash
npm start
```

Or using yarn:

```bash
yarn start
```

This command:
- Starts a local development server (usually at `http://localhost:3000`)
- Opens a browser window automatically
- Reflects most changes live without requiring a server restart
- Provides hot-reloading for a smooth development experience

## Building for Production

To build the documentation site for production:

```bash
npm run build
```

Or using yarn:

```bash
yarn build
```

This command generates static content in the `build` directory, which can be served using any static content hosting service such as:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Any web server

## Preview Production Build

To preview the production build locally:

```bash
npm run serve
```

Or using yarn:

```bash
yarn serve
```

This serves the built static files from the `build` directory, allowing you to test the production build before deployment.

## Deployment

### GitHub Pages

If you're using GitHub Pages for hosting, you can deploy using:

**Using SSH:**

```bash
USE_SSH=true npm run deploy
```

**Not using SSH:**

```bash
GIT_USER=<Your GitHub username> npm run deploy
```

This command builds the website and pushes it to the `gh-pages` branch automatically.

### Other Hosting Services

For other hosting services:

1. Build the site: `npm run build` or `yarn build`
2. Deploy the contents of the `build` directory to your hosting service

## Project Structure

```
document/
├── docs/              # Documentation files (Markdown/MDX)
│   ├── intro.md      # Introduction page
│   └── ...           # Package-specific documentation folders
├── blog/             # Blog posts (optional)
├── src/              # Source files (React components, CSS)
├── static/           # Static assets (images, files)
├── docusaurus.config.ts  # Docusaurus configuration
├── sidebars.ts       # Sidebar configuration
└── package.json      # Project dependencies
```

## Adding Documentation for a New Package

To add documentation for a new JobMetric package:

1. Create a new folder in the `docs` directory with the package name
2. Add markdown files for different sections (installation, configuration, usage, API reference)
3. Update `sidebars.ts` to include the new package in the navigation
4. Follow the existing documentation structure and style

## Contributing

Contributions to improve the documentation are welcome! When contributing:

- Follow the existing documentation style and format
- Ensure all code examples are tested and working
- Update the table of contents in `sidebars.ts` if adding new sections
- Keep documentation clear, concise, and easy to follow

## Additional Commands

- `npm run clear` or `yarn clear`: Clear the Docusaurus cache
- `npm run swizzle` or `yarn swizzle`: Copy theme components for customization
- `npm run write-translations` or `yarn write-translations`: Extract translatable strings
- `npm run write-heading-ids` or `yarn write-heading-ids`: Add heading IDs to markdown files
- `npm run typecheck` or `yarn typecheck`: Run TypeScript type checking

## Resources

- [Docusaurus Documentation](https://docusaurus.io/docs)
- [Docusaurus Tutorial](https://docusaurus.io/docs/tutorial/intro)
- [Markdown Guide](https://www.markdownguide.org/)
- [MDX Documentation](https://mdxjs.com/)

## License

This documentation is part of the JobMetric project. Please refer to the main repository for license information.

---

**Note**: This is a public repository. The documentation is designed to help developers understand and use JobMetric packages effectively. If you encounter any issues or have suggestions for improvement, please open an issue or submit a pull request.
