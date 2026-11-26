"use client";

import { useEffect, useRef } from "react";
import {
  cardHref,
  cards,
  type CardKey,
  type CardUrls,
} from "@/lib/begoat/content";

const legacySections: Record<string, string> = {
  "#agenda": "/agenda",
  "#links": "/lives#canais",
  "#recados": "/sobre#recados",
};

export function SiteHeader({
  urls,
  current,
}: {
  urls: CardUrls;
  current?: CardKey;
}) {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (!menu.current) return;
    const currentMenu = menu.current;
    function outside(event: Event) {
      if (event.target instanceof Node && !currentMenu.contains(event.target))
        currentMenu.open = false;
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || !currentMenu.open) return;
      currentMenu.open = false;
      currentMenu.querySelector("summary")?.focus();
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);
  useEffect(() => {
    if (current) return;
    const redirectOldAnchor = () => {
      const page = legacySections[window.location.hash];
      if (page) window.location.replace(page);
    };
    redirectOldAnchor();
    window.addEventListener("hashchange", redirectOldAnchor);
    return () => window.removeEventListener("hashchange", redirectOldAnchor);
  }, [current]);

  return (
    <header className={"site-header" + (current ? " inner-header" : "")}>
      <a className="skip" href="#conteudo">
        Ir para o conteúdo
      </a>
      <a className="handle" href="/" aria-label="@goatnatalia, início">
        @goatnatalia
      </a>
      <details className="site-menu" ref={menu}>
        <summary>Menu</summary>
        <nav
          aria-label="Menu principal"
          onClick={() => {
            if (menu.current) menu.current.open = false;
          }}
        >
          <a href="/" aria-current={current ? undefined : "page"}>
            Início
          </a>
          {cards.map((card) => (
            <a
              key={card.key}
              href={cardHref(card.key, urls)}
              aria-current={
                current === card.key && !urls[card.key] ? "page" : undefined
              }
            >
              {card.label}
            </a>
          ))}
          <a className="studio-entry" href="/admin">
            Estúdio da Nati
          </a>
        </nav>
      </details>
    </header>
  );
}
