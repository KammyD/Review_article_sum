import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.yoursite.com',
  server:{port:9100,},
  output: 'static',
  build: {
    format: 'directory',
  },
});
