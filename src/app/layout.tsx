import type { Metadata, Viewport } from "next";
import { Permanent_Marker } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import "./site.css";

// Termes (a Times face) carries all the reading, as on the painted pieces' "Click Here". Pinyon Script is
// for titles, as on the pieces themselves, and Calgary's tall capitals for headings. The files are cut
// down to Latin. None is preloaded: the first screen has no text, so they'd only slow the envelope down.
// Invitation fetches them while the envelope is up.
const serif = localFont({
  src: [
    { path: "./fonts/termes-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/termes-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/termes-bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/termes-bold-italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-serif", adjustFontFallback: "Times New Roman", preload: false,
});
const script = localFont({ src: "./fonts/pinyon-script.woff2", variable: "--font-script", adjustFontFallback: false, preload: false });
const display = localFont({ src: "./fonts/calgary.woff2", variable: "--font-display", adjustFontFallback: "Times New Roman", preload: false });
// Permanent Marker is only for the groomsmen's cardboard signs.
const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--font-marker", preload: false });

export const metadata: Metadata = {
  title: "Walters Wedding",
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
    <html lang="en" data-scroll-behavior="smooth" className={`${serif.variable} ${script.variable} ${display.variable} ${marker.variable}`}>
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
