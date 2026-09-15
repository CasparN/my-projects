import { getCollection } from "astro:content";

// Drafts are available only in the private development preview, never a build.
export async function getJournalPosts() {
  return (
    await getCollection(
      "journal",
      ({ data }) => import.meta.env.DEV || !data.draft,
    )
  ).sort(
    (a, b) =>
      (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0) ||
      b.data.order - a.data.order ||
      a.id.localeCompare(b.id),
  );
}
