import Link from "next/link";
import type { ReactNode } from "react";
import { textNumber } from "@/server/sms";

// The plain pages Twilio’s toll-free verification asks for: how the texts are opted into (/sms),
// their terms (/terms) and the site's privacy policy (/privacy). Paper and type as the rest of the site,
// nothing else.

export const CONTACT = "g.a.walterswedding@gmail.com";
export const UPDATED = "October 17, 2026";

export const alertNumber = () => textNumber() ?? "our texts number";

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
