"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import invitation from "@/content/gate/invitation.webp";
import saveTheDate from "@/content/buttons/save-the-date.webp";
import details from "@/content/buttons/details.webp";
import travel from "@/content/buttons/travel.webp";
import rsvp from "@/content/buttons/rsvp.webp";
import photos from "@/content/buttons/photos.webp";
import party from "@/content/buttons/wedding-party.webp";
import faq from "@/content/buttons/faq.webp";
import thingsToDo from "@/content/buttons/things-to-do.webp";
import registry from "@/content/buttons/registry.webp";
import dogsDressed from "@/content/clipart/dogs-dressed.webp";
import lily from "@/content/clipart/floral-lily.webp";
import cosmos from "@/content/clipart/floral-cosmos.webp";
import doves from "@/content/clipart/doves.webp";
import stem from "@/content/clipart/floral-stem.webp";
import bloom from "@/content/clipart/floral-bloom.webp";
import greenery from "@/content/clipart/floral-greenery.webp";
import sprig from "@/content/clipart/floral-sprig.webp";
import peony from "@/content/clipart/floral-peony.webp";
import vase from "@/content/clipart/floral-vase.webp";
import romeSteps from "@/content/photos/rome-steps.webp";
import silo from "@/content/photos/silo.webp";
import cruwood from "@/content/photos/cruwood.webp";
import romeGarden from "@/content/photos/rome-garden.webp";
import ringPhoto from "@/content/photos/ring.webp";
import withTheDog from "@/content/photos/with-the-dog.webp";
import proposal from "@/content/photos/proposal.webp";
import romeStepsSitting from "@/content/photos/rome-steps-sitting.webp";
import romeTerrace from "@/content/photos/rome-terrace.webp";
import redbudWalk from "@/content/photos/redbud-walk.webp";
import tulipKiss from "@/content/photos/tulip-kiss.webp";
import riverfront from "@/content/photos/riverfront.webp";
import { guestMessage } from "@/content/wedding";
import Polaroids from "./Polaroids";
import { useArrange } from "./Arrange";
import { ARRANGING, BOARD, type Arranged, type Layout, type Place } from "./boardSize";
import { getLayout, placeOnBoard } from "./boards";

export type PageId = "date" | "details" | "travel" | "rsvp" | "photos" | "party" | "faq" | "todo" | "registry";

// Where a piece lies on the page: left, top and width in the page's units, and how far it's turned.
// The page is 100 units wide on phones and 160 on wide screens, and taller than the screen on both, so it
// scrolls. Phones give each piece a band of its own, left and right in turn, with a photo or a flower in
// the space beside it. On wide screens it's three screens of about 103 units each: the title, a strip of photos and
// the Save the Date; then the details, RSVP, questions, travel and wedding party; then the registry,
// photos and things to do. A note to the guests and the dogs finish it, below the board.
type Spot = [x: number, y: number, width: number, tilt: number];
const PHONE = BOARD.phone;
const WIDE = BOARD.wide;

const title: { phone: Spot; wide: Spot } = { phone: [0.3, 1, 100, 0], wide: [1.8, 2.3, 160, 0] };
// The strip under the title: the photos glide slowly through it, round and round, and it can be swiped.
// It's this many times as wide as it is tall (the same as .banner in site.css), a little taller on phones.
const banner: { phone: Spot; wide: Spot; photos: StaticImageData[] } = {
  phone: [1, 15.6, 98, 0], wide: [4, 12.6, 152, 0],
  photos: [romeSteps, silo, cruwood, proposal, romeStepsSitting, redbudWalk, withTheDog],
};
const BANNER_RATIO = { phone: 3.2, wide: 148.5 / 38.4 };

