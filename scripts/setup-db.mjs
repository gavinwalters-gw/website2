// Creates the tables RSVPs and questions are saved to. Safe to run again; it only adds what's missing.
//   npm run db:setup
// To read the replies, open the SQL editor in Neon and run, say, `select * from rsvp_guests;`.
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("Put DATABASE_URL in .env.local first.");
const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL);

await sql`create table if not exists rsvps (
  id bigserial primary key,
  received_at timestamptz not null default now(),
  invitation text not null,
  email text not null,
  attending boolean not null,
  replies jsonb not null,
  dietary text,
  song text,
  note text,
  photo_name text,
  photo_type text,
  photo bytea
)`;
// Added after the first RSVPs could come in, so these change a table that may already be there: the
// phone number became what's asked for, and email optional.
await sql`alter table rsvps add column if not exists phone text`;
await sql`alter table rsvps alter column email drop not null`;

await sql`create table if not exists questions (
  id bigserial primary key,
  received_at timestamptz not null default now(),
  name text not null,
  email text not null,
  question text not null
)`;

// Where things on the board have been dragged to and how big they've been made, one row for phones and
// one for wide screens. Anything not in here lies where Invitation.tsx puts it. (board_layout, if it's
// there, is an older arrangement that's no longer read.)
await sql`create table if not exists board_arrangement (
  layout text primary key check (layout in ('phone', 'wide')),
  spots jsonb not null default '{}',
  updated_at timestamptz not null default now()
)`;

// One row per guest, which is the list to count heads from. (Phone comes last: a view can only gain columns
// at the end.)
await sql`create or replace view rsvp_guests as
  select r.id as rsvp, reply->>'guest' as guest, reply->>'attending' = 'yes' as attending,
         reply->>'plusOneOf' as plus_one_of, r.email, r.dietary, r.received_at, r.phone
  from rsvps r, jsonb_array_elements(r.replies) reply`;

console.log("Tables ready: rsvps, questions, board_arrangement, and the rsvp_guests view.");
