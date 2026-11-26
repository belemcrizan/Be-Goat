import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nati Goat · Lives e canais",
  description:
    "Acompanhe a programação de lives da Nati Goat e encontre os canais oficiais da streamer.",
  icons: { icon: "/favicon.svg" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Nati Goat · Lives e canais",
    description: "Programação, canais e novidades da Nati Goat.",
    type: "website",
    locale: "pt_BR",
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
