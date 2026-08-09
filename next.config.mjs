/** @type {import('next').NextConfig} */
const nextConfig = {
  // three ships untranspiled ESM in a few addon paths; drei re-exports them.
  transpilePackages: ["three"],

  experimental: {
    /*
     * drei and framer-motion are both barrel files re-exporting a few hundred
     * modules each. Without this every import of `Environment` or `motion`
     * pulls the whole barrel into the graph, which on the homepage means the
     * hero's client bundle carries drei helpers nothing renders.
     */
    optimizePackageImports: ["@react-three/drei", "framer-motion"],
  },

  async redirects() {
    return [
      {
        /*
         * Relationship Fitness stopped being a pillar of its own when the
         * catalogue was rebuilt from her package sheet — relationship work is a
         * tarot sub-service now, and the fourth pillar is Healing & Meditation.
         * The old URL was live and linked, so it redirects rather than 404s.
         */
        source: "/services/relationship-fitness",
        destination: "/services/healing-meditation",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
