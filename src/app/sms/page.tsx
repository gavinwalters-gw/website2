import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { CONTACT, alertNumber } from "@/components/site/PolicyPage";

export const metadata: Metadata = { title: "Text alerts · Walters Wedding" };

// The replies Twilio sends to START and Y (set under Advanced Opt-Out on the Messaging Service). Keep them
// word for word the same there and here.
const WELCOME = "Walters Wedding: Reply Y to confirm RSVP & question alerts. Msg frequency varies, a few/week. Msg & data rates may apply. Reply HELP for help, STOP to opt out. Terms: walters.wedding/terms Privacy: walters.wedding/privacy";
const CONFIRMED = "Walters Wedding: You're all set! You'll get a text each time a guest RSVPs or asks a question. Reply STOP to opt out.";

export default function Sms() {
  const number = alertNumber();
  return (
    <PolicyPage title="Text alerts">
      <h2>What they are</h2>
      <p>
        Walters Wedding text alerts let the site&rsquo;s owner, Gavin Walters, know when a guest sends an RSVP or a
        question through walters.wedding. Each alert carries what the guest wrote. They go to the owner&rsquo;s own phone
        only: guests and the public are never texted, and the phone numbers guests give on their RSVP are never
        messaged.
      </p>

      <h2>How to opt in</h2>
      <p>Text <strong>START</strong> to <strong>{number}</strong>. You&rsquo;ll get this reply:</p>
      <blockquote>{WELCOME}</blockquote>
      <p>Reply <strong>Y</strong> to confirm, and you&rsquo;ll get:</p>
      <blockquote>{CONFIRMED}</blockquote>
      <p>This number isn&rsquo;t advertised; the site&rsquo;s owner is the only subscriber.</p>

      <h2>What to expect</h2>
      <ul>
        <li>Message frequency varies with how many guests write, usually a few a week, and ends after the wedding.</li>
        <li>Message and data rates may apply.</li>
        <li>Reply <strong>STOP</strong> at any time to stop all messages, and <strong>START</strong> to begin again.</li>
        <li>Reply <strong>HELP</strong> for help, or email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</li>
        <li>Carriers are not liable for delayed or undelivered messages.</li>
      </ul>

      <h2>A sample alert</h2>
      <blockquote>
        Walters Wedding RSVP: Jane Doe<br />Yes - Jane Doe<br />Phone: (555) 123-4567<br />Reply STOP to opt out.
      </blockquote>

      <p>
        See the <Link href="/terms">terms</Link> and <Link href="/privacy">privacy policy</Link>. Mobile information is never
        shared with third parties or affiliates for marketing or promotional purposes.
      </p>
    </PolicyPage>
  );
}
