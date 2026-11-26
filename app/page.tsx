import { readPublication } from "@/lib/begoat/store";
import { localDay, timeInBrasilia } from "@/lib/begoat/calendar";
import { HomeView } from "@/components/home";

export const dynamic = "force-dynamic";
export default async function Home() {
  const { content } = await readPublication();
  const now = new Date();
  return (
    <HomeView
      content={content}
      initialDay={localDay(now)}
      initialTime={timeInBrasilia(now)}
    />
  );
}
