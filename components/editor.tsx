"use client";
import { useEffect, useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  LockKeyhole,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  contentSchema,
  platforms,
  weekdays,
  type Note,
  type Platform,
  type Publication,
  type SiteContent,
  type SocialLink,
  type Stream,
} from "@/lib/begoat/content";

type Tab = "perfil" | "links" | "streams" | "notes";
type Group = "links" | "streams" | "notes";
const tabs: { key: Tab; label: string }[] = [
  { key: "perfil", label: "Perfil" },
  { key: "links", label: "Links" },
  { key: "streams", label: "Lives" },
  { key: "notes", label: "Recados" },
];

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={"editor-field" + (wide ? " wide" : "")}>
      <span>{label}</span>
      {children}
    </label>
  );
}
function PlatformSelect({
  value,
  update,
}: {
  value: Platform;
  update: (value: Platform) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => update(event.target.value as Platform)}
    >
      {platforms.map((item) => (
        <option key={item}>{item}</option>
      ))}
    </select>
  );
}
function UrlField({
  value,
  update,
}: {
  value: string;
  update: (value: string) => void;
}) {
  return (
    <Field wide label="Endereço do link (opcional)">
      <input
        type="url"
        maxLength={1200}
        value={value}
        placeholder="https://"
        onChange={(e) => update(e.target.value)}
      />
    </Field>
  );
}
function EditRow({
  name,
  remove,
  move,
  first,
  last,
  children,
}: {
  name: string;
  remove: () => void;
  move?: (offset: number) => void;
  first?: boolean;
  last?: boolean;
  children: ReactNode;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <fieldset className="edit-row">
      <legend>{name}</legend>
      <div className="row-actions">
        {move && (
          <>
            <button
              type="button"
              className="icon-button"
              title="Mover para cima"
              aria-label={"Mover " + name + " para cima"}
              disabled={first}
              onClick={() => move(-1)}
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              className="icon-button"
              title="Mover para baixo"
              aria-label={"Mover " + name + " para baixo"}
              disabled={last}
              onClick={() => move(1)}
            >
              <ChevronDown size={16} />
            </button>
          </>
        )}
        {confirm ? (
          <>
            <button className="text-link" type="button" onClick={remove}>
              Sim, remover
            </button>
            <button
              className="text-link"
              type="button"
              onClick={() => setConfirm(false)}
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            className="icon-button"
            type="button"
            title="Remover"
            aria-label={"Remover " + name}
            onClick={() => setConfirm(true)}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
      <div className="field-grid">{children}</div>
    </fieldset>
  );
}

async function send(path: string, body: object) {
  const res = await fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const value: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      value &&
      typeof value === "object" &&
      "error" in value &&
      typeof value.error === "string"
        ? value.error
        : "Não foi possível salvar. Tente novamente.";
    throw new Error(message);
  }
  return value;
}
export function Editor({ initial }: { initial: Publication }) {
  const [saved, setSaved] = useState(initial);
  const [content, setContent] = useState(initial.content);
  const [tab, setTab] = useState<Tab>("perfil");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const dirty = JSON.stringify(content) !== JSON.stringify(saved.content);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function update<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((prev) => ({ ...prev, [key]: value }));
    setStatus("");
    setError(false);
  }
  function changeLink(id: string, patch: Partial<SocialLink>) {
    update(
      "links",
      content.links.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }
  function changeStream(id: string, patch: Partial<Stream>) {
    update(
      "streams",
      content.streams.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    );
  }
  function changeNote(id: string, patch: Partial<Note>) {
    update(
      "notes",
      content.notes.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }
  function remove(group: Group, id: string) {
    setContent((prev) => ({
      ...prev,
      [group]: prev[group].filter((row) => row.id !== id),
    }));
    setStatus("");
  }
  function move(group: "links" | "notes", index: number, offset: number) {
    const next = [...content[group]];
    const other = index + offset;
    if (other < 0 || other >= next.length) return;
    [next[index], next[other]] = [next[other], next[index]];
    setContent((prev) => ({ ...prev, [group]: next }));
    setStatus("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contentSchema.safeParse(content);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const [section, index, field] = issue.path;
      const target: Tab =
        section === "links" || section === "streams" || section === "notes"
          ? section
          : "perfil";
      setTab(target);
      setError(true);
      const item =
        typeof index === "number" ? " (item " + (index + 1) + ")" : "";
      const detail =
        field === "url"
          ? "Use um endereço https:// completo."
          : "Confira os campos obrigatórios e seus limites.";
      setStatus(
        (tabs.find((t) => t.key === target)?.label ?? "Perfil") +
          item +
          ". " +
          detail,
      );
      return;
    }
    setBusy(true);
    setError(false);
    setStatus("");
    try {
      const res = await send("/api/editor", {
        revision: saved.revision,
        content: parsed.data,
      });
      if (
        !res ||
        typeof res !== "object" ||
        !("revision" in res) ||
        typeof res.revision !== "number"
      )
        throw new Error("Atualize a página para conferir a publicação.");
      setSaved({ revision: res.revision, content: parsed.data });
      setContent(parsed.data);
      setStatus("Alterações publicadas na página.");
    } catch (reason) {
      setError(true);
      setStatus(
        reason instanceof Error ? reason.message : "Não foi possível salvar.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="wrap editor">
      <div className="editor-title">
        <p className="section-kicker">
          <LockKeyhole size={15} />
          NATI GOAT
        </p>
        <h1>Estúdio da Nati</h1>
      </div>
      <nav className="editor-tabs" aria-label="Seções do painel">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={tab === t.key}
            disabled={busy}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <form onSubmit={save} className="editor-panel">
        <fieldset className="editor-fields" disabled={busy}>
          {tab === "perfil" && (
            <>
              <h2>Apresentação</h2>
              <Field label="Texto de boas-vindas">
                <textarea
                  required
                  rows={4}
                  maxLength={280}
                  value={content.bio}
                  onChange={(e) => update("bio", e.target.value)}
                />
              </Field>
            </>
          )}
          {tab === "links" && (
            <>
              <h2>Meus links</h2>
              <p>
                Escolha a ordem dos seus canais. Um link sem endereço aparece
                como “Em breve”.
              </p>
              {content.links.map((row, i) => (
                <EditRow
                  key={row.id}
                  name={row.title || "Novo link"}
                  remove={() => remove("links", row.id)}
                  first={i === 0}
                  last={i === content.links.length - 1}
                  move={(offset) => move("links", i, offset)}
                >
                  <Field label="Título">
                    <input
                      required
                      maxLength={80}
                      value={row.title}
                      onChange={(e) =>
                        changeLink(row.id, { title: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Plataforma">
                    <PlatformSelect
                      value={row.platform}
                      update={(value) =>
                        changeLink(row.id, { platform: value })
                      }
                    />
                  </Field>
                  <Field wide label="Descrição">
                    <input
                      maxLength={100}
                      value={row.description}
                      onChange={(e) =>
                        changeLink(row.id, { description: e.target.value })
                      }
                    />
                  </Field>
                  <UrlField
                    value={row.url}
                    update={(value) => changeLink(row.id, { url: value })}
                  />
                </EditRow>
              ))}
              <button
                type="button"
                className="button light add-button"
                disabled={content.links.length >= 32}
                onClick={() =>
                  update("links", [
                    ...content.links,
                    {
                      id: crypto.randomUUID(),
                      title: "",
                      platform: "Outro",
                      url: "",
                      description: "",
                    },
                  ])
                }
              >
                <Plus size={16} />
                Adicionar link
              </button>
            </>
          )}
          {tab === "streams" && (
            <>
              <h2>Agenda semanal</h2>
              <p>
                Os dias se repetem a cada semana. Use o horário de Brasília.
              </p>
              <label className="check-field">
                <input
                  type="checkbox"
                  checked={content.sampleSchedule}
                  onChange={(e) => update("sampleSchedule", e.target.checked)}
                />
                Identificar a agenda como exemplo
              </label>
              {content.streams.map((row) => (
                <EditRow
                  key={row.id}
                  name={row.title || "Nova live"}
                  remove={() => remove("streams", row.id)}
                >
                  <Field wide label="Título da live">
                    <input
                      required
                      maxLength={80}
                      value={row.title}
                      onChange={(e) =>
                        changeStream(row.id, { title: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Dia da semana">
                    <select
                      value={row.day}
                      onChange={(e) =>
                        changeStream(row.id, { day: Number(e.target.value) })
                      }
                    >
                      {weekdays.map((day, i) => (
                        <option key={day} value={i}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Horário">
                    <input
                      type="time"
                      required
                      value={row.time}
                      onChange={(e) =>
                        changeStream(row.id, { time: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Plataforma">
                    <PlatformSelect
                      value={row.platform}
                      update={(value) =>
                        changeStream(row.id, { platform: value })
                      }
                    />
                  </Field>
                  <UrlField
                    value={row.url}
                    update={(value) => changeStream(row.id, { url: value })}
                  />
                </EditRow>
              ))}
              <button
                type="button"
                className="button light add-button"
                disabled={content.streams.length >= 35}
                onClick={() =>
                  update("streams", [
                    ...content.streams,
                    {
                      id: crypto.randomUUID(),
                      title: "",
                      day: 0,
                      time: "20:00",
                      platform: "Twitch",
                      url: "",
                    },
                  ])
                }
              >
                <Plus size={16} />
                Adicionar live
              </button>
            </>
          )}
          {tab === "notes" && (
            <>
              <h2>Recados</h2>
              <p>
                Publique novidades, avisos e conteúdos extras. Os recados
                aparecem depois da agenda.
              </p>
              {content.notes.map((row, i) => (
                <EditRow
                  key={row.id}
                  name={row.title || "Novo recado"}
                  remove={() => remove("notes", row.id)}
                  first={i === 0}
                  last={i === content.notes.length - 1}
                  move={(offset) => move("notes", i, offset)}
                >
                  <Field wide label="Título">
                    <input
                      required
                      maxLength={80}
                      value={row.title}
                      onChange={(e) =>
                        changeNote(row.id, { title: e.target.value })
                      }
                    />
                  </Field>
                  <Field wide label="Mensagem">
                    <textarea
                      required
                      maxLength={1600}
                      rows={4}
                      value={row.body}
                      onChange={(e) =>
                        changeNote(row.id, { body: e.target.value })
                      }
                    />
                  </Field>
                  <UrlField
                    value={row.url}
                    update={(value) => changeNote(row.id, { url: value })}
                  />
                </EditRow>
              ))}
              <button
                type="button"
                className="button light add-button"
                disabled={content.notes.length >= 20}
                onClick={() =>
                  update("notes", [
                    ...content.notes,
                    { id: crypto.randomUUID(), title: "", body: "", url: "" },
                  ])
                }
              >
                <Plus size={16} />
                Adicionar recado
              </button>
            </>
          )}
        </fieldset>
        <div className="save-bar">
          <button
            type="submit"
            className="button solid"
            disabled={busy || !dirty}
          >
            <Save size={16} />
            {busy ? "Salvando…" : "Salvar alterações"}
          </button>
          <span
            className={"form-status" + (error ? " error" : "")}
            role="status"
          >
            {!dirty && !error && <Check size={15} />}{" "}
            {status || (dirty ? "Alterações pendentes" : "Página atualizada")}
          </span>
        </div>
      </form>
    </main>
  );
}
