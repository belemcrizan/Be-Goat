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

export const contentSchema = z.object({
  bio: z.string().trim().min(1).max(280),
  sampleSchedule: z.boolean(),
  links: z.array(link).max(32).refine(distinct),
  streams: z.array(stream).max(35).refine(distinct),
  notes: z.array(note).max(20).refine(distinct),
});
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
