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

      <h2>Text alerts</h2>
      <ul>
        <li>
          <strong>Program:</strong> Walters Wedding text alerts tell the site&rsquo;s owner when a guest sends an RSVP or a
          question. Only the owner receives them, after opting in by texting START to {alertNumber()}.{" "}
          <Link href="/sms">More about the alerts</Link>.
        </li>
        <li><strong>Frequency:</strong> varies, usually a few messages a week, ending after the wedding.</li>
        <li><strong>Cost:</strong> message and data rates may apply.</li>
        <li><strong>Opting out:</strong> reply STOP to any message to stop all messages. Reply START to resume.</li>
        <li><strong>Help:</strong> reply HELP, or email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</li>
        <li><strong>Carriers</strong> are not liable for delayed or undelivered messages.</li>
        <li>We never text guests, and never use guests&rsquo; phone numbers for marketing.</li>
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
