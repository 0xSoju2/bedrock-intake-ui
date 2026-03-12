import type { Metadata } from 'next';
import './globals.css';
import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Bedrock Intake',
  description: 'The Bedrock of Internet Capital Markets — Incorporate your token',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        <SolanaWalletProvider>
          <Navbar />
          <main>{children}</main>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
