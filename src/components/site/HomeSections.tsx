import type { ReactNode } from "react";
import { ceremonyTime, children, dressCode, driveTimes, formatDate, gifts, hotels, registryUrl, rsvpDeadline, timeline, venue } from "@/content/wedding";
import { Illustration } from "./Icons";
import Invitation, { type PageId } from "./Invitation";
import RsvpForm from "./RsvpForm";
import { names } from "./Shared";

// One page of the invitation. Invitation shows the one that's open and moves between them.
function Page({ id, title, children }: { id: PageId; title: string; children: ReactNode }) {
  return (
    <article id={id} className="page" data-page={id} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="script page-title">{title}</h2>
      {children}
    </article>
  );
}

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
        <h3 className="section-title">Timeline</h3>
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
        <h3 className="section-title">Good to know</h3>
        <h4>Dress code: {dressCode.title.toLowerCase()}</h4>
        <p>{dressCode.text}</p>
        <ul className="swatches" aria-label="Suggested colors">
          {dressCode.palette.map(swatch => (
            <li key={swatch.name}>
              <span className="swatch" style={{ background: swatch.color }} aria-hidden="true" />
              {swatch.name}
            </li>
          ))}
        </ul>
        <h4>{children.title}</h4>
        <p>{children.text}</p>
      </section>

      <section className="page-section">
        <h3 className="section-title">Gifts</h3>
        <p>{gifts}</p>
        <a className="text-link" href={registryUrl} target="_blank" rel="noreferrer">View our registry</a>
      </section>
    </Page>
  );

  const travel = (
    <Page id="travel" title="Travel & Stay">
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
        <a className="text-link" href={venue.directions} target="_blank" rel="noreferrer">Get directions</a>
      </section>

      <section className="page-section">
        <h3 className="section-title">Where to stay</h3>
        <p>We’ve reserved rooms for our guests at the hotels below. You’re also welcome to book wherever you prefer.</p>
        <ul className="hotels">
          {hotels.map(hotel => (
            <li key={hotel.name}>
              <h4>{hotel.name}</h4>
              <p className="quiet">{hotel.address.map((line, i) => <span key={i}>{line}<br /></span>)}<em>{hotel.note}</em></p>
              <a className="text-link" href={hotel.url} target="_blank" rel="noreferrer">Visit website</a>
            </li>
          ))}
        </ul>
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

  return (
    <div className="site">
      <h1 className="sr-only">{names} are getting married on {formatDate("short")} in {venue.city}</h1>
      <Invitation>
        {date}
        {details}
        {travel}
        {rsvp}
      </Invitation>
      {/* Without JavaScript nothing can open, so skip the envelope and lay every page out under the table. */}
      <noscript><style>{".gate { display: none; } .table { visibility: visible !important; } .sheet, .page { display: block !important; position: static; } .sheet-bar { display: none; }"}</style></noscript>
    </div>
  );
}
