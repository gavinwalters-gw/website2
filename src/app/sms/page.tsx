import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { CONTACT, alertNumber } from "@/components/site/PolicyPage";
import { KEYWORD_CONFIRMED, KEYWORD_WELCOME, RSVP_CONSENT, RSVP_WELCOME } from "@/content/texts";

export const metadata: Metadata = { title: "Text messages · Walters Wedding" };

export default function Sms() {
  const number = alertNumber();
  return (
    <PolicyPage title="Text messages">
      <h2>What they are</h2>
      <p>Walters Wedding sends two kinds of texts, only to people who have asked for them:</p>
      <ul>
        <li>
          <strong>Wedding texts for guests</strong>: general news and information about the wedding, such as RSVP
          reminders, schedule and venue details, travel, hotel and weather notes, changes of plan, day-of reminders, and a
          thank-you with where to find the photos afterwards.
        </li>
        <li>
          <strong>RSVP alerts for the couple</strong>, telling the site&rsquo;s owner, Gavin Walters, when a guest RSVPs or
          asks a question.
        </li>
      </ul>
      <p>We never send marketing, and nothing is sent to anyone who hasn&rsquo;t opted in.</p>

      <h2>How guests opt in: the RSVP form</h2>
      <p>
        When guests RSVP at walters.wedding, they give a phone number. Below it is a checkbox, left unticked, and it
        isn&rsquo;t needed to RSVP. Next to it:
      </p>
      <blockquote>☐ {RSVP_CONSENT} Terms · Privacy</blockquote>
      <p>Only guests who tick it get update texts. Straight after their RSVP they receive:</p>
      <blockquote>{RSVP_WELCOME}</blockquote>

      <h2>Or by text</h2>
      <p>Text <strong>START</strong> to <strong>{number}</strong>. You&rsquo;ll get this reply:</p>
      <blockquote>{KEYWORD_WELCOME}</blockquote>
      <p>Reply <strong>Y</strong> to confirm, and you&rsquo;ll get:</p>
      <blockquote>{KEYWORD_CONFIRMED}</blockquote>

      <h2>What to expect</h2>
      <ul>
        <li>Message frequency varies: a few texts a month leading up to the wedding (June 13, 2027), more in its final week, then none.</li>
        <li>Message and data rates may apply.</li>
        <li>Reply <strong>STOP</strong> at any time to stop all messages, and <strong>START</strong> to begin again.</li>
        <li>Reply <strong>HELP</strong> for help, or email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</li>
        <li>Carriers are not liable for delayed or undelivered messages.</li>
      </ul>

      <h2>Sample messages</h2>
      <blockquote>
        Walters Wedding: Reminder, the ceremony starts at 4 PM on Sunday at Cruwood, with guests arriving from 3:30.
        Reply STOP to opt out.
      </blockquote>
      <blockquote>
        Walters Wedding: Hotel rooms near Cruwood are filling up. Details are at walters.wedding under Travel. Reply STOP to
        opt out.
      </blockquote>
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
