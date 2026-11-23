/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle (.next/standalone) so the VPS needs no node_modules.
  output: "standalone",
  // Only SVG assets are used; avoids a platform-specific `sharp` dependency on the server.
  images: { unoptimized: true },
};

export default nextConfig;
