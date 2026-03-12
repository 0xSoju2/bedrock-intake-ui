'use client';

import { FC, ReactNode, useState, useEffect } from 'react';
import { UnifiedWalletProvider } from '@jup-ag/wallet-adapter';

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Skip rendering wallet provider during SSR to prevent window/document errors
  if (!mounted) return <>{children}</>;

  return (
    <UnifiedWalletProvider
      wallets={[]}
      config={{
        autoConnect: false,
        env: 'mainnet-beta',
        metadata: {
          name: 'Bedrock Intake',
          description: 'Incorporate your token with Bedrock Foundation',
          url: 'https://bedrock-intake-5v5e8z0ke-0xsoju2s-projects.vercel.app',
          iconUrls: ['https://unified.jup.ag/favicon.ico'],
        },
        theme: 'dark',
        lang: 'en',
        walletlistExplanation: {
          href: 'https://station.jup.ag/docs/additional-topics/wallet-list',
        },
        notificationCallback: {
          onConnect: ({ shortAddress, walletName }) => {
            console.log(`[Bedrock] ${walletName} connected: ${shortAddress}`);
          },
          onConnecting: ({ walletName }) => {
            console.log(`[Bedrock] Connecting to ${walletName}...`);
          },
          onDisconnect: ({ walletName }) => {
            console.log(`[Bedrock] ${walletName} disconnected`);
          },
          onNotInstalled: ({ walletName, metadata }) => {
            console.log(`[Bedrock] ${walletName} not installed`);
            if (metadata?.url) window.open(metadata.url, '_blank');
          },
        },
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
};
