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

const siteUrl = process.env.SITE_URL || "https://economia-energy.onrender.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Economia Energy - 50% de Desconto na Conta de Luz | Economia Energética",
    template: "%s | Economia Energy",
  },
  description:
    "Economize até 50% na sua conta de energia elétrica com a Economia Energy. Consultoria energética especializada. Desconto válido por 12 meses. Mais de 15.000 clientes satisfeitos em todo o Brasil.",
  keywords: [
    "desconto conta de luz",
    "economia energia elétrica",
    "50% desconto energia",
    "redução conta de luz",
    "economia conta de luz",
    "consultoria energética",
    "desconto energia elétrica",
    "conta de luz barata",
    "economia energy",
    "mercado livre de energia",
    "energia solar por assinatura",
    "eficiência energética",
    "ANEEL desconto energia",
    "como economizar na conta de luz",
    "desconto na fatura de energia",
  ],
  authors: [{ name: "Economia Energy", url: siteUrl }],
  creator: "Economia Energy",
  publisher: "Economia Ecologica Energy Ltda",
  category: "Consultoria Energética",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Economia Energy",
    title: "Economia Energy - 50% de Desconto na Conta de Luz",
    description:
      "Economize até 50% na sua conta de energia elétrica. Consultoria energética com taxa única. Válido por 12 meses. Mais de 15.000 clientes satisfeitos.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Economia Energy - 50% de Desconto na Conta de Luz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Economia Energy - 50% de Desconto na Conta de Luz",
    description:
      "Economize até 50% na sua conta de energia elétrica. Mais de 15.000 clientes satisfeitos.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Economia Energy",
        legalName: "Economia Ecologica Energy Ltda",
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description:
          "Consultoria energética especializada em descontos na conta de luz.",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Avenida Desembargador Moreira, 1701 - Aldeota",
          addressLocality: "Fortaleza",
          addressRegion: "CE",
          postalCode: "60170-001",
          addressCountry: "BR",
        },
        taxID: "53.029.100/0001-07",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: "Portuguese",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Economia Energy",
        description:
          "Economize até 50% na sua conta de energia elétrica com consultoria especializada.",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        inLanguage: "pt-BR",
      },
      {
        "@type": "Service",
        name: "Consultoria Energética - Desconto na Conta de Luz",
        description:
          "Serviço de consultoria energética que garante até 50% de desconto na conta de luz por 12 meses.",
        provider: {
          "@id": `${siteUrl}/#organization`,
        },
        areaServed: {
          "@type": "Country",
          name: "Brasil",
        },
        serviceType: "Consultoria Energética",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Como funciona o desconto de 50% na conta de luz?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Após a aprovação do seu cadastro, realizamos todo o processo junto à distribuidora de energia da sua região. A partir do próximo mês, o desconto de 50% é aplicado diretamente na sua conta de luz.",
            },
          },
          {
            "@type": "Question",
            name: "O desconto é realmente de 50%?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sim! O desconto é de exatamente 50% sobre o valor total da sua conta de energia elétrica.",
            },
          },
          {
            "@type": "Question",
            name: "Por quanto tempo o desconto é válido?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "O desconto é válido por 12 meses (1 ano) a partir da data de ativação. Após esse período, você pode renovar o serviço.",
            },
          },
          {
            "@type": "Question",
            name: "O serviço é legal e seguro?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Todo o processo segue as normas e regulamentações da ANEEL e das distribuidoras de energia. Seus dados pessoais são protegidos pela LGPD.",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
