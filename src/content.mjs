// All the site's content lives here. To add a lesson, add an item to the
// `items` list of its category, then run `npm run build`.
//
// Item fields:
//   title  (required)  the lesson's title
//   type               "audio" | "video" | "pdf" | "article" | "link" (default "link")
//   url                where the play/read/download button goes
//   date               e.g. "1448/03/12" or "2026-09-26", shown as is
//   note               one short line under the title (the book, the shaykh…)
//   slug, source       a book whose lessons are listed on its own page at
//                      /<category>/<slug>/. `source` is its lessons page on
//                      al-abbaad.com; `npm run import` copies the lesson list
//                      into src/lessons/<slug>.json.

export const site = {
  name: 'البرنامج الهادي لتأصيل العلم',
  url: 'https://al-barnamaj-al-hadi.pages.dev',
};

export const categories = [
  { slug: 'aqeedah', name: 'العقيدة', icon: 'star', items: [] },
  { slug: 'adab-at-talib', name: 'آداب الطالب', icon: 'lamp', items: [] },
  {
    slug: 'hadith', name: 'الحديث', icon: 'scroll', items: [
      { title: 'شرح الأربعين وتتمة الخمسين للإمامين النووي وابن رجب', type: 'audio', slug: 'al-arbain', source: 'https://al-abbaad.com/lecture/hadith/arbain-annawawi?type=files', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
      { title: 'شرح عمدة الأحكام من كلام خير الأنام ﷺ للإمام عبد الغني المقدسي', type: 'audio', slug: 'umdat-al-ahkam', source: 'https://al-abbaad.com/lecture/hadith/umadtul-ahkam?type=dir', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
      { title: 'شرح بلوغ المرام من أدلة الأحكام للإمام ابن حجر العسقلاني', type: 'audio', slug: 'bulugh-al-maram', source: 'https://al-abbaad.com/lecture/hadith/bulugh-almaram?type=dir', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
    ],
  },
  { slug: 'ulum-al-hadith', name: 'علوم الحديث', icon: 'chain', items: [] },
  { slug: 'fiqh', name: 'الفقه', icon: 'scale', items: [] },
  { slug: 'usul-al-fiqh', name: 'أصول وقواعد الفقه', icon: 'columns', items: [] },
  { slug: 'tafsir', name: 'التفسير', icon: 'book', items: [] },
  { slug: 'usul-al-tafsir', name: 'أصول وقواعد التفسير', icon: 'key', items: [] },
  { slug: 'seerah', name: 'السيرة', icon: 'route', items: [] },
  { slug: 'arabiyyah', name: 'علوم العربية', icon: 'pen', items: [] },
];
