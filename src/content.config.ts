import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const service = defineCollection({
  loader: glob({ base: "./src/content/service", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** One line: used on cards, the page header and the meta description. */
      description: z.string(),
      /** Display order in grids and navigation. */
      order: z.number(),
      heroImage: image(),
      heroAlt: z.string(),
      /** Short "at a glance" points shown above the body copy. */
      highlights: z.array(z.string()).default([]),
    }),
});

export const collections = { service };
