"use client";

import { useActionState, useState } from "react";
import { contactEmail } from "@/content/wedding";
import { submitRsvp, type RsvpState } from "./rsvpActions";

export default function RsvpForm() {
  const [state, action, pending] = useActionState<RsvpState, FormData>(submitRsvp, { status: "idle" });
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const errors = state.status === "error" ? state.fields ?? {} : {};
  const values = state.status === "error" ? state.values ?? {} : {};

  if (state.status === "sent") {
    return (
      <div className="rsvp-thanks" role="status">
        <p className="block-title">{state.attending ? "See you there!" : "You’ll be missed"}</p>
        <p>
          {state.attending
            ? `Thank you, ${state.name.split(" ")[0]} — we can’t wait to celebrate with you.`
            : `Thank you for letting us know, ${state.name.split(" ")[0]}. We’ll be thinking of you on the day.`}
        </p>
      </div>
    );
  }

  const field = (name: string) => ({ name, id: `rsvp-${name}`, defaultValue: values[name], "aria-invalid": errors[name] ? true : undefined, "aria-describedby": errors[name] ? `rsvp-${name}-error` : undefined });
  const error = (name: string) => errors[name] && <span className="field-error" id={`rsvp-${name}-error`}>{errors[name]}</span>;

  return (
    <form action={action} className="rsvp-form" noValidate>
      <label className="field">
        <span className="field-label">Full name</span>
        <input {...field("name")} autoComplete="name" required />
        {error("name")}
      </label>
      <label className="field">
        <span className="field-label">Email</span>
        <input {...field("email")} type="email" autoComplete="email" inputMode="email" required />
        {error("email")}
      </label>
      <fieldset className="field" aria-describedby={errors.attending ? "rsvp-attending-error" : undefined}>
        <legend className="field-label">Will you be attending?</legend>
        <div className="choice-row">
          <label className="choice">
            <input type="radio" name="attending" value="yes" defaultChecked={values.attending === "yes"} onChange={() => setAttending("yes")} />
            <span>Joyfully accepts</span>
          </label>
          <label className="choice">
            <input type="radio" name="attending" value="no" defaultChecked={values.attending === "no"} onChange={() => setAttending("no")} />
            <span>Regretfully declines</span>
          </label>
        </div>
        {error("attending")}
      </fieldset>
      {attending === "yes" && (
        <>
          <label className="field">
            <span className="field-label">Number of guests (including you)</span>
            <select {...field("guests")} defaultValue={values.guests ?? "1"}>
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Guest names</span>
            <input {...field("guestNames")} placeholder="Anyone joining you" />
          </label>
          <label className="field">
            <span className="field-label">Dietary requirements</span>
            <input {...field("dietary")} placeholder="Allergies, vegetarian, etc." />
          </label>
        </>
      )}
      <label className="field">
        <span className="field-label">A note for the couple</span>
        <textarea {...field("message")} rows={3} />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {state.status === "error" && (
        <p className="form-message" role="alert">
          {state.message}
          {!state.fields && <> You can also reach us at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</>}
        </p>
      )}
      <button className="button" disabled={pending}>{pending ? "Sending…" : "Send RSVP"}</button>
    </form>
  );
}
