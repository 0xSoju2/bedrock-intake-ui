import type { Metadata } from 'next';
import './globals.css';
import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Bedrock Intake',
  description: 'Incorporate your token with Bedrock Foundation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-[#f5f5f5] min-h-screen">
        <SolanaWalletProvider>
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-10">{children}</main>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
