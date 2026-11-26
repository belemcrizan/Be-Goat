import { z } from "zod";

export const platforms = [
  "Twitch",
  "Instagram",
  "YouTube",
  "TikTok",
  "Discord",
  "Outro",
] as const;
export type Platform = (typeof platforms)[number];
export const weekdays = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
] as const;

const webUrl = z
  .string()
  .trim()
  .max(1200)
  .refine((value) => {
    if (value === "") return true;
    if (!/^https:\/\/[^/\\?#\s]/i.test(value) || /[\s\\]/.test(value))
      return false;
    try {
      const url = new URL(value);
      return (
        url.protocol === "https:" &&
        !!url.hostname &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "Use um endereço https:// completo.");
const title = z.string().trim().min(1).max(80);
const id = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
const link = z.object({
  id,
  title,
  platform: z.enum(platforms),
  description: z.string().trim().max(100),
  url: webUrl,
});
const stream = z.object({
  id,
  title,
  day: z.number().int().min(0).max(6),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  platform: z.enum(platforms),
  url: webUrl,
});
const note = z.object({
  id,
  title,
  body: z.string().trim().min(1).max(1600),
  url: webUrl,
});
const distinct = (rows: { id: string }[]) =>
  new Set(rows.map((row) => row.id)).size === rows.length;

export const cards = [
  { key: "lives", rank: "K", label: "Lives" },
  { key: "loja", rank: "Q", label: "Loja" },
  { key: "agenda", rank: "A", label: "Agenda" },
  { key: "sobre", rank: "J", label: "Sobre" },
] as const;
export type CardKey = (typeof cards)[number]["key"];
export const defaultCardUrls = { lives: "", loja: "", agenda: "", sobre: "" };
export type CardUrls = typeof defaultCardUrls;

export function cardHref(key: CardKey, urls: CardUrls) {
  return urls[key] || "/" + key;
}

export function cardDestinationIssue(urls: CardUrls, origin: string) {
  const seen = new Set<string>();
  for (const { key, label } of cards) {
    const url = new URL(cardHref(key, urls), origin);
    const pathname = url.pathname.replace(/\/+$/, "");
    if (urls[key] && url.origin === origin && pathname === "/" + key) {
      return (
        "Para usar a página original de " +
        label +
        ", deixe o endereço da carta em branco."
      );
    }
    const canonical = url.origin + pathname + url.search + url.hash;
    if (seen.has(canonical))
      return (
        "Cada carta precisa levar a um destino diferente. Confira a carta " +
        label +
        "."
      );
    seen.add(canonical);
  }
  return null;
}

const cardUrls = z
  .object({
    lives: webUrl.default(""),
    loja: webUrl.default(""),
    agenda: webUrl.default(""),
    sobre: webUrl.default(""),
  })
  .default(defaultCardUrls);

export const contentSchema = z.object({
  cardUrls,
  bio: z.string().trim().min(1).max(280),
  sampleSchedule: z.boolean(),
  links: z.array(link).max(32).refine(distinct),
  streams: z.array(stream).max(35).refine(distinct),
  notes: z.array(note).max(20).refine(distinct),
});
// Antigas publicações podiam conter endereços abreviados que o navegador tratava como caminhos locais.
export function parseStoredContent(json: string) {
  return contentSchema.parse(
    JSON.parse(json, (key, value: unknown) => {
      if (
        key !== "url" ||
        typeof value !== "string" ||
        webUrl.safeParse(value).success
      )
        return value;
      try {
        const repaired = webUrl.safeParse(new URL(value).href);
        return repaired.success ? repaired.data : "";
      } catch {
        return "";
      }
    }),
  );
}

export type SiteContent = z.infer<typeof contentSchema>;
export type SocialLink = z.infer<typeof link>;
export type Stream = z.infer<typeof stream>;
export type Note = z.infer<typeof note>;
export type Publication = { revision: number; content: SiteContent };
export const saveSchema = z.object({
  revision: z
    .number()
    .int()
    .min(0)
    .max(Number.MAX_SAFE_INTEGER - 1),
  content: contentSchema,
});
export const initialContent: SiteContent = {
  cardUrls: defaultCardUrls,
  bio: "Jogos, conversas e o que mais o chat inventar. Te encontro na próxima live.",
  sampleSchedule: true,
  links: [
    {
      id: "twitch",
      platform: "Twitch",
      title: "Twitch",
      description: "Lives e bate-papo",
      url: "",
    },
    {
      id: "instagram",
      platform: "Instagram",
      title: "Instagram",
      description: "Bastidores e momentos",
      url: "",
    },
    {
      id: "youtube",
      platform: "YouTube",
      title: "YouTube",
      description: "Vídeos e cortes",
      url: "",
    },
    {
      id: "tiktok",
      platform: "TikTok",
      title: "TikTok",
      description: "Clipes curtinhos",
      url: "",
    },
  ],
  streams: [
    {
      id: "terca",
      title: "Papo com o chat",
      day: 1,
      time: "20:00",
      platform: "Twitch",
      url: "",
    },
    {
      id: "quinta",
      title: "Noite de jogos",
      day: 3,
      time: "20:00",
      platform: "Twitch",
      url: "",
    },
    {
      id: "sabado",
      title: "Sábado ao vivo",
      day: 5,
      time: "18:00",
      platform: "Twitch",
      url: "",
    },
  ],
  notes: [],
};
