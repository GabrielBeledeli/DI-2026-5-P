import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KickHub | Gestão de Sneakers",
  description: "Sistema interno de gestão de vendas de sneakers",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full bg-[#0f0f0f]" suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`try { var theme = localStorage.getItem('kickhub_theme') || 'dark'; document.documentElement.classList.toggle('light', theme === 'light'); document.documentElement.classList.toggle('dark', theme !== 'light'); } catch (_) {}`}
        </Script>
      </head>
      <body className={`${inter.className} min-h-full text-[#f5f5f5]`}>
        {children}
      </body>
    </html>
  );
}
