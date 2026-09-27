# CLAUDE.md

البرنامج الهادي لتأصيل العلم: an Arabic (RTL) Islamic study site whose lessons are grouped into ten categories (العقيدة، آداب الطالب، الحديث، علوم الحديث، الفقه، أصول وقواعد الفقه، التفسير، أصول وقواعد التفسير، السيرة، علوم العربية). Its look follows rabee.net: cream parchment with a geometric pattern, a brown/gold nav bar, panels with brown headers and round gold badges, Tajawal for text, Aref Ruqaa for the site name, Amiri for Qur'an and ḥadīth. The user adds content little by little.

Live at https://al-barnamaj-al-hadi.pages.dev (Cloudflare Pages project `al-barnamaj-al-hadi`, linked to the GitHub repo `samycc777/al-barnamaj-al-hadi`: every push to `main` rebuilds and deploys it).

## Layout

- `src/content.mjs`: all content. `site` (name, url) and `categories`, each with `items` (lessons: `title`, `type` audio/video/pdf/article/link, `url`, `date`, `note`). A single recorded lecture gets `audio` (its mp3) and `download` instead of `url`, and plays right on the category page with the same player bar as book pages; never just link out to the Shaykh's page when there is an mp3. To add a lesson, add an item there. A book with many recorded lessons gets `slug` and `source` (its lessons page on the Shaykh's site, al-abbaad.com) instead of `url`, and its own page at `/<category>/<slug>/`. A book from another site (miraath.net, for scholars with no official site) uses that site's page as `source`. The source is only for the importer; the site does not show it (the user asked for no source link). When the source site files a lesson under the wrong book, list its number in the book's `skip` so the importer leaves it out.
- `src/lessons/<slug>.json`: each book's chapters and lessons (title, date, audio address, download link, size), copied from the Shaykh's site (or miraath.net) by `npm run import`. The audio stays on his site; the book page plays it from there with one player bar at the bottom.
- `scripts/import-lessons.mjs`: the importer.
- `build.mjs`: builds static pages into `dist/` (home, one page per category at `/<slug>/`, one per book at `/<category>/<book>/`, `404.html`). No dependencies. Icons are inline SVG line icons in `ICONS`.
- `check.mjs`: checks every page was built, every internal link resolves, and every book has a lesson list.
- `assets/`: `style.css` (colour tokens at the top) and `favicon.svg`.

## Commands

- `npm run build`: build into `dist/`.
- `npm run check`: build and verify. This is the full check command; run it after every change and merge.
- `npm run dev`: build and serve on http://localhost:4321.
- `npm run import` (or `npm run import -- <slug>`): refresh books' lesson lists from al-abbaad.com. Run it after adding a book, or when the Shaykh's site adds lessons, then commit the JSON.

Cloudflare builds with `npm run build` and serves `dist/`. Deploying = pushing `main` to GitHub (a push needs the user's OK only if they haven't asked for the change to go live).

## Conventions

- Arabic, RTL, no framework. Keep pages static.
- Follow the user's religious content rules: no images of living beings or faces (icons are objects and shapes only), no music, and cite every āyah and ḥadīth (sūrah and number; ḥadīth with source and grading).
- Put on the site only text the user gave. No taglines, verses, quotes, intro lines or "coming soon" messages of our own; only the words needed to use the site (menu labels, page not found).
