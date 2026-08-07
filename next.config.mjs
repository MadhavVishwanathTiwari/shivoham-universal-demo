/** @type {import('next').NextConfig} */
const nextConfig = {
  // three ships untranspiled ESM in a few addon paths; drei re-exports them.
  transpilePackages: ["three"],
};

export default nextConfig;
