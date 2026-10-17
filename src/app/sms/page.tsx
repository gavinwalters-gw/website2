import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { CONTACT } from "@/components/site/PolicyPage";
import { INVITE, KEYWORD, KEYWORD_CONFIRMED, KEYWORD_WELCOME, TEXT_NUMBER } from "@/content/texts";

export const metadata: Metadata = { title: "Text messages · Walters Wedding" };

export default function Sms() {
  return (
    <PolicyPage title="Text messages">
      <h2>What they are</h2>
      <p>Walters Wedding sends two kinds of texts, only to people who have signed up for them:</p>
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
      <p>We never send marketing, and no one is texted without signing up by text first.</p>

      <h2>How to sign up</h2>
      <p>
        Text <strong>{KEYWORD}</strong> to <strong>{TEXT_NUMBER}</strong>. Guests are invited to after they RSVP on
        walters.wedding, where they see:
      </p>
      <blockquote>{INVITE}</blockquote>
      <p>Texting {KEYWORD} gets this reply:</p>
      <blockquote>{KEYWORD_WELCOME}</blockquote>
      <p>Replying <strong>Y</strong> confirms, and gets:</p>
      <blockquote>{KEYWORD_CONFIRMED}</blockquote>
      <p>Nothing else is sent until someone has replied Y. Giving a phone number on the RSVP form does not sign anyone up.</p>

      <h2>What to expect</h2>
      <ul>
        <li>Up to 8 messages a month, fewer most months, ending after the wedding (June 13, 2027).</li>
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