// The pieces on the page, in reading order (the order they drop in and are tabbed through).
const pieces: { id: PageId; art: StaticImageData; label: string; phone: Spot; wide: Spot }[] = [
  { id: "date", art: saveTheDate, label: "Save the date: June 13, 2027 in Grand Blanc", phone: [15.9, 48.5, 63.3, 0], wide: [55.4, 52.9, 50.6, 0] },
  { id: "details", art: details, label: "The details", phone: [2.9, 105, 38.2, -2], wide: [10.5, 96.6, 27.4, 0] },
  { id: "rsvp", art: rsvp, label: "Kindly RSVP", phone: [54.6, 175.8, 45.1, 2], wide: [65.2, 121, 31.9, 0] },
  { id: "faq", art: faq, label: "Questions and answers", phone: [4.8, 244.9, 41.8, 0], wide: [109.8, 110.1, 33.3, 0] },
  { id: "travel", art: travel, label: "Travel and accommodations", phone: [46.6, 301.9, 49.1, 0], wide: [31.7, 179.1, 30.5, 0] },
  { id: "party", art: party, label: "The wedding party", phone: [2.3, 358, 34.4, -2], wide: [108.7, 164.5, 24.4, 2] },
  { id: "registry", art: registry, label: "Registry", phone: [44.6, 431.5, 54.7, 0], wide: [16.5, 222.4, 45.5, 0] },
  { id: "photos", art: photos, label: "Photos", phone: [24.3, 493.8, 45.8, 0], wide: [110.5, 222.7, 35.6, 0] },
  { id: "todo", art: thingsToDo, label: "Things to do nearby", phone: [-1.4, 574.8, 60.5, 0], wide: [61.5, 253.6, 43.6, 0] },
];

// Clip art scattered between the pieces, just for looks.
const clips: { key: string; art: StaticImageData; phone: Spot; wide: Spot }[] = [
  { key: "doves", art: doves, phone: [5.4, 307.3, 25.9, 0], wide: [10.5, 58.2, 20.8, 0] },
  { key: "lily", art: lily, phone: [85, 157.2, 12, 0], wide: [44.8, 91.6, 17.2, 0] },
  { key: "stem", art: stem, phone: [63.2, 254.3, 24.2, 0], wide: [121.5, 57.1, 13, 0] },
  { key: "cosmos", art: cosmos, phone: [83.1, 493.4, 15.1, 0], wide: [40.8, 130, 10.5, 0] },
  { key: "greenery", art: greenery, phone: [10.9, 541, 25.7, 0], wide: [137.5, 141.8, 20, 0] },
  { key: "bloom", art: bloom, phone: [22, 258, 10, 0], wide: [77.5, 179.6, 15, 0] },
  { key: "sprig", art: sprig, phone: [54, 408, 6, 0], wide: [10.9, 195, 9, 0] },
  { key: "peony", art: peony, phone: [69.6, 613.6, 28.2, 0], wide: [138, 202, 18, 0] },
  { key: "vase", art: vase, phone: [41.8, 643.1, 16.7, 0], wide: [77, 300.3, 11.2, 0] },
];

// Polaroids of the two of them taped between the pieces (none of them in the strip or on the Save the
// Date), each photo cropped to its own shape (width / height) around what matters in it.
const snaps: { key: string; photo: StaticImageData; ratio: number; focus?: string; phone: Spot; wide: Spot }[] = [
  { key: "rome-terrace", photo: romeTerrace, ratio: 75 / 80, focus: "60% 64%", phone: [59.6, 117.5, 30, 4], wide: [123.5, 78.4, 20.9, 4] },
  { key: "tulip-kiss", photo: tulipKiss, ratio: 64 / 60, focus: "52% 48%", phone: [6.3, 183.2, 34.3, -4], wide: [15.5, 148.5, 21.1, -4] },
  { key: "ring", photo: ringPhoto, ratio: 73 / 67, phone: [52.1, 368.3, 39.4, 3], wide: [74.3, 207, 24, 3] },
  { key: "riverfront", photo: riverfront, ratio: 81 / 76, focus: "56% 40%", phone: [4.1, 448.5, 32.8, 3], wide: [10.6, 259.3, 26.7, -3] },
  { key: "rome-garden", photo: romeGarden, ratio: 78 / 70, phone: [60.7, 541.8, 39.3, -4], wide: [125.4, 270, 25.7, 4] },
];

