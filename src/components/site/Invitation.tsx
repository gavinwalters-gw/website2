"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import invitation from "@/content/gate/invitation.webp";
import saveTheDate from "@/content/collage/save-the-date.webp";
import details from "@/content/collage/details.webp";
import travel from "@/content/collage/travel.webp";
import rsvp from "@/content/collage/rsvp.webp";
import photos from "@/content/collage/photos.webp";
import party from "@/content/collage/wedding-party.webp";
import faq from "@/content/collage/faq.webp";
import thingsToDo from "@/content/collage/things-to-do.webp";
import registry from "@/content/collage/registry.webp";
import dogsDressed from "@/content/clipart/dogs-dressed.webp";
import greenery from "@/content/clipart/floral-greenery.webp";
import peony from "@/content/clipart/floral-peony.webp";
import stem from "@/content/clipart/floral-stem.webp";
import Polaroids from "./Polaroids";
import { photos as couplePhotos } from "@/content/wedding";

export type PageId = "date" | "details" | "travel" | "rsvp" | "photos" | "party" | "faq" | "todo" | "registry";

// Where a piece lies on the page: left, top and width in the page's units, and how far it's turned.
// The page is 100 units wide on phones and 160 on wide screens, and taller than the screen on both, so it
// scrolls like a scrapbook page.
type Spot = [x: number, y: number, width: number, tilt: number];
const PHONE = { width: 100, height: 285 };
const WIDE = { width: 160, height: 118 };

// The pieces on the page, most important first (the order they drop in and are tabbed through). They sit
// in little groups like a scrapbook: the Save the Date with the RSVP and questions at the top, then the
// details and travel, then the registry and things to do, then the wedding party and photos.
const pieces: { id: PageId; art: StaticImageData; label: string; phone: Spot; wide: Spot }[] = [
  { id: "date", art: saveTheDate, label: "Save the date: June 13, 2027 in Grand Blanc", phone: [4, 8, 64, -2], wide: [12, 8, 54, -2] },
  { id: "rsvp", art: rsvp, label: "Kindly RSVP", phone: [69, 24, 28, 4], wide: [70, 5, 19, 5] },
  { id: "faq", art: faq, label: "Questions and answers", phone: [8, 66, 38, -4], wide: [72, 38, 22, -4] },
  { id: "details", art: details, label: "The details", phone: [56, 76, 31, 3], wide: [114, 10, 18, -4] },
  { id: "travel", art: travel, label: "Travel and accommodations", phone: [6, 110, 50, -3], wide: [122, 40, 32, 3] },
  { id: "registry", art: registry, label: "Registry", phone: [4, 158, 54, -2], wide: [24, 64, 36, -2] },
  { id: "todo", art: thingsToDo, label: "Things to do nearby", phone: [62, 166, 34, 3], wide: [57, 91, 26, 3] },
  { id: "party", art: party, label: "The wedding party", phone: [8, 204, 32, -3], wide: [96, 73, 21, -4] },
  { id: "photos", art: photos, label: "Photos", phone: [50, 213, 44, 4], wide: [121, 88, 24, 3] },
];

// What else is stuck down, behind the pieces, just for looks: polaroids of the two of them (taped or
// pinned, with a word written underneath) and watercolour flowers tucked under the groups' corners, and a
// note signed off with a heart in pink pen and the dogs. Some only fit on wide screens.
type Decor = { phone?: Spot; wide: Spot } & (
  | { kind: "photo"; photo: number; caption: string; hold: "pin" | "tape" }
  | { kind: "note"; text: string }
  | { kind: "clip"; art: StaticImageData }
  | { kind: "heart" }
);
const decor: Decor[] = [
  { kind: "photo", photo: 2, caption: "she said yes!", hold: "tape", phone: [74, 2, 19, 8], wide: [2, 3, 13, -10] },
  { kind: "clip", art: greenery, phone: [38, 56, 18, 22], wide: [86, 20, 12, 30] },
  { kind: "photo", photo: 1, caption: "Rome", hold: "pin", phone: [70, 250, 20, -5], wide: [104, 6, 13, -7] },
  { kind: "clip", art: peony, wide: [117, 60, 10, 8] },
  { kind: "photo", photo: 0, caption: "us", hold: "tape", phone: [62, 124, 22, 6], wide: [45, 84, 12, -7] },
  { kind: "photo", photo: 3, caption: "the three of us", hold: "pin", wide: [117, 67, 13, 8] },
  { kind: "clip", art: stem, wide: [89, 92, 8, -16] },
  { kind: "note", text: "We can’t wait to celebrate with you!", phone: [10, 256, 28, -3], wide: [10, 94, 17, -3] },
  { kind: "heart", phone: [33, 252, 6, 16], wide: [25.5, 91.5, 4, 16] },
  { kind: "clip", art: dogsDressed, phone: [40, 262, 27, -2], wide: [29, 103, 14, -2] },
];

