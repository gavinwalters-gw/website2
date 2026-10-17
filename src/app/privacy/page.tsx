import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { CONTACT } from "@/components/site/PolicyPage";

export const metadata: Metadata = { title: "Privacy · Walters Wedding" };

export default function Privacy() {
  return (
    <PolicyPage title="Privacy">
      <p>
        walters.wedding is a personal website for Gavin &amp; Ally&rsquo;s wedding, run by Gavin Walters. This is what we
        collect, why, and what we do with it.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>RSVPs:</strong> the names in your party, whether each is coming, your phone number, and anything else you
          choose to add: an email, dietary needs, a song request, a note, a photo, and whether you&rsquo;d like wedding update
          texts.
        </li>
        <li><strong>Questions:</strong> your name, email and question.</li>
        <li>The site sets no tracking or advertising cookies.</li>
      </ul>

      <h2>How we use it</h2>
      <p>
        Only to plan the wedding and to reach you about it: the guest count, seating, meals, and answering your questions.
        If you tick the box for wedding texts, we text you news and information about the wedding at that number until
        you reply STOP. If
        you don&rsquo;t, we only use your number to reach you personally about the wedding. When an RSVP or question
        arrives, its details are also texted to Gavin&rsquo;s own phone. More in <Link href="/sms">text messages</Link>.
      </p>

      <h2>Where it&rsquo;s kept</h2>
      <p>
        In a private database run by Neon, behind a site hosted by Vercel, and sometimes in a private Google spreadsheet
        and our wedding email. Texts are sent through Twilio. These services hold it only so we can use it as above.
      </p>

      <h2>Sharing</h2>
      <p>
        We don&rsquo;t sell, rent or share your information. No mobile information will be shared with third parties or
        affiliates for marketing or promotional purposes. Text messaging opt-in data and consent are not shared with any
        third parties.
      </p>

      <h2>Keeping and deleting</h2>
      <p>
        We keep it only as long as the wedding needs it. Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> to see, change or
        delete what you sent, and we&rsquo;ll take care of it.
      </p>

      <h2>Changes</h2>
      <p>We may update this policy; the date at the top says when it last changed.</p>
    </PolicyPage>
  );
}
