"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";
import { BOARD, keepOnBoard, type Layout, type Place } from "./boardSize";

type Point = { x: number; y: number };
type Options = { enabled: boolean; layout: Layout; placeOf: (key: string) => Place; onPlace: (key: string, place: Place) => void };

// Every painted piece, photo and flower on the board (anything marked data-spot) can be dragged somewhere
// else with a finger or the mouse, and pinched bigger or smaller, two fingers on a phone or the trackpad's
// pinch on a computer. A tap still opens a piece. The thing is drawn where the fingers put it as they
// move, and handed to onPlace when they let go.
export function useArrange(board: RefObject<HTMLElement | null>, { enabled, layout, placeOf, onPlace }: Options) {
  const startOf = useEffectEvent((key: string) => placeOf(key));
  const placed = useEffectEvent((key: string, place: Place) => onPlace(key, place));

  useEffect(() => {
    const box = board.current;
    if (!box || !enabled) return;
    const { width, height } = BOARD[layout];
    const unit = () => width / box.clientWidth; // board units to a pixel
    const show = (el: HTMLElement, [x, y, w]: Place) => {
      const p = layout === "phone" ? "p" : "w";
      el.style.setProperty(`--${p}x`, String(x / width));
      el.style.setProperty(`--${p}y`, String(y / height));
      el.style.setProperty(`--${p}w`, String(w / width));
    };

    const fingers = new Map<number, Point>();
    // What's held, and how the fingers were when the gesture last changed (a finger came or went), which
    // its movement is measured from.
    let held: { key: string; el: HTMLElement; place: Place; moved: boolean } | null = null;
    let from = { box: box.getBoundingClientRect(), at: { x: 0, y: 0 }, spread: 0, place: [0, 0, 0] as Place };
    let swallow = false;

    const measure = (rect: DOMRect) => {
      const points = [...fingers.values()];
      const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
      const spread = points.length > 1 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0;
      return { at: { x: (x - rect.left) * unit(), y: (y - rect.top) * unit() }, spread };
    };
    const restart = () => {
      if (!held) return;
      const rect = box.getBoundingClientRect();
      from = { box: rect, ...measure(rect), place: held.place };
    };

    const down = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (held) {
        // Another finger, wherever it lands: now it's a pinch.
        fingers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        restart();
        return;
      }
      const el = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-spot]") : null;
      if (!el || !box.contains(el)) return;
      swallow = false;
      fingers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      held = { key: el.dataset.spot!, el, place: startOf(el.dataset.spot!), moved: false };
      restart();
    };

    const move = (event: PointerEvent) => {
      if (!held || !fingers.has(event.pointerId)) return;
      fingers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const now = measure(from.box);
      if (!held.moved) {
        // Not until it's clearly a drag, so a tap still opens the piece.
        if (fingers.size < 2 && Math.hypot(now.at.x - from.at.x, now.at.y - from.at.y) / unit() < 6) return;
        held.moved = true;
        held.el.setAttribute("data-dragging", "");
      }
      // The point between the fingers stays on the same spot of the thing as it moves and grows.
      const scale = from.spread && now.spread ? now.spread / from.spread : 1;
      const [x, y, w] = from.place;
      held.place = keepOnBoard([now.at.x - (from.at.x - x) * scale, now.at.y - (from.at.y - y) * scale, w * scale], layout);
      show(held.el, held.place);
    };

    const up = (event: PointerEvent) => {
      if (!fingers.delete(event.pointerId) || !held) return;
      if (fingers.size) return restart(); // one finger of a pinch lifted: carry on with the other
      if (held.moved) {
        held.el.removeAttribute("data-dragging");
        swallow = true;
        placed(held.key, held.place);
      }
      held = null;
    };

    // A drag that ends over a piece mustn't open it.
    const click = (event: MouseEvent) => {
      if (!swallow) return;
      swallow = false;
      event.preventDefault();
      event.stopPropagation();
    };
    // Keep the page from scrolling or zooming under a drag or a pinch.
    const still = (event: Event) => { if (held) event.preventDefault(); };
    const noDrag = (event: DragEvent) => event.preventDefault();

    // The trackpad's pinch arrives as a wheel with the control key held.
    let pinched: { key: string; el: HTMLElement; place: Place; timer: number } | null = null;
    const wheel = (event: WheelEvent) => {
      const el = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-spot]") : null;
      if (!event.ctrlKey || !el) return;
      event.preventDefault();
      const key = el.dataset.spot!;
      if (pinched?.key !== key) pinched = { key, el, place: startOf(key), timer: 0 };
      const rect = box.getBoundingClientRect();
      const at = { x: (event.clientX - rect.left) * unit(), y: (event.clientY - rect.top) * unit() };
      const scale = Math.exp(-event.deltaY / 100);
      const [x, y, w] = pinched.place;
      pinched.place = keepOnBoard([at.x - (at.x - x) * scale, at.y - (at.y - y) * scale, w * scale], layout);
      show(el, pinched.place);
      window.clearTimeout(pinched.timer);
      const done = pinched;
      pinched.timer = window.setTimeout(() => { placed(done.key, done.place); pinched = null; }, 300);
    };

    document.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    box.addEventListener("click", click, true);
    box.addEventListener("dragstart", noDrag);
    box.addEventListener("wheel", wheel, { passive: false });
    document.addEventListener("touchmove", still, { passive: false });
    document.addEventListener("gesturestart", still);
    box.setAttribute("data-arranging", "");
    return () => {
      document.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      box.removeEventListener("click", click, true);
      box.removeEventListener("dragstart", noDrag);
      box.removeEventListener("wheel", wheel);
      document.removeEventListener("touchmove", still);
      document.removeEventListener("gesturestart", still);
      box.removeAttribute("data-arranging");
      held?.el.removeAttribute("data-dragging");
      if (pinched) window.clearTimeout(pinched.timer);
    };
  }, [board, enabled, layout]);
}
