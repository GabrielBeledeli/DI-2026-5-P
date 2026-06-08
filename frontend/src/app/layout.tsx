import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KickHub | Gestão de Sneakers",
  description: "Sistema interno de gestão de vendas de sneakers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full bg-[#0f0f0f]">
      {/* suppressHydrationWarning adicionado para evitar erros causados por extensoes de browser (ex: ColorZilla) */}
      <body className={`${inter.className} min-h-full text-[#f5f5f5]`} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
