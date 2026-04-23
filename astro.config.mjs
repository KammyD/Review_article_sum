import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://www.yoursite.com',
  server:{port:9100,},
  output: "hybrid",

  build: {
    format: 'directory',
  },

  adapter: cloudflare()
});