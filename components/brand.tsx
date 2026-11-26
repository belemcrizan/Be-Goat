import { Link2 } from "lucide-react";
import type { Platform } from "@/lib/begoat/content";

export function Wordmark() {
  return (
    <span className="wordmark">
      <img src="/favicon.svg" alt="" width="39" height="39" />
      begoat<span className="wordmark-point">.</span>
    </span>
  );
}

export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 32 32"
      fill="none"
    >
      <path
        d="M16 1c0 9-4 14-14 15 10 1 14 5 14 15 1-10 6-14 15-15C21 15 17 10 16 1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Suit({
  suit,
}: {
  suit: "heart" | "diamond" | "club" | "spade";
}) {
  const paths = {
    heart:
      "M20 13C15-1 0 4 2 17c1 7 12 14 18 20 6-6 17-13 18-20C40 4 25-1 20 13Z",
    diamond:
      "M20 2c4 8 10 14 17 18-7 4-13 10-17 18C16 30 10 24 3 20 10 16 16 10 20 2Z",
    club: "M20 3c-7 0-11 8-6 14-8-5-15 2-12 10 3 7 12 6 16-1-1 5-2 8-5 11h14c-3-3-4-6-5-11 4 7 13 8 16 1 3-8-4-15-12-10C31 11 27 3 20 3Z",
    spade:
      "M20 2C14 10 2 16 2 23c0 10 12 12 16 3-1 6-2 9-5 12h14c-3-3-4-6-5-12 4 9 16 7 16-3C38 16 26 10 20 2Z",
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" fill="none">
      <path
        d={paths[suit]}
        stroke="currentColor"
        fill="inherit"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlatformIcon({
  name,
  size = 22,
}: {
  name: Platform;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
  };
  switch (name) {
    case "Twitch":
      return (
        <svg {...common} fill="currentColor">
          <path d="M4.6 1 1.5 5.1v15.5h5.4V24l3.9-3.4h4.4l7.3-7.3V1H4.6Zm15.9 11.2-4.4 4.3h-4.5l-3.2 3.1v-3.1H5.1V3h15.4v9.2Z" />
          <path d="M11 5.8h1.9v5.3H11zm5.1 0H18v5.3h-1.9z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.9">
          <rect x="3" y="3" width="18" height="18" rx="5.3" />
          <circle cx="12" cy="12" r="4.2" />
          <circle
            cx="17.6"
            cy="6.6"
            r="1.05"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
    case "YouTube":
      return (
        <svg {...common} fill="currentColor">
          <path
            fillRule="evenodd"
            d="M22.4 7a3.2 3.2 0 0 0-2.2-2.3c-2-.5-6.6-.5-8.2-.5s-6.2 0-8.2.5A3.2 3.2 0 0 0 1.6 7a24.6 24.6 0 0 0 0 10 3.2 3.2 0 0 0 2.2 2.3c2 .5 6.6.5 8.2.5s6.2 0 8.2-.5a3.2 3.2 0 0 0 2.2-2.3 24.6 24.6 0 0 0 0-10ZM10 15.7V8.3l6.3 3.7-6.3 3.7Z"
          />
        </svg>
      );
    case "TikTok":
      return (
        <svg {...common} fill="currentColor">
          <path d="M15.5 2c.4 2.9 1.9 4.6 4.9 4.8v3.4a9.2 9.2 0 0 1-4.8-1.5v7.2a6.8 6.8 0 1 1-6.8-6.8c.4 0 .8 0 1.2.1v3.6a3.2 3.2 0 1 0 2.1 3V2h3.4Z" />
        </svg>
      );
    case "Discord":
      return (
        <svg {...common} fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.2 4.7a18 18 0 0 1 4.3-1.3l.6 1.3a15 15 0 0 1 3.8 0l.6-1.3a18 18 0 0 1 4.3 1.3c2.3 3.5 3.5 7.2 3.5 11.9-1.6 1.3-3.1 2.1-5 2.8L16.1 18c.7-.2 1.2-.5 1.8-.9l-.4-.3a13 13 0 0 1-11 0l-.4.3c.6.4 1.1.7 1.8.9l-1.2 1.4c-1.9-.7-3.4-1.5-5-2.8 0-4.7 1.2-8.4 3.5-11.9Zm3.5 9.9c1 0 1.7-.9 1.7-2s-.7-2-1.7-2-1.7.9-1.7 2 .7 2 1.7 2Zm6.6 0c1 0 1.7-.9 1.7-2s-.7-2-1.7-2-1.7.9-1.7 2 .7 2 1.7 2Z"
          />
        </svg>
      );
    default:
      return <Link2 size={size} aria-hidden="true" />;
  }
}

export function HeroArt() {
  return (
    <div className="hero-art">
      <div className="art-layout">
        <span className="card-back" aria-hidden="true">
          <span />
        </span>
        <figure className="portrait-card">
          <img
            src="/brand/retrato.webp"
            width="840"
            height="1120"
            fetchPriority="high"
            alt="begoat sentada em uma poltrona, com vestido vinho."
          />
          <span className="photo-index top-index" aria-hidden="true">
            K<small>♥</small>
          </span>
          <span className="photo-index bottom-index" aria-hidden="true">
            K<small>♥</small>
          </span>
        </figure>
        <img
          className="signature-card"
          src="/brand/rei-de-copas.webp"
          width="330"
          height="469"
          alt="Carta Rei de Copas com a cabra coroada, símbolo da begoat."
        />
        <Spark className="spark art-spark one" />
        <Spark className="spark art-spark two" />
        <Spark className="spark art-spark three" />
      </div>
    </div>
  );
}
