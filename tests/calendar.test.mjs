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
