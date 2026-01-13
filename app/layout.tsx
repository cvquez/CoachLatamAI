import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CoachLatam - Plataforma de Coaching',
  description: 'Plataforma integral de gestión de coaching profesional',

  icons: {
    icon: '/app/favicon.png',
  },

// openGraph: {
//    images: [
//      {
//        url: 'https://bolt.new/static/og_default.png',
//      },
//    ],
//  },
//
//  twitter: {
//    card: 'summary_large_image',
//    images: [
//      {
//        url: 'https://bolt.new/static/og_default.png',
//      },
//    ],
//  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
