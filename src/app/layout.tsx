import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Economia Energy - 50% de Desconto na Conta de Luz",
  description:
    "Economize 50% na sua conta de energia elétrica. Pague apenas R$ 129,90 de taxa de consultoria e comece a economizar a partir do próximo mês. Válido por 12 meses!",
  keywords: [
    "desconto conta de luz",
    "economia energia",
    "50% desconto energia",
    "redução conta luz",
    "economia conta de luz",
  ],
  authors: [{ name: "Economia Energy" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Economia Energy - 50% de Desconto na Conta de Luz",
    description:
      "Economize 50% na sua conta de energia elétrica. Taxa única de R$ 129,90.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
