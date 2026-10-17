"use server";

import { after } from "next/server";
import { sql } from "@/server/db";
import { personById } from "@/server/guestList";
import { textCouple, textTo, toE164 } from "@/server/sms";
import { RSVP_WELCOME } from "@/content/texts";

// Everything guests send (RSVPs and questions) is saved to Postgres (src/server/db.ts; npm run db:setup
// makes the tables). If RSVP_WEBHOOK_URL is set as well, it also goes as JSON to the Google Apps Script in
// scripts/rsvp-webhook.gs, which can email the couple; RSVP_WEBHOOK_SECRET goes along so the script can
// ignore anything else. The database is what counts: a webhook that fails then is only logged. With
// neither set, development logs what was sent and production refuses it, so nothing a guest sends is
// ever silently dropped. Once it's kept, the couple also gets a text (src/server/sms.ts), sent after the
// guest has their answer so Twilio never slows them down.

type Db = NonNullable<typeof sql>;

const text = (data: FormData, key: string, max = 500) => String(data.get(key) ?? "").trim().slice(0, max);
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

async function forward(endpoint: string, payload: Record<string, unknown>) {
  try {
    // Not waited on forever: once it's saved, a slow script mustn't hold the guest up until the request
    // times out and they're told it failed (and send it again).
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, secret: process.env.RSVP_WEBHOOK_SECRET ?? "" }), signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`Webhook responded ${response.status}`);
    const result = await response.json().catch(() => ({ ok: true }));
    if (result.ok === false) throw new Error(`Webhook refused: ${result.error ?? "unknown"}`);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function keep(payload: Record<string, unknown>, save: (db: Db) => Promise<unknown>) {
  const webhook = process.env.RSVP_WEBHOOK_URL;
  if (sql) {
    try {
      await save(sql);
    } catch (error) {
      console.error(error);
      return false;
    }
    if (webhook) await forward(webhook, payload);
    return true;
  }
  if (webhook) return forward(webhook, payload);
  if (process.env.NODE_ENV === "production") return false;
  const { photo, ...rest } = payload as { photo?: { size: number } };
  console.info("Set DATABASE_URL to store this:", rest, photo ? `(with a ${photo.size}-byte photo)` : "");
  return true;
}

// ---------- Replying ----------

export type RsvpState =
  | { status: "idle" }
  | { status: "error"; message: string; fields?: Record<string, string> }
  | { status: "sent"; attending: boolean };

const PHOTO_LIMIT = 5 * 1024 * 1024; // the browser shrinks photos first, so this only catches the odd one it couldn't