// How wide each piece is drawn (the table's width is set in site.css), wide screens first, so phones
// fetch only the pixels they show.
const sizes = ({ phone, wide }: { phone?: Spot; wide: Spot }) => {
  const share = wide[2] / WIDE.width;
  return `(min-aspect-ratio: 5/4) min(${(share * 96).toFixed(1)}vw, ${(share * 1400).toFixed(0)}px), ${((phone ?? wide)[2] * 0.92).toFixed(1)}vw`;
};
const place = ({ phone = [0, 0, 0, 0], wide }: { phone?: Spot; wide: Spot }, i: number) => ({
  "--i": i,
  "--px": phone[0] / PHONE.width, "--py": phone[1] / PHONE.height, "--pw": phone[2] / PHONE.width, "--pt": `${phone[3]}deg`,
  "--wx": wide[0] / WIDE.width, "--wy": wide[1] / WIDE.height, "--ww": wide[2] / WIDE.width, "--wt": `${wide[3]}deg`,
}) as CSSProperties;

// Once the envelope is on screen, fetch what the next screens need while the guest is looking at it:
// the fonts (only the Latin files the pages use) and, via `warm`, the paintings on the table.
const whenIdle = (then: () => void) => {
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(then, { timeout: 1500 });
  else setTimeout(then, 300); // where it is missing (Safari)
};
const coversLatin = (range: string) => range.split(",").some(part => {
  const [from, to = from] = part.trim().replace(/^U\+/i, "").split("-");
  return parseInt(from.replace(/\?/g, "0"), 16) <= 0x61 && 0x61 <= parseInt(to.replace(/\?/g, "f"), 16);
});
const fetchFonts = () => document.fonts.forEach(face => { if (coversLatin(face.unicodeRange)) face.load().catch(() => {}); });

// A tap on the envelope before the page's script has loaded is noted by a little script in the layout,
// and the envelope opens as soon as it can.
declare global { interface Window { envelopeTapped?: boolean } }

// Which page is open lives in the address (/#rsvp), so the back button closes it and a link can open it.
const isPage = (id: string): id is PageId => pieces.some(piece => piece.id === id);
const currentPage = () => {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return isPage(id) ? id : null;
};
const listeners = new Set<() => void>();
const watchPage = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
  };
};
// Opening a page from the table adds a history entry marked as such; moving between pages replaces it,
// so closing always lands back on the table.
const go = (page: PageId | null, how: "push" | "replace") => {
  const url = page ? `#${page}` : window.location.pathname + window.location.search;
  if (how === "push") window.history.pushState({ fromTable: true }, "", url);
  else window.history.replaceState(window.history.state, "", url);
  listeners.forEach(notify => notify());
};

