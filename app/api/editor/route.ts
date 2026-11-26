import { cardDestinationIssue, saveSchema } from "@/lib/begoat/content";
import { authorizeMutation, readBody, result } from "@/lib/begoat/mutations";
import { publish } from "@/lib/begoat/store";

export async function PUT(req: Request) {
  const denied = await authorizeMutation(req);
  if (denied) return denied;
  const parsed = saveSchema.safeParse(await readBody(req));
  if (!parsed.success)
    return result(
      { error: "Confira os textos, horários e endereços dos links." },
      400,
    );
  const issue = cardDestinationIssue(
    parsed.data.content.cardUrls,
    new URL(req.url).origin,
  );
  if (issue) return result({ error: issue }, 400);
  const revision = await publish(parsed.data.revision, parsed.data.content);
  return revision === null
    ? result(
        {
          error:
            "A página foi atualizada em outra aba. Copie suas alterações e recarregue para continuar.",
        },
        409,
      )
    : result({ revision });
}
