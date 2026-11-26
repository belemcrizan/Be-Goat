import assert from "node:assert/strict";
import test from "node:test";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Miniflare } from "miniflare";
import { initialContent } from "../lib/begoat/content.ts";

test("publicação, controle de acesso e conflitos no Worker com um D1 isolado", async (t) => {
  const root = path.resolve("dist/server");
  const sources = (await readdir(root, { recursive: true })).filter(
    (name) => name.endsWith(".js") && name !== "index.js",
  );
  const names = ["index.js", ...sources];
  const modules = await Promise.all(
    names.map(async (name) => ({
      type: "ESModule",
      path: path.join(root, name),
      contents: await readFile(path.join(root, name)),
    })),
  );
  const runtime = new Miniflare({
    modules,
    modulesRoot: root,
    compatibilityDate: "2026-05-15",
    compatibilityFlags: ["nodejs_compat"],
    cf: false,
    d1Databases: ["DB"],
    bindings: { BEGOAT_OWNER_EMAIL: "owner@example.test" },
  });
  t.after(() => runtime.dispose());
  const db = await runtime.getD1Database("DB");
  for (const name of (await readdir("drizzle"))
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    for (const statement of (
      await readFile(path.join("drizzle", name), "utf8")
    ).split("--> statement-breakpoint")) {
      if (statement.trim()) await db.prepare(statement).run();
    }
  }

  const origin = "https://begoat.example";
  // O teste injeta as identidades que o gateway autenticado entregaria ao Worker.
  function identity(email) {
    return email
      ? {
          "oai-authenticated-user-id": "test-" + email,
          "oai-authenticated-user-email": email,
        }
      : {};
  }
  function put(route, body, email, requestOrigin = origin) {
    return runtime.dispatchFetch(origin + route, {
      method: "PUT",
      headers: {
        ...identity(email),
        origin: requestOrigin,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }
  const owner = "owner@example.test";
  const streamer = "streamer@example.test";
  const visitor = "visitor@example.test";
  const content = {
    ...initialContent,
    bio: "Programação aprovada no ensaio.",
    sampleSchedule: false,
    links: [
      {
        id: "principal",
        title: "Canal oficial",
        platform: "Outro",
        description: "Acompanhar",
        url: "https://example.com/canal",
      },
    ],
    streams: [
      {
        id: "domingo",
        title: "Domingo da comunidade",
        day: 6,
        time: "19:30",
        platform: "Outro",
        url: "",
      },
    ],
    notes: [
      {
        id: "aviso",
        title: "Recado da streamer",
        body: "Até domingo!",
        url: "",
      },
    ],
  };
  const body = { revision: 0, content };

  await t.test(
    "visitantes leem a página, sem controles de edição",
    async () => {
      const page = await runtime.dispatchFetch(origin);
      assert.equal(page.status, 200);
      assert.match(await page.text(), /Meus links/);
      const admin = await runtime.dispatchFetch(origin + "/admin");
      assert.match(await admin.text(), /Entrar com ChatGPT/);
      const ownerPage = await runtime.dispatchFetch(origin + "/admin", {
        headers: identity(owner),
      });
      assert.match(await ownerPage.text(), /Texto de boas-vindas/);
    },
  );
  await t.test(
    "publicação exige autenticação, permissão e mesma origem",
    async () => {
      assert.equal((await put("/api/editor", body)).status, 401);
      assert.equal((await put("/api/editor", body, visitor)).status, 403);
      assert.equal(
        (await put("/api/editor", body, owner, "https://outro.example")).status,
        403,
      );
      assert.equal(
        (await put("/api/access", { email: streamer }, visitor)).status,
        403,
      );
    },
  );
  await t.test(
    "o responsável autoriza a streamer, que publica para visitantes",
    async () => {
      assert.equal(
        (await put("/api/access", { email: streamer }, owner)).status,
        200,
      );
      const writes = await Promise.all([
        put("/api/editor", body, streamer),
        put("/api/editor", body, streamer),
      ]);
      assert.deepEqual(writes.map((v) => v.status).sort(), [200, 409]);
      assert.deepEqual(await writes.find((v) => v.status === 200).json(), {
        revision: 1,
      });
      const html = await (await runtime.dispatchFetch(origin)).text();
      for (const text of [
        content.bio,
        "https://example.com/canal",
        "Domingo da comunidade",
        "19h30",
        "Até domingo!",
      ])
        assert.ok(html.includes(text), text);
      assert.ok(!html.includes("PROGRAMAÇÃO DE EXEMPLO"));
      assert.equal(
        (await put("/api/access", { email: visitor }, streamer)).status,
        403,
      );
    },
  );
  await t.test(
    "um formulário inválido ou desatualizado preserva a versão publicada",
    async () => {
      const invalid = {
        ...content,
        links: [{ ...content.links[0], url: "http://example.net/" }],
      };
      assert.equal(
        (await put("/api/editor", { revision: 1, content: invalid }, owner))
          .status,
        400,
      );
      assert.equal((await put("/api/editor", body, owner)).status, 409);
      const blank = { ...content, links: [], streams: [], notes: [] };
      assert.equal(
        (await put("/api/editor", { revision: 1, content: blank }, owner))
          .status,
        200,
      );
      const html = await (await runtime.dispatchFetch(origin)).text();
      assert.ok(html.includes("próxima live ainda vai ganhar data"));
      assert.ok(!html.includes("Recado da streamer"));
    },
  );
  await t.test(
    "revogar o e-mail encerra a autorização na próxima gravação",
    async () => {
      assert.equal(
        (await put("/api/access", { email: "" }, owner)).status,
        200,
      );
      assert.equal(
        (await put("/api/editor", { revision: 2, content }, streamer)).status,
        403,
      );
    },
  );
});
