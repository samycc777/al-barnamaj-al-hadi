# Fable 5.1 review: status

1. Scroll margin under the nav and player: done (`.lesson` scroll-margin 70px top, 120px bottom; 170px on narrow phones).
2. Failed audio: done (failed message links the lesson's download; `last` saved only when it plays).
3. Descriptions, sitemap, locale: done (book title + note as description, `sitemap.xml`, `robots.txt`, `ar_SA`).
4. Cache headers: done (fonts immutable one year; other top-level assets one hour; not `search.json`, so a deploy shows within an hour).
5. Narrow-phone player bar: done in CSS (under 560px the audio gets its own line, buttons below); not tested on iOS Safari, check on the phone.
6. Lesson numbers: done (continuous across the book, equal to the `#l-<n>` ids; ids and links unchanged; file-name titles say «الدرس N» with the same number).
7. Accessibility: done (chapter titles are `h3`, `.player-title` has `role="status"`, lesson buttons 44px on phones).
8. Search by shaykh: done (the page subtitle is part of each lesson's searched text).
9. Inbox limits: done (POST refuses over 95 MB total with 413, same as the page; GET reads only the newest 300 messages, 25 at a time).
10. Loose ends: skipped (Ibn Majah titles and the questions to the brother are content). The old `tathir-al-itiqad-abbad` page cache purge is not done: no Cloudflare API token is stored locally (only the wrangler login), and pages.dev has no zone to purge from here; purge from the Cloudflare dashboard if it still shows.
