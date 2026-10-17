// The words of the Walters Wedding texts, shared by the texts themselves, the line after an RSVP that
// invites guests to sign up, and the /sms page that shows them to Twilio's toll-free verification reviewers.
// Guests sign up only by texting the keyword; src/app/api/sms answers them.

export const KEYWORD = "WEDDING";

// Sent when someone texts the keyword. Their reply of Y confirms.
export const KEYWORD_WELCOME = "Walters Wedding: Welcome! Get wedding updates and reminders by text, up to 8 msgs/mo. Msg & data rates may apply. Reply HELP for help, STOP to opt out. Terms: walters.wedding/terms Privacy: walters.wedding/privacy Reply Y to confirm.";
export const KEYWORD_CONFIRMED = "Walters Wedding: You're all set! We'll text you wedding updates and reminders. Reply STOP to opt out.";

// Shown to a guest once their RSVP is in.
export const invite = (number: string) => `Want wedding updates and reminders by text? Text ${KEYWORD} to ${number}. Up to 8 msgs/mo; msg & data rates may apply.`;
