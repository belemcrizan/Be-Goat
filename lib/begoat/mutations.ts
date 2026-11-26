import { isSameOriginWrite } from "./permissions";
import { hasAdminSession, sessionCookieName } from "./access";
import { cookies } from "next/headers";

export const result = (value: object, status = 200) =>
  Response.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });

export async function authorizeMutation(req: Request) {
  if (!isSameOriginWrite(req))
    return result({ error: "Requisição inválida." }, 403);
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!(await hasAdminSession(token)))
    return result({ error: "Entre novamente para continuar." }, 401);
  return null;
}

export async function readBody(req: Request, limit = 640 * 1024) {
  const reader = req.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  try {
    const data = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    return JSON.parse(new TextDecoder().decode(data));
  } catch {
    return null;
  }
}
