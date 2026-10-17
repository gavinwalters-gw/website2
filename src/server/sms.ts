// Texts the couple through Twilio when an RSVP or question comes in. Set these where the site runs:
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN  from the Twilio console
//   TWILIO_PHONE_NUMBER                     the Twilio number texts come from, as +15551234567
//   SMS_NOTIFY_TO                           who gets them, as +15551234567 (several split by commas)
// With any missing it does nothing. A text that fails is only logged: the database already has it.

const LIMIT = 1200; // Twilio splits long texts into segments; past this they're more scroll than help

export async function textCouple(body: string) {
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_PHONE_NUMBER: from, SMS_NOTIFY_TO: to } = process.env;
  if (!sid || !token || !from || !to) return;
  const message = body.length > LIMIT ? `${body.slice(0, LIMIT - 1)}…` : body;
  await Promise.all(to.split(",").map(number => number.trim()).filter(Boolean).map(async number => {
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