// One RSVP covers everyone the guest picked from the list: whether each is coming, and the name of the
// guests anyone with a plus one (or two) is bringing.
export async function submitRsvp(_previous: RsvpState, data: FormData): Promise<RsvpState> {
  const ids = [...new Set(data.getAll("person").map(String))].slice(0, 20);
  const people = ids.map(personById);
  if (!people.length) return { status: "error", message: "Please find your name above first.", fields: { people: "Please find your name and pick it from the list." } };
  if (people.some(person => !person)) return { status: "error", message: "Something went wrong with the names you picked. Please remove them and find them again." };

  const fields: Record<string, string> = {};
  const replies = people.map(person => ({ person: person!, attending: text(data, `attending-${person!.id}`) }));
  replies.forEach(({ person, attending }) => { if (attending !== "yes" && attending !== "no") fields[`attending-${person.id}`] = `Please let us know if ${person.name.split(" ")[0]} can make it.`; });
  const phone = text(data, "phone", 40);
  const digits = phone.replace(/\D/g, "").length;
  if (!phone) fields.phone = "Please enter a phone number so we can reach you.";
  else if (digits < 7 || digits > 15 || /[^\d\s()+.-]/.test(phone)) fields.phone = "Please check that phone number.";
  // Wedding update texts only with the box ticked, and only to a number Twilio can text.
  const updates = text(data, "sms") === "yes";
  if (updates && phone && !fields.phone && !toE164(phone)) fields.phone = "Please include the area code (or +country code) so we can text this number.";
  const email = text(data, "email", 200); // optional, but if it's there it should be one we can write to
  if (email && !isEmail(email)) fields.email = "Please check that email, or leave it blank.";

  const file = data.get("photo");
  const photo = file instanceof File && file.size > 0 ? file : null;
  if (photo && (!photo.type.startsWith("image/") || photo.size > PHOTO_LIMIT)) fields.photo = "That photo couldn’t be used. Please try a different one.";
  if (Object.keys(fields).length) return { status: "error", message: "Just a couple of things to fill in.", fields };
  if (text(data, "website")) return { status: "sent", attending: true }; // the hidden field only bots fill in

  const guests = replies.flatMap(({ person, attending }) => attending !== "yes" ? [] : data.getAll(`guest-${person.id}`)
    .slice(0, person.guests)
    .map(value => String(value).trim().slice(0, 120))
    .filter(Boolean)
    .map(name => ({ guest: name, attending, plusOneOf: person.name })));
  const attending = replies.some(reply => reply.attending === "yes");
  const rsvp = {
    type: "rsvp",
    invitation: people.map(person => person!.name).join(", "),
    replies: [...replies.map(({ person, attending }) => ({ guest: person.name, attending })), ...guests],
    email,
    phone,
    updates,
    dietary: text(data, "dietary"),
    song: text(data, "song", 200),
    note: text(data, "note", 1000),
    photo: photo && { name: photo.name, type: photo.type, size: photo.size, data: Buffer.from(await photo.arrayBuffer()).toString("base64") },
    receivedAt: new Date().toISOString(),
  };
  const sent = await keep(rsvp, db => db`
    insert into rsvps (invitation, email, phone, sms_opt_in, attending, replies, dietary, song, note, photo_name, photo_type, photo)
    values (${rsvp.invitation}, ${email || null}, ${phone}, ${updates}, ${attending}, ${JSON.stringify(rsvp.replies)}::jsonb, ${rsvp.dietary || null},
      ${rsvp.song || null}, ${rsvp.note || null}, ${rsvp.photo?.name ?? null}, ${rsvp.photo?.type ?? null},
      decode(${rsvp.photo?.data ?? null}, 'base64'))`);
  if (!sent) return { status: "error", message: "We couldn’t save your RSVP just now. Please try again in a moment." };
  after(() => textCouple([
    `RSVP: ${rsvp.invitation}`,
    ...rsvp.replies.map(reply => `${reply.attending === "yes" ? "Yes" : "No"} - ${reply.guest}${"plusOneOf" in reply ? ` (with ${reply.plusOneOf})` : ""}`),
    `Phone: ${phone}${updates ? " (wants update texts)" : ""}`,
    email && `Email: ${email}`,
    rsvp.dietary && `Dietary: ${rsvp.dietary}`,
    rsvp.song && `Song: ${rsvp.song}`,
    rsvp.note && `Note: ${rsvp.note}`,
    rsvp.photo && "(sent a photo)",
  ].filter(Boolean).join("\n")));
  const number = updates && toE164(phone);
  if (number) after(() => textTo([number], RSVP_WELCOME));
  return { status: "sent", attending };
}

// ---------- Questions from the FAQ ----------

export type QuestionState =
  | { status: "idle" }
  | { status: "error"; message: string; fields?: Record<string, string> }
  | { status: "sent" };

export async function askQuestion(_previous: QuestionState, data: FormData): Promise<QuestionState> {
  const question = { name: text(data, "name", 120), email: text(data, "email", 200), question: text(data, "question", 2000) };
  const fields: Record<string, string> = {};
  if (!question.name) fields.name = "Please tell us your name.";
  if (!isEmail(question.email)) fields.email = "Please enter a valid email so we can answer you.";
  if (!question.question) fields.question = "What would you like to ask?";
  if (Object.keys(fields).length) return { status: "error", message: "Just a couple of things to fill in.", fields };
  if (text(data, "website")) return { status: "sent" };
  const sent = await keep({ type: "question", ...question, receivedAt: new Date().toISOString() }, db => db`
    insert into questions (name, email, question) values (${question.name}, ${question.email}, ${question.question})`);
  if (!sent) return { status: "error", message: "We couldn’t send your question just now. Please try again in a moment." };
  after(() => textCouple(`question from ${question.name} (${question.email}):\n${question.question}`));
  return { status: "sent" };
}
