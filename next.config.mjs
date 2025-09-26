/** @type {import('next').NextConfig} */
import withLess from 'next-with-less';

const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
  },
  env: {
    // Make Vercel environment detection available on client side
    NEXT_PUBLIC_IS_VERCEL: process.env.VERCEL || process.env.VERCEL_ENV ? 'true' : 'false',
  },
};

export default withLess(nextConfig);