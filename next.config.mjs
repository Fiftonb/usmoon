/** @type {import('next').NextConfig} */
import withLess from 'next-with-less';

const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
  },
};

export default withLess(nextConfig);