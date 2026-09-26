// All the site's content lives here. To add a lesson, add an item to the
// `items` list of its category, then run `npm run build`.
//
// Item fields:
//   title  (required)  the lesson's title
//   type               "audio" | "video" | "pdf" | "article" | "link" (default "link")
//   url                where the play/read/download button goes
//   date               e.g. "1448/03/12" or "2026-09-26", shown as is
//   note               one short line under the title (the book, the shaykh…)

export const site = {
  name: 'البرنامج الهادي لتأصيل العلم',
  url: 'https://al-barnamaj-al-hadi.pages.dev',
};

export const categories = [
  { slug: 'aqeedah', name: 'العقيدة', icon: 'star', items: [] },
  { slug: 'adab-at-talib', name: 'آداب الطالب', icon: 'lamp', items: [] },
  {
    slug: 'hadith', name: 'الحديث', icon: 'scroll', items: [
      { title: 'شرح الأربعين النووية وتتمة الخمسين', note: 'الشيخ عبد المحسن العباد' },
      { title: 'شرح عمدة الأحكام', note: 'الشيخ عبد المحسن العباد' },
      { title: 'شرح بلوغ المرام', note: 'الشيخ عبد المحسن العباد' },
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
