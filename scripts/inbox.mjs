// Reads the brother's inbox (what he sent through the site's /inbox page).
//
//   npm run inbox                        show the messages not yet added, and
//                                        download their files into inbox/<id>/
//   npm run inbox -- all                 show every message, added ones too
//   npm run inbox -- done <id> [reply]   mark a message as added; the reply is
//                                        shown to the brother under his message
//   npm run inbox -- undo <id>           mark it as waiting again
//
// Needs INBOX_KEY in .env.local of the main project folder (it works from a
// worktree too). INBOX_URL there overrides the site address, e.g. for a local test.
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";

const SITE = "https://al-barnamaj-al-hadi.pages.dev";

const projectFolder = dirname(
  execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
    encoding: "utf8",
  }).trim(),
);
const envFile = join(projectFolder, ".env.local");
if (existsSync(envFile)) process.loadEnvFile(envFile);

const key = process.env.INBOX_KEY;
const site = process.env.INBOX_URL || SITE;
if (!key) {
  console.error(`INBOX_KEY is missing from ${envFile}.`);
  process.exit(1);
}

const [command = "new", id, ...replyWords] = process.argv.slice(2);

if (command === "done" || command === "undo") {
  await setStatus(id, command === "done" ? "done" : "new", replyWords.join(" "));
} else if (command === "new" || command === "all") {
  await show(command === "all");
} else {
  console.error(`Unknown command "${command}". Use: (nothing), all, done <id> [reply], undo <id>.`);
  process.exit(1);
}

async function show(includeDone) {
  const { messages } = await api("/api/inbox");
  // Oldest first, the order he sent them in.
  const chosen = messages.filter((message) => includeDone || message.status === "new").reverse();

  if (chosen.length === 0) {
    console.log(includeDone ? "The inbox is empty." : "No new messages from the brother.");
    return;
  }

  console.log(`${chosen.length} ${includeDone ? "" : "new "}message(s) from the brother, oldest first:\n`);
  for (const message of chosen) {
    console.log("=".repeat(72));
    console.log(`id: ${message.id}`);
    console.log(`sent: ${new Date(message.sentAt).toLocaleString("en-GB")}  status: ${message.status}`);
    if (message.reply) console.log(`reply: ${message.reply}`);
    console.log("");
    console.log(message.text || "(no text)");

    if (message.files.length) {
      const folder = join(projectFolder, "inbox", message.id);
      mkdirSync(folder, { recursive: true });
      console.log("\nfiles:");
      for (const file of message.files) {
        const path = join(folder, file.name);
        if (!existsSync(path)) {
          const query = new URLSearchParams({ id: message.id, name: file.name });
          const response = await request(`/api/inbox/file?${query}`);
          writeFileSync(path, Buffer.from(await response.arrayBuffer()));
        }
        console.log(`  ${path}  (${megabytes(file.size)}, ${file.type})`);
      }
    }
    console.log("");
  }
}

async function setStatus(messageId, status, reply) {
  if (!messageId) {
    console.error("Give the message id, e.g. npm run inbox -- done 2026-10-07T14-03-22-k3f9 \"Added.\"");
    process.exit(1);
  }
  const body = { id: messageId, status };
  if (reply) body.reply = reply;
  const { message } = await api("/api/inbox/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  console.log(`${message.id} is now ${message.status === "done" ? "added" : "waiting"}.`);
}

async function api(path, options) {
  return (await request(path, options)).json();
}

async function request(path, options = {}) {
  const response = await fetch(site + path, {
    ...options,
    headers: { ...options.headers, "X-Inbox-Key": key },
  });
  if (!response.ok) {
    console.error(`${path} failed: ${response.status} ${await response.text()}`);
    process.exit(1);
  }
  return response;
}

function megabytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
