# All7s - Music Artist Website

A modern, full-featured music artist website built with Next.js 15, Sanity CMS, and deployed on Netlify. Features music showcases, video galleries, blog, and e-commerce functionality.

[![Watch the demo](https://img.youtube.com/vi/CxX_1vZBQQI/maxresdefault.jpg)](https://youtu.be/CxX_1vZBQQI)

> Demo video of the application highlighting functionality, design, and user flow.

## Overview

All7s is a professional music artist platform designed to showcase music, videos, and merchandise while providing a content-rich blog experience. The website features a modular content block system, real-time preview capabilities, and seamless integration with music streaming platforms.

## Key Features

### 🎵 Music & Media
- **Album Showcase**: Interactive flip-card album displays
- **Dual Album Support**: Custom-hosted albums and embedded Spotify/SoundCloud content
- **Video Galleries**: Hero videos, background videos, and YouTube integration
- **Music Metadata API**: Automatic fetching of Spotify and SoundCloud metadata

### 📝 Content Management
- **Sanity CMS**: Headless CMS with real-time preview
- **Content Blocks System**: Flexible, modular page layouts
- **Multi-Environment Support**: Separate staging and production datasets
- **SEO Optimization**: Dynamic metadata and Open Graph support

### 🛍️ E-Commerce
- **Product Catalog**: Dynamic product pages with category filtering
- **Shopping Cart**: Persistent cart with localStorage
- **Stripe Integration**: Secure payment processing with 62+ country support
- **Checkout Flow**: Streamlined purchase experience

### 📰 Blog
- **Rich Content**: Full-featured blog with categories and authors
- **Related Posts**: Automatic related content suggestions
- **SEO-Friendly**: Optimized URLs and metadata

### 🚀 Performance & Developer Experience
- **Next.js 15**: App Router with server components
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Netlify Deployment**: Edge functions and serverless capabilities

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **CMS**: Sanity v3
- **Deployment**: Netlify (Edge Functions + Serverless)
- **Payment**: Stripe
- **Media**: YouTube API, Spotify API, SoundCloud API

## Quick Start

### Prerequisites

- Node.js 20.11.1 or higher
- npm or yarn
- Sanity CLI (`npm install -g @sanity/cli`)
- Netlify CLI (`npm install -g netlify-cli`) for local development

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/all7s.git
cd all7s
```

2. Install dependencies:
```bash
npm install
```

3. Install Sanity Studio dependencies:
```bash
cd fresh_sanity_studio
npm install
cd ..
```

4. Copy the environment variables template:
```bash
cp .env.example .env.local
```

5. Configure your environment variables (see Environment Variables section)

6. Run the development server:
```bash
npm run dev
```

7. In another terminal, run Sanity Studio:
```bash
npm run fresh-studio:dev
```

8. Open [http://localhost:3000](http://localhost:3000) for the website
9. Open [http://localhost:3333](http://localhost:3333) for Sanity Studio

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_read_token
SANITY_STUDIO_API_TOKEN=your_studio_token
SANITY_WEBHOOK_SECRET=your_webhook_secret

# Environment Settings
NEXT_PUBLIC_ENVIRONMENT=development
NODE_ENV=development

# Site URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_VERCEL_URL=http://localhost:3000

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Spotify API (for music metadata)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Optional: Preview Secret
SANITY_PREVIEW_SECRET=your_preview_secret
```

## Project Structure

```
all7s/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── blog/              # Blog pages
│   ├── shop/              # E-commerce pages
│   ├── components/        # Page-specific components
│   └── providers.tsx      # Global providers
├── components/            # Shared components
│   ├── Blog/             # Blog components
│   ├── blocks/           # Content block components
│   ├── common/           # Common UI components
│   ├── home/             # Homepage components
│   └── shop/             # Shop components
├── context/              # React Context providers
├── fresh_sanity_studio/  # Sanity Studio configuration
│   ├── schemas/          # Content schemas
│   ├── plugins/          # Studio plugins
│   └── sanity.config.tsx # Studio configuration
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── netlify/              # Netlify functions
│   ├── edge-functions/   # Edge functions
│   └── functions/        # Serverless functions
├── public/               # Static assets
├── styles/               # Global styles
└── types/                # TypeScript types
```

## Available Scripts

### Development
- `npm run dev` - Start Next.js development server
- `npm run dev:staging` - Start with staging environment
- `npm run fresh-studio:dev` - Start Sanity Studio development server
- `npm run dev:all:staging` - Run both Next.js and Studio in staging mode

### Build & Production
- `npm run build` - Build for production
- `npm run build:staging` - Build for staging environment
- `npm run build:production` - Build with production environment
- `npm run start` - Start production server
- `npm run prod` - Build and start production

### Sanity Studio
- `npm run fresh-studio:build` - Build Sanity Studio
- `npm run fresh-studio:deploy` - Deploy Studio to Sanity
- `npm run deploy:staging` - Deploy Studio to staging
- `npm run deploy:production` - Deploy Studio to production

### Utilities
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts

## Features Documentation

### Content Blocks System

The website uses a modular content block system that allows flexible page layouts:

- **Hero Banner**: Full-width hero sections with video backgrounds
- **About Section**: Rich text content with images
- **Music Block**: Album showcases with flip-card interactions
- **Video Block**: Embedded video content
- **Background Video Block**: Immersive video backgrounds
- **Newsletter Block**: Email signup with social links

### Music Integration

#### Spotify & SoundCloud
- Automatic metadata fetching via Netlify Functions
- Support for albums and individual tracks
- Cached responses for performance

#### Custom Albums
- Upload custom album artwork
- Define track listings
- Manage release information

### E-Commerce Features

#### Product Management
- Rich product descriptions
- Multiple product images
- Category organization
- SEO-optimized product pages

#### Shopping Cart
- Add/remove items
- Quantity management
- Persistent storage
- Real-time price calculations

#### Stripe Checkout
- Secure payment processing
- Support for 62 countries
- Billing and shipping address collection
- Success/cancel flow handling

### Blog System

- Author profiles
- Category taxonomy
- Featured posts
- Related content
- Rich text editing with Portable Text
- SEO metadata per post

### Preview Mode

Real-time content preview for editors:
1. Access via `/api/preview?secret=YOUR_SECRET`
2. Live updates as content changes
3. Exit preview mode to see published content

## API Endpoints

### Public APIs
- `GET /api/blog` - Fetch blog posts
- `GET /api/navigation` - Get navigation structure
- `GET /api/preview/current` - Get preview status

### Protected APIs
- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/revalidate` - Trigger ISR revalidation
- `GET /api/preview` - Enter preview mode
- `POST /api/navbar/update-title` - Update navbar title

### Netlify Functions
- `/api/music-metadata` - Fetch Spotify/SoundCloud metadata
- `/api/form-submission` - Handle newsletter signups

## Sanity Studio Configuration

### Content Schemas

The project uses Sanity Studio v3 with a comprehensive schema structure:

#### Document Types

##### Single Instance Documents (Singletons)
- **Home** (`home`): Homepage content management
  - Hero banner configuration
  - Content blocks array
  - SEO settings
- **Settings** (`settings`): Global site settings
  - Site title and description
  - Default SEO configuration
  - Social media links
- **Blog Page** (`blogPage`): Blog landing page
  - Hero content
  - Featured post selection
  - Curated post feed
- **Shop Page** (`shopPage`): Shop landing page
  - Hero banner
  - Featured products

##### Collection Documents
- **Posts** (`post`): Blog posts
  - Title, slug, author
  - Auto-generated excerpt from body
  - Categories
  - Main image with hotspot
  - Rich text body
  - SEO metadata
- **Products** (`products`): E-commerce products
  - Name, slug, description
  - Price
  - Product images gallery
  - Category reference
  - SEO settings
- **Authors** (`author`): Blog authors
  - Name, image, bio
- **Categories** (`category`): Blog/product categories
  - Title, description, color
- **Collections** (`collection`): Product collections
- **Comments** (`comment`): Blog comments
- **Navbar** (`navbar`): Navigation configuration

#### Object Types (Content Blocks)

##### Page Building Blocks
- **Hero Banner** (`heroBanner`)
  - Title, subtitle, description
  - CTA buttons with links
  - Background video options
- **About Section** (`about`)
  - Title and rich text content
  - Image with alt text
  - Layout options
- **Music Block** (`musicBlock`)
  - Section title
  - Albums array (custom or embedded)
- **Video Block** (`videoBlock`)
  - Title and description
  - YouTube video ID
  - Additional videos
- **Background Video Block** (`backgroundVideoBlock`)
  - Video URL
  - Overlay text
  - Opacity settings
- **Newsletter Block** (`newsletter`)
  - Title and description
  - Social media links

##### Supporting Objects
- **Album** (`album`)
  - Album type (custom/spotify/soundcloud)
  - Cover image, title, artist
  - Release info
  - Songs array
  - External URLs
- **Song** (`song`)
  - Track number, title, duration
  - Audio file upload
- **SEO** (`seo`)
  - Meta title and description
  - Open Graph image
- **Block Content** (`blockContent`)
  - Rich text editor configuration
  - Custom marks and annotations

### Studio Features

#### Plugins
- **Singleton Plugin**: Ensures single instance documents
- **Iframe Pane**: Preview functionality
- **Media Plugin**: Advanced media management
- **Hotspot Array**: Image hotspot editing
- **Vision Plugin**: GROQ query playground

#### Custom Functionality
- **Excerpt Sync**: Auto-generates post excerpts from body content
- **Document Actions**: Custom preview and publish actions
- **Rich Text Editor**: Configured with custom styles and marks
- **Desk Structure**: Organized content hierarchy

### Working with Schemas

#### Adding New Content Types

1. Create schema file in `fresh_sanity_studio/schemas/documents/` or `/objects/`
2. Define the schema structure:
```javascript
export default {
  name: 'schemaName',
  title: 'Display Name',
  type: 'document', // or 'object'
  fields: [
    {
      name: 'fieldName',
      title: 'Field Title',
      type: 'string', // or other type
      validation: Rule => Rule.required()
    }
  ]
}
```
3. Import and add to `schema.tsx`
4. Create TypeScript types in `/types/`
5. Implement frontend components and queries

#### Schema Best Practices
- Use validation rules for required fields
- Implement proper field descriptions
- Use references for relationships
- Configure preview for better UX
- Use field groups for organization

### Studio Development

#### Local Development
```bash
cd fresh_sanity_studio
npm run dev
```

#### Building for Production
```bash
npm run fresh-studio:build
```

#### Deploying Studio
```bash
# Deploy to production
npm run deploy:production

# Deploy to staging
npm run deploy:staging
```

## Netlify Configuration

### Edge Functions
- **Preview Mode**: Cookie-based preview authentication
- Path: `/api/preview`

### Serverless Functions
- **Checkout**: Stripe payment processing
- **Form Submission**: Newsletter handling
- **Music Metadata**: Third-party API integration

### Build Settings
- **Command**: `npm ci && npm run fresh-studio:build && next build`
- **Publish Directory**: `.next`
- **Node Version**: 20.11.1

### Environment Contexts
- **Production**: Main branch deployments
- **Staging**: Staging branch with separate dataset
- **Deploy Preview**: PR preview deployments
- **Branch Deploy**: Feature branch deployments

## Deployment

### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build:production`
   - Publish directory: `.next`
3. Set environment variables in Netlify dashboard
4. Deploy!

### Manual Deployment

```bash
# Build for production
npm run build:production

# Deploy Sanity Studio
npm run deploy:production

# Deploy to Netlify
netlify deploy --prod
```

### Environment-Specific Deployments

#### Staging
```bash
# Build for staging
npm run build:staging

# Deploy Studio to staging
npm run deploy:staging
```

#### Production
```bash
# Build for production
npm run build:production

# Deploy Studio to production
npm run deploy:production
```

## Development Guide

### Code Conventions
- Use TypeScript for all new files
- Follow existing component patterns
- Implement proper error boundaries
- Use Tailwind CSS for styling

### Adding New Content Types

1. Create schema in `fresh_sanity_studio/schemas/documents/`
2. Add to schema index
3. Create corresponding TypeScript types
4. Implement frontend components
5. Add necessary API routes

### Testing Locally with Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run with Netlify Dev
netlify dev
```

This will run your serverless functions locally.

### Performance Optimization

- Use Next.js Image component for all images
- Implement lazy loading for heavy components
- Utilize ISR for static content
- Enable caching headers for assets

## Troubleshooting

### Common Issues

#### Sanity Connection Issues
- Verify your project ID and dataset
- Check API token permissions
- Ensure CORS origins are configured

#### Stripe Integration
- Verify webhook endpoint in Stripe dashboard
- Check webhook secret configuration
- Ensure product prices are in cents

#### Build Failures
- Clear cache: `npm run clean`
- Check Node version: 20.11.1
- Verify all environment variables

#### Preview Mode Not Working
- Check preview secret configuration
- Verify cookie settings
- Ensure proper API route setup

## Security Considerations

- Never commit `.env` files
- Use read-only tokens for public API access
- Implement rate limiting for API routes
- Sanitize all user inputs
- Keep dependencies updated

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

1. Run `npm run dev` for local development
2. Make changes and test thoroughly
3. Run `npm run lint` and `npm run type-check`
4. Create PR with clear description

## License

This project is private and proprietary. All rights reserved.

## Support

For issues and questions:
- Check existing GitHub issues
- Review documentation thoroughly
- Contact the development team

---

Built with ❤️ for All7s