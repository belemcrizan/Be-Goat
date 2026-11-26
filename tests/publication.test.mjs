import assert from "node:assert/strict";
import test from "node:test";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Miniflare } from "miniflare";
import { initialContent, parseStoredContent } from "../lib/begoat/content.ts";

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
  const salt = randomBytes(16);
  const password = randomBytes(20).toString("hex");
  const verifier = [
    "v1",
    salt.toString("hex"),
    pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex"),
  ].join(":");
  const runtime = new Miniflare({
    modules,
    modulesRoot: root,
    compatibilityDate: "2026-05-15",
    compatibilityFlags: ["nodejs_compat"],
    cf: false,
    d1Databases: ["DB"],
    bindings: { BEGOAT_ADMIN_VERIFIER: verifier },
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
  function request(route, method, body, cookie = "", requestOrigin = origin) {
    return runtime.dispatchFetch(origin + route, {
      method,
      headers: {
        origin: requestOrigin,
        "content-type": "application/json",
        cookie,
      },
      body: JSON.stringify(body),
    });
  }
  const login = (guess = password) =>
    request("/api/session", "POST", { username: "admin", password: guess });
  let cookie = "";
  const content = {
    ...initialContent,
    bio: "Programação aprovada no ensaio.",
    cardUrls: { ...initialContent.cardUrls, loja: "https://example.com/loja" },
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
    "página pública mostra Nati Goat e o estúdio pede credenciais próprias",
    async () => {
      const home = await runtime.dispatchFetch(origin);
      const html = await home.text();
      assert.equal(home.status, 200);
      assert.match(html, /Nati Goat/);
      assert.ok(html.includes("DON’T FORGET YOU’RE THE GREATEST OF ALL TIME."));
      const deck = html.match(/<nav class="deck"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
      assert.ok(deck);
      assert.deepEqual(
        [...deck.matchAll(/<a [^>]*href="([^"]+)"/g)].map((match) => match[1]),
        ["/lives", "/loja", "/agenda", "/sobre"],
      );
      const panel = await runtime.dispatchFetch(origin + "/admin");
      const form = await panel.text();
      assert.ok(form.includes('name="password"'));
      assert.ok(
        !form.includes("Entrar com ChatGPT") &&
          !form.includes("Texto de boas-vindas"),
      );
    },
  );
  await t.test(
    "as quatro cartas abrem páginas próprias por endereço direto",
    async () => {
      for (const [route, title] of [
        ["/lives", "Lives da Nati"],
        ["/loja", "Loja da Nati"],
        ["/agenda", "Agenda de lives"],
        ["/sobre", "Sobre a Nati"],
      ]) {
        const response = await runtime.dispatchFetch(origin + route);
        assert.equal(response.status, 200, route);
        const html = await response.text();
        assert.ok(html.includes(title), route);
        if (route === "/sobre")
          assert.ok(
            html.includes("/brand/rei-de-copas.webp") &&
              html.includes("/brand/retrato.webp"),
          );
        if (route === "/loja")
          assert.ok(html.includes("O endereço da loja será publicado"));
      }
      assert.equal(
        (await runtime.dispatchFetch(origin + "/carta-inexistente")).status,
        404,
      );
    },
  );
  await t.test(
    "o painel valida as credenciais e entrega um cookie de sessão",
    async () => {
      assert.equal((await login("outra-senha")).status, 401);
      assert.equal(
        (
          await request("/api/session", "POST", {
            username: "visitante",
            password,
          })
        ).status,
        401,
      );
      assert.equal((await request("/api/editor", "PUT", body)).status, 401);
      const res = await login();
      assert.equal(res.status, 200);
      const header = res.headers.get("set-cookie") ?? "";
      for (const part of ["HttpOnly", "Secure", "SameSite=Strict", "Path=/"])
        assert.ok(header.includes(part), part);
      cookie = header.split(";")[0];
      assert.match(cookie, /^nati_admin=[0-9a-f]{64}$/);
      const panel = await runtime.dispatchFetch(origin + "/admin", {
        headers: { cookie },
      });
      const studio = await panel.text();
      assert.ok(studio.includes("Texto de boas-vindas") && studio.includes("Cartas"));
    },
  );
  await t.test(
    "publica os dados em D1 e rejeita uma revisão concorrente",
    async () => {
      const pair = await Promise.all([
        request("/api/editor", "PUT", body, cookie),
        request("/api/editor", "PUT", body, cookie),
      ]);
      assert.deepEqual(pair.map((r) => r.status).sort(), [200, 409]);
      for (const [route, texts] of [
        ["", [content.bio, 'href="https://example.com/loja"']],
        ["/loja", ['href="https://example.com/loja"', "Visitar a loja"]],
        ["/lives", ["https://example.com/canal", "Domingo da comunidade"]],
        ["/agenda", ["Domingo da comunidade", "19h30"]],
        ["/sobre", [content.bio, "Até domingo!"]],
      ]) {
        const html = await (await runtime.dispatchFetch(origin + route)).text();
        for (const text of texts)
          assert.ok(html.includes(text), route + " · " + text);
        assert.ok(!html.includes("Programação de exemplo"));
      }
    },
  );
  await t.test(
    "o estúdio rejeita cartas repetidas, autorreferentes e URLs incompletas",
    async () => {
      for (const patch of [
        { lives: "https://example.com/loja/" },
        { loja: origin + "/agenda" },
        { loja: origin + "/loja/" },
        { loja: "https:loja.example" },
        { loja: "https:///loja.example" },
      ]) {
        const res = await request(
          "/api/editor",
          "PUT",
          {
            revision: 1,
            content: {
              ...content,
              cardUrls: { ...content.cardUrls, ...patch },
            },
          },
          cookie,
        );
        assert.equal(res.status, 400, JSON.stringify(patch));
      }
    },
  );
  await t.test("gravação exige a origem do site e campos válidos", async () => {
    assert.equal(
      (
        await request(
          "/api/editor",
          "PUT",
          { revision: 1, content },
          cookie,
          "https://outro.example",
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await request(
          "/api/editor",
          "PUT",
          {
            revision: 1,
            content: {
              ...content,
              links: [{ ...content.links[0], url: "http://example.test/" }],
            },
          },
          cookie,
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await request(
          "/api/editor",
          "PUT",
          {
            revision: 1,
            content: { ...content, links: [], notes: [], streams: [] },
          },
          cookie,
        )
      ).status,
      200,
    );
    assert.ok(
      (await (await runtime.dispatchFetch(origin + "/lives")).text()).includes(
        "Aguardando nova data",
      ),
    );
  });
  await t.test("sair revoga a sessão no servidor", async () => {
    const res = await request("/api/session", "DELETE", {}, cookie);
    assert.equal(res.status, 200);
    assert.ok(res.headers.get("set-cookie").includes("Max-Age=0"));
    assert.equal(
      (await request("/api/editor", "PUT", { revision: 2, content }, cookie))
        .status,
      401,
    );
  });
  await t.test(
    "a sessão expira mesmo se o navegador ainda tiver o cookie",
    async () => {
      const res = await login();
      const second = res.headers.get("set-cookie").split(";")[0];
      await db.prepare("UPDATE admin_sessions SET expires_at = 0").run();
      assert.equal(
        (await request("/api/editor", "PUT", { revision: 2, content }, second))
          .status,
        401,
      );
    },
  );
  await t.test(
    "tentativas repetidas entram em espera e liberam após a janela",
    async () => {
      for (let i = 0; i < 6; i++)
        assert.equal((await login("incorreta")).status, 401);
      const blocked = await login();
      assert.equal(blocked.status, 429);
      assert.equal(blocked.headers.get("Retry-After"), "900");
      await db.prepare("UPDATE login_windows SET resets_at = 0").run();
      assert.equal((await login()).status, 200);
    },
  );
});

test("publicações antigas recuperam as quatro rotas e mantêm os canais existentes", () => {
  const { cardUrls: _old, ...legacy } = initialContent;
  legacy.links = [{ ...legacy.links[0], url: "https:example.com/canal" }];
  const parsed = parseStoredContent(JSON.stringify(legacy));
  assert.deepEqual(parsed.cardUrls, {
    lives: "",
    loja: "",
    agenda: "",
    sobre: "",
  });
  assert.equal(parsed.bio, legacy.bio);
  assert.equal(parsed.links[0].url, "https://example.com/canal");
});
