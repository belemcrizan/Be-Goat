import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Portrait, SiteFooter } from "@/components/portrait";
import { Programming } from "@/components/programming";
import { RamOutline } from "@/components/brand";
import { cardHref, cards } from "@/lib/begoat/content";
import { localDay, timeInBrasilia } from "@/lib/begoat/calendar";
import { readPublication } from "@/lib/begoat/store";

type PageProps = { params: Promise<{ carta: string }> };
const findCard = (slug: string) => cards.find((card) => card.key === slug);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const card = findCard((await params).carta);
  return {
    title: card
      ? card.label + " · Nati Goat"
      : "Página não encontrada · Nati Goat",
  };
}

export const dynamic = "force-dynamic";
export default async function CardPage({ params }: PageProps) {
  const card = findCard((await params).carta);
  if (!card) notFound();
  const { content } = await readPublication();
  const { key } = card;
  const now = new Date();
  return (
    <>
      <SiteHeader urls={content.cardUrls} current={key} />
      <main className="chapter" id="conteudo">
        <div className="chapter-top wrap">
          <a className="back-link" href="/">
            Voltar ao início
          </a>
        </div>
        {key === "sobre" ? (
          <>
            <section className="portrait-section">
              <div className="portrait-layout wrap">
                <div className="portrait-copy">
                  <h1>Sobre a Nati</h1>
                  <p>{content.bio}</p>
                  <a className="button secondary" href="/lives#canais">
                    Meus canais
                  </a>
                </div>
                <Portrait />
              </div>
            </section>
            {content.notes.length > 0 && (
              <section
                className="mural wrap"
                id="recados"
                aria-labelledby="mural-title"
              >
                <h2 id="mural-title">Mural da Nati</h2>
                <div className="notes">
                  {content.notes.map((note) => (
                    <article key={note.id}>
                      <h3>{note.title}</h3>
                      <p>{note.body}</p>
                      {note.url && (
                        <a
                          className="text-link"
                          href={note.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Saiba mais
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : key === "loja" ? (
          <section className="shop-layout wrap" aria-labelledby="shop-title">
            <div className="shop-copy">
              {!content.cardUrls.loja && <p className="eyebrow">Em breve</p>}
              <h1 id="shop-title">Loja da Nati</h1>
              {content.cardUrls.loja ? (
                <a className="button primary" href={content.cardUrls.loja}>
                  Visitar a loja
                </a>
              ) : (
                <>
                  <p>O endereço da loja será publicado aqui pela Nati.</p>
                  <a
                    className="button secondary"
                    href={cardHref("lives", content.cardUrls)}
                  >
                    Explorar as lives
                  </a>
                </>
              )}
            </div>
            <div className="shop-print" aria-hidden="true">
              <span>Q</span>
              <RamOutline />
              <em>Loja</em>
            </div>
          </section>
        ) : (
          <div className="programming wrap">
            <div className="chapter-intro">
              <h1>{key === "agenda" ? "Agenda de lives" : "Lives da Nati"}</h1>
            </div>
            <Programming
              page={key}
              content={content}
              initialDay={localDay(now)}
              initialTime={timeInBrasilia(now)}
            />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
