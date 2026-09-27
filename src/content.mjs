// All the site's content lives here. To add a lesson, add an item to the
// `items` list of its category, then run `npm run build`.
//
// Item fields:
//   title  (required)  the lesson's title
//   type               "audio" | "video" | "pdf" | "article" | "link" (default "link")
//   url                where the play/read/download button goes
//   audio, download    a single recorded lecture: its mp3 address (played on
//                      the page) and its download link
//   date               e.g. "1448/03/12" or "2026-09-26", shown as is
//   note               one short line under the title (the book, the shaykh…)
//   slug, source       a book whose lessons are listed on its own page at
//                      /<category>/<slug>/. `source` is its lessons page on
//                      al-abbaad.com (or miraath.net); `npm run import` copies
//                      the lesson list into src/lessons/<slug>.json. The
//                      source is not shown on the site. A book with no
//                      `source` has its audio in our own storage (see
//                      CLAUDE.md) and a lesson list written by hand.
//   skip               lesson numbers on the source page that belong to
//                      another book; `npm run import` leaves them out

export const site = {
  name: 'البرنامج الهادي لتأصيل العلم',
  url: 'https://al-barnamaj-al-hadi.pages.dev',
};

export const categories = [
  { slug: 'aqeedah', name: 'العقيدة', icon: 'star', items: [] },
  {
    slug: 'adab-at-talib', name: 'آداب الطالب', icon: 'lamp', items: [
      { title: 'شرح حلية طالب العلم للشيخ بكر بن عبد الله أبي زيد', type: 'audio', slug: 'hilyat-talib-al-ilm', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين' },
    ],
  },
  {
    slug: 'hadith', name: 'الحديث', icon: 'scroll', items: [
      { title: 'شرح الأربعين في مباني الإسلام وقواعد الأحكام للإمام النووي', type: 'audio', slug: 'al-arbain', source: 'https://al-abbaad.com/lecture/hadith/arbain-annawawi?type=files', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
      { title: 'شرح الأربعين وتتمة الخمسين للإمامين النووي وابن رجب', type: 'audio', slug: 'fath-al-qawi', source: 'https://al-abbaad.com/lecture/hadith/fathul-qowiy?type=files', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
      { title: 'شرح عمدة الأحكام من كلام خير الأنام ﷺ للإمام عبد الغني المقدسي', type: 'audio', slug: 'umdat-al-ahkam', source: 'https://al-abbaad.com/lecture/hadith/umadtul-ahkam?type=dir', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
      { title: 'شرح بلوغ المرام من أدلة الأحكام للإمام ابن حجر العسقلاني', type: 'audio', slug: 'bulugh-al-maram', source: 'https://al-abbaad.com/lecture/hadith/bulugh-almaram?type=dir', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
      { title: 'كيفية الاستفادة من كتب الحديث', type: 'audio', audio: 'https://al-abbaad.com/jdownloads/muhadharah/kaifiyah-alistifadah-min-kutub-alhadith.mp3', download: 'https://al-abbaad.com/download/?type=audio&ids=243742', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
      { title: 'شرح الموطأ للإمام مالك بن أنس', type: 'audio', slug: 'al-muwatta', source: 'https://al-abbaad.com/lecture/hadith/sharh-almuwatto?type=files', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
      { title: 'شرح الجامع المسند الصحيح المختصر من أمور رسول الله ﷺ وسننه وأيامه للإمام محمد بن إسماعيل البخاري', type: 'audio', slug: 'sahih-al-bukhari', source: 'https://al-abbaad.com/lecture/hadith/shahih-albukhari-old?type=dir', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
      { title: 'شرح المسند الصحيح المختصر من السنن بنقل العدل عن العدل إلى رسول الله ﷺ للإمام مسلم بن الحجاج النيسابوري', type: 'audio', slug: 'sahih-muslim', source: 'https://al-abbaad.com/lecture/hadith/syarh-shahih-muslim?type=dir', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
      { title: 'شرح السنن للإمام أبي داود سليمان بن الأشعث السجستاني', type: 'audio', slug: 'sunan-abi-dawud', source: 'https://al-abbaad.com/lecture/hadith/syarh-sunan-abi-dawud?type=files', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
      { title: 'شرح الجامع المختصر من السنن عن رسول الله ﷺ ومعرفة الصحيح والمعلول وما عليه العمل للإمام محمد بن عيسى الترمذي', type: 'audio', slug: 'jami-at-tirmidhi', source: 'https://al-abbaad.com/lecture/hadith/syarh-sunan-attirmidzi?type=files', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
      { title: 'شرح المجتبى من السنن للإمام أحمد بن شعيب النسائي', type: 'audio', slug: 'sunan-an-nasai', source: 'https://al-abbaad.com/lecture/hadith/syarh-sunan-annasaiy?type=dir', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
      { title: 'شرح السنن للإمام محمد بن يزيد ابن ماجه القزويني', type: 'audio', slug: 'sunan-ibn-majah', source: 'https://al-abbaad.com/lecture/hadith/syarh-sunan-ibni-majah?type=dir', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد' },
    ],
  },
  { slug: 'ulum-al-hadith', name: 'علوم الحديث', icon: 'chain', items: [] },
  { slug: 'fiqh', name: 'الفقه', icon: 'scale', items: [] },
  { slug: 'usul-al-fiqh', name: 'أصول وقواعد الفقه', icon: 'columns', items: [] },
  {
    slug: 'tafsir', name: 'التفسير', icon: 'book', items: [
      { title: 'التفسير الميسر', type: 'audio', slug: 'tafsir-al-muyassar', note: 'مع تلاوة الآيات بصوت فضيلة الشيخ علي بن عبد الرحمن الحذيفي' },
      { title: 'تيسير الكريم الرحمن في تفسير كلام المنان للإمام عبد الرحمن بن ناصر السعدي', type: 'audio', slug: 'tafsir-as-saadi', note: 'قراءة الشيخ محمد بن علي العرفج' },
    ],
  },
  {
    slug: 'usul-al-tafsir', name: 'أصول وقواعد التفسير', icon: 'key', items: [
      { title: 'شرح القواعد الحسان في تفسير القرآن للإمام عبد الرحمن بن ناصر السعدي', type: 'audio', slug: 'al-qawaid-al-hisan', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين' },
      { title: 'شرح أصول في التفسير', type: 'audio', slug: 'usul-fi-at-tafsir', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين' },
      { title: 'شرح مقدمة في أصول التفسير للإمام أحمد بن عبد الحليم ابن تيمية النميري الحراني', type: 'audio', slug: 'muqaddimah-at-tafsir', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين' },
    ],
  },
  {
    slug: 'seerah', name: 'السيرة', icon: 'route', items: [
      { title: 'شرح مختصر سيرة الرسول ﷺ للإمام محمد بن عبد الوهاب التميمي', type: 'audio', slug: 'mukhtasar-as-seerah', source: 'https://miraath.net/%D9%85%D8%AE%D8%AA%D8%B5%D8%B1-%D8%A7%D9%84%D8%B3%D9%8A%D8%B1%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%B9%D9%84%D9%8A-%D9%86%D8%A7%D8%B5%D8%B1-%D8%A7%D9%84%D9%81%D9%82%D9%8A%D9%87%D9%8A/', skip: [64], note: 'فضيلة الشيخ العلامة علي بن محمد بن ناصر الفقيهي' },
    ],
  },
  { slug: 'arabiyyah', name: 'علوم العربية', icon: 'pen', items: [] },
];
