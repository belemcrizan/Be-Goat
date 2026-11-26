import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nati Goat · Lives, loja e agenda",
  description:
    "Escolha uma carta para ver as lives, a loja, a agenda ou conhecer a Nati Goat.",
  icons: { icon: "/brand/carneiro.svg" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Nati Goat · Lives, loja e agenda",
    description: "Lives, loja, agenda e a história da Nati Goat.",
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
