// Tells the owner's phone and Mac that the brother sent something new.
// It posts a short alert to ntfy.sh (a free push service) on a secret topic
// (the NTFY_TOPIC secret); the ntfy app on the phone and a script on the Mac
// (scripts/inbox-alerts-mac.sh in ~/dev/site-exposing-arafat) listen to it.
// The exposing-arafat site posts to the same topic, so the title names the site.
// Only a generic line is sent, never the message itself: ntfy.sh is outside
// the site, so the brother's text and files stay in the private bucket.
const TITLE = "Tasil ilm: new from the brother";

export async function notifyNewMessage(env, message) {
  if (!env.NTFY_TOPIC) return;

  const fileCount = message.files.length;
  const files = fileCount === 1 ? "1 file" : `${fileCount} files`;
  const body = fileCount > 0 ? `A new message with ${files}.` : "A new message.";

  try {
    await fetch(`https://ntfy.sh/${env.NTFY_TOPIC}`, {
      method: "POST",
      headers: { Title: TITLE, Tags: "inbox_tray" },
      body,
    });
  } catch {
    // An alert that fails must never stop his message from being saved.
  }
}
