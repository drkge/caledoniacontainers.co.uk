// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { readdir, rename, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { SITE_URL } from "./src/consts";

/**
 * The directory build format writes a redirect for "/parts.html" as
 * "parts.html/index.html", which GitHub Pages would serve only after an extra hop
 * to "/parts.html/". Flatten those back into plain files.
 * @type {import("astro").AstroIntegration}
 */
const flattenHtmlRedirects = {
  name: "flatten-html-redirects",
  hooks: {
    "astro:build:done": async ({ dir }) => {
      const root = fileURLToPath(dir);
      for (const entry of await readdir(root, { withFileTypes: true })) {
        if (!entry.isDirectory() || !entry.name.endsWith(".html")) continue;
        const folder = `${root}/${entry.name}`;
        await rename(`${folder}/index.html`, `${folder}.tmp`);
        await rm(folder, { recursive: true });
        await rename(`${folder}.tmp`, folder);
      }
    },
  },
};

/** Pages that deserve more weight than the default in the sitemap. */
const PRIORITIES = [
  [/^\/$/, 1.0, "monthly"],
  [/^\/services\/$/, 0.8, "monthly"],
  [/^\/services\/.+/, 0.7, "monthly"],
  [/^\/(about|contact)\/$/, 0.6, "yearly"],
];

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: SITE_URL,
  trailingSlash: "always",
  build: { format: "directory" },
  // Old .html pages from the previous site, still known to search engines. GitHub
  // Pages can't send real redirects, so these become small forwarding pages.
  // Temporary: review in November 2026 and remove once search engines have moved on.
  redirects: {
    "/new skips.html": "/services/newskips/",
    "/sheeting system.html": "/services/sheetingsystems/",
    "/refurbishment.html": "/services/refurbishment/",
    "/about us.html": "/about/",
    "/ror open.html": "/services/rollonrolloffskips/",
    "/parts.html": "/services/",
    "/shop.html": "/services/",
  },
  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        const { pathname } = new URL(item.url);
        const match = PRIORITIES.find(([pattern]) => pattern.test(pathname));
        item.priority = match ? match[1] : 0.5;
        item.changefreq = match ? match[2] : "yearly";
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
    icon(),
    flattenHtmlRedirects,
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
