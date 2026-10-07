import Image from "next/image";
import type { CSSProperties } from "react";
import { photos } from "@/content/wedding";

// Where each polaroid lies behind everything (left and top, as a share of the screen) and how askew it
// is. Phones show the first six.
const scatter = [
  { photo: 0, x: 2, y: 5, tilt: -14 },
  { photo: 3, x: 74, y: 3, tilt: 11 },
  { photo: 1, x: 40, y: -6, tilt: -7 },
  { photo: 4, x: 66, y: 66, tilt: -12 },
  { photo: 2, x: -4, y: 60, tilt: 13 },
  { photo: 0, x: 30, y: 78, tilt: 8 },
  { photo: 4, x: 20, y: 30, tilt: -10 },
  { photo: 1, x: 88, y: 38, tilt: 15 },
];

// The two of them as polaroids scattered behind the envelope, the pieces and the pages, out of focus and
// still, so they're there without pulling the eye from what's in front.
export default function Polaroids() {
  return (
    <div className="polaroids" aria-hidden="true">
      {scatter.map((spot, i) => (
        <div
          key={i}
          className="polaroid"
          style={{ "--x": spot.x, "--y": spot.y, "--tilt": `${spot.tilt}deg`} as CSSProperties}
        >
          <Image src={photos[spot.photo].src} alt="" sizes="(min-width: 700px) 260px, 40vw" draggable={false} />
        </div>
      ))}
    </div>
  );
}
