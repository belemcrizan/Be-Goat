import { z } from "zod";
import { emailSchema } from "@/lib/begoat/content";
import { authorizeMutation, readBody, result } from "@/lib/begoat/mutations";
import { writeStreamerEmail } from "@/lib/begoat/store";

export async function PUT(req: Request) {
  const denied = await authorizeMutation(req, true);
  if (denied) return denied;
  const parsed = z
    .object({ email: emailSchema })
    .safeParse(await readBody(req));
  if (!parsed.success)
    return result({ error: "Informe um e-mail válido." }, 400);
  await writeStreamerEmail(parsed.data.email.toLowerCase());
  return result({ saved: true });
}
