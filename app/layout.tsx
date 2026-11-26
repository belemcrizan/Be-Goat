import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "begoat · Links e agenda de lives",
  description:
    "O cantinho da begoat. Encontre as redes da streamer e acompanhe a agenda de lives em horário de Brasília.",
  icons: { icon: "/favicon.svg" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
