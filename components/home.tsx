"use client";
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Link2,
  LockKeyhole,
  Menu,
  X,
} from "lucide-react";
import type { SiteContent, SocialLink } from "@/lib/begoat/content";
import { weekdays } from "@/lib/begoat/content";
import { dateInWeek, printDay } from "@/lib/begoat/calendar";
import { HeroArt, PlatformIcon, Spark, Suit, Wordmark } from "./brand";

const suits = ["heart", "diamond", "club", "spade"] as const;
const sections = [
  { id: "inicio", text: "Início" },
  { id: "links", text: "Meus links" },
  { id: "agenda", text: "Agenda" },
];

function Header({ hasNotes }: { hasNotes: boolean }) {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("inicio");
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const anchors = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-section]"),
    );
    function trackScroll() {
      const atEnd =
        window.scrollY > 0 &&
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 3;
      const current = atEnd
        ? anchors.at(-1)
        : anchors.filter((el) => el.getBoundingClientRect().top <= 150).at(-1);
      setActive(current?.id ?? "inicio");
    }
    trackScroll();
    window.addEventListener("scroll", trackScroll, { passive: true });
    return () => window.removeEventListener("scroll", trackScroll);
  }, []);
  useEffect(() => {
    if (!menu) return;
    function close(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenu(false);
        toggle.current?.focus();
      }
    }
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menu]);
  const items = hasNotes
    ? [...sections, { id: "recados", text: "Recados" }]
    : sections;
  return (
    <header className="topbar">
      <div className="wrap nav-layout">
        <a
          className="brand-link"
          href="#inicio"
          aria-label="begoat, início"
          onClick={() => setMenu(false)}
        >
          <Wordmark />
        </a>
        <nav
          id="main-navigation"
          aria-label="Navegação principal"
          className={"main-nav" + (menu ? " is-open" : "")}
        >
          {items.map((item) => (
            <a
              key={item.id}
              className={active === item.id ? "current" : ""}
              aria-current={active === item.id ? "location" : undefined}
              href={"#" + item.id}
              onClick={() => setMenu(false)}
            >
              {item.text}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <a className="admin-link" href="/admin">
            <LockKeyhole size={15} aria-hidden="true" />
            <span>Área da streamer</span>
          </a>
          <button
            ref={toggle}
            className="mobile-menu icon-button"
            aria-label={menu ? "Fechar menu" : "Abrir menu"}
            aria-controls="main-navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function SocialCards({ links }: { links: SocialLink[] }) {
  const [selected, setSelected] = useState<SocialLink | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  function open(link: SocialLink, element: HTMLElement) {
    trigger.current = element;
    setSelected(link);
    dialog.current?.showModal();
  }
  return (
    <section
      className="social-section wrap"
      id="links"
      data-nav-section
      aria-labelledby="links-title"
    >
      <div className="section-heading">
        <h2 id="links-title">
          Meus links<span>.</span>
        </h2>
        <span className="heading-rule" aria-hidden="true" />
        <Spark className="heading-spark" />
      </div>
      {links.length ? (
        <div className="link-grid">
          {links.map((link, index) => {
            const tileClass = "link-tile color-" + (index % 4);
            const inner = (
              <>
                <span className="tile-emblem">
                  <PlatformIcon name={link.platform} size={25} />
                </span>
                <span className="tile-status">
                  {link.url ? <ExternalLink size={15} /> : "Em breve"}
                </span>
                <span className="tile-word">
                  <strong>{link.title}</strong>
                  {link.description && <small>{link.description}</small>}
                </span>
                <span className="tile-suit">
                  <Suit suit={suits[index % 4]} />
                </span>
              </>
            );
            return link.url ? (
              <a
                className={tileClass}
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.title + ", abrir em nova aba"}
              >
                {inner}
              </a>
            ) : (
              <button
                type="button"
                className={tileClass}
                key={link.id}
                onClick={(e) => open(link, e.currentTarget)}
                aria-label={link.title + ", perfil em breve"}
              >
                {inner}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="empty-message">
          Os próximos links vão aparecer por aqui.
        </p>
      )}
      <dialog
        ref={dialog}
        className="link-dialog"
        aria-labelledby="dialog-title"
        onClose={() => {
          setSelected(null);
          trigger.current?.focus({ preventScroll: true });
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const rect = e.currentTarget.getBoundingClientRect();
            if (
              e.clientX < rect.left ||
              e.clientX > rect.right ||
              e.clientY < rect.top ||
              e.clientY > rect.bottom
            )
              dialog.current?.close();
          }
        }}
      >
        {selected && (
          <>
            <button
              className="icon-button dialog-close"
              autoFocus
              aria-label="Fechar"
              onClick={() => dialog.current?.close()}
            >
              <X size={19} />
            </button>
            <div className="dialog-emblem">
              <PlatformIcon name={selected.platform} size={28} />
            </div>
            <h2 id="dialog-title">{selected.title}</h2>
            <p>O endereço deste perfil ainda será adicionado pela streamer.</p>
            <a
              className="button solid"
              href="#agenda"
              onClick={() => dialog.current?.close()}
            >
              <CalendarDays size={17} />
              Ver agenda
            </a>
          </>
        )}
      </dialog>
    </section>
  );
}

function Schedule({ content, today }: { content: SiteContent; today: string }) {
  const [week, setWeek] = useState(0);
  const first = dateInWeek(today, week, 0);
  const last = dateInWeek(today, week, 6);
  const month = { month: "short" } as const;
  const label =
    printDay(first, { day: "numeric", ...month }) +
    " – " +
    printDay(last, { day: "numeric", ...month, year: "numeric" });
  const streams = [...content.streams].sort(
    (a, b) => a.day - b.day || a.time.localeCompare(b.time),
  );
  return (
    <section
      className="agenda-section"
      id="agenda"
      data-nav-section
      aria-labelledby="agenda-title"
    >
      <div className="wrap">
        <div className="agenda-head">
          <div>
            {content.sampleSchedule && content.streams.length > 0 && (
              <div className="section-kicker">
                <CalendarDays size={15} />
                PROGRAMAÇÃO DE EXEMPLO
              </div>
            )}
            <h2 id="agenda-title">
              Agenda de lives<span>.</span>
            </h2>
          </div>
          <span className="zone">
            <Clock3 size={16} />
            Horário de Brasília
          </span>
        </div>
        <div className="week-bar">
          <div>
            <strong>
              {week === 0
                ? "Esta semana"
                : week === 1
                  ? "Próxima semana"
                  : week === -1
                    ? "Semana passada"
                    : "Semana selecionada"}
            </strong>
            <span aria-live="polite">{label}</span>
          </div>
          <div className="week-actions">
            {week !== 0 && (
              <button className="week-reset" onClick={() => setWeek(0)}>
                Hoje
              </button>
            )}
            <button
              className="icon-button"
              aria-label="Semana anterior"
              onClick={() => setWeek((value) => value - 1)}
            >
              <ChevronLeft size={19} />
            </button>
            <button
              className="icon-button"
              aria-label="Semana seguinte"
              onClick={() => setWeek((value) => value + 1)}
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
        {streams.length ? (
          <ul className="stream-list">
            {streams.map((item) => {
              const day = dateInWeek(today, week, item.day);
              const url =
                item.url ||
                content.links.find(
                  (link) =>
                    link.platform === item.platform &&
                    link.url &&
                    item.platform !== "Outro",
                )?.url;
              return (
                <li key={item.id}>
                  <time
                    className="date-stamp"
                    dateTime={day.toISOString().slice(0, 10)}
                  >
                    <strong>{printDay(day, { day: "2-digit" })}</strong>
                    <small>{printDay(day, month).replace(".", "")}</small>
                  </time>
                  <div className="stream-main">
                    <span>{weekdays[item.day]}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <span className="stream-time">
                    <Clock3 size={16} />
                    {item.time.replace(":", "h")}
                  </span>
                  {url ? (
                    <a
                      className="stream-platform"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <PlatformIcon name={item.platform} size={16} />
                      {item.platform === "Outro" ? "Ver canal" : item.platform}
                      <ExternalLink size={13} />
                    </a>
                  ) : (
                    <span className="stream-platform">
                      <PlatformIcon name={item.platform} size={16} />
                      {item.platform === "Outro" ? "Live" : item.platform}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty-message">
            A próxima live ainda vai ganhar data. Volte em breve!
          </p>
        )}
      </div>
    </section>
  );
}

export function HomeView({
  content,
  today,
}: {
  content: SiteContent;
  today: string;
}) {
  return (
    <>
      <a className="skip" href="#conteudo">
        Ir para o conteúdo
      </a>
      <Header hasNotes={content.notes.length > 0} />
      <main id="conteudo">
        <section
          className="hero"
          id="inicio"
          data-nav-section
          aria-labelledby="hero-title"
        >
          <div className="hero-inner wrap">
            <div className="hero-copy">
              <p className="eyebrow">
                <span aria-hidden="true">♥</span> STREAMER &amp; CRIADORA
              </p>
              <h1 id="hero-title">
                <span>Oi, eu sou a</span>{" "}
                <em>
                  begoat<span>.</span>
                </em>
              </h1>
              <p className="intro">{content.bio}</p>
              <div className="hero-actions">
                <a className="button solid" href="#links">
                  <Link2 size={18} />
                  Meus links
                </a>
                <a className="button light" href="#agenda">
                  <CalendarDays size={17} />
                  Agenda de lives
                </a>
              </div>
            </div>
            <HeroArt />
          </div>
          <div className="hero-rule" aria-hidden="true">
            <span />
            <b>♥</b>
            <span />
          </div>
        </section>
        <SocialCards links={content.links} />
        <Schedule content={content} today={today} />
        {content.notes.length > 0 && (
          <section
            className="notes-section wrap"
            id="recados"
            data-nav-section
            aria-labelledby="notes-title"
          >
            <div className="section-heading">
              <h2 id="notes-title">
                Recados<span>.</span>
              </h2>
              <span className="heading-rule" aria-hidden="true" />
            </div>
            <div className="note-list">
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
                      Saiba mais <ExternalLink size={14} />
                    </a>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
      <footer className="page-footer">
        <div className="wrap">
          <a
            className="brand-link"
            href="#inicio"
            aria-label="begoat, voltar ao início"
          >
            <Wordmark />
          </a>
          <span className="footer-suits" aria-hidden="true">
            ♠ <i>♥</i> ♣ <i>♦</i>
          </span>
          <a href="/admin">
            <LockKeyhole size={14} />
            Área da streamer
          </a>
        </div>
      </footer>
    </>
  );
}
