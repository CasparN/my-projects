import { defineConfig } from "astro/config";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { visit } from "unist-util-visit";
import path from "node:path";
import { unified } from "@astrojs/markdown-remark";
import fs from "node:fs";
import rehypeRaw from "rehype-raw";
import sirv from "sirv";

function readableMedia() {
  const photoSizes = JSON.parse(
    fs.readFileSync("./src/lib/media.json", "utf8"),
  );
  const docSizes = fs.existsSync("./src/lib/doc-media.json")
    ? JSON.parse(fs.readFileSync("./src/lib/doc-media.json", "utf8"))
    : {};
  return (tree) =>
    visit(tree, "element", (node) => {
      if (
        node.tagName === "h1" &&
        node.children.length === 1 &&
        node.children[0].type === "text"
      ) {
        const match = node.children[0].value.match(
          /^(.*?) (\- \d{2}-\d{4}.*)$/,
        );
        if (match)
          node.children = [
            { type: "text", value: match[1] + " " },
            {
              type: "element",
              tagName: "span",
              properties: { className: ["project-period"] },
              children: [{ type: "text", value: match[2] }],
            },
          ];
      }
      if (["pre", "table"].includes(node.tagName)) {
        node.properties.tabIndex = 0;
        if (node.tagName === "pre") {
          node.properties.role = "group";
          node.properties["aria-label"] = node.properties.className?.includes(
            "mermaid",
          )
            ? "Diagram"
            : "Codevoorbeeld";
        }
      }
      if (node.properties.className?.includes("katex-display")) {
        Object.assign(node.properties, {
          tabIndex: 0,
          role: "group",
          "aria-label": "Formule",
        });
      }
      if (node.tagName === "img" && typeof node.properties.src === "string") {
        const doc = node.properties.src.replace(
          /^\/portfolio\/doc-assets\//,
          "",
        );
        if (docSizes[doc]) {
          const { width, height, smallWidth } = docSizes[doc];
          const source = node.properties.src;
          Object.assign(node.properties, {
            width,
            height,
            loading: "lazy",
            decoding: "async",
            src: `${source}.1600.webp`,
            srcSet: `${source}.640.webp ${smallWidth}w, ${source}.1600.webp ${width}w`,
            sizes: "(max-width: 760px) 100vw, 760px",
          });
        }
        const match = node.properties.src.match(
          /^\/portfolio\/media\/(.+)-1600\.webp$/,
        );
        if (match) {
          const privateManifest = process.env.PORTFOLIO_EDITOR_MEDIA
            ? path.join(process.env.PORTFOLIO_EDITOR_MEDIA, "..", "media.json") : "";
          const privateSizes = privateManifest && fs.existsSync(privateManifest)
            ? JSON.parse(fs.readFileSync(privateManifest, "utf8")) : {};
          const size = photoSizes[match[1]] || privateSizes[match[1]];
          if (size) {
            Object.assign(node.properties, {
              width: size.width,
              height: size.height,
              loading: "lazy",
              decoding: "async",
              srcSet: `/portfolio/media/${match[1]}-640.webp ${size.smallWidth}w, ${node.properties.src} ${size.width}w`,
              sizes: "(max-width: 760px) 100vw, 760px",
            });
          }
        }
      }
    });
}

function existingMarkdown() {
  return (tree, file) => {
    const source = String(file.path).replaceAll("\\", "/");
    const relative = source.split("/docs/")[1];
    visit(tree, (node, index, parent) => {
      if (
        relative &&
        ["link", "image"].includes(node.type) &&
        node.url &&
        !/^(https?:|mailto:|#|\/)/.test(node.url)
      ) {
        if (node.type === "image") {
          node.url =
            "/portfolio/doc-assets/" +
            path.posix.normalize(
              path.posix.join(path.posix.dirname(relative), node.url),
            );
        } else if (node.url.includes(".md")) {
          const [filename, hash] = node.url.split("#");
          const target = path.posix
            .normalize(path.posix.join(path.posix.dirname(relative), filename))
            .replace(/\.md$/, "");
          const current = relative.replace(/\.md$/, "");
          node.url =
            (path.posix.relative(current, target) || ".") +
            "/" +
            (hash ? "#" + hash : "");
        }
      }
      if (node.type === "code" && node.lang === "mermaid") {
        const escaped = node.value
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;");
        parent.children[index] = {
          type: "html",
          value: `<pre class="mermaid">${escaped}</pre>`,
        };
      }
      if (
        node.type === "paragraph" &&
        node.children?.[0]?.type === "text" &&
        node.children[0].value.startsWith("!!! ")
      ) {
        const first = node.children[0].value;
        const title = first.match(/["“]([^"”]+)["”]/)?.[1] || "Note";
        const remainder = first.replace(/^!!![^\n]*(?:\n|$)/, "");
        const next = parent.children[index + 1];
        const body = [
          { type: "text", value: remainder },
          ...node.children.slice(1),
        ];
        const children = [
          {
            type: "paragraph",
            children: [
              { type: "strong", children: [{ type: "text", value: title }] },
            ],
          },
        ];
        if (remainder || node.children.length > 1)
          children.push({ type: "paragraph", children: body });
        if (next?.type === "code" && !next.lang) {
          children.push(...this.parse(next.value).children);
          parent.children.splice(index, 2, { type: "blockquote", children });
        } else {
          parent.children[index] = { type: "blockquote", children };
        }
      }
    });
  };
}

export default defineConfig({
  server: {
    allowedHosts: (process.env.PORTFOLIO_ALLOWED_HOST || "")
      .split(",")
      .map((host) => host.trim())
      .filter(Boolean),
  },
  vite: {
    plugins: [{
      name: "private-editor-media",
      configureServer(server) {
        if (process.env.PORTFOLIO_EDITOR_MEDIA) {
          server.middlewares.use("/portfolio/media", sirv(process.env.PORTFOLIO_EDITOR_MEDIA, { dev: true }));
          server.middlewares.use("/media", sirv(process.env.PORTFOLIO_EDITOR_MEDIA, { dev: true }));
        }
      },
    }],
  },
  base: "/portfolio",
  output: "static",
  trailingSlash: "always",
  markdown: {
    processor: unified({
      smartypants: false,
      remarkPlugins: [remarkMath, existingMarkdown],
      rehypePlugins: [rehypeRaw, rehypeKatex, readableMedia],
    }),
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" } },
  },
});
