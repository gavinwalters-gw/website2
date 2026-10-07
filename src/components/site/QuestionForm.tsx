"use client";

import { useActionState } from "react";
import { contactEmail } from "@/content/wedding";
import { askQuestion, type QuestionState } from "./actions";
import { dispatchFrom } from "./RsvpForm";

// At the bottom of the FAQ: a question that's emailed to the couple.
export default function QuestionForm() {
  const [state, ask, sending] = useActionState<QuestionState, FormData>(askQuestion, { status: "idle" });
  const errors = state.status === "error" ? state.fields ?? {} : {};

  if (state.status === "sent") return <p className="rsvp-thanks" role="status">Thank you! We’ll get back to you soon.</p>;

  const field = (name: string) => ({ name, "aria-invalid": errors[name] ? true : undefined, "aria-describedby": errors[name] ? `ask-${name}-error` : undefined });
  const error = (name: string) => errors[name] && <span className="field-error" id={`ask-${name}-error`}>{errors[name]}</span>;

  return (
    <form className="rsvp-form" onSubmit={event => dispatchFrom(event, ask)} noValidate>
      <label className="field">
        <span className="field-label">Name</span>
        <input {...field("name")} autoComplete="name" required />
        {error("name")}
      </label>
      <label className="field">
        <span className="field-label">Email</span>
        <input {...field("email")} type="email" autoComplete="email" inputMode="email" required />
        {error("email")}
      </label>
      <label className="field">
        <span className="field-label">Your question</span>
        <textarea {...field("question")} rows={4} required />
        {error("question")}
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
      <button className="button" disabled={sending}>{sending ? "Sending…" : "Send question"}</button>
    </form>
  );
}
