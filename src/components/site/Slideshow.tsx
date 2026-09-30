"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export type Slide = { src: StaticImageData; alt: string; position?: string };

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const watchReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const prefersReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;

// Full-bleed photos that slide across every few seconds, behind the envelope. Native scroll snapping
// does the sliding; a copy of the first photo after the last lets it loop without rewinding, and the
// first photo sits first in the markup so it shows before any script runs. It rests while off screen
// or under a finger, never starts on its own for anyone who prefers reduced motion, and the pause
// button stops it for good.
export default function Slideshow({ slides, interval = 5000 }: { slides: Slide[]; interval?: number }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const count = slides.length;
  const loop = count > 1;
  const frame = useRef(0);
  const [current, setCurrent] = useState(0);
  const [near, setNear] = useState(false);
  const [paused, setPaused] = useState<boolean | null>(null);
  const reducedMotion = useSyncExternalStore(watchReducedMotion, prefersReducedMotion, () => false);
  const stopped = paused ?? reducedMotion;
  const frames = loop ? [...slides, slides[0]] : slides;

  // Keep the current photo lined up when the width changes.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let width = 0;
    const place = () => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      el.scrollTo({ left: frame.current * width, behavior: "instant" });
    };
    const observer = new ResizeObserver(place);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = track.current, section = root.current;
    if (!el || !section) return;
    let timer = 0, settling = 0, visible = false, holding = false;
    const at = () => Math.round(el.scrollLeft / el.clientWidth);
    const schedule = () => {
      window.clearTimeout(timer);
      if (loop && !stopped && visible && !holding && !document.hidden) {
        timer = window.setTimeout(() => el.scrollTo({ left: (at() + 1) * el.clientWidth, behavior: "smooth" }), interval);
      }
    };
    // Once a slide comes to rest: step off the copy onto the real first photo, then queue the next one.
    const settle = () => {
      let index = at();
      if (loop && index >= count) {
        index = 0;
        el.scrollTo({ left: 0, behavior: "instant" });
      }
      frame.current = index;
      setCurrent(index);
      schedule();
    };
    const scrolled = () => {
      window.clearTimeout(timer);
      window.clearTimeout(settling);
      settling = window.setTimeout(settle, 120);
    };
    const hold = () => { holding = true; window.clearTimeout(timer); };
    const release = () => { holding = false; schedule(); };
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) setNear(true);
      schedule();
    });
    watcher.observe(section);
    el.addEventListener("scroll", scrolled, { passive: true });
    el.addEventListener("pointerdown", hold);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(settling);
      watcher.disconnect();
      el.removeEventListener("scroll", scrolled);
      el.removeEventListener("pointerdown", hold);
      el.removeEventListener("pointerup", release);
      el.removeEventListener("pointercancel", release);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [count, interval, loop, stopped]);

  const show = (index: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: index * el.clientWidth, behavior: reducedMotion ? "instant" : "smooth" });
  };

  return (
    <section ref={root} className="slideshow" aria-roledescription="carousel" aria-label="Photos">
      <div ref={track} className="slides">
        {frames.map((slide, i) => {
          const copy = loop && i === count;
          return (
            <div
              key={i}
              className="slide"
              role={copy ? undefined : "group"}
              aria-roledescription={copy ? undefined : "slide"}
              aria-label={copy ? undefined : `${i + 1} of ${count}`}
              aria-hidden={copy || undefined}
            >
              <Image
                src={slide.src}
                alt={copy ? "" : slide.alt}
                fill
                sizes="100vw"
                placeholder="blur"
                loading={near || i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
                style={{ objectPosition: slide.position }}
              />
            </div>
          );
        })}
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
