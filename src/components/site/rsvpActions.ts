"use server";

export type RsvpState =
  | { status: "idle" }
  | { status: "error"; message: string; fields?: Record<string, string>; values?: Record<string, string> }
  | { status: "sent"; attending: boolean; name: string };

const text = (data: FormData, key: string, max = 500) => String(data.get(key) ?? "").trim().slice(0, max);

// Replies are forwarded as JSON to RSVP_WEBHOOK_URL (a Google Apps Script, Formspree, Zapier or
// similar endpoint). Without one, development logs the reply and production refuses it, so no
// guest's answer is ever silently dropped.
export async function submitRsvp(_previous: RsvpState, data: FormData): Promise<RsvpState> {
  const reply = {
    name: text(data, "name", 120),
    email: text(data, "email", 200),
    attending: text(data, "attending"),
    guests: Number(text(data, "guests")) || 1,
    guestNames: text(data, "guestNames"),
    dietary: text(data, "dietary"),
    message: text(data, "message", 1000),
    receivedAt: new Date().toISOString(),
  };
  // Sent back on failure: React resets the form after an action, so the fields are refilled from these.
  const values = { name: reply.name, email: reply.email, attending: reply.attending, guests: String(reply.guests), guestNames: reply.guestNames, dietary: reply.dietary, message: reply.message };
  const fields: Record<string, string> = {};
  if (!reply.name) fields.name = "Please tell us your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reply.email)) fields.email = "Please enter a valid email so we can reach you.";
  if (reply.attending !== "yes" && reply.attending !== "no") fields.attending = "Please let us know if you can make it.";
  if (Object.keys(fields).length) return { status: "error", message: "Just a couple of things to fill in.", fields, values };
  if (text(data, "website")) return { status: "sent", attending: reply.attending === "yes", name: reply.name }; // honeypot

  const endpoint = process.env.RSVP_WEBHOOK_URL;
  if (!endpoint) {
    if (process.env.NODE_ENV === "production") {
      return { status: "error", message: "We couldn’t save your reply just now. Please try again later or email us.", values };
    }
    console.info("RSVP (set RSVP_WEBHOOK_URL to store replies):", reply);
  } else {
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reply) });
      if (!response.ok) throw new Error(`RSVP webhook responded ${response.status}`);
    } catch (error) {
      console.error(error);
      return { status: "error", message: "We couldn’t save your reply just now. Please try again in a moment.", values };
    }
  }
  return { status: "sent", attending: reply.attending === "yes", name: reply.name };
}
