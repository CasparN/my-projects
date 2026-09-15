import { marked, type Tokens } from "marked";
import homeMarkdown from "../../../docs/index.md?raw";

export const base = import.meta.env.BASE_URL.replace(/\/$/, "");
// Update alongside changes to the published portfolio, not on each page visit.
export const lastUpdated = "2026-09-08";
const raw = homeMarkdown.replace(/^---[\s\S]*?---\s*/, "");
const tokens = marked.lexer(raw);
export const paragraphs = tokens
  .filter((t) => t.type === "paragraph" && !t.raw.startsWith("!"))
  .map((t) => t.raw);
const list = tokens.find((t) => t.type === "list") as Tokens.List | undefined;
const pictures = [
  "stratusdash-at-home",
  "counter",
  "aura",
  "drone",
  "research",
];
export const projects: {
  title: string;
  path: string;
  description: string;
  picture: string;
}[] =
  list?.type === "list"
    ? list.items.map((item: Tokens.ListItem, i: number) => {
        const match = item.text.match(
          /^\*\*\[([^\]]+)\]\(([^)]+)\)\*\* — ([\s\S]*)$/,
        )!;
        return {
          title: match[1],
          path: match[2].replace(/\.md$/, ""),
          description: match[3],
          picture: pictures[i],
        };
      })
    : [];
export function html(text: string) {
  return marked.parse(
    text.replace(/\]\(([^)]+)\.md\)/g, `](${base}/$1/)`),
  ) as string;
}
export function url(page = "") {
  return `${base}/${page}${page ? "/" : ""}`;
}
