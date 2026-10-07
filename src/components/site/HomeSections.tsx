import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { ceremonyTime, contactEmail, dressCode, driveTimes, formatDate, hotel, photos, registryUrl, rsvpDeadline, thingsToDo, timeline, venue, weddingParty } from "@/content/wedding";
import flourish from "@/content/clipart/flourish.webp";
import peekingDog from "@/content/clipart/peeking-dog.webp";
import dogsDressed from "@/content/clipart/dogs-dressed.webp";
import doves from "@/content/clipart/doves.webp";
import champagne from "@/content/clipart/champagne.webp";
import car from "@/content/clipart/car.webp";
import brideGroom from "@/content/clipart/bride-groom.webp";
import puppy from "@/content/clipart/puppy.webp";
import dogLying from "@/content/clipart/dog-lying.webp";
import peony from "@/content/clipart/floral-peony.webp";
import cosmos from "@/content/clipart/floral-cosmos.webp";
import greenery from "@/content/clipart/floral-greenery.webp";
import roses from "@/content/clipart/floral-roses.webp";
import stem from "@/content/clipart/floral-stem.webp";
import hanging from "@/content/clipart/floral-hanging.webp";
import lily from "@/content/clipart/floral-lily.webp";
import sprig from "@/content/clipart/floral-sprig.webp";
import bloom from "@/content/clipart/floral-bloom.webp";
import vase from "@/content/clipart/floral-vase.webp";
import { Illustration } from "./Icons";
import Invitation, { type PageId } from "./Invitation";
import QuestionForm from "./QuestionForm";
import RsvpForm from "./RsvpForm";
import { names } from "./Shared";

// Each page's watercolour flower in the top corner, and the little drawing at the bottom (the dog peeking
// up over the edge unless the page has one of its own).
const art: Record<PageId, { floral: StaticImageData; end?: StaticImageData }> = {
  date: { floral: peony, end: doves },
  details: { floral: cosmos, end: champagne },
  travel: { floral: greenery, end: car },
  rsvp: { floral: roses, end: dogsDressed },
  photos: { floral: stem },
  party: { floral: hanging, end: brideGroom },
  faq: { floral: lily, end: puppy },
  todo: { floral: sprig, end: dogLying },
  registry: { floral: bloom, end: vase },
};

// One page of the invitation, with a flower in the corner, a little flourish under the title and a
// drawing at the bottom. Invitation shows the one that's open and moves between them.
function Page({ id, title, children }: { id: PageId; title: string; children: ReactNode }) {
  const { floral, end } = art[id];
  return (
    <article id={id} className="page" data-page={id} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
      <Image src={floral} alt="" sizes="220px" className="page-floral" />
      <h2 id={`${id}-title`} className="script page-title">{title}</h2>
      <Image src={flourish} alt="" sizes="180px" className="page-flourish" />
      {children}
      {end ? <Image src={end} alt="" sizes="240px" className="page-end" /> : <Image src={peekingDog} alt="" sizes="200px" className="page-dog" />}
    </article>
  );
}

const Email = () => <a className="text-link" href={`mailto:${contactEmail}`}>{contactEmail}</a>;
const External = ({ href, children }: { href: string; children: ReactNode }) => <a className="text-link" href={href} target="_blank" rel="noreferrer">{children}</a>;

