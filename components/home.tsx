"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Link2,
  LockKeyhole,
  Menu,
  Radio,
  X,
} from "lucide-react";
import type { SiteContent, SocialLink, Stream } from "@/lib/begoat/content";
import { weekdays } from "@/lib/begoat/content";
import {
  dateInWeek,
  hourLabel,
  localDay,
  nextSlot,
  printDay,
  timeInBrasilia,
} from "@/lib/begoat/calendar";
import { calendarEvent } from "@/lib/begoat/ical";
import { PlatformIcon, Wordmark } from "./brand";

type Selection =
  | { type: "stream"; item: Stream; day: string; url: string }
  | { type: "channel"; item: SocialLink };
const sections = [
  { id: "inicio", label: "Início" },
  { id: "agenda", label: "Agenda" },
  { id: "links", label: "Canais" },
];
const civilDate = (value: string) => new Date(value + "T12:00:00Z");
const shortDate = (value: string) =>
  printDay(civilDate(value), { day: "2-digit", month: "short" })
    .replace(" de ", " ")
    .replace(".", "");
const channelURL = (stream: Stream, links: SocialLink[]) =>
  stream.url ||
  (stream.platform !== "Outro" &&
    links.find((link) => link.platform === stream.platform && link.url)?.url) ||
  "";
const external = { target: "_blank", rel: "noopener noreferrer" } as const;

