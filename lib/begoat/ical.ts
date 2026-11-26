import type { Stream } from "./content";

const escapeText = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n?|\n/g, "\\n")
    .replace(/([,;])/g, "\\$1");
const utc = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

function fold(line: string) {
  const parts: string[] = [];
  const encoder = new TextEncoder();
  let current = "",
    size = 0;
  for (const char of line) {
    const width = encoder.encode(char).length;
    if (size + width > 75) {
      parts.push(current);
      current = " ";
      size = 1;
    }
    current += char;
    size += width;
  }
  return [...parts, current].join("\r\n");
}

export function calendarEvent(
  stream: Stream,
  day: string,
  url: string,
  now = new Date(),
) {
  const localClock = Date.parse(day + "T" + stream.time + ":00Z");
  const offset = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    timeZoneName: "longOffset",
  })
    .formatToParts(localClock)
    .find((part) => part.type === "timeZoneName")?.value;
  const match = /^GMT([+-])(\d{2}):(\d{2})$/.exec(offset ?? "");
  if (!match) throw new Error("O fuso horário da live não está disponível.");
  const minutes =
    (Number(match[2]) * 60 + Number(match[3])) * (match[1] === "+" ? 1 : -1);
  const start = new Date(localClock - minutes * 60000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nati Goat//Lives//PT-BR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:" + stream.id + "-" + day + "@begoat",
    "DTSTAMP:" + utc(now),
    "DTSTART:" + utc(start),
    "SUMMARY:" + escapeText("Nati Goat · " + stream.title),
    "LOCATION:" + escapeText(stream.platform),
  ];
  if (url) lines.push("URL:" + new URL(url).href);
  return (
    [...lines, "END:VEVENT", "END:VCALENDAR"].map(fold).join("\r\n") + "\r\n"
  );
}
