"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from "react";

export type Slide = { src: StaticImageData; alt: string; position?: string };

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const watchReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const prefersReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;

// Full-bleed photos, stacked, that fade from one to the next every few seconds behind everything else.
// The incoming photo fades in on top of the one before, which stays put underneath until it's covered,
// so the screen never dips between them. Only the photos shown so far are in the page, plus the next one
// once the first has loaded, so a phone isn't fetching the whole set up front; and since they're blurred,
// they're fetched at a little over half the screen's resolution. A swipe steps through them by hand. It rests while off screen
// or in a background tab, never starts on its own for anyone who prefers reduced motion, and the pause
// button stops it for good.
export default function Slideshow({ slides, interval = 6000 }: { slides: Slide[]; interval?: number }) {
  const root = useRef<HTMLElement>(null);
  const swipeFrom = useRef<number | null>(null);
  const count = slides.length;
  const loop = count > 1;
  const [{ current, previous }, setView] = useState({ current: 0, previous: -1 });
  const [resting, setResting] = useState(true);
  const [seen, setSeen] = useState<number[]>([0]);
  const [firstLoaded, setFirstLoaded] = useState(false);
  const [paused, setPaused] = useState<boolean | null>(null);
  const reducedMotion = useSyncExternalStore(watchReducedMotion, prefersReducedMotion, () => false);
  const stopped = paused ?? reducedMotion;

  const show = (next: number) => setView(view => (next === view.current ? view : { current: next, previous: view.current }));
  if (!seen.includes(current)) setSeen([...seen, current]);
  const upNext = (current + 1) % count;
  const inPage = (i: number) => seen.includes(i) || (firstLoaded && i === upNext);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    let onScreen = false;
    const update = () => setResting(!onScreen || document.hidden);
    const watcher = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    });
    watcher.observe(section);
    document.addEventListener("visibilitychange", update);
    return () => {
      watcher.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // Each photo gets its full turn, counted again from any manual change.
  useEffect(() => {
    if (!loop || stopped || resting) return;
    const timer = window.setTimeout(() => setView({ current: (current + 1) % count, previous: current }), interval);
    return () => window.clearTimeout(timer);
  }, [current, count, interval, loop, stopped, resting]);

  const startSwipe = (event: PointerEvent) => { swipeFrom.current = event.clientX; };
  const endSwipe = (event: PointerEvent) => {
    const from = swipeFrom.current;
    swipeFrom.current = null;
    if (from === null || !loop) return;
    const distance = event.clientX - from;
    if (Math.abs(distance) > 48) show((current + (distance < 0 ? 1 : count - 1)) % count);
  };

  return (
    <section ref={root} className="slideshow" aria-roledescription="carousel" aria-label="Photos">
      <div className="slides" onPointerDown={startSwipe} onPointerUp={endSwipe} onPointerCancel={() => { swipeFrom.current = null; }}>
        {slides.map((slide, i) => (
          <div
            key={i}
            className="slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== current || undefined}
            data-current={i === current || undefined}
            data-previous={i === previous || undefined}
          >
            {inPage(i) && <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 899px) 60vw, 80vw"
              draggable={false}
              placeholder="blur"
              fetchPriority={i === 0 ? "high" : "low"}
              onLoad={i === 0 ? () => setFirstLoaded(true) : undefined}
              style={{ objectPosition: slide.position }}
            />}
          </div>
        ))}
      </div>
      {loop && (
        <div className="slideshow-controls">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className="slide-dot"
              aria-label={`Show photo ${i + 1} of ${count}`}
              aria-current={i === current || undefined}
              onClick={() => show(i)}
            />
          ))}
          <button type="button" className="slide-pause" aria-label={stopped ? "Play slideshow" : "Pause slideshow"} onClick={() => setPaused(!stopped)}>
            <svg viewBox="0 0 10 10" aria-hidden="true">
              {stopped ? <path d="M2 1l7 4-7 4z" /> : <path d="M2 1h2v8H2zM6 1h2v8H6z" />}
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
