// Everything guests read lives here. Swap the placeholders (marked TODO) for the real details.

import romeGarden from "./photos/rome-garden.webp";
import romeSteps from "./photos/rome-steps.webp";
import ringPhoto from "./photos/ring.jpg";
import withTheDog from "./photos/with-the-dog.webp";
import silo from "./photos/silo.webp";

export const couple = {
  first: "Gavin",
  second: "Ally",
  monogram: ["G", "A"] as const,
};

// Sunday, June 13, 2027, in Michigan (Eastern Daylight Time). TODO: confirm the 4:00 PM ceremony start.
export const weddingDate = new Date("2027-06-13T16:00:00-04:00");
export const weddingTimeZone = "America/Detroit";

export const venue = {
  name: "Cruwood",
  address: "6353 Belsay Rd",
  city: "Grand Blanc, Michigan",
  zip: "48439",
  directions: "https://www.google.com/maps/dir/?api=1&destination=Cruwood%2C+6353+Belsay+Rd%2C+Grand+Blanc%2C+MI+48439",
};

// Typical drive times without traffic (OpenStreetMap routing). Leave extra time on the day.
export const driveTimes = [
  { from: "Auburn Hills", time: "40 minutes", distance: "31 miles" },
  { from: "Novi", time: "1 hour", distance: "39 miles" },
  { from: "South Lyon", time: "1 hour", distance: "45 miles" },
];

// The slideshow at the top of the details, in order. Add more photos here; `position` is the part of
// each picture to keep in view when it's cropped to fit the screen.
export const slideshow = [
  { src: romeGarden, alt: "Gavin and Ally smiling at each other in the sun under the trees in Rome", position: "50% 38%" },
  { src: romeSteps, alt: "Ally, wearing the engagement ring, with arms around Gavin at the top of the Spanish Steps in Rome", position: "48% 50%" },
  { src: ringPhoto, alt: "Ally’s hand, wearing the engagement ring, resting on Gavin’s shoulder", position: "50% 52%" },
  { src: withTheDog, alt: "Gavin and Ally sitting on a stone wall with their golden retriever", position: "50% 12%" },
  { src: silo, alt: "Gavin and Ally leaning together against an old concrete silo", position: "55% 30%" },
];

export const rsvpDeadline = "May 1, 2027"; // TODO
export const contactEmail = "hello@example.com"; // TODO
export const registryUrl = "#"; // TODO

export type TimelineIcon = "church" | "rings" | "coupes" | "camera" | "dinner" | "cake" | "disco" | "car";

// TODO: the real order of the day.
export const timeline: { time: string; label: string; icon: TimelineIcon }[] = [
  { time: "3:30 PM", label: "Guests arrive", icon: "church" },
  { time: "4:00 PM", label: "The ceremony", icon: "rings" },
  { time: "4:45 PM", label: "Cocktail hour", icon: "coupes" },
  { time: "5:15 PM", label: "Photos", icon: "camera" },
  { time: "6:00 PM", label: "Dinner", icon: "dinner" },
  { time: "7:30 PM", label: "Cake cutting", icon: "cake" },
  { time: "8:00 PM", label: "Dancing", icon: "disco" },
  { time: "11:00 PM", label: "Farewell", icon: "car" },
];

// TODO: hotel blocks.
export const hotels = [
  { name: "Hotel Name", address: ["Street Address", "City, State"], note: "A short walk from the venue", url: "#" },
  { name: "Second Hotel", address: ["Street Address", "City, State"], note: "Ten minutes by car", url: "#" },
];

export const dressCode = {
  title: "Garden formal",
  text: "We’d love for everyone to wear cocktail or semi-formal attire — something a bit dressy, but comfortable enough to enjoy the festivities. To keep with the garden, we kindly ask guests to avoid wearing white.",
  palette: [
    { name: "Ivory", color: "#ece5d6" },
    { name: "Sage", color: "#b3bba4" },
    { name: "Olive", color: "#7d8a5c" },
    { name: "Dusty rose", color: "#bd9292" },
    { name: "Wine", color: "#6e2430" },
  ],
};

export const children = {
  title: "Adults only",
  text: "While we absolutely love your little ones, we’ve chosen to make our celebration an adults-only evening. We hope you can enjoy a night off on us!",
};

export const gifts = "Your presence is truly the greatest gift. If you would like to give something extra, we have created a registry with a few ideas to help us begin our new life together.";

// Dates always read in the venue's time zone, wherever the guest is.
export const formatDate = (style: "long" | "short" | "weekday") => {
  const at = (options: Intl.DateTimeFormatOptions) => weddingDate.toLocaleDateString("en-US", { timeZone: weddingTimeZone, ...options });
  if (style === "long") return at({ weekday: "long", month: "long", day: "numeric", year: "numeric" });
  if (style === "weekday") return at({ weekday: "long" });
  return at({ month: "long", day: "numeric", year: "numeric" });
};
export const ceremonyTime = weddingDate.toLocaleTimeString("en-US", { timeZone: weddingTimeZone, hour: "numeric", minute: "2-digit" });
