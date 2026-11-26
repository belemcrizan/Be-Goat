"use client";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, LogOut } from "lucide-react";

export function LoginForm() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.get("username"),
          password: data.get("password"),
        }),
      });
      if (res.ok) {
        window.location.replace("/admin");
        return;
      }
      const body: { error?: string } = await res.json();
      setError(body.error ?? "Não foi possível entrar. Tente novamente.");
    } catch {
      setError("Não foi possível conectar ao estúdio. Tente novamente.");
    }
    setBusy(false);
  }
  return (
    <form className="login-form" onSubmit={submit}>
      <label className="editor-field">
        <span>Usuário</span>
        <input
          name="username"
          autoCapitalize="none"
          autoComplete="username"
          autoCorrect="off"
          spellCheck={false}
          required
          maxLength={80}
        />
      </label>
      <div className="password-field">
        <label className="editor-field">
          <span>Senha</span>
          <input
            className="password-input"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            maxLength={256}
          />
        </label>
        <button
          type="button"
          className="reveal-button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <button className="button primary" disabled={busy}>
        <LockKeyhole size={16} />
        {busy ? "Entrando…" : "Entrar no estúdio"}
      </button>
      {error && (
        <p className="form-status error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export function Logout() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="logout">
      <button
        className="admin-link"
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          try {
            const res = await fetch("/api/session", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: "{}",
            });
            if (!res.ok) throw new Error();
            window.location.replace("/admin");
          } catch {
            setError("Não foi possível sair. Tente novamente.");
            setPending(false);
          }
        }}
      >
        <LogOut size={15} />
        Sair
      </button>
      {error && <span role="alert">{error}</span>}
    </div>
  );
}
