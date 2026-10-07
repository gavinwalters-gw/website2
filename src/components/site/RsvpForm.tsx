"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { contactEmail } from "@/content/wedding";
import type { Match, Person } from "@/server/guestList";
import { submitRsvp, type RsvpState } from "./actions";

// Sent through a transition from onSubmit rather than the form's action, so a reply that comes back
// with something to fix keeps everything the guest typed.
export const dispatchFrom = (event: FormEvent<HTMLFormElement>, dispatch: (data: FormData) => void) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  startTransition(() => dispatch(data));
};

// Phone photos are several megabytes; a 1600px JPEG is plenty and uploads quickly.
async function shrink(file: File) {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(done => canvas.toBlob(done, "image/jpeg", 0.85));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file; // a format the browser can't draw: send it as it is, and the server checks the size
  }
}

// The guest finds their name, adds anyone else they're replying for, and answers for each of them.
export default function RsvpForm() {
  const [state, reply, sending] = useActionState<RsvpState, FormData>(submitRsvp, { status: "idle" });
  const [preparing, setPreparing] = useState(false);
  const [people, setPeople] = useState<Match[]>([]);
  const [answers, setAnswers] = useState<Record<string, "yes" | "no">>({});
  const errors = state.status === "error" ? state.fields ?? {} : {};
  const anyoneComing = people.some(person => answers[person.id] === "yes");
  const busy = preparing || sending;

  if (state.status === "sent") {
    return (
      <div className="rsvp-thanks" role="status">
        <p className="block-title">{state.attending ? "See you there!" : "You’ll be missed"}</p>
        <p>{state.attending ? "Thank you! We can’t wait to celebrate with you." : "Thank you for letting us know. We’ll be thinking of you on the day."}</p>
      </div>
    );
  }

  const add = (person: Person, family: Person[] = []) => {
    if (people.some(picked => picked.id === person.id)) return;
    setPeople([...people, { ...person, family }]);
  };
  const remove = (id: string) => setPeople(people.filter(person => person.id !== id));
  // Everyone else sharing a last name with someone picked, for adding with one tap, by last name.
  const others = people.flatMap(person => person.family).filter((person, i, all) => !people.some(picked => picked.id === person.id) && all.findIndex(other => other.id === person.id) === i);
  const lastNames = [...new Set(others.map(person => person.name.split(" ").at(-1)!))];
  // Someone added from a suggestion brings the rest of that family along as suggestions too.
  const familyFor = (person: Person) => [...people.flatMap(picked => picked.family), ...people].filter(other => other.id !== person.id && other.name.split(" ").at(-1) === person.name.split(" ").at(-1));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const photo = data.get("photo");
    if (photo instanceof File && photo.size > 0) {
      setPreparing(true);
      data.set("photo", await shrink(photo));
      setPreparing(false);
    }
    startTransition(() => reply(data));
  };

  const error = (name: string) => errors[name] && <span className="field-error" id={`rsvp-${name}-error`}>{errors[name]}</span>;
  const described = (name: string) => ({ "aria-invalid": errors[name] ? true : undefined, "aria-describedby": errors[name] ? `rsvp-${name}-error` : undefined });

  return (
    <form className="rsvp-form" onSubmit={submit} noValidate>
      <div className="field">
        <GuestSearch
          label={people.length ? "Replying for someone else too?" : "Find your name"}
          hint={people.length ? "Add anyone else on your invitation" : "Start typing your first or last name"}
          picked={people.map(person => person.id)}
          onPick={match => add(match, match.family)}
          invalid={!!errors.people}
        />
        {error("people")}
        {lastNames.map(last => (
          <div key={last} className="guest-suggest">
            <span className="field-hint">Also named {last}:</span>
            {others.filter(person => person.name.split(" ").at(-1) === last).map(person => (
              <button key={person.id} type="button" className="guest-add" onClick={() => add(person, familyFor(person))}>
                <span aria-hidden="true">+</span> {person.name}
              </button>
            ))}
          </div>
        ))}
      </div>

      {people.map(person => (
        <fieldset key={person.id} className="field guest-reply" {...described(`attending-${person.id}`)}>
          <input type="hidden" name="person" value={person.id} />
          <legend className="guest-reply-name">{person.name}</legend>
          <button type="button" className="guest-remove" onClick={() => remove(person.id)} aria-label={`Remove ${person.name}`}>×</button>
          <div className="choice-row">
            <label className="choice">
              <input type="radio" name={`attending-${person.id}`} value="yes" checked={answers[person.id] === "yes"} onChange={() => setAnswers({ ...answers, [person.id]: "yes" })} />
              <span>Joyfully accepts</span>
            </label>
            <label className="choice">
              <input type="radio" name={`attending-${person.id}`} value="no" checked={answers[person.id] === "no"} onChange={() => setAnswers({ ...answers, [person.id]: "no" })} />
              <span>Regretfully declines</span>
            </label>
          </div>
          {person.plusOne && answers[person.id] === "yes" && (
            <label className="field">
              <span className="field-hint">{person.name.split(" ")[0]}’s guest</span>
              <input name={`guest-${person.id}`} autoComplete="off" placeholder="Their full name, or leave blank" />
            </label>
          )}
          {error(`attending-${person.id}`)}
        </fieldset>
      ))}

      {people.length > 0 && (
        <>
          <label className="field">
            <span className="field-label">Email</span>
            <input name="email" type="email" autoComplete="email" inputMode="email" required {...described("email")} />
            {error("email")}
          </label>

          {anyoneComing && (
            <label className="field">
              <span className="field-label">Any dietary restrictions?</span>
              <textarea name="dietary" rows={2} placeholder="Who, and what to avoid" />
            </label>
          )}

          <fieldset className="field rsvp-married">
            <legend className="field-label">Married? We’d love to know</legend>
            <label className="field">
              <span className="field-hint">Your wedding song</span>
              <input name="song" autoComplete="off" />
            </label>
            <label className="field">
              <span className="field-hint">A photo from your wedding</span>
              <input name="photo" type="file" accept="image/*" className="file-input" {...described("photo")} />
              {error("photo")}
            </label>
          </fieldset>

          <label className="field">
            <span className="field-label">A note for us</span>
            <textarea name="note" rows={3} />
          </label>
        </>
      )}
      <label className="honeypot" aria-hidden="true">
        Website <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {state.status === "error" && (
        <p className="form-message" role="alert">
          {state.message}
          {!state.fields && <> You can also reach us at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</>}
        </p>
      )}
      <button className="button" disabled={busy}>{busy ? "Sending…" : "Send RSVP"}</button>
    </form>
  );
}

