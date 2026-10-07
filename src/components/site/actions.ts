"use server";

import { personById } from "@/server/guestList";

// Everything guests send (RSVPs and questions) is forwarded as JSON to RSVP_WEBHOOK_URL: the Google
// Apps Script in scripts/rsvp-webhook.gs, which adds RSVPs to a Google Sheet, saves wedding photos to
// Drive and emails questions to the couple. RSVP_WEBHOOK_SECRET goes along so the script can ignore
// anything else. Without a URL, development logs what was sent and production refuses it, so nothing a
// guest sends is ever silently dropped.

const text = (data: FormData, key: string, max = 500) => String(data.get(key) ?? "").trim().slice(0, max);
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

async function forward(payload: Record<string, unknown>) {
  const endpoint = process.env.RSVP_WEBHOOK_URL;
  if (!endpoint) {
    if (process.env.NODE_ENV === "production") return false;
    const { photo, ...rest } = payload as { photo?: { size: number } };
    console.info("Set RSVP_WEBHOOK_URL to store this:", rest, photo ? `(with a ${photo.size}-byte photo)` : "");
    return true;
  }
  try {
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, secret: process.env.RSVP_WEBHOOK_SECRET ?? "" }) });
    if (!response.ok) throw new Error(`Webhook responded ${response.status}`);
    const result = await response.json().catch(() => ({ ok: true }));
    if (result.ok === false) throw new Error(`Webhook refused: ${result.error ?? "unknown"}`);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// ---------- Replying ----------

export type RsvpState =
  | { status: "idle" }
  | { status: "error"; message: string; fields?: Record<string, string> }
  | { status: "sent"; attending: boolean };

const PHOTO_LIMIT = 5 * 1024 * 1024; // the browser shrinks photos first, so this only catches the odd one it couldn't

// One RSVP covers everyone the guest picked from the list: whether each is coming, and the name of the
// guest anyone with a plus one is bringing.
export async function submitRsvp(_previous: RsvpState, data: FormData): Promise<RsvpState> {
  const ids = [...new Set(data.getAll("person").map(String))].slice(0, 20);
  const people = ids.map(personById);
  if (!people.length) return { status: "error", message: "Please find your name above first.", fields: { people: "Please find your name and pick it from the list." } };
  if (people.some(person => !person)) return { status: "error", message: "Something went wrong with the names you picked. Please remove them and find them again." };

  const fields: Record<string, string> = {};
  const replies = people.map(person => ({ person: person!, attending: text(data, `attending-${person!.id}`) }));
  replies.forEach(({ person, attending }) => { if (attending !== "yes" && attending !== "no") fields[`attending-${person.id}`] = `Please let us know if ${person.name.split(" ")[0]} can make it.`; });
  const email = text(data, "email", 200);
  if (!isEmail(email)) fields.email = "Please enter a valid email so we can reach you.";

  const file = data.get("photo");
  const photo = file instanceof File && file.size > 0 ? file : null;
  if (photo && (!photo.type.startsWith("image/") || photo.size > PHOTO_LIMIT)) fields.photo = "That photo couldn’t be used. Please try a different one.";
  if (Object.keys(fields).length) return { status: "error", message: "Just a couple of things to fill in.", fields };
  if (text(data, "website")) return { status: "sent", attending: true }; // the hidden field only bots fill in

  const guests = replies.flatMap(({ person, attending }) => {
    const name = person.plusOne && attending === "yes" ? text(data, `guest-${person.id}`, 120) : "";
    return name ? [{ guest: name, attending, plusOneOf: person.name }] : [];
  });
  const attending = replies.some(reply => reply.attending === "yes");
  const sent = await forward({
    type: "rsvp",
    invitation: people.map(person => person!.name).join(", "),
    replies: [...replies.map(({ person, attending }) => ({ guest: person.name, attending })), ...guests],
    email,
    dietary: text(data, "dietary"),
    song: text(data, "song", 200),
    note: text(data, "note", 1000),
    photo: photo && { name: photo.name, type: photo.type, size: photo.size, data: Buffer.from(await photo.arrayBuffer()).toString("base64") },
    receivedAt: new Date().toISOString(),
  });
  if (!sent) return { status: "error", message: "We couldn’t save your RSVP just now. Please try again in a moment." };
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
  const sent = await forward({ type: "question", ...question, receivedAt: new Date().toISOString() });
  return sent ? { status: "sent" } : { status: "error", message: "We couldn’t send your question just now. Please try again in a moment." };
}
