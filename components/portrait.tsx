import { Wordmark } from "./brand";

export function Portrait() {
  return (
    <figure className="portrait-pair">
      <div className="portrait-frame">
        <img
          src="/brand/retrato.webp"
          srcSet="/brand/retrato.webp 840w, /brand/nati-goat.webp 1200w"
          sizes="(max-width: 680px) 70vw, 360px"
          width="840"
          height="1120"
          className="portrait-photo"
          loading="lazy"
          alt="Nati, de vestido vinho, sentada em uma poltrona."
        />
      </div>
      <a
        className="keepsake"
        href="/brand/rei-de-copas.webp"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ampliar a carta original Rei de Copas em nova aba"
      >
        <img
          src="/brand/rei-de-copas.webp"
          width="330"
          height="469"
          loading="lazy"
          alt="Carta Rei de Copas da Nati, com o carneiro coroado."
        />
      </a>
    </figure>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <a href="/" aria-label="Nati Goat, início">
        <Wordmark />
      </a>
      <a className="footer-studio" href="/admin">
        Estúdio da Nati
      </a>
    </footer>
  );
}
