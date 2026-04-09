import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { ChatLoader } from '@/components/chat-loader';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'OpenCX Interview Prep',
    template: '%s - Study Guide',
  },
  description:
    'Study guide for OpenCX Customer Engineer interview: AI Agents, RAG, Tools, and Prompt Engineering.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <ChatLoader />
        </ThemeProvider>
      </body>
    </html>
  );
}
