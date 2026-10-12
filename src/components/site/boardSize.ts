// The board's size in its own units: 100 wide on phones and 160 on wide screens, and taller than the
// screen on both (see Invitation.tsx). Where things have been dragged to is saved in these units too.
export const BOARD = { phone: { width: 100, height: 660 }, wide: { width: 160, height: 311 } } as const;

// While this is on, anyone can drag things on the board and pinch them bigger or smaller, and where they
// end up is saved for everyone (boards.ts). Turn it off once the board is laid out.
export const ARRANGING = true;

export type Layout = keyof typeof BOARD;
// Where a thing lies and how wide it is: left, top and width in the board's units.
export type Place = [x: number, y: number, width: number];
export type Spots = Record<string, Place>;
export type Arranged = Record<Layout, Spots>;

// Keeps a thing on the board and at a size that can still be seen and grabbed.
export function keepOnBoard([x, y, w]: Place, layout: Layout): Place {
  const { width, height } = BOARD[layout];
  const round = (value: number) => Math.round(value * 10) / 10;
  const size = Math.min(width, Math.max(3, w));
  return [round(Math.min(width - size / 2, Math.max(-size / 2, x))), round(Math.min(height - 3, Math.max(0, y))), round(size)];
}
