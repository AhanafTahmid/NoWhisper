import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvide from '../context/AuthProvide';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NoWhisper',
  description: 'Real feedback from real people.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" >
      <AuthProvide>
        <body className={inter.className}>
          {children}
        </body>
        </AuthProvide>
    </html>
  );
}
