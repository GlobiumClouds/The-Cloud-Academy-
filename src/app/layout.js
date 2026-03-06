/**
 * Root layout — wraps every page with:
 *  - ThemeProvider  (next-themes)
 *  - QueryClientProvider (TanStack Query v5)
 *  - Toaster (react-hot-toast)
 */
import { Inter } from 'next/font/google';
import './globals.css';

import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: {
    default: 'The Clouds Academy',
    template: '%s | The Clouds Academy',
  },
  description: 'School Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
