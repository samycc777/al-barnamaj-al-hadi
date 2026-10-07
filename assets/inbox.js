// The brother's inbox page (/inbox/, built by build.mjs): sends a message
// (text and files) to /api/inbox, then lists what he sent in two panels:
// waiting to be added, and added to the site (with the reply and a link to
// where it was added). The inbox key comes from the link (/inbox/#key=...)
// and is remembered on this device.

const words = {
  sending: "جارٍ الإرسال…",
  sendingPercent: (percent) => `جارٍ الإرسال… ${percent}%`,
  sent: "تم الإرسال.",
  empty: "اكتب رسالة أو أرفق ملفًا أولًا.",
  tooBig: "الملفات أكبر من أن تُرسل من هنا (أكثر من 95 ميغابايت). أرسل رابطها بدلًا منها.",
  failed: "تعذّر الإرسال. تحقّق من الاتصال وحاول مرة أخرى.",
  wrongKey: "مفتاح هذا الرابط غير صحيح. افتح الرابط كاملًا كما أُرسل إليك.",
  loading: "جارٍ التحميل…",
  loadFailed: "تعذّر تحميل الرسائل المرسلة.",
  waiting: "بانتظار الإضافة",
  done: "أُضيفت",
  sentOn: "أُرسلت",
  addedOn: "أُضيفت",
  open: "عرض في الموقع",
  remove: "إزالة",
  more: "عرض الرسالة كاملة",
  less: "إخفاء",
  // Gregorian date with Arabic-Indic digits, like the rest of the site.
  dateLocale: "ar-EG",
};

// Line icons drawn like the site's (build.mjs ICONS).
const icons = {
  clip: '<path d="M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 17.2a1.7 1.7 0 0 1-2.4-2.4L15 7"/>',
  check: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.5l2.7 2.7L16.5 9.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  open: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
};

// Cloudflare refuses uploads over 100 MB, so stop a little before that.
const MAX_BYTES = 95 * 1024 * 1024;

const key = readKey();
const form = document.getElementById("send-form");
const textBox = document.getElementById("text");
const fileInput = document.getElementById("files");
const drop = document.getElementById("drop");
const chosenList = document.getElementById("chosen");
const progress = document.getElementById("progress");
const sendStatus = document.getElementById("send-status");
// The files to send. Kept here (not in the file input) so he can pick files
// several times, drop them on the page, and take one out again.
let chosen = [];

if (!key) {
  document.getElementById("no-key").hidden = false;
  form.hidden = true;
  for (const id of ["waiting", "added"]) document.getElementById(`panel-${id}`).hidden = true;
} else {
  form.addEventListener("submit", send);
  fileInput.addEventListener("change", () => {
    addFiles(fileInput.files);
    fileInput.value = "";
  });
  for (const name of ["dragenter", "dragover"]) {
    drop.addEventListener(name, (event) => {
      event.preventDefault();
      drop.classList.add("over");
    });
  }
  for (const name of ["dragleave", "drop"]) {
    drop.addEventListener(name, () => drop.classList.remove("over"));
  }
  drop.addEventListener("drop", (event) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  });
  loadMessages();
}

function readKey() {
  const fromLink = new URLSearchParams(location.hash.slice(1)).get("key");
  try {
    if (fromLink) localStorage.setItem("inboxKey", fromLink);
    return fromLink || localStorage.getItem("inboxKey") || "";
  } catch {
    return fromLink || "";
  }
}

function addFiles(files) {
  chosen.push(...[...files].filter((file) => file.size > 0));
  showChosen();
}

function showChosen() {
  chosenList.replaceChildren(
    ...chosen.map((file, index) => {
      const item = element("li");
      const name = element("span", "name", file.name);
      name.dir = "auto";
      const remove = element("button", "remove");
      remove.type = "button";
      remove.title = words.remove;
      remove.setAttribute("aria-label", `${words.remove}: ${file.name}`);
      remove.innerHTML = svg("close");
      remove.addEventListener("click", () => {
        chosen.splice(index, 1);
        showChosen();
      });
      item.append(iconNode("clip"), name, element("span", "size", size(file.size)), remove);
      return item;
    }),
  );
}

function send(event) {
  event.preventDefault();
  const text = textBox.value.trim();

  if (!text && chosen.length === 0) return say(sendStatus, words.empty);
  if (chosen.reduce((total, file) => total + file.size, 0) > MAX_BYTES) {
    return say(sendStatus, words.tooBig);
  }

  const data = new FormData();
  data.append("text", text);
  for (const file of chosen) data.append("files", file, file.name);

  // XMLHttpRequest (not fetch) because it reports upload progress, which
  // matters for big audio or video files on a phone.
  const request = new XMLHttpRequest();
  request.open("POST", "/api/inbox");
  request.setRequestHeader("X-Inbox-Key", key);
  request.upload.addEventListener("progress", (step) => {
    if (step.lengthComputable) {
      const percent = Math.round((step.loaded / step.total) * 100);
      progress.value = percent;
      say(sendStatus, words.sendingPercent(percent));
    }
  });
  request.addEventListener("load", () => {
    setBusy(false);
    if (request.status === 201) {
      form.reset();
      chosen = [];
      showChosen();
      say(sendStatus, words.sent);
      loadMessages();
    } else {
      say(sendStatus, request.status === 403 ? words.wrongKey : words.failed);
    }
  });
  request.addEventListener("error", () => {
    setBusy(false);
    say(sendStatus, words.failed);
  });

  setBusy(true);
  say(sendStatus, words.sending);
  request.send(data);
}

