# Portfolio site

Astro renders the portfolio from Markdown, with light and dark themes.

## Run locally

Use Node 24.

```sh
cd restyle-demo
npm ci
npm run dev
```

Open `http://localhost:4321/portfolio/`. Project pages are under `/portfolio/projects/`; journal entries are under `/portfolio/journal/`.

```sh
npm run check
npm run build
npm run preview
```

## Content

- `../docs/index.md` contains the homepage text and featured project list.
- Project articles and the about page live in `../docs`.
- Journal entries live in `src/content/journal`.
- `src/lib/site.ts` maps featured projects to photographs and records the last published update date.

A journal entry has this frontmatter:

```yaml
---
title: Entry title
description: A short introduction.
cover: photograph-name
coverAlt: A description of the photograph.
category: Journal
date: 2026-05-18
draft: true
---
```

Write the body underneath in Markdown. `cover` refers to prepared media without the size suffix or extension. Entries sort by date, newest first; `order` is an optional tiebreaker. An optional `relatedProject` object, with `path` and `label`, links an entry to its project article.

The homepage uses the newest available journal entry unless `featuredJournal` in `docs/index.md` names a particular entry slug. Set it to `none` to hide the journal feature. Both homepage journal links use that entry's title and cover. A missing or unpublished selection falls back to the newest available entry.

Drafts appear in the development preview and are excluded from static builds. New journal Markdown files are ignored by Git until explicitly selected for publication. Setting `draft: false` makes an entry eligible for a build; it does not commit or publish it. Edits to already tracked entries remain tracked and must be reviewed before committing.

## Photographs and video

Original uploads and unfinished media belong outside `public` and outside commits. `.portfolio-private` is ignored. Every file in `public` is copied into the static build, including unreferenced files.

From this directory, run:

```sh
node scripts/prepare-photo.mjs /path/to/photo.jpg photograph-name
```

This creates two WebP sizes, strips capture metadata, and updates `src/lib/media.json`. Images referenced by existing project Markdown are prepared automatically when starting or building the site. Restart the development server after adding a new project image.

All portfolio photographs belong to Caspar Niekus. Font licences are retained in `public/licenses`.

## Public build

```sh
SITE_BASE=/my-projects node scripts/build-public.mjs
```

The output is `dist`. The GitHub Pages workflow builds and deploys it when approved changes reach `main`. Local saves and builds do not update the public site.

Browser tests, content checks, test reports, editor code and hosting instructions are maintained separately in the private tooling repository.
