import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LocalHub - Find Local Businesses',
  description: 'Conversational local business discovery for ChatGPT',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
