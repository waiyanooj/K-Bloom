/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/products.html', destination: '/products', permanent: true },
    ];
  },
};

export default nextConfig;
