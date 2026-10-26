// Everything guests read lives here. Swap the placeholders (marked TODO) for the real details.

import type { StaticImageData } from "next/image";
import romeGarden from "./photos/rome-garden.webp";
import romeSteps from "./photos/rome-steps.webp";
import ringPhoto from "./photos/ring.webp";
import withTheDog from "./photos/with-the-dog.webp";
import silo from "./photos/silo.webp";
import proposal from "./photos/proposal.webp";
import romeStepsSitting from "./photos/rome-steps-sitting.webp";
import romeStepsStanding from "./photos/rome-steps-standing.webp";
import romeTerrace from "./photos/rome-terrace.webp";
import parkWithDog from "./photos/park-with-dog.webp";
import redbudWalk from "./photos/redbud-walk.webp";
import redbudLean from "./photos/redbud-lean.webp";
import tulipKiss from "./photos/tulip-kiss.webp";
import riverfront from "./photos/riverfront.webp";
import comfortInn from "./photos/comfort-inn.webp";
import romeOverlook from "./photos/rome-overlook.webp";
import kait from "./party/kait.webp";
import madison from "./party/madison.webp";
import lorelei from "./party/lorelei.webp";
import sunny from "./party/sunny.webp";
import grace from "./party/grace.webp";
import olivia from "./party/olivia.webp";
import ashley from "./party/ashley.webp";
import addilyn from "./party/addilyn.webp";
import oliver from "./party/oliver.webp";
import james from "./party/james.webp";
import chris from "./party/chris.webp";
import owenDrake from "./party/owen-drake.webp";

export const couple = {
  first: "Gavin",
  second: "Ally",
  monogram: ["G", "A"] as const,
};

// Sunday, June 13, 2027, in Michigan (Eastern Daylight Time).
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

// The two of them: drifting as polaroids behind everything, and laid out on the Photos page. Each is
// cropped square; `focus` moves the crop (object-position) where the middle would cut someone off.
export const photos: { src: StaticImageData; alt: string; focus?: string }[] = [
  { src: romeOverlook, alt: "Gavin and Ally hugging and smiling on a terrace above the rooftops of Rome, Ally showing her engagement ring" },
  { src: romeGarden, alt: "Gavin and Ally smiling at each other in the sun under the trees in Rome" },
  { src: romeSteps, alt: "Ally, wearing the engagement ring, with arms around Gavin at the top of the Spanish Steps in Rome" },
  { src: ringPhoto, alt: "Ally’s hand, wearing the engagement ring, resting on Gavin’s shoulder" },
  { src: withTheDog, alt: "Gavin and Ally sitting on a stone wall with their golden retriever", focus: "50% 0%" },
  { src: silo, alt: "Gavin and Ally leaning together against an old concrete silo", focus: "50% 75%" },
  { src: proposal, alt: "Gavin on one knee holding out the ring as Ally covers her face, on a terrace above the rooftops of Rome" },
  { src: romeStepsSitting, alt: "Gavin and Ally sitting together on the Spanish Steps below the church of Trinità dei Monti" },
  { src: romeStepsStanding, alt: "Gavin and Ally smiling at the foot of the Spanish Steps" },
  { src: romeTerrace, alt: "Gavin holding Ally from behind in front of an orange building in Rome", focus: "50% 75%" },
  { src: parkWithDog, alt: "Gavin and Ally sitting on a stone wall under blossoming trees with their golden retriever" },
  { src: redbudWalk, alt: "Gavin and Ally walking hand in hand along a path under a pink redbud tree" },
  { src: redbudLean, alt: "Ally leaning her head on Gavin’s arm and smiling under the redbud branches", focus: "50% 0%" },
  { src: tulipKiss, alt: "Gavin and Ally kissing beside a carousel, with tulips in the foreground" },
  { src: riverfront, alt: "Gavin and Ally holding each other and smiling by the river" },
];

// The note to the guests at the foot of the board.
export const guestMessage = { text: "We can’t wait to celebrate with you. Thank you for being part of our story.", from: "With love, Ally & Gavin" };

export const rsvpDeadline = "May 10, 2027";
export const contactEmail = "g.a.walterswedding@gmail.com";
export const registryUrl = ""; // TODO: the registry link. The Registry page says it's coming until this is set.

