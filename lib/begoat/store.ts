import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { publication, streamerAccess } from "@/db/schema";
import {
  contentSchema,
  initialContent,
  type Publication,
  type SiteContent,
} from "./content";

export async function readPublication(): Promise<Publication> {
  const [row] = await getDb()
    .select()
    .from(publication)
    .where(eq(publication.id, 1));
  if (!row) return { revision: 0, content: initialContent };
  return {
    revision: row.revision,
    content: contentSchema.parse(JSON.parse(row.content)),
  };
}

export async function publish(revision: number, value: SiteContent) {
  const db = getDb();
  const next = { revision: revision + 1, content: JSON.stringify(value) };
  const result =
    revision === 0
      ? await db
          .insert(publication)
          .values({ id: 1, ...next })
          .onConflictDoNothing()
          .returning({ revision: publication.revision })
      : await db
          .update(publication)
          .set(next)
          .where(and(eq(publication.id, 1), eq(publication.revision, revision)))
          .returning({ revision: publication.revision });
  return result[0]?.revision ?? null;
}

export async function readStreamerEmail() {
  const [row] = await getDb()
    .select()
    .from(streamerAccess)
    .where(eq(streamerAccess.id, 1));
  return row?.email ?? "";
}

export async function writeStreamerEmail(email: string) {
  await getDb()
    .insert(streamerAccess)
    .values({ id: 1, email })
    .onConflictDoUpdate({ target: streamerAccess.id, set: { email } });
}