const faqs: { q: string; a: ReactNode }[] = [
  { q: "What time should I get there?", a: <p>The ceremony starts at 4:00 PM, so please arrive at 3:30 PM and be seated by 3:50 PM.</p> },
  { q: "When should I RSVP by?", a: <p>Please <a className="text-link" href="#rsvp">RSVP</a> by {rsvpDeadline}. For any issues with your RSVP or special considerations, email us at <Email />.</p> },
  { q: "Is there parking at the venue?", a: <p>Yes, right on site. There’s no overnight parking, so please plan accordingly. A shuttle will run between the venue and the Comfort Inn &amp; Suites Grand Blanc, and you’re more than welcome to use it.</p> },
  { q: "Will the wedding be indoors or outdoors?", a: <p>The ceremony will be outdoors, the cocktail hour indoors and out, and the reception indoors.</p> },
  { q: "What is the dress code?", a: <p>Formal. Here’s <External href={dressCode.guide}>a guide to formal wedding attire</External>. The venue is European style with lots of gravel paths, so plan your footwear accordingly.</p> },
  { q: "Is there a hotel room block?", a: <p>Yes! See <a className="text-link" href="#travel">Travel &amp; Stay</a>. Please reach out if more rooms need to be opened up, or if you need anything 🙂</p> },
  { q: "Can I bring a plus one or my kids?", a: <p>As much as we’d love to have everyone there, the venue only fits so many people. If you have a plus one, your invitation will say “your name and guest”, and you’ll add your guest’s name in the RSVP. If your children are invited, it will say “The (your last name) Family”; otherwise it will just have your name and your partner’s. We appreciate your understanding!</p> },
];