async function loadMessages() {
  for (const id of ["waiting", "added"]) say(statusOf(id), words.loading);
  try {
    const response = await fetch("/api/inbox", { headers: { "X-Inbox-Key": key } });
    if (!response.ok) throw new Error(String(response.status));
    const { messages } = await response.json();
    const added = messages
      .filter((message) => message.status === "done")
      .sort((a, b) => (b.doneAt || b.id).localeCompare(a.doneAt || a.id));
    fill("waiting", messages.filter((message) => message.status !== "done"));
    fill("added", added);
  } catch {
    for (const id of ["waiting", "added"]) say(statusOf(id), words.loadFailed);
  }
}

function fill(id, messages) {
  say(statusOf(id), "");
  document.querySelector(`[data-count="${id}"]`).textContent = messages.length
    ? messages.length.toLocaleString(words.dateLocale)
    : "";
  document.querySelector(`[data-empty="${id}"]`).hidden = messages.length > 0;
  const list = document.getElementById(id);
  list.replaceChildren(...messages.map(showMessage));
  // Long messages start folded, with a button to open them.
  for (const text of list.querySelectorAll(".text")) {
    if (text.scrollHeight > text.clientHeight + 4) {
      const toggle = element("button", "more", words.more);
      toggle.type = "button";
      toggle.addEventListener("click", () => {
        const open = text.classList.toggle("open");
        toggle.textContent = open ? words.less : words.more;
      });
      text.after(toggle);
    }
  }
}

// Built with textContent only (icons aside), so nothing in a message can act as HTML.
function showMessage(message) {
  const added = message.status === "done";
  const item = element("li", added ? "msg added" : "msg");

  const head = element("div", "head");
  const pill = element("span", `pill ${added ? "done" : "new"}`);
  pill.append(iconNode(added ? "check" : "clock"), element("span", "", added ? words.done : words.waiting));
  head.append(pill, element("span", "date", `${words.sentOn} ${date(message.sentAt)}`));
  item.append(head);

  if (message.text) {
    const text = element("p", "text", message.text);
    text.dir = "auto";
    item.append(text);
  }
  if (message.files.length) {
    const files = element("ul", "files");
    files.append(
      ...message.files.map((file) => {
        const name = element("li");
        const label = element("span", "", file.name);
        label.dir = "auto";
        name.append(iconNode("clip"), label);
        return name;
      }),
    );
    item.append(files);
  }
  if (added && (message.reply || message.link)) {
    const reply = element("div", "reply");
    reply.append(iconNode("check"));
    const body = element("div", "body");
    if (message.reply) {
      const text = element("p", "", message.reply);
      text.dir = "auto";
      body.append(text);
    }
    const foot = element("p", "foot");
    if (message.doneAt) foot.append(element("span", "date", `${words.addedOn} ${date(message.doneAt)}`));
    // Only links to pages of this site.
    if (/^\/(?![/\\])/.test(message.link || "")) {
      const link = element("a", "btn open");
      link.href = message.link;
      link.append(element("span", "", words.open), iconNode("open"));
      foot.append(link);
    }
    if (foot.childNodes.length) body.append(foot);
    reply.append(body);
    item.append(reply);
  }
  return item;
}

function statusOf(id) {
  return document.querySelector(`[data-status="${id}"]`);
}

function date(iso) {
  return new Date(iso).toLocaleString(words.dateLocale, { dateStyle: "medium", timeStyle: "short" });
}

function size(bytes) {
  const megabytes = bytes / 1024 / 1024;
  return megabytes >= 1
    ? `${megabytes.toLocaleString(words.dateLocale, { maximumFractionDigits: 1 })} م.ب`
    : `${Math.max(1, Math.round(bytes / 1024)).toLocaleString(words.dateLocale)} ك.ب`;
}

function svg(name) {
  return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}

function iconNode(name) {
  const holder = document.createElement("span");
  holder.innerHTML = svg(name);
  return holder.firstChild;
}

function element(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function say(target, text) {
  target.textContent = text;
}

function setBusy(busy) {
  form.querySelector("button[type=submit]").disabled = busy;
  progress.hidden = !busy;
  if (!busy) progress.value = 0;
}