// A name box that suggests guests as you type: arrow keys move through them, Enter or a tap picks one.
// The server sends back only a few matches at a time, and anyone already picked is left out.
function GuestSearch({ label, hint, picked, onPick, invalid }: { label: string; hint: string; picked: string[]; onPick: (match: Match) => void; invalid: boolean }) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<{ query: string; matches: Match[] }>({ query: "", matches: [] });
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const typed = query.trim();
  const matches = typed.length < 2 ? [] : found.matches.filter(match => !picked.includes(match.id));
  const settled = found.query === typed;
  const showing = open && typed.length >= 2 && (matches.length > 0 || settled);

  useEffect(() => {
    if (typed.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/guests?q=${encodeURIComponent(typed)}`, { signal: controller.signal })
        .then(response => response.json())
        .then((matches: Match[]) => { setFound({ query: typed, matches }); setActive(0); })
        .catch(() => {});
    }, 120);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [typed]);

  // On a phone the keyboard covers the bottom of the screen, and iOS slides the whole page up to keep the box
  // in sight. While typing, keep the box at the top of what can actually be seen, so the suggestions fit
  // between it and the keyboard.
  useEffect(() => {
    const view = window.visualViewport;
    const sheet = box.current?.closest(".sheet");
    if (!focused || !view || !sheet || !matchMedia("(max-width: 699px)").matches) return;
    const place = () => {
      const gap = box.current!.getBoundingClientRect().top - view.offsetTop - 12;
      if (Math.abs(gap) > 4) sheet.scrollTop += gap;
    };
    const timers = [setTimeout(place, 100), setTimeout(place, 450)];
    view.addEventListener("resize", place);
    view.addEventListener("scroll", place);
    return () => {
      timers.forEach(clearTimeout);
      view.removeEventListener("resize", place);
      view.removeEventListener("scroll", place);
    };
  }, [focused]);

  const pick = (match: Match) => {
    onPick(match);
    setQuery("");
    setOpen(false);
    // On a touch screen the keyboard goes away, so the card just added can be seen.
    if (matchMedia("(pointer: coarse)").matches) input.current?.blur();
    else input.current?.focus();
  };


  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (matches.length) setActive((active + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      event.preventDefault(); // never sends the form from here
      if (showing && matches[active]) pick(matches[active]);
    } else if (event.key === "Escape" && showing) {
      event.preventDefault();
      event.stopPropagation(); // closes the suggestions, not the page
      setOpen(false);
    }
  };

  return (
    <div className="guest-search" ref={box}>
      <label className="field-label" htmlFor={`${id}-input`}>{label}</label>
      <span className="field-hint" id={`${id}-hint`}>{hint}</span>
      <input
        ref={input}
        id={`${id}-input`}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showing}
        aria-controls={`${id}-list`}
        aria-activedescendant={showing && matches[active] ? `${id}-${matches[active].id}` : undefined}
        aria-describedby={`${id}-hint`}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="words"
        spellCheck={false}
        enterKeyHint="search"
        value={query}
        onChange={event => { setQuery(event.target.value); setOpen(true); }}
        onFocus={() => { setOpen(true); setFocused(true); }}
        onBlur={() => { setOpen(false); setFocused(false); }}
        onKeyDown={onKeyDown}
      />
      <ul className="guest-options" id={`${id}-list`} role="listbox" aria-label="Guests" hidden={!showing}>
        {matches.map((match, i) => (
          <li
            key={match.id}
            id={`${id}-${match.id}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={event => event.preventDefault()}
            onMouseEnter={() => setActive(i)}
            onClick={() => pick(match)}
          >
            {match.name}
          </li>
        ))}
        {matches.length === 0 && <li className="guest-none" role="presentation">No one by that name. Try it as it’s written on your invitation, or email us at {contactEmail}.</li>}
      </ul>
    </div>
  );
}
