import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { readStreamerEmail } from "./store";
import { sameAccount } from "./permissions";

export async function getAccess() {
  const user = await getChatGPTUser();
  if (!user) return { role: "guest", user } as const;
  if (sameAccount(user.email, env.BEGOAT_OWNER_EMAIL))
    return { role: "owner", user } as const;
  if (sameAccount(user.email, await readStreamerEmail()))
    return { role: "streamer", user } as const;
  return { role: "visitor", user } as const;
}
