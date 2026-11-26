import test from "node:test";
import assert from "node:assert/strict";
import { dateInWeek, localDay } from "../lib/begoat/calendar.ts";

test("usa a data civil de Brasília quando o UTC já virou o dia", () => {
  assert.equal(localDay(new Date("2026-11-27T02:59:00Z")), "2026-11-26");
  assert.equal(localDay(new Date("2026-11-27T03:00:00Z")), "2026-11-27");
});

test("semanas começam na segunda, inclusive na virada do ano", () => {
  const date = (day, offset, weekday) =>
    dateInWeek(day, offset, weekday).toISOString().slice(0, 10);
  assert.equal(date("2027-01-03", 0, 0), "2026-12-28");
  assert.equal(date("2027-01-03", 0, 6), "2027-01-03");
  assert.equal(date("2027-01-03", 1, 0), "2027-01-04");
  assert.equal(date("2027-01-04", -1, 3), "2026-12-31");
});

test("a próxima transmissão considera a hora local e a semana seguinte", async () => {
  const { nextSlot } = await import("../lib/begoat/calendar.ts");
  const slot = { day: 6, time: "19:30" };
  assert.deepEqual(nextSlot([slot], "2027-01-03", "19:29"), {
    slot,
    date: "2027-01-03",
  });
  assert.deepEqual(nextSlot([slot], "2027-01-03", "19:31"), {
    slot,
    date: "2027-01-10",
  });
  assert.equal(nextSlot([], "2027-01-03", "19:30"), null);
});

test("arquivo do calendário preserva a hora de Brasília, acentos e texto longo", async () => {
  const { calendarEvent } = await import("../lib/begoat/ical.ts");
  const title = "Nati, jogos; conversa\n" + "é".repeat(100);
  const file = calendarEvent(
    { id: "quinta", title, time: "23:30", platform: "Twitch" },
    "2026-11-26",
    "https://example.com/live",
    new Date("2026-11-25T09:00:00Z"),
  );
  assert.ok(file.includes("DTSTART:20261127T023000Z\r\n"));
  assert.ok(file.includes("URL:https://example.com/live\r\n"));
  assert.ok(file.includes("Nati\\, jogos\\; conversa\\n"));
  assert.ok(file.split("\r\n").every((line) => Buffer.byteLength(line) <= 75));
  assert.ok(file.endsWith("END:VCALENDAR\r\n"));
});
