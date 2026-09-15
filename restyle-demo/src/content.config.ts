import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

export const collections = {
  pages: defineCollection({
    loader: glob({
      pattern: "**/*.md",
      base: "../docs",
      generateId: ({ entry }) => entry.replace(/\.md$/, ""),
    }),
  }),
  journal: defineCollection({
    loader: glob({ pattern: "*.md", base: "./src/content/journal" }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      cover: z.string(),
      coverAlt: z.string(),
      category: z.string().default("Journal"),
      date: z.coerce.date().optional(),
      relatedProject: z
        .object({ path: z.string(), label: z.string() })
        .optional(),
      draft: z.boolean().default(true),
      order: z.number().default(0),
    }),
  }),
};