// Closing steps back to the table's history entry when there is one, so forward reopens the page.
const close = () => {
  if (window.history.state?.fromTable) window.history.back();
  else go(null, "replace");
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = "cubic-bezier(.2, .8, .2, 1)";
const GROW = "cubic-bezier(.45, 0, .1, 1)"; // eases out of the piece as well as into the screen, so the growth reads
const WASH_IN = 750; // how long the screen takes to wash to white after the envelope is tapped

// The scalloped edge of the close badge, like the lace on the Save the Date heart.
const SCALLOP = "M32 8A6.71 6.71 0 0 1 44 11.22A6.71 6.71 0 0 1 52.78 20A6.71 6.71 0 0 1 56 32A6.71 6.71 0 0 1 52.78 44A6.71 6.71 0 0 1 44 52.78A6.71 6.71 0 0 1 32 56A6.71 6.71 0 0 1 20 52.78A6.71 6.71 0 0 1 11.22 44A6.71 6.71 0 0 1 8 32A6.71 6.71 0 0 1 11.22 20A6.71 6.71 0 0 1 20 11.22A6.71 6.71 0 0 1 32 8Z";

// The RSVP piece opens as an envelope: it comes up from the piece to the middle of the screen, the flap
// opens, the card inside slides up, and the page grows out of the card. Returns a cleanup for the effect.
function growFromEnvelope(fx: HTMLDivElement, box: HTMLElement, body: HTMLElement | null, piece: HTMLElement) {
  const width = Math.min(window.innerWidth * 0.78, 420);
  const height = width * 0.66;
  const left = (window.innerWidth - width) / 2;
  const top = window.innerHeight * 0.58 - height / 2;
  const rise = height * 0.6;
  Object.assign(fx.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` });
  fx.setAttribute("data-playing", "");

  const from = piece.getBoundingClientRect();
  const scale = from.width / width;
  const dx = from.left + from.width / 2 - (left + width / 2);
  const dy = from.top + from.height / 2 - (top + height / 2);
  const part = (name: string) => fx.querySelector<HTMLElement>(`.rsvp-envelope-${name}`)!;

  fx.animate(
    [{ transform: `translate(${dx}px, ${dy}px) scale(${scale}) rotate(3deg)`, opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: "none", opacity: 1 }],
    { duration: 560, easing: GROW },
  );
  part("flap").animate([{ transform: "rotateX(0deg)", zIndex: 4 }, { transform: "rotateX(180deg)", zIndex: 0 }], { duration: 420, delay: 520, easing: "ease-in-out", fill: "both" });
  part("card").animate([{ transform: "none" }, { transform: `translateY(${-rise}px)` }], { duration: 520, delay: 900, easing: EASE, fill: "both" });

  // The card's outline once it's out, which the page grows from.
  const card = { left: left + width * 0.05, top: top + height * 0.05 - rise, right: left + width * 0.95, bottom: top + height * 0.95 - rise };
  const outline = `inset(${card.top}px ${window.innerWidth - card.right}px ${window.innerHeight - card.bottom}px ${card.left}px round 4px)`;
  const grow = box.animate(
    [{ clipPath: outline, opacity: 0 }, { opacity: 1, offset: 0.12 }, { clipPath: "inset(0 round 0)", opacity: 1 }],
    { duration: 700, delay: 1380, easing: GROW, fill: "backwards" },
  );
  body?.animate(
    [{ opacity: 0, transform: "translateY(22px)" }, { opacity: 1, transform: "none" }],
    { duration: 520, delay: 1800, easing: EASE, fill: "backwards" },
  );
  grow.onfinish = () => fx.removeAttribute("data-playing");
  return () => {
    grow.onfinish = null;
    fx.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    fx.removeAttribute("data-playing");
  };
}

// The whole site. First the painted envelope over polaroids of the two of them; tapping it washes the
// screen to white, which clears onto clean paper and the painted pieces settling into place one after
// another. Each piece opens
// its page: a sheet of paper that grows out of the piece, with a lace-edged button that shrinks it back.
// The RSVP opens differently: an envelope comes up from the piece, opens, and the reply card slides out
// and grows into the page.
export default function Invitation({ children }: { children: ReactNode }) {
  const page = useSyncExternalStore(watchPage, currentPage, () => null);
  const [stage, setStage] = useState<"envelope" | "opening" | "table">("envelope");
  const [veil, setVeil] = useState<"in" | "out" | null>(null);
  // The page on screen, which stays a moment after the address has moved on so it can shrink away.
  const [shown, setShown] = useState<PageId | null>(null);
  const [warm, setWarm] = useState(false);
  const timer = useRef(0);
  const origin = useRef<PageId | null>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const envelope = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef(new Map<PageId, HTMLAnchorElement>());
  const returnTo = useRef<HTMLElement | null>(null);

  // A link straight to a page goes past the envelope.
  if (page && stage === "envelope") setStage("table");
  if (page && page !== shown) setShown(page);
  const leaving = shown !== null && page === null;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Once the table is live again (no longer inert), give focus back to the piece that was opened.
  useEffect(() => {
    if (shown) return;
    returnTo.current?.focus({ preventScroll: true });
    returnTo.current = null;
  }, [shown]);

  const envelopeShown = () => whenIdle(() => {
    fetchFonts();
    setWarm(true);
  });

  const openEnvelope = () => {
    if (stage !== "envelope" || timer.current) return; // already opening
    if (reducedMotion()) return setStage("table");
    setStage("opening");
    setVeil("in");
    timer.current = window.setTimeout(() => {
      setStage("table");
      window.scrollTo({ top: 0, behavior: "instant" });
      requestAnimationFrame(() => requestAnimationFrame(() => setVeil("out")));
    }, WASH_IN);
  };

  // A tap on the envelope that came before the page was ready opens it now.
  const openIfTapped = useEffectEvent(() => {
    if (window.envelopeTapped) openEnvelope();
  });
  useEffect(() => {
    const frame = requestAnimationFrame(openIfTapped);
    return () => cancelAnimationFrame(frame);
  }, []);

  const openPage = (event: MouseEvent, id: PageId) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    origin.current = id;
    go(id, "push");
  };

  // Links between pages (the RSVP button under the date) swap one page for the other.
  useEffect(() => {
    const follow = (event: globalThis.MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      const id = link?.getAttribute("href")?.slice(1) ?? "";
      if (!link || !isPage(id) || !sheet.current?.contains(link)) return;
      event.preventDefault();
      go(id, "replace");
    };
    document.addEventListener("click", follow);
    return () => document.removeEventListener("click", follow);
  }, []);

  useEffect(() => {
    if (!shown || leaving) return;
    const escape = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [shown, leaving]);

  // The sheet grows out of the piece that was tapped and shrinks back into it, clipped to the piece's
  // outline. Moving between pages, or arriving by link, just fades the new page in.
  useLayoutEffect(() => {
    const box = sheet.current;
    if (!box || !shown) return;
    box.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    const fx = envelope.current;
    fx?.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    fx?.removeAttribute("data-playing");
    const body = box.querySelector<HTMLElement>(`[data-page="${shown}"]`);
    const piece = pieceRefs.current.get(shown);
    const still = reducedMotion();
    const outline = () => {
      const r = piece!.getBoundingClientRect();
      return `inset(${r.top}px ${window.innerWidth - r.right}px ${window.innerHeight - r.bottom}px ${r.left}px round 32px)`;
    };

    if (leaving) {
      const done = () => {
        returnTo.current = piece ?? null;
        setShown(null);
        if (!still) piece?.animate([{ transform: "scale(1.05)" }, { transform: "none" }], { duration: 500, easing: EASE, composite: "add" });
      };
      if (still || !piece) {
        const frame = requestAnimationFrame(done);
        return () => cancelAnimationFrame(frame);
      }
      body?.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(10px)" }], { duration: 180, easing: "ease-in", fill: "forwards" });
      const shrink = box.animate(
        [{ clipPath: "inset(0 round 0)", opacity: 1 }, { opacity: 1, offset: 0.55 }, { clipPath: outline(), opacity: 0 }],
        { duration: 600, easing: GROW, fill: "forwards" },
      );
      shrink.onfinish = done;
      return;
    }

    box.scrollTop = 0;
    body?.focus({ preventScroll: true });
    const from = origin.current === shown && piece ? piece : null;
    origin.current = null;
    if (still) return;
    if (from && fx && shown === "rsvp") return growFromEnvelope(fx, box, body, from);
    if (from) {
      box.animate(
        [{ clipPath: outline(), opacity: 0 }, { opacity: 1, offset: 0.25 }, { clipPath: "inset(0 round 0)", opacity: 1 }],
        { duration: 720, easing: GROW },
      );
    }
    body?.animate(
      [{ opacity: 0, transform: "translateY(22px)" }, { opacity: 1, transform: "none" }],
      { duration: 520, delay: from ? 420 : 0, easing: EASE, fill: "backwards" },
    );
  }, [shown, leaving]);

  return (
    <>
      <div className="backdrop">
        {stage !== "table" && <Polaroids />}
      </div>

      {stage !== "table" && (
        <section className="gate" data-stage={stage} aria-label="Your invitation">
          <button type="button" className="gate-envelope" onClick={openEnvelope} aria-label="Open the invitation">
            <Image src={invitation} alt="" sizes="(max-aspect-ratio: 4/5) 150vw, min(94vw, 1180px)" preload onLoad={envelopeShown} />
          </button>
        </section>
      )}

      {/* The pieces come back to life as soon as a page starts shrinking away, so a tap then opens the next. */}
      <main className="table" data-arrived={stage === "table" || undefined} inert={stage !== "table" || (!!shown && !leaving)}>
        <nav className="pieces" aria-label="The invitation">
          {pieces.map((piece, i) => (
            <a
              key={piece.id}
              ref={link => { if (link) pieceRefs.current.set(piece.id, link); }}
              href={`#${piece.id}`}
              className={`piece piece-${piece.id}`}
              style={{ ...place(piece, i), aspectRatio: `${piece.art.width} / ${piece.art.height}` }}
              aria-label={piece.label}
              onClick={event => openPage(event, piece.id)}
            >
              {(warm || stage === "table") && <Image src={piece.art} alt="" sizes={sizes(piece)} draggable={false} />}
            </a>
          ))}
          {decor.map((item, i) => (
            <span
              key={i}
              className={`decor decor-${item.kind}${item.kind === "photo" ? ` decor-${item.hold}` : ""}${item.phone ? "" : " decor-wide"}`}
              style={{ ...place(item, i), "--tape": `${((i * 7) % 11) - 5}deg`, aspectRatio: item.kind === "clip" ? `${item.art.width} / ${item.art.height}` : undefined } as CSSProperties}
              aria-hidden="true"
            >
              {(warm || stage === "table") && item.kind === "clip" && <Image src={item.art} alt="" sizes={sizes(item)} draggable={false} />}
              {(warm || stage === "table") && item.kind === "photo" && <Image src={couplePhotos[item.photo].src} alt="" sizes={sizes(item)} draggable={false} />}
              {item.kind === "photo" && <span className="script">{item.caption}</span>}
              {item.kind === "note" && <span className="script">{item.text}</span>}
              {item.kind === "heart" && (
                <svg viewBox="0 0 100 92"><path d="M52 86C30 70 6 52 9 30 11 13 30 6 43 18 47 22 49 27 50 31 52 19 62 8 77 9 94 11 98 31 89 47 81 61 66 73 49 84 46 86 44 87 41 85" /></svg>
              )}
            </span>
          ))}
        </nav>
      </main>

      {/* The pages (one <article data-page> each) all stay in the sheet; the stylesheet shows the open one. */}
      <div ref={sheet} className="sheet" hidden={!shown} data-shown={shown ?? undefined} data-leaving={leaving || undefined}>
        <div className="sheet-bar">
          <button type="button" className="sheet-close" onClick={close} aria-label="Close and go back to the invitation">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <path className="sheet-close-lace" d={SCALLOP} />
              <circle className="sheet-close-stitch" cx="32" cy="32" r="18.5" />
              <path className="sheet-close-cross" d="M26 26l12 12M38 26L26 38" />
            </svg>
          </button>
        </div>
        {children}
      </div>

      <div ref={envelope} className="rsvp-envelope" aria-hidden="true">
        <div className="rsvp-envelope-back" />
        <div className="rsvp-envelope-card"><span className="script">Kindly RSVP</span></div>
        <div className="rsvp-envelope-pocket" />
        <div className="rsvp-envelope-flap" />
      </div>

      {veil && (
        <div className="gate-veil" data-state={veil} aria-hidden="true" onAnimationEnd={() => veil === "out" && setVeil(null)} />
      )}
    </>
  );
}
