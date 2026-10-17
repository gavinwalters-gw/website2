import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { CONTACT, alertNumber } from "@/components/site/PolicyPage";

export const metadata: Metadata = { title: "Terms · Walters Wedding" };

export default function Terms() {
  return (
    <PolicyPage title="Terms">
      <p>
        walters.wedding is a personal website for Gavin &amp; Ally&rsquo;s wedding, run by Gavin Walters. It&rsquo;s not a
        business and sells nothing. By using it you agree to these terms.
      </p>

      <h2>Using the site</h2>
      <p>
        The site is for our guests: to read about the wedding, RSVP, and ask us questions. Please send only true
        information about yourself and the people in your party. Wedding details may change, and we&rsquo;ll update the
        site when they do.
      </p>

      <h2>Text messages</h2>
      <ul>
        <li>
          <strong>Program:</strong> Walters Wedding sends guests who opt in general texts about the wedding (RSVP
          reminders, schedule, venue, travel and hotel details, changes of plan, day-of reminders, and thank-yous), and tells the site&rsquo;s owner when a guest RSVPs or asks a question. Guests opt in by
          ticking the box on the RSVP form, or by texting START to {alertNumber()}. Opting in is never needed to RSVP.{" "}
          <Link href="/sms">More about the texts</Link>.
        </li>
        <li><strong>Frequency:</strong> varies: a few texts a month before the wedding, more in its final week, then none.</li>
        <li><strong>Cost:</strong> message and data rates may apply.</li>
        <li><strong>Opting out:</strong> reply STOP to any message to stop all messages. Reply START to resume.</li>
        <li><strong>Help:</strong> reply HELP, or email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</li>
        <li><strong>Carriers</strong> are not liable for delayed or undelivered messages.</li>
        <li>We never send marketing, and never text anyone who hasn&rsquo;t opted in.</li>
      </ul>

      <h2>Your information</h2>
      <p>How we keep and use what you send is in our <Link href="/privacy">privacy policy</Link>.</p>

      <h2>Changes</h2>
      <p>We may update these terms; the date at the top says when they last changed.</p>

      <h2>Contact</h2>
      <p><a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
    </PolicyPage>
  );
}
