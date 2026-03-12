'use client';

import { FC, ReactNode, useState, useEffect } from 'react';
import { UnifiedWalletProvider } from '@jup-ag/wallet-adapter';

/**
 * Mounted guard prevents SSR hydration issues.
 * @jup-ag/wallet-adapter accesses window/document during init —
 * must only render on the client.
 */
export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          onConnect: (args) => {
            console.log('[Bedrock] Wallet connected:', args.shortAddress);
          },
          onDisconnect: () => {
            console.log('[Bedrock] Wallet disconnected');
          },
          onNotInstalled: (args) => {
            window.open(args.url, '_blank');
          },
        },
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
};
