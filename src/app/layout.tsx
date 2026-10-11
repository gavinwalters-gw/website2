import type { Metadata, Viewport } from "next";
import { Newsreader, Pinyon_Script } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./site.css";

// Newsreader carries all the reading; its optical sizes keep body text sturdy and large titles fine.
// The script is for the page titles, as on the printed card. Neither is preloaded: the first screen has
// no text, so they'd only slow the envelope down. Invitation fetches them while the envelope is up.
const serif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-serif", preload: false });
const script = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--font-script", preload: false });

export const metadata: Metadata = {
  title: "Gavin & Ally | The Wedding",
  description: "A little envelope. A lifetime of love. Open your invitation to Gavin & Ally’s wedding.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2a211d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${serif.variable} ${script.variable}`}>
      <body>
        {children}
        {/* The envelope is painted before the page's own script has loaded, and a tap on it then would be
            lost, so this notes the tap and Invitation opens the envelope as soon as it's ready. */}
        <Script id="early-tap" strategy="beforeInteractive">
          {`document.addEventListener("click", function (event) { if (event.target.closest && event.target.closest(".gate-envelope")) window.envelopeTapped = true; }, true);`}
        </Script>
      </body>
    </html>
  );
}
