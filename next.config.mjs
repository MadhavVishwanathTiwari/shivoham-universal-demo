/** @type {import('next').NextConfig} */
const nextConfig = {
  // three ships untranspiled ESM in a few addon paths; drei re-exports them.
  transpilePackages: ["three"],

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
