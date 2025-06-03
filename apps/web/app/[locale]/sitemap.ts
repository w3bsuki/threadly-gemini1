import fs from 'node:fs';
import { env } from '@/env';
import { blog, legal } from '@repo/cms';
import type { MetadataRoute } from 'next';

const appFolders = fs.readdirSync('app', { withFileTypes: true });
const pages = appFolders
  .filter((file) => file.isDirectory())
  .filter((folder) => !folder.name.startsWith('_'))
  .filter((folder) => !folder.name.startsWith('('))
  .map((folder) => folder.name);

// Conditionally fetch CMS data with fallbacks
const getBlogSlugs = async (): Promise<string[]> => {
  try {
    const posts = await blog.getPosts();
    return posts.map((post) => post._slug);
  } catch (error) {
    console.warn('Failed to fetch blog posts for sitemap:', error);
    return [];
  }
};

const getLegalSlugs = async (): Promise<string[]> => {
  try {
    const posts = await legal.getPosts();
    return posts.map((post) => post._slug);
  } catch (error) {
    console.warn('Failed to fetch legal posts for sitemap:', error);
    return [];
  }
};

const blogs = await getBlogSlugs();
const legals = await getLegalSlugs();

const protocol = env.VERCEL_PROJECT_PRODUCTION_URL?.startsWith('https')
  ? 'https'
  : 'http';
const url = new URL(`${protocol}://${env.VERCEL_PROJECT_PRODUCTION_URL}`);

const sitemap = async (): Promise<MetadataRoute.Sitemap> => [
  {
    url: new URL('/', url).href,
    lastModified: new Date(),
  },
  ...pages.map((page) => ({
    url: new URL(page, url).href,
    lastModified: new Date(),
  })),
  ...blogs.map((blog) => ({
    url: new URL(`blog/${blog}`, url).href,
    lastModified: new Date(),
  })),
  ...legals.map((legal) => ({
    url: new URL(`legal/${legal}`, url).href,
    lastModified: new Date(),
  })),
];

export default sitemap;
