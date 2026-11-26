import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Globe, LockKeyhole } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { Editor } from "@/components/editor";
import { LoginForm, Logout } from "@/components/session-controls";
import { hasAdminSession, sessionCookieName } from "@/lib/begoat/access";
import { readPublication } from "@/lib/begoat/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Estúdio · Nati Goat",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const editing = await hasAdminSession(
    (await cookies()).get(sessionCookieName)?.value,
  );
  return (
    <div className="admin-page">
      <header className="masthead">
        <div className="wrap mast-inner">
          <a href="/" className="brand-link" aria-label="Nati Goat, início">
            <Wordmark />
          </a>
          <div className="mast-actions">
            <a
              className="admin-link"
              href="/"
              target={editing ? "_blank" : undefined}
              rel="noopener"
            >
              <Globe size={15} />
              Ver página
            </a>
            {editing && <Logout />}
          </div>
        </div>
      </header>
      {editing ? (
        <Editor initial={await readPublication()} />
      ) : (
        <main className="login-shell wrap">
          <section className="login-art">
            <img
              src="/brand/retrato.webp"
              alt="Nati Goat em um vestido vinho."
            />
            <div>
              <span className="micro">Nati Goat</span>
              <h2>
                Estúdio <br />
                <em>da Nati.</em>
              </h2>
            </div>
          </section>
          <section className="login-panel">
            <span className="section-kicker">
              <LockKeyhole size={14} /> Acesso da streamer
            </span>
            <h1>Entrar no estúdio</h1>
            <p>Edite a agenda, os canais e os recados da Nati.</p>
            <LoginForm />
          </section>
        </main>
      )}
    </div>
  );
}