export type TimelineIcon = "church" | "rings" | "coupes" | "camera" | "dinner" | "cake" | "disco" | "car";

export const timeline: { time: string; label: string; icon: TimelineIcon }[] = [
  { time: "3:30 PM", label: "Guests arrive", icon: "church" },
  { time: "4:00 PM", label: "The ceremony", icon: "rings" },
  { time: "To follow", label: "Cocktail hour and reception", icon: "coupes" },
  { time: "10:00 PM", label: "Send off", icon: "car" },
];

export const dressCode = {
  title: "Formal",
  text: "We would love for everyone to dress up for the occasion. We kindly ask guests to avoid wearing white. If you have any questions, please let us know.",
  guide: "https://www.theknot.com/content/formal-wedding-attire",
};

export const hotel = {
  name: "Comfort Inn & Suites",
  photo: comfortInn,
  address: ["1359 Grand Pointe Ct", "Grand Blanc, MI 48439"],
  fromVenue: "11 minutes from the venue",
  amenities: ["Free breakfast", "Pool & hot tub", "Fire pit", "Free airport transportation"],
  rooms: [
    { room: "King", night: "Saturday", price: "$154" },
    { room: "King", night: "Sunday", price: "$124" },
    { room: "2 Queens", night: "Saturday", price: "$159" },
    { room: "2 Queens", night: "Sunday", price: "$129" },
  ],
  bookUrl: "https://www.choicehotels.com/reservations/groups/FU99V6",
  phone: "810-694-9900",
  bookBy: "May 1, 2027",
};

export const weddingParty: { name: string; role: string; photo?: StaticImageData; focus?: string; fit?: boolean }[] = [
  { name: "Madison", role: "Maid of Honor", photo: madison },
  { name: "Kait", role: "Matron of Honor", photo: kait, fit: true },
  { name: "Lorelei", role: "Bridesmaid", photo: lorelei },
  { name: "Sunny", role: "Bridesmaid", photo: sunny },
  { name: "Grace", role: "Bridesmaid", photo: grace, focus: "50% 40%" },
  { name: "Olivia", role: "Bridesmaid", photo: olivia },
  { name: "Ashley", role: "Bridesmaid", photo: ashley },
  { name: "Addilyn", role: "Junior Bridesmaid", photo: addilyn, focus: "50% 60%" },
  { name: "Ivy", role: "Flower Girl" },
  { name: "Timothy", role: "Ring Bearer" },
];

// The groom's side, shown as marker on cardboard rather than polaroids.
export const groomsmen: { name: string; role: string; photo?: StaticImageData; focus?: string }[] = [
  { name: "Owen & Drake", role: "Best Men", photo: owenDrake, focus: "50% 8%" },
  { name: "James", role: "Groomsman", photo: james, focus: "50% 10%" },
  { name: "Oliver", role: "Groomsman", photo: oliver, focus: "42% 20%" },
  { name: "Chris", role: "Groomsman", photo: chris },
];

export const thingsToDo = [
  { name: "Grand Blanc Commons Nature Preserve", url: "https://www.cityofgrandblancmi.gov/city_services/parks_and_recreation/city_parks/grand_blanc_commons.php" },
  { name: "Galaxy Lanes", url: "https://www.bowlgalaxylanes.com/" },
  { name: "US-23 Drive-In Theater", url: "https://www.us23driveintheater.com/" },
  { name: "Fenton Winery & Brewery", url: "https://www.fentonbrewery.com/" },
  { name: "The Captain’s Club Golf & Event Center", url: "https://thecaptainsclub.golf/" },
  { name: "Atlas Valley Golf Club", url: "https://atlasvalleygolf.com/" },
];

// Dates always read in the venue's time zone, wherever the guest is.
export const formatDate = (style: "long" | "short" | "weekday") => {
  const at = (options: Intl.DateTimeFormatOptions) => weddingDate.toLocaleDateString("en-US", { timeZone: weddingTimeZone, ...options });
  if (style === "long") return at({ weekday: "long", month: "long", day: "numeric", year: "numeric" });
  if (style === "weekday") return at({ weekday: "long" });
  return at({ month: "long", day: "numeric", year: "numeric" });
};
export const ceremonyTime = weddingDate.toLocaleTimeString("en-US", { timeZone: weddingTimeZone, hour: "numeric", minute: "2-digit" });