function Header({ hasNotes }: { hasNotes: boolean }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const nav = hasNotes
    ? [...sections, { id: "recados", label: "Mural" }]
    : sections;
  useEffect(() => {
    if (!open) return;
    function close(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="masthead">
      <div className="wrap mast-inner">
        <a
          href="#inicio"
          className="brand-link"
          aria-label="Nati Goat, início"
          onClick={() => setOpen(false)}
        >
          <Wordmark />
        </a>
        <nav
          id="main-nav"
          className={"main-nav" + (open ? " expanded" : "")}
          aria-label="Navegação principal"
        >
          {nav.map((item) => (
            <a
              key={item.id}
              href={"#" + item.id}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mast-actions">
          <a className="admin-link" href="/admin">
            <LockKeyhole size={15} />
            Estúdio
          </a>
          <button
            ref={toggle}
            type="button"
            className="icon-button nav-toggle"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ content }: { content: SiteContent }) {
  const twitch = content.links.find(
    (link) => link.platform === "Twitch" && link.url,
  );
  return (
    <section id="inicio" className="hero" aria-labelledby="hero-title">
      <picture className="hero-photo">
        <source media="(max-width:600px)" srcSet="/brand/retrato.webp" />
        <img
          src="/brand/nati-goat.webp"
          width="1200"
          height="1600"
          alt="Retrato de Nati Goat com um vestido vinho."
          fetchPriority="high"
        />
      </picture>
      <div className="hero-light" aria-hidden="true" />
      <div className="wrap hero-shell">
        <div className="hero-copy">
          <p className="hero-kicker">
            <span aria-hidden="true" className="kicker-line" />
            Live streamer
          </p>
          <h1 id="hero-title">
            <span>Nati</span> <em>Goat</em>
          </h1>
          <p className="intro">{content.bio}</p>
          <div className="hero-actions">
            {twitch ? (
              <a className="button primary" href={twitch.url} {...external}>
                <PlatformIcon name="Twitch" size={18} />
                Abrir Twitch
              </a>
            ) : (
              <a className="button primary" href="#agenda">
                <CalendarDays size={17} />
                Ver agenda
              </a>
            )}
            <a className="button ghost" href="#links">
              <Link2 size={16} />
              Meus canais
            </a>
          </div>
        </div>
        <a
          className="hero-sigil"
          href="/brand/rei-de-copas.webp"
          aria-label="Ver a carta Rei de Copas"
          {...external}
        >
          <img
            src="/brand/rei-de-copas-mark.png"
            width="42"
            height="50"
            alt=""
          />
          <span>Rei de Copas</span>
        </a>
      </div>
    </section>
  );
}

function UpNext({
  next,
  sample,
  onOpen,
}: {
  next: ReturnType<typeof nextSlot<Stream>>;
  sample: boolean;
  onOpen: () => void;
}) {
  return (
    <aside className="up-next" aria-label="Próxima transmissão">
      <div className="wrap next-inner">
        <div className="next-label">
          <span className="signal-icon">
            <Radio size={21} />
          </span>
          <span>
            Próxima live{sample && next && <small>Agenda de exemplo</small>}
          </span>
        </div>
        {next ? (
          <>
            <div className="next-title">{next.slot.title}</div>
            <div className="next-datetime">
              <CalendarDays size={15} />
              {shortDate(next.date)}
              <i aria-hidden="true" />
              <Clock3 size={15} />
              {hourLabel(next.slot.time)} <span>BRT</span>
            </div>
            <button type="button" className="next-details" onClick={onOpen}>
              Ver detalhes <span aria-hidden="true">+</span>
            </button>
          </>
        ) : (
          <span className="next-title">Aguardando nova data</span>
        )}
      </div>
    </aside>
  );
}

function Channels({
  links,
  select,
}: {
  links: SocialLink[];
  select: (choice: Selection) => void;
}) {
  return (
    <aside
      id="links"
      className="channels column"
      aria-labelledby="channels-title"
    >
      <div className="block-title">
        <span className="accent-stroke" aria-hidden="true" />
        <h2 id="channels-title">Canais da Nati</h2>
      </div>
      {links.length ? (
        <ul className="channels-list">
          {links.map((link) => {
            const inner = (
              <>
                <span
                  className={"channel-icon icon-" + link.platform.toLowerCase()}
                >
                  <PlatformIcon name={link.platform} size={20} />
                </span>
                <span className="channel-name">
                  <strong>{link.title}</strong>
                  {link.description && <small>{link.description}</small>}
                </span>
                {link.url ? (
                  <ExternalLink size={15} />
                ) : (
                  <span className="pending-label">Em breve</span>
                )}
              </>
            );
            return (
              <li key={link.id}>
                {link.url ? (
                  <a
                    className="channel-row"
                    href={link.url}
                    {...external}
                    aria-label={link.title + ", abrir em nova aba"}
                  >
                    {inner}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="channel-row"
                    onClick={() => select({ type: "channel", item: link })}
                    aria-label={link.title + ", perfil em breve"}
                  >
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="empty-message">Os canais oficiais aparecerão aqui.</p>
      )}
    </aside>
  );
}

function Schedule({
  content,
  today,
  select,
}: {
  content: SiteContent;
  today: string;
  select: (choice: Selection) => void;
}) {
  const [week, setWeek] = useState(0);
  const first = dateInWeek(today, week, 0).toISOString().slice(0, 10),
    last = dateInWeek(today, week, 6).toISOString().slice(0, 10);
  const sorted = [...content.streams].sort(
    (a, b) => a.day - b.day || a.time.localeCompare(b.time),
  );
  return (
    <section
      id="agenda"
      className="schedule column"
      aria-labelledby="schedule-title"
    >
      <div className="block-title">
        <span className="accent-stroke" aria-hidden="true" />
        <h2 id="schedule-title">Agenda de lives</h2>
      </div>
      <div className="week-bar">
        <div className="week-summary">
          <CalendarDays size={16} />
          <span aria-live="polite">
            {shortDate(first)} – {shortDate(last)}{" "}
            <span className="year">
              {first.slice(0, 4) === last.slice(0, 4)
                ? last.slice(0, 4)
                : "· " + first.slice(0, 4) + "/" + last.slice(0, 4)}
            </span>
          </span>
        </div>
        <div className="week-buttons">
          {week !== 0 && (
            <button
              type="button"
              className="week-reset"
              onClick={() => setWeek(0)}
            >
              Hoje
            </button>
          )}
          <button
            type="button"
            className="icon-button"
            aria-label="Semana anterior"
            onClick={() => setWeek((n) => n - 1)}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Semana seguinte"
            onClick={() => setWeek((n) => n + 1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      {sorted.length ? (
        <ul className="events">
          {sorted.map((stream) => {
            const date = dateInWeek(today, week, stream.day),
              day = date.toISOString().slice(0, 10);
            return (
              <li key={stream.id}>
                <button
                  type="button"
                  className={"event-row" + (day === today ? " is-today" : "")}
                  aria-label={
                    "Detalhes de " +
                    stream.title +
                    ", " +
                    weekdays[stream.day] +
                    ", " +
                    hourLabel(stream.time)
                  }
                  onClick={() =>
                    select({
                      type: "stream",
                      item: stream,
                      day,
                      url: channelURL(stream, content.links),
                    })
                  }
                >
                  <time className="date-tile" dateTime={day}>
                    <b>{day.slice(-2)}</b>
                    <small>
                      {printDay(date, { month: "short" }).replace(".", "")}
                    </small>
                  </time>
                  <span className="event-name">
                    <small>
                      {day === today ? "Hoje · " : ""}
                      {weekdays[stream.day]}
                    </small>
                    <strong>{stream.title}</strong>
                  </span>
                  <span className="event-channel">
                    <PlatformIcon name={stream.platform} size={14} />
                    {stream.platform === "Outro" ? "Live" : stream.platform}
                  </span>
                  <span className="event-hour">{hourLabel(stream.time)}</span>
                  <span className="row-plus" aria-hidden="true">
                    +
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="empty-message">A próxima live ainda vai ganhar data.</p>
      )}
      <p className="schedule-foot">
        <Clock3 size={14} /> Horário de Brasília
        {content.sampleSchedule && sorted.length > 0 && (
          <>
            <span>·</span> Programação de exemplo
          </>
        )}
      </p>
    </section>
  );
}

function saveCalendar(choice: Extract<Selection, { type: "stream" }>) {
  const file = new Blob([calendarEvent(choice.item, choice.day, choice.url)], {
    type: "text/calendar;charset=utf-8",
  });
  const address = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = address;
  a.download = "nati-goat-" + choice.day + ".ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(address), 2000);
}

function Detail({
  choice,
  close,
  sample,
}: {
  choice: Selection;
  close: () => void;
  sample: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [downloaded, setDownloaded] = useState(false);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const item = choice.item;
  return (
    <dialog
      ref={ref}
      className="detail-dialog"
      aria-labelledby="detail-title"
      onClose={close}
      onClick={(e) => {
        if (e.currentTarget !== e.target) return;
        const rect = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        )
          ref.current?.close();
      }}
    >
      <div className="detail-tools">
        <span className="detail-icon">
          <PlatformIcon name={item.platform} size={22} />
        </span>
        <button
          type="button"
          className="icon-button"
          autoFocus
          aria-label="Fechar detalhes"
          onClick={() => ref.current?.close()}
        >
          <X size={18} />
        </button>
      </div>
      <h2 id="detail-title">{item.title}</h2>
      {choice.type === "channel" ? (
        <p>O endereço deste canal será divulgado aqui pela Nati.</p>
      ) : (
        <>
          <p className="detail-meta">
            <CalendarDays size={17} />
            {printDay(civilDate(choice.day), {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <p className="detail-meta">
            <Clock3 size={17} />
            {hourLabel(choice.item.time)} · Horário de Brasília
          </p>
          {sample && (
            <p className="detail-note">
              Esta transmissão faz parte da agenda de exemplo.
            </p>
          )}
          <div className="detail-actions">
            {choice.url && (
              <a className="button primary" href={choice.url} {...external}>
                <ExternalLink size={15} />
                Abrir canal
              </a>
            )}
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                saveCalendar(choice);
                setDownloaded(true);
              }}
            >
              {downloaded ? <Check size={15} /> : <CalendarPlus size={16} />}
              Salvar no calendário
            </button>
          </div>
          <span role="status" className="screen-reader">
            {downloaded ? "Arquivo de calendário preparado." : ""}
          </span>
        </>
      )}
    </dialog>
  );
}

export function HomeView({
  content,
  initialDay,
  initialTime,
}: {
  content: SiteContent;
  initialDay: string;
  initialTime: string;
}) {
  const [tick, setTick] = useState({ day: initialDay, time: initialTime });
  const [choice, setChoice] = useState<Selection | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const next = nextSlot(content.streams, tick.day, tick.time);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTick({ day: localDay(now), time: timeInBrasilia(now) });
    };
    update();
    const timer = window.setInterval(update, 30000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  function select(item: Selection) {
    trigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setChoice(item);
  }
  function close() {
    setChoice(null);
    trigger.current?.focus({ preventScroll: true });
  }
  return (
    <>
      <a className="skip" href="#conteudo">
        Ir para o conteúdo
      </a>
      <Header hasNotes={!!content.notes.length} />
      <main id="conteudo">
        <Hero content={content} />
        <UpNext
          next={next}
          sample={content.sampleSchedule}
          onOpen={() => {
            if (next)
              select({
                type: "stream",
                item: next.slot,
                day: next.date,
                url: channelURL(next.slot, content.links),
              });
          }}
        />
        <div className="wrap programming">
          <Schedule content={content} today={tick.day} select={select} />
          <Channels links={content.links} select={select} />
        </div>
        {content.notes.length > 0 && (
          <section
            className="mural wrap"
            id="recados"
            aria-labelledby="mural-title"
          >
            <div className="block-title">
              <span className="accent-stroke" aria-hidden="true" />
              <h2 id="mural-title">Mural da Nati</h2>
            </div>
            <div className="notes">
              {content.notes.map((note) => (
                <article key={note.id}>
                  <h3>{note.title}</h3>
                  <p>{note.body}</p>
                  {note.url && (
                    <a className="text-link" href={note.url} {...external}>
                      Saiba mais <ExternalLink size={14} />
                    </a>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
      <footer className="footer">
        <div className="wrap">
          <a
            className="brand-link"
            href="#inicio"
            aria-label="Nati Goat, voltar ao início"
          >
            <Wordmark />
          </a>
          <a className="footer-studio" href="/admin">
            <LockKeyhole size={14} />
            Estúdio da Nati
          </a>
        </div>
      </footer>
      {choice && (
        <Detail choice={choice} close={close} sample={content.sampleSchedule} />
      )}
    </>
  );
}
