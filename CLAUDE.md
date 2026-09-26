# CLAUDE.md

البرنامج الهادي لتأصيل العلم: an Arabic (RTL) Islamic study site whose lessons are grouped into nine categories (العقيدة، الحديث، علوم الحديث، الفقه، أصول وقواعد الفقه، التفسير، أصول وقواعد التفسير، السيرة، علوم العربية). Its look follows rabee.net: cream parchment with a geometric pattern, a brown/gold nav bar, panels with brown headers and round gold badges, Tajawal for text, Aref Ruqaa for the site name, Amiri for Qur'an and ḥadīth. The user adds content little by little.

Live at https://al-barnamaj-al-hadi.pages.dev (Cloudflare Pages project `al-barnamaj-al-hadi`, linked to the GitHub repo `samycc777/al-barnamaj-al-hadi`: every push to `main` rebuilds and deploys it).

## Layout

- `src/content.mjs`: all content. `site` (name, url) and `categories`, each with `items` (lessons: `title`, `type` audio/video/pdf/article/link, `url`, `date`, `note`). To add a lesson, add an item there.
- `build.mjs`: builds static pages into `dist/` (home, one page per category at `/<slug>/`, `404.html`). No dependencies. Icons are inline SVG line icons in `ICONS`.
- `check.mjs`: checks every page was built and every internal link resolves.
- `assets/`: `style.css` (colour tokens at the top) and `favicon.svg`.

## Commands

- `npm run build`: build into `dist/`.
- `npm run check`: build and verify. This is the full check command; run it after every change and merge.
- `npm run dev`: build and serve on http://localhost:4321.

Cloudflare builds with `npm run build` and serves `dist/`. Deploying = pushing `main` to GitHub (a push needs the user's OK only if they haven't asked for the change to go live).

## Conventions

- Arabic, RTL, no framework. Keep pages static.
- Follow the user's religious content rules: no images of living beings or faces (icons are objects and shapes only), no music, and cite every āyah and ḥadīth (sūrah and number; ḥadīth with source and grading).
- Put on the site only text the user gave. No taglines, verses, quotes, intro lines or "coming soon" messages of our own; only the words needed to use the site (menu labels, page not found).
