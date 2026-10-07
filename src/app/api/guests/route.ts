import type { NextRequest } from "next/server";
import { searchGuests } from "@/server/guestList";

// The RSVP name search: a few names matching what's been typed, each with everyone else who shares their last name.
export function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 60);
  return Response.json(searchGuests(query), { headers: { "Cache-Control": "no-store" } });
}
