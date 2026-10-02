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
//
// A category can also have `sections`: [{ title, items }], groups shown under
// their own heading on the category page (a scholar's works, النحو…). Their
// books' pages are still at /<category>/<slug>/.

export const site = {
  name: 'البرنامج الهادي لتأصيل العلم',
  // Shown under the name (the brother's wording, 2 Oct 2026).
  description: 'مكتبة صوتية تهدف إلى تأصيل العلم الشرعي عبر تتبع شروح العلماء على المتون المعتمدة',
  url: 'https://al-barnamaj-al-hadi.pages.dev',
};

export const categories = [
  {
    slug: 'aqeedah', name: 'العقيدة', icon: 'star', items: [], sections: [
      {
        title: 'مؤلفات الإمام محمد بن عبد الوهاب التميمي (ت 1206هـ)', items: [
        { title: 'شرح رسالة إلى أهل القصيم', type: 'audio', slug: 'risalah-ahl-al-qasim', source: 'https://miraath.net/%D8%B1%D8%B3%D8%A7%D9%84%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D9%85%D8%AD%D9%85%D8%AF-%D8%A8%D9%86-%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%88%D9%87%D8%A7%D8%A8-%D8%A5%D9%84%D9%89-%D8%A3%D9%87%D9%84-%D8%A7/', note: 'فضيلة الشيخ العلامة علي بن محمد بن ناصر الفقيهي (ت 1446هـ)' },
        { title: 'شرح شروط لا إله إلا الله', type: 'audio', slug: 'shurut-la-ilaha-illallah', note: 'فضيلة الشيخ العلامة محمد أمان بن علي الجامي (ت 1416هـ)' },
        { title: 'شرح تفسير كلمة التوحيد', type: 'audio', slug: 'tafsir-kalimat-at-tawhid', source: 'https://miraath.net/%D9%83%D8%AA%D8%A7%D8%A8-%D8%AA%D9%81%D8%B3%D9%8A%D8%B1-%D9%83%D9%84%D9%85%D8%A9-%D8%A7%D9%84%D8%AA%D9%88%D8%AD%D9%8A%D8%AF-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%B9%D9%84%D9%8A-%D9%86%D8%A7/', note: 'فضيلة الشيخ العلامة علي بن محمد بن ناصر الفقيهي (ت 1446هـ)' },
        { title: 'شرح الجامع لعبادة الله وحده', type: 'audio', slug: 'al-jami-li-ibadatillah', source: 'https://miraath.net/%D8%B1%D8%B3%D8%A7%D9%84%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D9%85%D8%AD%D9%85%D8%AF-%D8%A8%D9%86-%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%88%D9%87%D8%A7%D8%A8-%D9%81%D9%8A-%D8%A7%D9%84%D8%AC%D8%A7%D9%85/', note: 'فضيلة الشيخ العلامة علي بن محمد بن ناصر الفقيهي (ت 1446هـ)' },
        { title: 'شرح أربع قواعد تدور عليها الأحكام', type: 'audio', audio: 'https://pub-04b2ff031f654021aecd7529acd87d9c.r2.dev/arba-qawaid-qusayr/arba-qawaid-qusayr.mp3', download: 'https://pub-04b2ff031f654021aecd7529acd87d9c.r2.dev/arba-qawaid-qusayr/arba-qawaid-qusayr.mp3', note: 'فضيلة الشيخ العلامة عبد الله بن صالح القصير (ت 1445هـ)' },
        { title: 'شرح بعض فوائد من سورة الفاتحة', type: 'audio', slug: 'fawaid-al-fatihah', source: 'https://miraath.net/%D8%B1%D8%B3%D8%A7%D9%84%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D9%85%D8%AD%D9%85%D8%AF-%D8%A8%D9%86-%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%88%D9%87%D8%A7%D8%A8-%D9%81%D9%8A-%D8%A8%D8%B9%D8%B6-%D9%81%D9%88/', note: 'فضيلة الشيخ العلامة علي بن محمد بن ناصر الفقيهي (ت 1446هـ)' },
        { title: 'شرح معنى الطاغوت', type: 'audio', slug: 'mana-at-taghut', source: 'https://miraath.net/%D8%B1%D8%B3%D8%A7%D9%84%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D9%85%D8%AD%D9%85%D8%AF-%D8%A8%D9%86-%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%88%D9%87%D8%A7%D8%A8-%D9%81%D9%8A-%D9%85%D8%B9%D9%86%D9%89-%D8%A7/', note: 'فضيلة الشيخ العلامة علي بن محمد بن ناصر الفقيهي (ت 1446هـ)' },
        { title: 'شرح ستة مواضع في السيرة', type: 'audio', slug: 'sittat-mawadi-as-seerah', source: 'https://miraath.net/%D9%85%D9%88%D8%A7%D8%B6%D8%B9-%D8%A7%D9%84%D8%B3%D9%8A%D8%B1%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%B9%D9%84%D9%8A-%D9%86%D8%A7%D8%B5%D8%B1-%D8%A7%D9%84%D9%81%D9%82%D9%8A%D9%87%D9%8A/', note: 'فضيلة الشيخ العلامة علي بن محمد بن ناصر الفقيهي (ت 1446هـ)' },
        { title: 'شرح القواعد الأربع', type: 'audio', slug: 'al-qawaid-al-arba', source: 'https://miraath.net/%D8%B1%D8%B3%D8%A7%D9%84%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D9%85%D8%AD%D9%85%D8%AF-%D8%A8%D9%86-%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%88%D9%87%D8%A7%D8%A8-%D9%81%D9%8A-%D8%A7%D9%84%D9%82%D9%88%D8%A7/', note: 'فضيلة الشيخ العلامة علي بن محمد بن ناصر الفقيهي (ت 1446هـ)' },
        { title: 'شرح ثلاثة الأصول', type: 'audio', slug: 'thalathat-al-usul', source: 'https://miraath.net/%D8%A7%D9%84%D8%A3%D8%B5%D9%88%D9%84-%D8%A7%D9%84%D8%AB%D9%84%D8%A7%D8%AB%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%B9%D9%84%D9%8A-%D9%86%D8%A7%D8%B5%D8%B1-%D8%A7%D9%84%D9%81%D9%82%D9%8A/', note: 'فضيلة الشيخ العلامة علي بن محمد بن ناصر الفقيهي (ت 1446هـ)' },
        { title: 'شرح نواقض الإسلام', type: 'audio', slug: 'nawaqid-al-islam', note: 'فضيلة الشيخ العلامة محمد أمان بن علي الجامي (ت 1416هـ)' },
        { title: 'شرح الأصول الستة', type: 'audio', slug: 'al-usul-as-sittah', source: 'https://miraath.net/%D8%A7%D9%84%D8%A3%D8%B5%D9%88%D9%84-%D8%A7%D9%84%D8%B3%D8%AA%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%B9%D9%84%D9%8A-%D9%86%D8%A7%D8%B5%D8%B1-%D8%A7%D9%84%D9%81%D9%82%D9%8A%D9%87%D9%8A/', note: 'فضيلة الشيخ العلامة علي بن محمد بن ناصر الفقيهي (ت 1446هـ)' },
        { title: 'شرح فضل الإسلام', type: 'audio', slug: 'fadl-al-islam', note: 'فضيلة الشيخ العلامة عبيد بن عبد الله بن سليمان الحمداني الجابري (ت 1444هـ)' },
        { title: 'شرح كشف الشبهات', type: 'audio', slug: 'kashf-ash-shubuhat', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
        { title: 'شرح كتاب التوحيد الذي هو حق الله على العبيد', type: 'audio', slug: 'kitab-at-tawhid', note: 'فضيلة الشيخ العلامة عبيد بن عبد الله بن سليمان الحمداني الجابري (ت 1444هـ)' },
        { title: 'شرح مسائل الجاهلية', type: 'audio', slug: 'masail-al-jahiliyyah', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
        { title: 'شرح أصول الإيمان', type: 'audio', slug: 'usul-al-iman', note: 'فضيلة الشيخ العلامة زيد بن محمد بن هادي المدخلي (ت 1435هـ)' },
        { title: 'شرح كتاب الكبائر', type: 'audio', slug: 'al-kabair', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
        { title: 'شرح كتاب الفتن والحوادث', type: 'audio', slug: 'al-fitan-wal-hawadith', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
        ],
      },
      {
        title: 'مؤلفات الإمام أحمد بن عبد الحليم ابن تيمية النميري الحراني (ت 728هـ)', items: [
        { title: 'شرح القصيدة اللامية', type: 'audio', audio: 'https://pub-04b2ff031f654021aecd7529acd87d9c.r2.dev/al-lamiyyah/al-lamiyyah.mp3', download: 'https://pub-04b2ff031f654021aecd7529acd87d9c.r2.dev/al-lamiyyah/al-lamiyyah.mp3', note: 'فضيلة الشيخ العلامة عبد الله بن صالح القصير (ت 1445هـ)' },
        { title: 'شرح العبودية', type: 'audio', slug: 'al-ubudiyyah', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
        { title: 'شرح قاعدة جليلة في التوسل والوسيلة', type: 'audio', slug: 'at-tawassul-wal-wasilah', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
        { title: 'شرح العقيدة الواسطية', type: 'audio', slug: 'al-aqidah-al-wasitiyyah', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
        { title: 'شرح الفتوى الحموية الكبرى', type: 'audio', slug: 'al-hamawiyyah', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
        { title: 'شرح الرسالة التدمرية', type: 'audio', slug: 'at-tadmuriyyah', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
        { title: 'شرح اقتضاء الصراط المستقيم لمخالفة أصحاب الجحيم', type: 'audio', slug: 'iqtida-as-sirat', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
        { title: 'شرح الأمر بالمعروف والنهي عن المنكر', type: 'audio', slug: 'al-amr-bil-maruf', note: 'فضيلة الشيخ العلامة عبيد بن عبد الله بن سليمان الحمداني الجابري (ت 1444هـ)' },
        ],
      },
      {
        title: 'مؤلفات العلماء المتقدمين إلى المتأخرين', items: [
        { title: 'شرح أصول السنة للإمام عبد الله بن الزبير الحميدي (ت 219هـ)', type: 'audio', slug: 'usul-as-sunnah-al-humaydi', note: 'فضيلة الشيخ العلامة عبيد بن عبد الله بن سليمان الحمداني الجابري (ت 1444هـ)' },
        { title: 'شرح أصول السنة للإمام أحمد بن حنبل (ت 241هـ)', type: 'audio', slug: 'usul-as-sunnah-ahmad', note: 'فضيلة الشيخ العلامة ربيع بن هادي عمير المدخلي (ت 1447هـ)' },
        { title: 'شرح أصول السنة للإمام أحمد بن حنبل (ت 241هـ)', type: 'audio', slug: 'usul-as-sunnah-ahmad-jabiri', note: 'فضيلة الشيخ العلامة عبيد بن عبد الله بن سليمان الحمداني الجابري (ت 1444هـ)' },
        { title: 'شرح عقيدة الرازيين أبي زرعة (ت 264هـ) وأبي حاتم (ت 277هـ)', type: 'audio', slug: 'aqidat-ar-raziyyayn', note: 'فضيلة الشيخ العلامة ربيع بن هادي عمير المدخلي (ت 1447هـ)' },
        { title: 'شرح كتاب الرد على الجهمية للإمام عثمان بن سعيد الدارمي (ت 280هـ)', type: 'audio', slug: 'ar-radd-ala-al-jahmiyyah', note: 'فضيلة الشيخ ياسين بن علي الحوشبي العدني (ت 1439هـ)' },
        { title: 'شرح صريح السنة للإمام محمد بن جرير الطبري (ت 310هـ)', type: 'audio', slug: 'sarih-as-sunnah-at-tabari', note: 'فضيلة الشيخ ياسين بن علي الحوشبي العدني (ت 1439هـ)' },
        { title: 'شرح المنظومة الحائية للإمام أبي بكر عبد الله بن سليمان بن أبي داود السجستاني (ت 316هـ)', type: 'audio', slug: 'al-haiyyah', note: 'فضيلة الشيخ العلامة زيد بن محمد بن هادي المدخلي (ت 1435هـ)' },
        { title: 'شرح كتاب شرح السنة للإمام الحسن بن علي البربهاري (ت 329هـ)', type: 'audio', slug: 'sharh-as-sunnah-al-barbahari', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
        { title: 'شرح اعتقاد أهل الحديث للإمام أبي بكر أحمد بن إبراهيم الإسماعيلي (ت 371هـ)', type: 'audio', slug: 'itiqad-ahl-al-hadith', note: 'فضيلة الشيخ العلامة عبيد بن عبد الله بن سليمان الحمداني الجابري (ت 1444هـ)' },
        { title: 'شرح مقدمة الرسالة للإمام عبد الله بن أبي زيد القيرواني (ت 386هـ)', type: 'audio', slug: 'muqaddimat-ar-risalah', note: 'فضيلة الشيخ العلامة عبيد بن عبد الله بن سليمان الحمداني الجابري (ت 1444هـ)' },
        { title: 'شرح أصول السنة للإمام محمد بن عبد الله بن أبي زمنين (ت 399هـ)', type: 'audio', slug: 'usul-as-sunnah-ibn-abi-zamanin', note: 'فضيلة الشيخ العلامة زيد بن محمد بن هادي المدخلي (ت 1435هـ)' },
        { title: 'شرح عقيدة السلف أصحاب الحديث للإمام أبي عثمان إسماعيل بن عبد الرحمن الصابوني (ت 449هـ)', type: 'audio', slug: 'aqidat-as-salaf-as-sabuni', note: 'فضيلة الشيخ ياسين بن علي الحوشبي العدني (ت 1439هـ)' },
        { title: 'شرح لمعة الاعتقاد للإمام عبد الله بن أحمد بن محمد بن قدامة المقدسي (ت 620هـ)', type: 'audio', slug: 'lumat-al-itiqad', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
        { title: 'شرح الكافية الشافية في الانتصار للفرقة الناجية (القصيدة النونية) للإمام محمد بن أبي بكر ابن قيم الجوزية (ت 751هـ)', type: 'audio', slug: 'an-nuniyyah', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
        { title: 'شرح إجماع السلف في الاعتقاد للإمام حرب بن إسماعيل الكرماني (ت 280هـ)', type: 'audio', slug: 'ijma-as-salaf-al-kirmani', note: 'فضيلة الشيخ العلامة علي بن السيد الوصيفي (ت 1444هـ)' },
        { title: 'شرح الدرة المضية في عقد أهل الفرقة المرضية (العقيدة السفارينية) للإمام محمد بن أحمد السفاريني (ت 1188هـ)', type: 'audio', slug: 'as-saffariniyyah', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
        { title: 'شرح تطهير الاعتقاد عن أدران الإلحاد للإمام محمد بن إسماعيل الأمير الصنعاني (ت 1182هـ)', type: 'audio', slug: 'tathir-al-itiqad-fawzan', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
        { title: 'شرح كتاب شرح الصدور بتحريم رفع القبور للإمام محمد بن علي الشوكاني (ت 1250هـ)', type: 'audio', slug: 'sharh-as-sudur', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
        ],
      },
      {
        title: 'مؤلفات ومحاضرات العلماء المعاصرين', items: [
        { title: 'عقيدة أهل السنة والجماعة', type: 'audio', audio: 'https://files.zadapps.info/binbaz.org.sa/sawtyaat/dros%26mohadrat/dros_aqida/aqeda_sunna.mp3', download: 'https://files.zadapps.info/binbaz.org.sa/sawtyaat/dros%26mohadrat/dros_aqida/aqeda_sunna.mp3', note: 'فضيلة الشيخ العلامة عبد العزيز بن عبد الله بن باز (ت 1420هـ)' },
        { title: 'الطائفة الناجية المنصورة', type: 'audio', audio: 'https://alnajmi.net/files/altaifh-almansoura.MP3', download: 'https://alnajmi.net/files/altaifh-almansoura.MP3', note: 'فضيلة الشيخ العلامة أحمد بن يحيى النجمي (ت 1429هـ)' },
        { title: 'شرح وجوب الأمر بالمعروف والنهي عن المنكر للإمام عبد العزيز بن عبد الله بن باز (ت 1420هـ)', type: 'audio', slug: 'wujub-al-amr-bil-maruf', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
        { title: 'شرح أصول العقائد الدينية للإمام عبد الرحمن بن ناصر السعدي (ت 1376هـ)', type: 'audio', slug: 'usul-al-aqaid-ad-diniyyah', note: 'فضيلة الشيخ العلامة زيد بن محمد بن هادي المدخلي (ت 1435هـ)' },
        { title: 'شرح منظومة الفروق بين الكفر والشرك والنفاق والظلم والفسوق', type: 'audio', slug: 'manzumat-al-furuq', note: 'فضيلة الشيخ العلامة زيد بن محمد بن هادي المدخلي (ت 1435هـ)' },
        { title: 'شرح عقيدة أهل السنة والجماعة', type: 'audio', slug: 'aqidat-ahl-as-sunnah', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
        { title: 'شرح القواعد المثلى في صفات الله وأسمائه الحسنى', type: 'audio', slug: 'al-qawaid-al-muthla', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
        { title: 'شرح الحسام الماحق لكل مشرك ومنافق', type: 'audio', slug: 'al-husam-al-mahiq', note: 'فضيلة الشيخ العلامة محمد تقي الدين بن عبد القادر الهلالي (ت 1407هـ)' },
        ],
      },
    ],
  },
  {
    slug: 'adab-at-talib', name: 'الآداب', icon: 'lamp', items: [
      { title: 'مرحبا يا طالب العلم', type: 'audio', audio: 'https://pub-04b2ff031f654021aecd7529acd87d9c.r2.dev/marhaban-ya-talib-al-ilm/marhaban-ya-talib-al-ilm.mp3', download: 'https://pub-04b2ff031f654021aecd7529acd87d9c.r2.dev/marhaban-ya-talib-al-ilm/marhaban-ya-talib-al-ilm.mp3', note: 'فضيلة الشيخ العلامة ربيع بن هادي عمير المدخلي (ت 1447هـ)' },
      { title: 'عوائق في طريق طالب العلم', type: 'audio', audio: 'https://rabee.net/wp-content/uploads/bulk-files/sounds/awaiq.mp3', download: 'https://rabee.net/wp-content/uploads/bulk-files/sounds/awaiq.mp3', note: 'فضيلة الشيخ العلامة ربيع بن هادي عمير المدخلي (ت 1447هـ)' },
      { title: 'شرح حلية طالب العلم للشيخ بكر بن عبد الله أبي زيد (ت 1429هـ)', type: 'audio', slug: 'hilyat-talib-al-ilm', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
      { title: 'التعليق على مقدمة المجموع شرح المهذب للإمام يحيى بن شرف النووي (ت 676هـ)', type: 'audio', slug: 'muqaddimat-al-majmu', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
      { title: 'شرح الألفية في الآداب الشرعية للإمام محمد بن عبد القوي المرداوي (ت 699هـ)', type: 'audio', slug: 'al-alfiyyah-fil-adab', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
      { title: 'شرح رياض الصالحين من كلام سيد المرسلين ﷺ للإمام يحيى بن شرف النووي (ت 676هـ)', type: 'audio', slug: 'riyad-as-salihin', note: 'سماحة الشيخ العلامة عبد العزيز بن عبد الله بن باز (ت 1420هـ)' },
    ],
  },
  {
    slug: 'hadith', name: 'الحديث', icon: 'scroll', items: [
      { title: 'شرح الأربعين في مباني الإسلام وقواعد الأحكام للإمام النووي (ت 676هـ)', type: 'audio', slug: 'al-arbain', source: 'https://al-abbaad.com/lecture/hadith/arbain-annawawi?type=files', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
      { title: 'شرح الأربعين وتتمة الخمسين للإمامين النووي (ت 676هـ) وابن رجب (ت 795هـ)', type: 'audio', slug: 'fath-al-qawi', source: 'https://al-abbaad.com/lecture/hadith/fathul-qowiy?type=files', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
      { title: 'شرح عمدة الأحكام من كلام خير الأنام ﷺ للإمام عبد الغني المقدسي (ت 600هـ)', type: 'audio', slug: 'umdat-al-ahkam', source: 'https://al-abbaad.com/lecture/hadith/umadtul-ahkam?type=dir', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
      { title: 'شرح بلوغ المرام من أدلة الأحكام للإمام ابن حجر العسقلاني (ت 852هـ)', type: 'audio', slug: 'bulugh-al-maram', source: 'https://al-abbaad.com/lecture/hadith/bulugh-almaram?type=dir', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
      { title: 'كيفية الاستفادة من كتب الحديث', type: 'audio', audio: 'https://al-abbaad.com/jdownloads/muhadharah/kaifiyah-alistifadah-min-kutub-alhadith.mp3', download: 'https://al-abbaad.com/download/?type=audio&ids=243742', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
      { title: 'شرح الموطأ للإمام مالك بن أنس (ت 179هـ)', type: 'audio', slug: 'al-muwatta', source: 'https://al-abbaad.com/lecture/hadith/sharh-almuwatto?type=files', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
      { title: 'شرح الجامع المسند الصحيح المختصر من أمور رسول الله ﷺ وسننه وأيامه للإمام محمد بن إسماعيل البخاري (ت 256هـ)', type: 'audio', slug: 'sahih-al-bukhari', source: 'https://al-abbaad.com/lecture/hadith/syarh-shahih-albukhari?type=dir', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
      { title: 'شرح المسند الصحيح المختصر من السنن بنقل العدل عن العدل إلى رسول الله ﷺ للإمام مسلم بن الحجاج النيسابوري (ت 261هـ)', type: 'audio', slug: 'sahih-muslim', source: 'https://al-abbaad.com/lecture/hadith/syarh-shahih-muslim?type=dir', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
      { title: 'شرح السنن للإمام محمد بن يزيد ابن ماجه القزويني (ت 273هـ)', type: 'audio', slug: 'sunan-ibn-majah', source: 'https://al-abbaad.com/lecture/hadith/syarh-sunan-ibni-majah?type=dir', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
      { title: 'شرح الجامع المختصر من السنن عن رسول الله ﷺ ومعرفة الصحيح والمعلول وما عليه العمل للإمام محمد بن عيسى الترمذي (ت 279هـ)', type: 'audio', slug: 'jami-at-tirmidhi', source: 'https://al-abbaad.com/lecture/hadith/syarh-sunan-attirmidzi?type=files', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
      { title: 'شرح المجتبى من السنن للإمام أحمد بن شعيب النسائي (ت 303هـ)', type: 'audio', slug: 'sunan-an-nasai', source: 'https://al-abbaad.com/lecture/hadith/syarh-sunan-annasaiy?type=dir', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
      { title: 'شرح السنن للإمام أبي داود سليمان بن الأشعث السجستاني (ت 275هـ)', type: 'audio', slug: 'sunan-abi-dawud', source: 'https://al-abbaad.com/lecture/hadith/syarh-sunan-abi-dawud?type=files', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
    ],
  },
  {
    slug: 'ulum-al-hadith', name: 'علوم الحديث', icon: 'chain', items: [
      { title: 'مقدمة في علم الحديث', type: 'audio', audio: 'https://rabee.net/wp-content/uploads/bulk-files/sounds/mostalah.mp3', note: 'فضيلة الشيخ العلامة ربيع بن هادي عمير المدخلي (ت 1447هـ)' },
      { title: 'شرح مقدمة صحيح الإمام مسلم بن الحجاج (ت 261هـ)', type: 'audio', slug: 'muqaddimat-sahih-muslim-muqbil', note: 'فضيلة الشيخ العلامة مقبل بن هادي الوادعي (ت 1422هـ)' },
      { title: 'شرح مقدمة صحيح الإمام مسلم بن الحجاج (ت 261هـ)', type: 'audio', slug: 'muqaddimat-sahih-muslim', note: 'فضيلة الشيخ العلامة محمد بن علي بن آدم الإتيوبي (ت 1442هـ)' },
      { title: 'شرح المنظومة البيقونية للإمام عمر بن محمد البيقوني (ت نحو 1080هـ)', type: 'audio', slug: 'al-bayquniyyah', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
      { title: 'شرح اختصار علوم الحديث للإمام إسماعيل بن عمر بن كثير (ت 774هـ)', type: 'audio', slug: 'ikhtisar-ulum-al-hadith', note: 'فضيلة الشيخ العلامة مقبل بن هادي الوادعي (ت 1422هـ)' },
      { title: 'شرح نزهة النظر في توضيح نخبة الفكر للإمام أحمد بن علي بن حجر العسقلاني (ت 852هـ)', type: 'audio', slug: 'nuzhat-an-nazar', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
      { title: 'شرح نخبة الفكر في مصطلح أهل الأثر للإمام أحمد بن علي بن حجر العسقلاني (ت 852هـ)', type: 'audio', slug: 'nukhbat-al-fikar', note: 'فضيلة الشيخ العلامة محمد بن علي بن آدم الإتيوبي (ت 1442هـ)' },
      { title: 'شرح ألفية السيوطي في علم الحديث للإمام عبد الرحمن بن أبي بكر السيوطي (ت 911هـ)', type: 'audio', slug: 'alfiyyat-as-suyuti', source: 'https://al-abbaad.com/lecture/hadith/alfiyah-suyuthi?type=files', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
    ],
  },
  {
    slug: 'fiqh', name: 'الفقه', icon: 'scale', items: [
      { title: 'شرح شروط الصلاة وأركانها وواجباتها للإمام محمد بن عبد الوهاب التميمي (ت 1206هـ)', type: 'audio', slug: 'shurut-as-salah', source: 'https://al-abbaad.com/lecture/feqh/shuruth-assalah-wa-arkaaniha?type=files', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
      { title: 'شرح آداب المشي إلى الصلاة للإمام محمد بن عبد الوهاب التميمي (ت 1206هـ)', type: 'audio', slug: 'adab-al-mashy', source: 'https://al-abbaad.com/lecture/feqh/adab-mashi-ilas-solah?type=files', note: 'فضيلة الشيخ العلامة عبد المحسن بن حمد العباد البدر' },
      { title: 'شرح عمدة الفقه للإمام عبد الله بن أحمد بن محمد بن قدامة المقدسي (ت 620هـ)', type: 'audio', slug: 'umdat-al-fiqh', note: 'فضيلة الشيخ العلامة صالح بن محمد اللحيدان (ت 1443هـ)' },
      { title: 'شرح زاد المستقنع في اختصار المقنع للإمام موسى بن أحمد الحجاوي (ت 968هـ)', type: 'audio', slug: 'zad-al-mustaqni', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
      { title: 'التعليق على الكافي للإمام عبد الله بن أحمد بن محمد بن قدامة المقدسي (ت 620هـ)', type: 'audio', slug: 'al-kafi', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
      { title: 'شرح السياسة الشرعية في إصلاح الراعي والرعية للإمام أحمد بن عبد الحليم ابن تيمية النميري الحراني (ت 728هـ)', type: 'audio', slug: 'as-siyasah-ash-shariyyah', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
      { title: 'شرح الفوائد الجلية في المباحث الفرضية', type: 'audio', slug: 'al-fawaid-al-jaliyyah', note: 'سماحة الشيخ العلامة عبد العزيز بن عبد الله بن باز (ت 1420هـ)' },
    ],
  },
  {
    slug: 'usul-al-fiqh', name: 'أصول وقواعد الفقه', icon: 'columns', items: [
      { title: 'شرح منظومة القواعد الفقهية للإمام عبد الرحمن بن ناصر السعدي (ت 1376هـ)', type: 'audio', slug: 'manzumat-al-qawaid-al-fiqhiyyah', note: 'فضيلة الشيخ العلامة عبيد بن عبد الله بن سليمان الحمداني الجابري (ت 1444هـ)' },
      { title: 'شرح القواعد والأصول الجامعة والفروق والتقاسيم البديعة النافعة للإمام عبد الرحمن بن ناصر السعدي (ت 1376هـ)', type: 'audio', slug: 'al-qawaid-wal-usul-al-jamiah', source: 'https://miraath.net/%d8%b4%d8%b1%d8%ad-%d8%a7%d9%84%d9%82%d9%88%d8%a7%d8%b9%d8%af-%d9%88%d8%a7%d9%84%d8%a3%d8%b5%d9%88%d9%84-%d8%a7%d9%84%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d9%88%d8%a7%d9%84%d9%81%d8%b1%d9%88%d9%82-%d9%88/', note: 'فضيلة الشيخ العلامة عبيد بن عبد الله بن سليمان الحمداني الجابري (ت 1444هـ)' },
      { title: 'شرح الأصول من علم الأصول', type: 'audio', slug: 'al-usul-min-ilm-al-usul', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
      { title: 'شرح منظومة أصول الفقه وقواعده', type: 'audio', slug: 'manzumat-usul-al-fiqh', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
      { title: 'شرح قواعد الأصول ومعاقد الفصول للإمام عبد المؤمن بن عبد الحق القطيعي البغدادي (ت 739هـ)', type: 'audio', slug: 'qawaid-al-usul', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
      { title: 'شرح تقرير القواعد وتحرير الفوائد للإمام ابن رجب (ت 795هـ)', type: 'audio', slug: 'taqrir-al-qawaid', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
    ],
  },
  {
    slug: 'tafsir', name: 'التفسير', icon: 'book', items: [
      { title: 'التفسير الميسّر بإشراف الشيخ صالح بن عبد العزيز آل الشيخ', type: 'audio', slug: 'tafsir-al-muyassar', note: 'مع تلاوة الآيات بصوت فضيلة الشيخ علي بن عبد الرحمن الحذيفي' },
      { title: 'تيسير الكريم الرحمن في تفسير كلام المنان للإمام عبد الرحمن بن ناصر السعدي (ت 1376هـ)', type: 'audio', slug: 'tafsir-as-saadi', note: 'قراءة الشيخ محمد بن علي العرفج (ت 1442هـ)' },
    ],
  },
  {
    slug: 'usul-al-tafsir', name: 'أصول وقواعد التفسير', icon: 'key', items: [
      { title: 'شرح القواعد الحسان في تفسير القرآن للإمام عبد الرحمن بن ناصر السعدي (ت 1376هـ)', type: 'audio', slug: 'al-qawaid-al-hisan', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
      { title: 'شرح أصول في التفسير', type: 'audio', slug: 'usul-fi-at-tafsir', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
      { title: 'شرح مقدمة في أصول التفسير للإمام أحمد بن عبد الحليم ابن تيمية النميري الحراني (ت 728هـ)', type: 'audio', slug: 'muqaddimah-at-tafsir', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
    ],
  },
  {
    slug: 'seerah', name: 'السيرة', icon: 'route', items: [
      { title: 'التعليق على السيرة النبوية في ضوء المصادر الأصلية للدكتور مهدي رزق الله أحمد', type: 'audio', slug: 'as-sirah-fi-daw-al-masadir', note: 'فضيلة الشيخ صالح بن عبد الله الحديثي' },
      { title: 'شرح مختصر سيرة الرسول ﷺ للإمام محمد بن عبد الوهاب التميمي (ت 1206هـ)', type: 'audio', slug: 'mukhtasar-as-seerah', source: 'https://miraath.net/%D9%85%D8%AE%D8%AA%D8%B5%D8%B1-%D8%A7%D9%84%D8%B3%D9%8A%D8%B1%D8%A9-%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%B9%D9%84%D9%8A-%D9%86%D8%A7%D8%B5%D8%B1-%D8%A7%D9%84%D9%81%D9%82%D9%8A%D9%87%D9%8A/', skip: [64], note: 'فضيلة الشيخ العلامة علي بن محمد بن ناصر الفقيهي (ت 1446هـ)' },
      { title: 'شرح مختصر زاد المعاد للإمام محمد بن عبد الوهاب التميمي (ت 1206هـ)', type: 'audio', slug: 'mukhtasar-zad-al-maad', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
    ],
  },
  {
    slug: 'arabiyyah', name: 'علوم العربية', icon: 'pen', items: [], sections: [
      {
        title: 'النحو', items: [
        { title: 'التعليق على الدرة اليتيمة', type: 'audio', slug: 'ad-durrah-al-yatimah', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
        { title: 'شرح الآجرومية للإمام محمد بن محمد بن آجروم الصنهاجي (ت 723هـ)', type: 'audio', slug: 'al-ajurrumiyyah', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
        { title: 'شرح الآجرومية للإمام محمد بن محمد بن آجروم الصنهاجي (ت 723هـ)', type: 'audio', slug: 'al-ajurrumiyyah-kouni', note: 'فضيلة الشيخ العلامة عبد الرحمن بن عوف كوني' },
        { title: 'شرح متممة الآجرومية للإمام محمد بن محمد الرعيني الحطاب (ت 954هـ)', type: 'audio', slug: 'mutammimat-al-ajurrumiyyah', note: 'فضيلة الشيخ العلامة عبد الرحمن بن عوف كوني' },
        { title: 'شرح قطر الندى وبل الصدى للإمام عبد الله بن يوسف بن هشام الأنصاري (ت 761هـ)', type: 'audio', slug: 'qatr-an-nada', note: 'فضيلة الشيخ العلامة عبد الرحمن بن عوف كوني' },
        { title: 'شرح ألفية ابن مالك للإمام محمد بن عبد الله بن مالك الطائي الأندلسي (ت 672هـ)', type: 'audio', slug: 'alfiyyat-ibn-malik-kouni', note: 'فضيلة الشيخ العلامة عبد الرحمن بن عوف كوني' },
        ],
      },
      {
        title: 'الصرف', items: [
        { title: 'الإيناس بشرح متن البناء والأساس في علم الصرف', type: 'audio', slug: 'al-inas-matn-al-bina', note: 'فضيلة الشيخ العلامة عبد الرحمن بن عوف كوني' },
        { title: 'شرح تصريف العزي للإمام عز الدين عبد الوهاب بن إبراهيم الزنجاني (ت 655هـ)', type: 'audio', slug: 'tasrif-al-izzi', note: 'فضيلة الشيخ العلامة محمد بن علي بن آدم الإتيوبي (ت 1442هـ)' },
        { title: 'شرح عنوان الظرف في علم الصرف للشيخ هارون بن عبد الرازق البنجاوي (ت 1336هـ)', type: 'audio', slug: 'unwan-az-zarf', note: 'فضيلة الشيخ العلامة عبد الرحمن بن عوف كوني' },
        { title: 'شرح لامية الأفعال للإمام محمد بن عبد الله بن مالك الطائي الأندلسي (ت 672هـ) مع زيادة الحضرمي (ت 930هـ)', type: 'audio', slug: 'lamiyyat-al-afal-kouni', note: 'فضيلة الشيخ العلامة عبد الرحمن بن عوف كوني' },
        ],
      },
      {
        title: 'البلاغة', items: [
        { title: 'شرح البلاغة من كتاب قواعد اللغة العربية', type: 'audio', slug: 'durus-al-balaghah', note: 'فضيلة الشيخ العلامة محمد بن صالح العثيمين (ت 1421هـ)' },
        ],
      },
    ],
  },
  {
    slug: 'adhkar', name: 'الأذكار', icon: 'sunrise', items: [
      { title: 'شرح الوابل الصيب ورافع الكلم الطيب للإمام محمد بن أبي بكر ابن قيم الجوزية (ت 751هـ)', type: 'audio', slug: 'al-wabil-as-sayyib', note: 'سماحة الشيخ العلامة عبد العزيز بن عبد الله بن باز (ت 1420هـ)' },
    ],
  },
  {
    slug: 'tazkiyat-an-nafs', name: 'تزكية النفس', icon: 'heart', items: [
      { title: 'شرح الداء والدواء للإمام محمد بن أبي بكر ابن قيم الجوزية (ت 751هـ)', type: 'audio', slug: 'ad-daa-wad-dawaa', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
      { title: 'شرح الفرقان بين أولياء الرحمن وأولياء الشيطان للإمام أحمد بن عبد الحليم ابن تيمية النميري الحراني (ت 728هـ)', type: 'audio', slug: 'al-furqan', note: 'فضيلة الشيخ العلامة صالح بن فوزان بن عبد الله الفوزان' },
    ],
  },
];

// A category's items, including those in its sections.
export const itemsOf = (c) => [...c.items, ...(c.sections || []).flatMap((s) => s.items)];
