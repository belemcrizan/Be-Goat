import type { Metadata } from "next";
import { ExternalLink, LockKeyhole } from "lucide-react";
import { chatGPTSignInPath, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { Wordmark } from "@/components/brand";
import { Editor } from "@/components/editor";
import { getAccess } from "@/lib/begoat/access";
import { readPublication, readStreamerEmail } from "@/lib/begoat/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Área da streamer · begoat",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const { role, user } = await getAccess();
  const editing = role === "owner" || role === "streamer";
  return (
    <div className="admin-page">
      <header className="topbar">
        <div className="wrap admin-top">
          <a className="brand-link" href="/" aria-label="begoat, início">
            <Wordmark />
          </a>
          <div>
            <a
              className="admin-link"
              href="/"
              target={editing ? "_blank" : undefined}
              rel="noopener"
            >
              Ver página{editing && <ExternalLink size={14} />}
            </a>
            {user && (
              <a
                className="text-link"
                href={chatGPTSignOutPath("/admin")}
                target="_top"
              >
                Sair
              </a>
            )}
          </div>
        </div>
      </header>
      {editing ? (
        <Editor
          initial={await readPublication()}
          owner={role === "owner"}
          streamerEmail={role === "owner" ? await readStreamerEmail() : ""}
        />
      ) : (
        <main className="login-panel">
          <img
            className="login-card"
            src="/brand/rei-de-copas.webp"
            width="72"
            height="102"
            alt=""
          />
          <p className="section-kicker">
            <LockKeyhole size={15} />
            ACESSO RESTRITO
          </p>
          <h1>
            Área da <em>streamer.</em>
          </h1>
          {user ? (
            <>
              <p>
                Esta conta não tem acesso de edição. Entre com a conta
                autorizada pelo responsável pelo site.
              </p>
              <a
                className="button solid"
                href={chatGPTSignOutPath("/admin")}
                target="_top"
              >
                Trocar de conta
              </a>
            </>
          ) : (
            <>
              <p>
                Entre com a conta autorizada para editar seus links, a agenda e
                os recados.
              </p>
              <a
                className="button solid"
                href={chatGPTSignInPath("/admin")}
                target="_top"
              >
                <LockKeyhole size={16} />
                Entrar com ChatGPT
              </a>
            </>
          )}
          <a className="login-back" href="/">
            Voltar para a página
          </a>
        </main>
      )}
    </div>
  );
}