// Everything on the board by name, which is how where it's been dragged to is saved (boards.ts).
type Spots = { phone: Spot; wide: Spot };
const things: Record<string, Spots> = {
  title, banner,
  ...Object.fromEntries(pieces.map(piece => [piece.id, piece])),
  ...Object.fromEntries(snaps.map(snap => [snap.key, snap])),
  ...Object.fromEntries(clips.map(clip => [clip.key, clip])),
};
// The order things arrive in when the envelope opens, top to bottom, for phones and wide screens.
const arrival = (layout: Layout) => new Map(
  Object.entries(things).sort(([, a], [, b]) => a[layout][1] - b[layout][1]).map(([key], rank) => [key, rank]),
);
const ARRIVAL = { phone: arrival("phone"), wide: arrival("wide") };
const LAST = Object.keys(things).length;
// Where a thing lies once it's been dragged (keeping its tilt), for phones and wide screens.
const arrangedSpots = (key: string, arranged: Arranged): Spots => {
  const { phone, wide } = things[key];
  const moved = (spot: Spot, to?: Place): Spot => (to ? [to[0], to[1], to[2], spot[3]] : spot);
  return { phone: moved(phone, arranged.phone[key]), wide: moved(wide, arranged.wide[key]) };
};

// Whether the screen is wide enough for the wide layout (the same test as site.css).
const WIDE_SCREEN = "(min-aspect-ratio: 5/4)";
const watchScreen = (onChange: () => void) => {
  const query = window.matchMedia(WIDE_SCREEN);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const screenLayout = (): Layout => (window.matchMedia(WIDE_SCREEN).matches ? "wide" : "phone");

// How wide each piece is drawn (the table's width is set in site.css), wide screens first, so phones
// fetch only the pixels they show.
const sizes = ({ phone, wide }: Spots) => {
  const share = wide[2] / WIDE.width;
  return `(min-aspect-ratio: 5/4) min(${(share * 96).toFixed(1)}vw, ${(share * 1400).toFixed(0)}px), ${(phone[2] * 0.96).toFixed(1)}vw`;
};
const place = (key: string, { phone, wide }: Spots, i: number) => ({
  "--i": i, "--pr": ARRIVAL.phone.get(key), "--wr": ARRIVAL.wide.get(key),
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
// But the address is Next's too: its router rewrites it from its own copy now and then, telling no one.
// So the open page is kept here, and taken from the address only when the site loads or the guest goes
// back or forward. Read afresh on every render, a rewrite that dropped the #page would close the page
// the next time anything changed, and one that brought it back would leave the table ignoring every tap.
const isPage = (id: string): id is PageId => pieces.some(piece => piece.id === id);
const fromAddress = () => {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return isPage(id) ? id : null;
};
let open: PageId | null | undefined; // not yet read from the address
const currentPage = () => (open === undefined ? (open = fromAddress()) : open);
const listeners = new Set<() => void>();
const watchPage = (onChange: () => void) => {
  const moved = () => {
    open = fromAddress();
    onChange();
  };
  listeners.add(onChange);
  window.addEventListener("popstate", moved);
  window.addEventListener("hashchange", moved);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("popstate", moved);
    window.removeEventListener("hashchange", moved);
  };
};
// Opening a page from the table adds a history entry marked as such; moving between pages replaces it,
// so closing always lands back on the table.
const go = (page: PageId | null, how: "push" | "replace") => {
  open = page;
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
  const strip = useRef<HTMLDivElement>(null);
  const envelope = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef(new Map<PageId, HTMLAnchorElement>());
  const returnTo = useRef<HTMLElement | null>(null);
  const board = useRef<HTMLElement>(null);
  const keyed = useRef(false); // the envelope was opened from the keyboard

  // While the board can be laid out by hand (ARRANGING), where things have been dragged to on the live
  // site, which is the same for everyone. Otherwise everything lies where it's set out above.
  const [arranged, setArranged] = useState<Arranged>({ phone: {}, wide: {} });
  const layout = useSyncExternalStore<Layout>(watchScreen, screenLayout, () => "phone");
  useEffect(() => {
    if (ARRANGING) getLayout().then(setArranged).catch(() => {});
  }, []);
  const spotsOf = (key: string) => arrangedSpots(key, arranged);
  useArrange(board, {
    enabled: ARRANGING && stage === "table" && !shown,
    layout,
    placeOf: key => spotsOf(key)[layout].slice(0, 3) as Place,
    onPlace: (key, at) => {
      setArranged(current => ({ ...current, [layout]: { ...current[layout], [key]: at } }));
      placeOnBoard(layout, key, at).catch(() => {});
    },
  });

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

  // The envelope goes once it's open, so focus moves on to the first piece rather than being lost.
  useEffect(() => {
    if (stage !== "table" || !keyed.current) return;
    keyed.current = false;
    pieceRefs.current.get(pieces[0].id)?.focus({ preventScroll: true });
  }, [stage]);

  const envelopeShown = () => whenIdle(() => {
    fetchFonts();
    setWarm(true);
  });

  const openEnvelope = () => {
    if (stage !== "envelope" || timer.current) return; // already opening
    keyed.current = document.activeElement?.matches(".gate-envelope:focus-visible") ?? false;
    if (reducedMotion()) {
      setStage("table");
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
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

  // The photo strip glides along by itself, and the guest can swipe it too. It holds the photos twice, so
  // on reaching the second set it steps back one set, which looks the same. It waits while a finger is on
  // it, for a moment after it's been swiped, and while a page covers it; scrolling the page or tapping
  // elsewhere doesn't stop it. Phones get a quicker pace than its size alone would give, or the strip
  // would seem to stand still. It scrolls by whole pixels and the track is nudged the fraction between,
  // so it glides rather than ticks, and it eases back up to pace after stopping.
  useEffect(() => {
    const box = strip.current;
    const track = box?.firstElementChild as HTMLElement | null;
    if (!box || !track || stage !== "table" || reducedMotion()) return;
    let at = box.scrollLeft, speed = 0, then = 0, held = false, restUntil = 0, frame = 0;
    const rest = () => { restUntil = performance.now() + 2500; };
    const nudge = (by: number) => { track.style.transform = by ? `translate3d(${-by}px, 0, 0)` : ""; };
    const glide = (now: number) => {
      frame = requestAnimationFrame(glide);
      const elapsed = Math.min(now - (then || now), 50);
      then = now;
      if (held || now < restUntil || sheet.current?.hidden === false) { speed = 0; return; }
      const pace = Math.max(22, box.clientHeight / 10);
      speed = pace - (pace - speed) * Math.exp(-elapsed / 600);
      at += speed * elapsed / 1000;
      if (at >= box.scrollWidth / 2) at -= box.scrollWidth / 2;
      const whole = Math.floor(at);
      if (box.scrollLeft !== whole) box.scrollLeft = whole;
      nudge(at - whole);
    };
    // A scroll that isn't the glide's own is the guest's.
    const scrolled = () => {
      if (Math.abs(box.scrollLeft - Math.floor(at)) < 2) return;
      nudge(0);
      at = box.scrollLeft;
      if (!held && at <= 0) at = box.scrollLeft = box.scrollWidth / 2;
      rest();
    };
    // A finger is followed by its touch events: its pointer is cancelled as soon as the browser takes
    // the swipe over, while the finger is still down.
    const hold = () => { held = true; };
    const letGo = (event: PointerEvent | TouchEvent) => {
      if ("touches" in event ? event.touches.length === 0 : event.pointerType !== "touch") held = false;
    };
    box.addEventListener("scroll", scrolled, { passive: true });
    box.addEventListener("pointerdown", hold);
    box.addEventListener("touchstart", hold, { passive: true });
    window.addEventListener("pointerup", letGo);
    window.addEventListener("pointercancel", letGo);
    window.addEventListener("touchend", letGo);
    window.addEventListener("touchcancel", letGo);
    frame = requestAnimationFrame(glide);
    return () => {
      cancelAnimationFrame(frame);
      box.removeEventListener("scroll", scrolled);
      box.removeEventListener("pointerdown", hold);
      box.removeEventListener("touchstart", hold);
      window.removeEventListener("pointerup", letGo);
      window.removeEventListener("pointercancel", letGo);
      window.removeEventListener("touchend", letGo);
      window.removeEventListener("touchcancel", letGo);
      nudge(0);
    };
  }, [stage]);

  const openPage = (event: MouseEvent, id: PageId) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (currentPage()) return; // a second quick tap, landing before the page covers the table
    origin.current = id;
    go(id, "push");
  };

  // Links between pages (the RSVP button under the date) swap one page for the other.
  useEffect(() => {
    const follow = (event: globalThis.MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
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
      let gone = false;
      const done = () => {
        if (gone) return;
        gone = true;
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
      // If the shrink is held up (the browser stops animating), the sheet still goes, or it would sit
      // there unseen over the table, keeping it from being tapped or scrolled.
      const late = window.setTimeout(done, 900);
      return () => window.clearTimeout(late);
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
        <nav ref={board} className="pieces" aria-label="The invitation">
          <p className="board-title" data-spot="title" style={place("title", spotsOf("title"), 0)} aria-hidden="true">Walters Wedding</p>
          <div ref={strip} className="banner" data-spot="banner" style={place("banner", spotsOf("banner"), 0)} aria-hidden="true">
            {/* The photos twice over, so the strip can slide by one set and start again without a seam.
                They're all fetched while the envelope is up, not as each slides into view, and show
                blurred until they arrive. */}
            <div className="banner-track">
              {(warm || stage === "table") && [0, 1].flatMap(round => banner.photos.map(photo => {
                const share = photo.width / photo.height;
                return (
                  <Image
                    key={`${round}-${photo.src}`}
                    src={photo}
                    alt=""
                    sizes={sizes({ phone: [0, 0, spotsOf("banner").phone[2] * share / BANNER_RATIO.phone, 0], wide: [0, 0, spotsOf("banner").wide[2] * share / BANNER_RATIO.wide, 0] })}
                    loading="eager"
                    placeholder="blur"
                    draggable={false}
                  />
                );
              }))}
            </div>
          </div>
          {pieces.map((piece, i) => (
            <a
              key={piece.id}
              ref={link => { if (link) pieceRefs.current.set(piece.id, link); }}
              href={`#${piece.id}`}
              className={`piece piece-${piece.id}`}
              data-spot={piece.id}
              style={{ ...place(piece.id, spotsOf(piece.id), i), aspectRatio: `${piece.art.width} / ${piece.art.height}` }}
              aria-label={piece.label}
              onClick={event => openPage(event, piece.id)}
            >
              {(warm || stage === "table") && <Image src={piece.art} alt="" sizes={sizes(spotsOf(piece.id))} draggable={false} />}
            </a>
          ))}
          {snaps.map((snap, i) => (
            <span key={snap.key} className="decor snap" data-spot={snap.key} style={place(snap.key, spotsOf(snap.key), i)} aria-hidden="true">
              {(warm || stage === "table") && <Image src={snap.photo} alt="" style={{ aspectRatio: snap.ratio, objectPosition: snap.focus }} sizes={sizes(spotsOf(snap.key))} draggable={false} />}
            </span>
          ))}
          {clips.map((clip, i) => (
            <span
              key={clip.key}
              className="decor"
              data-spot={clip.key}
              style={{ ...place(clip.key, spotsOf(clip.key), i), aspectRatio: `${clip.art.width} / ${clip.art.height}` }}
              aria-hidden="true"
            >
              {(warm || stage === "table") && <Image src={clip.art} alt="" sizes={sizes(spotsOf(clip.key))} draggable={false} />}
            </span>
          ))}
        </nav>
        <footer className="send-off" style={{ "--r": LAST } as CSSProperties}>
          <p>{guestMessage.text}<span className="send-off-from">{guestMessage.from}</span></p>
          {(warm || stage === "table") && <Image src={dogsDressed} alt="" sizes="180px" draggable={false} />}
        </footer>
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
