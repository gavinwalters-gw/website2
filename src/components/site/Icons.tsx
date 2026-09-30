import type { TimelineIcon } from "@/content/wedding";

// Fine-line, engraved-style illustrations. Every drawing uses a 64×64 box and currentColor.
const drawings: Record<TimelineIcon, React.ReactNode> = {
  church: (
    <>
      <path d="M32 3v7M29 6h6" />
      <path d="M26 22 32 10l6 12" />
      <path d="M27 22h10v36H27zM37 34l11-8 11 8M39 33v25M57 33v25" />
      <circle cx="32" cy="29" r="2.6" />
      <path d="M29.5 58v-7a2.5 2.5 0 0 1 5 0v7M43 45v-4a2 2 0 0 1 4 0v4zM51 45v-4a2 2 0 0 1 4 0v4z" />
      <path d="M5 58h56M9 58c0-5 3-8 5-8s5 3 5 8M13 50v-4" />
    </>
  ),
  rings: (
    <>
      <circle cx="25" cy="40" r="12.5" />
      <circle cx="25" cy="40" r="10" />
      <circle cx="39.5" cy="40" r="12.5" />
      <circle cx="39.5" cy="40" r="10" />
      <path d="M20 24l2.5-3.5h5L30 24l-5 5.5zM20 24h10M22.5 20.5 25 24l2.5-3.5M25 24v5.5" />
      <path d="M47 13v7M43.5 16.5h7M53 24v4M51 26h4M13 16v3M11.5 17.5h3" />
    </>
  ),
  coupes: (
    <>
      {[[32, 11], [25, 24], [39, 24], [18, 37], [32, 37], [46, 37]].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x - 6} ${y}h12c0 4-2.7 6-6 6s-6-2-6-6zM${x} ${y + 6}v5M${x - 3} ${y + 11}h6`} />
      ))}
      <path d="M8 51h48" />
      <path d="M32 5v-2M28 6.5l-1-1.5M36 6.5l1-1.5" />
      <circle cx="30.5" cy="14" r=".6" /><circle cx="33.5" cy="13" r=".6" /><circle cx="24" cy="27" r=".6" /><circle cx="40" cy="26.5" r=".6" />
    </>
  ),
  camera: (
    <>
      <rect x="9" y="22" width="46" height="30" rx="4" />
      <path d="M22 22l3.5-6h13l3.5 6M14 19h6" />
      <circle cx="32" cy="37" r="10" />
      <circle cx="32" cy="37" r="6" />
      <path d="M29 34.5a3.5 3.5 0 0 1 3-1.5" />
      <rect x="45" y="26" width="6" height="4" rx="1" />
      <path d="M9 30h13M42 30h3" />
    </>
  ),
  dinner: (
    <>
      <ellipse cx="32" cy="34" rx="25" ry="7.5" />
      <path d="M7 34v13c3 3 7 3 10 0 3 3 7 3 10 0 3 3 7 3 10 0 3 3 7 3 10 0 3 3 7 3 10 0V34" />
      <ellipse cx="32" cy="34" rx="8" ry="2.6" />
      <path d="M20 33V18M44 33V18M20 14.5c-1.5 1.5-1.5 3 0 3.5 1.5-.5 1.5-2 0-3.5zM44 14.5c-1.5 1.5-1.5 3 0 3.5 1.5-.5 1.5-2 0-3.5z" />
      <path d="M17 33h6M41 33h6M27 29c2-4 8-4 10 0" />
    </>
  ),
  cake: (
    <>
      <path d="M8 56h48" />
      <rect x="13" y="42" width="38" height="14" rx="1" />
      <rect x="19" y="30" width="26" height="12" rx="1" />
      <rect x="25" y="20" width="14" height="10" rx="1" />
      <path d="M13 46c3.2 3 6.3 3 9.5 0 3.2 3 6.3 3 9.5 0 3.2 3 6.3 3 9.5 0 3.2 3 6.3 3 9.5 0M19 34c2.2 2.5 4.3 2.5 6.5 0 2.2 2.5 4.3 2.5 6.5 0 2.2 2.5 4.3 2.5 6.5 0 2.2 2.5 4.3 2.5 6.5 0M25 23.5c2.3 2 4.7 2 7 0 2.3 2 4.7 2 7 0" />
      <path d="M32 20v-5M32 9.5c-1.8 1.8-1.8 3.8 0 4.5 1.8-.7 1.8-2.7 0-4.5z" />
    </>
  ),
  disco: (
    <>
      <path d="M32 3v9" />
      <circle cx="32" cy="32" r="20" />
      <ellipse cx="32" cy="32" rx="20" ry="7" />
      <ellipse cx="32" cy="32" rx="20" ry="14" />
      <ellipse cx="32" cy="32" rx="7" ry="20" />
      <ellipse cx="32" cy="32" rx="14" ry="20" />
      <path d="M6 20l-3-1.5M5 32H1.5M6 44l-3 1.5M58 20l3-1.5M59 32h3.5M58 44l3 1.5M14 56l-2 3M50 56l2 3M32 56v5" />
    </>
  ),
  car: (
    <>
      <path d="M6 44v-6c0-3 2-5 5-5h7l7-9h16l7 9h5c3 0 5 2 5 5v6z" />
      <path d="M27 26l-5 7h11v-7zM37 26v7h10l-5-7z" />
      <circle cx="17" cy="45" r="5.5" /><circle cx="17" cy="45" r="2" />
      <circle cx="46" cy="45" r="5.5" /><circle cx="46" cy="45" r="2" />
      <path d="M58 40c2 2 3 5 4 9M58 40c1 3 1 6 0 10" />
      <path d="M22 16c-1.6-2.4 1.2-4 2.4-1.8 1.2-2.2 4-.6 2.4 1.8L24.4 19zM38 12c-1.3-2 1-3.3 2-1.5 1-1.8 3.3-.5 2 1.5L40 14.5z" />
    </>
  ),
};

export function Illustration({ name, className = "" }: { name: TimelineIcon; className?: string }) {
  return (
    <svg className={`illustration ${className}`} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {drawings[name]}
    </svg>
  );
}
