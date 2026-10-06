// The brother's inbox page (/inbox/, built by build.mjs): sends a message
// (text and files) to /api/inbox and lists the messages already sent with
// their status. The inbox key comes
// from the link (/inbox/#key=...) and is remembered on this device.

const words = {
  sending: "جارٍ الإرسال…",
  sendingPercent: (percent) => `جارٍ الإرسال… ${percent}%`,
  sent: "تم الإرسال.",
  empty: "اكتب رسالة أو أرفق ملفًا أولًا.",
  tooBig: "الملفات أكبر من أن تُرسل من هنا (أكثر من 95 ميغابايت). أرسل رابطها بدلًا منها.",
  failed: "تعذّر الإرسال. تحقّق من الاتصال وحاول مرة أخرى.",
  wrongKey: "مفتاح هذا الرابط غير صحيح. افتح الرابط كاملًا كما أُرسل إليك.",
  loading: "جارٍ التحميل…",
  none: "لم تُرسل أي رسالة بعد.",
  loadFailed: "تعذّر تحميل الرسائل المرسلة.",
  waiting: "بانتظار الإضافة",
  done: "أُضيفت",
  // Gregorian date with Arabic-Indic digits, like the rest of the site.
  dateLocale: "ar-EG",
};

// Cloudflare refuses uploads over 100 MB, so stop a little before that.
const MAX_BYTES = 95 * 1024 * 1024;

const key = readKey();
const form = document.getElementById("send-form");
const sendStatus = document.getElementById("send-status");
const listStatus = document.getElementById("list-status");
const list = document.getElementById("messages");

if (!key) {
  document.getElementById("no-key").hidden = false;
  form.hidden = true;
} else {
  form.addEventListener("submit", send);
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

function send(event) {
  event.preventDefault();
  const data = new FormData(form);
  const files = data.getAll("files").filter((file) => file.size > 0);
  const text = String(data.get("text") || "").trim();

  if (!text && files.length === 0) return say(sendStatus, words.empty);
  if (files.reduce((total, file) => total + file.size, 0) > MAX_BYTES) {
    return say(sendStatus, words.tooBig);
  }

  // XMLHttpRequest (not fetch) because it reports upload progress, which
  // matters for big audio or video files on a phone.
  const request = new XMLHttpRequest();
  request.open("POST", "/api/inbox");
  request.setRequestHeader("X-Inbox-Key", key);
  request.upload.addEventListener("progress", (progress) => {
    if (progress.lengthComputable) {
      say(sendStatus, words.sendingPercent(Math.round((progress.loaded / progress.total) * 100)));
    }
  });
  request.addEventListener("load", () => {
    setBusy(false);
    if (request.status === 201) {
      form.reset();
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
  say(listStatus, words.loading);
  try {
    const response = await fetch("/api/inbox", { headers: { "X-Inbox-Key": key } });
    if (!response.ok) throw new Error(String(response.status));
    const { messages } = await response.json();
    list.replaceChildren(...messages.map(showMessage));
    say(listStatus, messages.length ? "" : words.none);
  } catch {
    say(listStatus, words.loadFailed);
  }
}

// Built with textContent only, so nothing in a message can act as HTML.
function showMessage(message) {
  const item = element("li");
  const meta = element("p", "meta");
  const date = new Date(message.sentAt).toLocaleString(words.dateLocale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  meta.append(
    element("span", "", date),
    element("span", `badge ${message.status}`, message.status === "done" ? words.done : words.waiting),
  );
  item.append(meta);

  if (message.text) {
    const text = element("p", "text", message.text);
    text.dir = "auto";
    item.append(text);
  }
  if (message.files.length) {
    const files = element("ul", "files");
    files.append(
      ...message.files.map((file) => {
        const name = element("li", "", file.name);
        name.dir = "auto";
        return name;
      }),
    );
    item.append(files);
  }
  if (message.reply) {
    const reply = element("p", "reply", message.reply);
    reply.dir = "auto";
    item.append(reply);
  }
  return item;
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
  form.querySelector("button").disabled = busy;
}
