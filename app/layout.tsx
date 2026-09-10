import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Yojna Setu | National Scheme Matching & Concessional Credit Portal',
  description: 'Smart scheme matching, reducing-balance EMI calculator with moratorium, and Channel Partner locator for entrepreneurs.',
  openGraph: {
    title: 'Yojna Setu',
    description: 'Empowering entrepreneurs with concessional credit and official scheme guidance.',
    type: 'website',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
