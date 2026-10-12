"use server";

import { sql } from "@/server/db";
import { ARRANGING, keepOnBoard, type Arranged, type Layout, type Place } from "./boardSize";

// Where things on the board have been dragged to and how big they've been made. It's one layout that
// everyone sees, kept in Postgres (the board_layout table); anything not in it lies where Invitation.tsx
// puts it.

export async function getLayout(): Promise<Arranged> {
  const arranged: Arranged = { phone: {}, wide: {} };
  if (!sql) return arranged;
  for (const row of await sql`select layout, spots from board_layout`) arranged[row.layout as Layout] = row.spots;
  return arranged;
}

// Saves where one thing now lies. Only names like the board's own are taken, and only a few dozen of them.
export async function placeOnBoard(layout: Layout, key: string, place: Place): Promise<boolean> {
  if (!ARRANGING || !sql || (layout !== "phone" && layout !== "wide") || !/^[a-z0-9-]{1,40}$/.test(key)) return false;
  if (!Array.isArray(place) || place.length !== 3 || !place.every(Number.isFinite)) return false;
  const spot = JSON.stringify({ [key]: keepOnBoard(place, layout) });
  const rows = await sql`
    insert into board_layout (layout, spots) values (${layout}, ${spot}::jsonb)
    on conflict (layout) do update set spots = board_layout.spots || excluded.spots, updated_at = now()
      where board_layout.spots ? ${key} or (select count(*) from jsonb_object_keys(board_layout.spots)) < 60
    returning layout`;
  return rows.length > 0;
}
