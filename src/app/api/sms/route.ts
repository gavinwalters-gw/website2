import { createHmac, timingSafeEqual } from "node:crypto";
import { sql } from "@/server/db";
import { KEYWORD, KEYWORD_CONFIRMED, KEYWORD_WELCOME } from "@/content/texts";

// Texts coming in to the site's Twilio number. In Twilio, set the number's (or its Messaging Service's)
// "A message comes in" webhook to https://walters.wedding/api/sms, HTTP POST. Texting WEDDING gets the
// welcome, which asks for Y; Y confirms. Each step is kept in sms_subscribers (npm run db:setup), the list
// wedding updates go to. Twilio answers STOP, START and HELP itself, and won't deliver to anyone who sent
// STOP; this only notes it. Set SMS_WEBHOOK_URL if the URL in Twilio differs from the one this sees.

const STOP = new Set(["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT", "REVOKE", "OPTOUT"]);
const RESTART = new Set(["START", "UNSTOP", "YES"]);

const escape = (text: string) => text.replace(/[<>&'"]/g, c => `&#${c.charCodeAt(0)};`);
const reply = (message?: string) => new Response(
  `<?xml version="1.0" encoding="UTF-8"?><Response>${message ? `<Message>${escape(message)}</Message>` : ""}</Response>`,
  { headers: { "Content-Type": "text/xml" } },
);

// Twilio signs each request: an HMAC-SHA1, keyed with the auth token, of the URL it called followed by every
// parameter's name and value in name order.
function fromTwilio(request: Request, params: URLSearchParams) {
  const token = process.env.TWILIO_AUTH_TOKEN;
  const signature = request.headers.get("x-twilio-signature");
  if (!token || !signature) return false;
  const seen = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? seen.host;
  const urls = new Set([process.env.SMS_WEBHOOK_URL, request.url, `https://${host}${seen.pathname}${seen.search}`].filter(Boolean) as string[]);
  const signed = [...params.keys()].sort().map(key => key + params.get(key)).join("");
  const given = Buffer.from(signature);
  return [...urls].some(url => {
    const expected = Buffer.from(createHmac("sha1", token).update(url + signed).digest("base64"));
    return expected.length === given.length && timingSafeEqual(expected, given);
  });
}

export async function POST(request: Request) {
  const params = new URLSearchParams(await request.text());
  if (!fromTwilio(request, params)) return new Response("Forbidden", { status: 403 });
  const phone = params.get("From") ?? "";
  const word = (params.get("Body") ?? "").trim().toUpperCase().replace(/[.!]+$/, "");
  const said = params.get("OptOutType"); // STOP, START or HELP, when Twilio's Advanced Opt-Out recognised one

  const status = async (next: "pending" | "subscribed" | "stopped") => {
    if (sql) await sql`insert into sms_subscribers (phone, status) values (${phone}, ${next})
      on conflict (phone) do update set status = excluded.status, updated_at = now()`;
  };
  const current = async () => sql ? ((await sql`select status from sms_subscribers where phone = ${phone}`)[0]?.status as string | undefined) : undefined;

  try {
    if (said === "STOP" || STOP.has(word)) { await status("stopped"); return reply(); }
    if (said === "HELP" || word === "HELP" || word === "INFO") return reply();
    // A STOP undone with START puts them back on the list (Twilio sends its own reply); it never signs up anyone new.
    if (said === "START" || RESTART.has(word)) {
      if (await current() === "stopped") await status("subscribed");
      return reply();
    }
    if (word === KEYWORD) {
      if (await current() === "subscribed") return reply(KEYWORD_CONFIRMED);
      await status("pending");
      return reply(KEYWORD_WELCOME);
    }
    if (word === "Y") {
      if (sql && await current() !== "pending") return reply();
      await status("subscribed");
      return reply(KEYWORD_CONFIRMED);
    }
  } catch (error) {
    console.error(error);
  }
  return reply();
}
