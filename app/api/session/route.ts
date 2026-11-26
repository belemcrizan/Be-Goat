import { z } from "zod";
import { cookies } from "next/headers";
import {
  cookieHeader,
  revokeSession,
  sessionCookieName,
  sessionSeconds,
  signIn,
} from "@/lib/begoat/access";
import { isSameOriginWrite } from "@/lib/begoat/permissions";
import { readBody, result } from "@/lib/begoat/mutations";

const login = z.object({
  username: z.string().min(1).max(80),
  password: z.string().min(1).max(256),
});

export async function POST(req: Request) {
  if (!isSameOriginWrite(req))
    return result({ error: "Origem inválida." }, 403);
  const parsed = login.safeParse(await readBody(req, 4096));
  if (!parsed.success)
    return result({ error: "Informe usuário e senha." }, 400);
  const session = await signIn(
    parsed.data.username,
    parsed.data.password,
    req.headers.get("cf-connecting-ip") || "local",
  );
  if (session.status === 401)
    return result({ error: "Usuário ou senha incorretos." }, 401);
  if (session.status === 503)
    return result(
      { error: "O acesso do estúdio ainda precisa ser configurado." },
      503,
    );
  if (session.status === 429) {
    const response = result(
      { error: "Muitas tentativas. Tente novamente em 15 minutos." },
      429,
    );
    response.headers.set("Retry-After", "900");
    return response;
  }
  const response = result({ ok: true });
  response.headers.set(
    "Set-Cookie",
    cookieHeader(req, session.token, sessionSeconds),
  );
  return response;
}

export async function DELETE(req: Request) {
  if (!isSameOriginWrite(req))
    return result({ error: "Origem inválida." }, 403);
  await revokeSession((await cookies()).get(sessionCookieName)?.value);
  const response = result({ ok: true });
  response.headers.set("Set-Cookie", cookieHeader(req, "", 0));
  return response;
}
