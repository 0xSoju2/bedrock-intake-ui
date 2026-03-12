'use client';

import { FC, ReactNode } from 'react';
import { UnifiedWalletProvider } from '@jup-ag/wallet-adapter';

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <UnifiedWalletProvider
      wallets={[]}
      config={{
        autoConnect: true,
        env: 'mainnet-beta',
        metadata: {
          name: 'Bedrock Intake',
          description: 'Incorporate your token with Bedrock Foundation',
          url: 'https://bedrock.foundation',
          iconUrls: [],
        },
        theme: 'dark',
        lang: 'en',
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
};
