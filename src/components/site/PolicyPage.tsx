import Link from "next/link";
import type { ReactNode } from "react";

// The plain pages Twilio’s toll-free verification asks for: how the texts are opted into (/sms),
// their terms (/terms) and the site's privacy policy (/privacy). Paper and type as the rest of the site,
// nothing else.

export const CONTACT = "g.a.walterswedding@gmail.com";
export const UPDATED = "October 17, 2026";

// The number the alerts come from, as (888) 555-1234, read from the environment at build time so these
// pages show whichever number the site is sending from.
export function alertNumber() {
  const digits = (process.env.TWILIO_PHONE_NUMBER ?? "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : "our alerts number";
}

export default function PolicyPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="site paper policy">
      <article>
        <Link href="/" className="policy-home">Walters Wedding</Link>
        <h1 className="script">{title}</h1>
        <p className="quiet">Last updated {UPDATED}</p>
        {children}
        <nav className="policy-links">
          <Link href="/sms">Text messages</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </article>
    </main>
  );
}
