import type { Metadata } from 'next';
import './globals.css';
import '@/styles/theme.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'EcoSphere AI - Autonomous ESG Operating System',
  description: 'Enterprise-grade autonomous ESG intelligence and carbon accounting platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen font-sans transition-all duration-200 bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
