import { guests } from "./guests";

// The guest list as people the RSVP page can find: each with a stable id, whether they may bring a guest,
// and who else on the list shares their last name.

export type Person = { id: string; name: string; plusOne: boolean };
export type Match = Person & { family: Person[] };

// Names compare without case, accents or punctuation: "o'neil" finds "Brennen O’Neil".
const words = (name: string) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z\s-]/g, "").split(/[\s-]+/).filter(Boolean);

const taken = new Set<string>();
const everyone = guests.map(entry => {
  const name = entry.replace(/\s*\+\s*guest$/i, "");
  let id = words(name).join("-");
  for (let n = 2; taken.has(id); n++) id = `${words(name).join("-")}-${n}`;
  taken.add(id);
  return { person: { id, name, plusOne: name !== entry }, words: words(name) };
});
// Only a real surname counts: "Aunt Renee" and "Dakota" have no family to offer.
const lastName = (entry: (typeof everyone)[number]) => entry.words.length > 1 && !/^(aunt|uncle)$/.test(entry.words[0]) ? entry.words.at(-1) : undefined;

export const personById = (id: string) => everyone.find(entry => entry.person.id === id)?.person;
const familyOf = (entry: (typeof everyone)[number]) => {
  const last = lastName(entry);
  return last ? everyone.filter(other => other !== entry && lastName(other) === last).map(other => other.person) : [];
};

// How far apart two words are, counting a letter added, dropped, changed or two swapped.
function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[a.length][b.length];
}

// How well one typed word matches a word of a name: the start of it is best, then somewhere inside it,
// then close enough to be a typo ("kurzyneic", "wlaker"), allowing more slips in longer words.
function wordScore(typed: string, word: string) {
  if (word.startsWith(typed)) return typed.length === word.length ? 4 : 3;
  if (typed.length >= 3 && word.includes(typed)) return 2;
  const slips = typed.length >= 7 ? 2 : typed.length >= 4 ? 1 : 0;
  if (slips && Math.min(distance(typed, word), distance(typed, word.slice(0, typed.length))) <= slips) return 1;
  return 0;
}

// Everyone whose name matches every word typed, best first. Only a few come back, so the list can't be
// read off the page.
export function searchGuests(query: string, limit = 6): Match[] {
  const typed = words(query);
  if (typed.join("").length < 2) return [];
  return everyone
    .map(entry => {
      let score = 0;
      for (const word of typed) {
        const best = Math.max(0, ...entry.words.map(w => wordScore(word, w)));
        if (!best) return null;
        score += best;
      }
      return { entry, score };
    })
    .filter(hit => hit !== null)
    .sort((a, b) => b.score - a.score || a.entry.person.name.localeCompare(b.entry.person.name))
    .slice(0, limit)
    .map(({ entry }) => ({ ...entry.person, family: familyOf(entry) }));
}
