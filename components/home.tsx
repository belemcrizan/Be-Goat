import { cardHref, cards, type SiteContent } from "@/lib/begoat/content";
import { Ram, RamOutline } from "./brand";
import { SiteHeader } from "./site-header";
import { Portrait, SiteFooter } from "./portrait";

export function HomeView({ content }: { content: SiteContent }) {
  return (
    <>
      <SiteHeader urls={content.cardUrls} />
      <main id="conteudo">
        <section className="tableau" id="inicio" aria-labelledby="hero-title">
          <div className="identity">
            <Ram className="signature-ram" />
            <p className="byline">Live streamer</p>
            <h1 id="hero-title">Nati Goat</h1>
            <p className="motto" lang="en">
              DON’T FORGET YOU’RE THE GREATEST OF ALL TIME.
            </p>
          </div>
          <nav className="deck" aria-label="Cartas da Nati">
            {cards.map((card) => (
              <a
                className={"playing-card card-" + card.key}
                key={card.key}
                href={cardHref(card.key, content.cardUrls)}
                aria-label={card.label}
              >
                <span className="card-rank" aria-hidden="true">
                  {card.rank}
                </span>
                <RamOutline />
                <span className="card-label">{card.label}</span>
              </a>
            ))}
          </nav>
        </section>
        <section
          className="portrait-section home-about"
          aria-labelledby="about-home-title"
        >
          <div className="portrait-layout wrap">
            <div className="portrait-copy">
              <p className="eyebrow">@goatnatalia</p>
              <h2 id="about-home-title">Sobre a Nati</h2>
              <p>{content.bio}</p>
              <a
                className="button secondary"
                href={cardHref("sobre", content.cardUrls)}
              >
                Conhecer a Nati
              </a>
            </div>
            <Portrait />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
