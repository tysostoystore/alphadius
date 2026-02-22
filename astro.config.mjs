import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: "server",
  adapter: vercel({
    imageService: true,
    webAnalytics: true,
    includeFiles: ['./audius_alpha.db']
  }),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
  server: { port: 4321 },
});
