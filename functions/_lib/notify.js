// Tells the owner that the brother sent something new: a Telegram bot
// (@bilal_brother_alerts_bot) messages him, so it pops up on his phone and
// Mac. Needs the TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID secrets.
// The exposing-arafat site uses the same bot, so the alert names the site.
// Only a generic line is sent, never the message itself: Telegram is outside
// the site, so the brother's text and files stay in the private bucket.
const SITE_NAME = "Tasil ilm";

export async function notifyNewMessage(env, message) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.log("Inbox alert skipped: the Telegram secrets are missing.");
    return;
  }

  const fileCount = message.files.length;
  const files = fileCount === 1 ? "1 file" : `${fileCount} files`;
  const what = fileCount > 0 ? `A new message with ${files}.` : "A new message.";
  const text = `${SITE_NAME}: new from the brother\n${what}\nAsk Claude for the new additions.`;

  // An alert that fails must never stop his message from being saved, so
  // problems are only written to the Cloudflare log.
  try {
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    });
    if (!response.ok) {
      console.log(`Inbox alert failed: Telegram answered ${response.status} ${await response.text()}`);
    }
  } catch (error) {
    console.log(`Inbox alert failed: ${error}`);
  }
}
