import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    // Primary (German)
    title:       z.string(),
    description: z.string(),
    // English — optional; falls back to German if absent
    titleEn:       z.string().optional(),
    descriptionEn: z.string().optional(),
    bodyEn: z.string().optional(),
    // Arabic — optional; falls back to English then German
    titleAr:       z.string().optional(),
    descriptionAr: z.string().optional(),
    bodyAr: z.string().optional(),
    // Dates & status
    pubDate: z.coerce.date(),
    draft:   z.boolean().default(false),
    // Visuals
    heroImage: z.string().optional(),
    visuals:   z.array(z.string()).optional(),
    // Source attribution
    sourceTitle: z.string().optional(),
    sourceUrl:   z.string().optional(),
  }),
});

export const collections = { blog };
