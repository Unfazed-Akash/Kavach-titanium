import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Kavach Titanium — Real-Time Fraud Intelligence Platform',
  description: 'India\'s next-generation AI-powered ATM & UPI fraud detection system. Real-time threat monitoring, geospatial intelligence, and law enforcement command interface.',
  keywords: 'fraud detection, ATM security, UPI fraud, cybercrime, fintech, AI, real-time monitoring, India',
  openGraph: {
    title: 'Kavach Titanium',
    description: 'Real-Time Fraud Intelligence Platform',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>" />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingTop: 'var(--nav-height)', height: '100vh', overflow: 'hidden' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
