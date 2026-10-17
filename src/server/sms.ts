// Texts through Twilio: the couple when an RSVP or question comes in. (Guests sign up for wedding texts by
// texting in; src/app/api/sms.) Set these where the site runs:
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN  from the Twilio console
//   TWILIO_PHONE_NUMBER                     the Twilio number texts come from, as +15551234567
//   SMS_NOTIFY_TO                           who gets the couple's texts, as +15551234567 (several split by commas)
// With any missing it does nothing. A text that fails is only logged: the database already has it.

const LIMIT = 1200; // Twilio splits long texts into segments; past this they're more scroll than help
const SIGN_OFF = "\nReply STOP to opt out."; // as the samples given for the number's toll-free verification (src/app/sms)

// The number texts come from, as (888) 555-1234, read from the environment when the pages are built.
export function textNumber() {
  const digits = (process.env.TWILIO_PHONE_NUMBER ?? "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : undefined;
}

export async function textTo(numbers: string[], message: string) {
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_PHONE_NUMBER: from } = process.env;
  if (!sid || !token || !from) return;
  await Promise.all(numbers.map(async number => {
    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}` },
        body: new URLSearchParams({ From: from, To: number, Body: message }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`Twilio responded ${response.status}: ${await response.text()}`);
    } catch (error) {
      console.error(error);
    }
  }));
}

export async function textCouple(body: string) {
  const to = (process.env.SMS_NOTIFY_TO ?? "").split(",").map(number => number.trim()).filter(Boolean);
  if (!to.length) return;
  await textTo(to, `Walters Wedding ${body.length > LIMIT ? `${body.slice(0, LIMIT - 1)}…` : body}${SIGN_OFF}`);
}
