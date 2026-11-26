import { readPublication } from "@/lib/begoat/store";
import { localDay } from "@/lib/begoat/calendar";
import { HomeView } from "@/components/home";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { content } = await readPublication();
  return <HomeView content={content} today={localDay()} />;
}