// The whole site: a painted envelope opens onto a table of painted pieces, and each piece opens its page.
// The pages are written here; Invitation lays out the pieces and opens the pages.
export default function HomeSections() {
  const date = (
    <Page id="date" title="Save the Date">
      <section className="details-card-wrap">
        <div className="details-card">
          <h3 className="sr-only">Date and location</h3>
          <p className="card-quiet">{formatDate("weekday")}</p>
          <p className="card-display">{formatDate("short")}</p>
          <p>Ceremony at {ceremonyTime}</p>
          <span className="card-rule" aria-hidden="true" />
          <p className="card-display">{venue.name}</p>
          <p className="card-address">{venue.address}<br />{venue.city} {venue.zip}</p>
          <span className="card-rule" aria-hidden="true" />
          <p className="card-quiet">Reception to follow</p>
        </div>
        <a href="#rsvp" className="button rsvp-jump">
          <span>RSVP by {rsvpDeadline}</span>
          <span className="rsvp-jump-cta">Click here</span>
        </a>
      </section>
    </Page>
  );

  const details = (
    <Page id="details" title="The Details">
      <section className="page-section">
        <h3 className="section-title">{formatDate("short")}</h3>
        <p>{venue.name}<br /><span className="quiet">{venue.address}, {venue.city} {venue.zip}</span></p>
        <External href={venue.directions}>Get directions</External>
        <ol className="day">
          {timeline.map(item => (
            <li key={item.label}>
              <Illustration name={item.icon} />
              <span className="day-time">{item.time}</span>
              <span className="day-label">{item.label}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="page-section">
        <h3 className="section-title">Dress code: {dressCode.title.toLowerCase()}</h3>
        <p>{dressCode.text}</p>
        <External href={dressCode.guide}>A guide to formal wedding attire</External>
      </section>

      <section className="page-section">
        <h3 className="section-title">Questions?</h3>
        <p>Email us at <Email /></p>
      </section>
    </Page>
  );

  const travel = (
    <Page id="travel" title="Travel & Stay">
      <section className="page-section">
        <h3 className="section-title">Where to stay</h3>
        <figure className="polaroid hotel-photo">
          <Image src={hotel.photo} alt={`The front entrance of the ${hotel.name}`} sizes="(min-width: 700px) 360px, 80vw" />
        </figure>
        <h4>{hotel.name}</h4>
        <p className="quiet">{hotel.address.join(", ")}<br /><em>{hotel.fromVenue}</em></p>
        <ul className="amenities">{hotel.amenities.map(item => <li key={item}>{item}</li>)}</ul>
        <p>We have a room block for Saturday, the night before the wedding, and Sunday, the night of. You don’t need to book both nights to use it. Please book early, so we can ask for more rooms if we need them.</p>
        <ul className="drives">
          {hotel.rooms.map(room => (
            <li key={room.room + room.night}>
              <span className="drive-row">
                <span>{room.room} <span className="quiet">({room.night})</span></span>
                <span className="leader" aria-hidden="true" />
                <span>{room.price}</span>
              </span>
            </li>
          ))}
        </ul>
        <a className="button" href={hotel.bookUrl} target="_blank" rel="noreferrer">Book a room</a>
        <p className="quiet">Or call <a className="text-link" href={`tel:${hotel.phone.replaceAll("-", "")}`}>{hotel.phone}</a> and say it’s for the Walters Wedding. Please book by {hotel.bookBy}.</p>
        <p>A shuttle will run to and from the hotel. Times to come.</p>
      </section>

      <section className="page-section">
        <h3 className="section-title">Getting there</h3>
        <p className="quiet">Drive times to {venue.name} without traffic, so leave a little extra.</p>
        <ul className="drives">
          {driveTimes.map(drive => (
            <li key={drive.from}>
              <span className="drive-row">
                <span>{drive.from}</span>
                <span className="leader" aria-hidden="true" />
                <span>{drive.time}</span>
              </span>
              <span className="quiet drive-distance">{drive.distance}</span>
            </li>
          ))}
        </ul>
        <External href={venue.directions}>Get directions</External>
      </section>
    </Page>
  );

  const rsvp = (
    <Page id="rsvp" title="Kindly RSVP">
      <section className="page-section">
        <p>We’d love to celebrate with you. Please reply by <span className="whitespace-nowrap">{rsvpDeadline}</span>.</p>
        <RsvpForm />
      </section>
    </Page>
  );

  const gallery = (
    <Page id="photos" title="Photos">
      <ul className="polaroid-wall">
        {photos.map((photo, i) => (
          <li key={i} className="polaroid">
            <Image src={photo.src} alt={photo.alt} sizes="(min-width: 760px) 300px, 80vw" />
          </li>
        ))}
      </ul>
    </Page>
  );

  const party = (
    <Page id="party" title="The Wedding Party">
      <ul className="polaroid-wall">
        {weddingParty.map(person => (
          <li key={person.name} className="polaroid">
            {person.photo ? <Image src={person.photo} alt={person.name} sizes="(min-width: 760px) 240px, 42vw" /> : <span className="polaroid-empty" />}
            <span className="polaroid-caption">
              <span className="script">{person.name}</span>
              <span>{person.role}</span>
            </span>
          </li>
        ))}
      </ul>
    </Page>
  );

  const faq = (
    <Page id="faq" title="FAQ">
      <section className="page-section faqs">
        {faqs.map(item => (
          <div key={item.q} className="faq">
            <h3>{item.q}</h3>
            {item.a}
          </div>
        ))}
      </section>
      <section className="page-section">
        <h3 className="section-title">Still wondering?</h3>
        <p>Write your question below and it will be emailed to Ally &amp; Gavin.</p>
        <QuestionForm />
      </section>
    </Page>
  );

  const todo = (
    <Page id="todo" title="Things to Do">
      <section className="page-section">
        <p>Making a weekend of it? A few things to do around Grand Blanc.</p>
        <ul className="places">
          {thingsToDo.map(place => (
            <li key={place.name}><External href={place.url}>{place.name}</External></li>
          ))}
        </ul>
      </section>
    </Page>
  );

  const registry = (
    <Page id="registry" title="Registry">
      <section className="page-section">
        <p>Your presence is truly the greatest gift. If you would like to give something extra, we’ve made a registry with a few ideas to help us begin our life together.</p>
        {registryUrl ? <a className="button" href={registryUrl} target="_blank" rel="noreferrer">View our registry</a> : <p className="quiet"><em>The link is coming soon.</em></p>}
      </section>
    </Page>
  );

  return (
    <div className="site">
      <h1 className="sr-only">{names} are getting married on {formatDate("short")} in {venue.city}</h1>
      <Invitation>
        {date}
        {details}
        {travel}
        {rsvp}
        {gallery}
        {party}
        {faq}
        {todo}
        {registry}
      </Invitation>
      {/* Without JavaScript nothing can open, so skip the envelope and lay every page out under the table. */}
      <noscript><style>{".gate { display: none; } .table { visibility: visible !important; } .sheet, .page { display: block !important; position: static; } .sheet-bar { display: none; }"}</style></noscript>
    </div>
  );
}
