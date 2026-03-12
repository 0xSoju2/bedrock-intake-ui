'use client';

import { useEffect } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useRouter } from 'next/navigation';
import { ManualMintInput } from '@/components/ManualMintInput';

export default function TokensPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!connected) router.push('/');
  }, [connected, router]);

  if (!connected || !publicKey) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col gap-12">

      <div className="border-b border-[#1e1e1e] pb-8">
        <p className="text-[11px] uppercase tracking-widest text-[#666] mb-4">Step 01 — Find your token</p>
        <h1 className="text-3xl font-bold mb-3">Token Lookup</h1>
        <p className="text-[#666] text-sm max-w-lg leading-relaxed">
          Enter your token's mint address. We verify you're the creator using multiple
          on-chain methods — pump.fun, Meteora DBC, mint authority, or genesis transaction.
        </p>
        <p className="text-[11px] font-mono text-[#444] mt-4 truncate">
          {publicKey.toBase58()}
        </p>
      </div>

      {/* Detection methods legend */}
      <div className="border border-[#1e1e1e] p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'pump.fun creator', tag: 'PUMP' },
          { label: 'Meteora DBC creator', tag: 'DBC' },
          { label: 'Mint authority', tag: 'MINT' },
          { label: 'Genesis tx deployer', tag: 'GENESIS' },
        ].map(({ label, tag }) => (
          <div key={tag}>
            <p className="text-[10px] font-mono text-[#444] border border-[#1e1e1e] inline-block px-1.5 py-0.5 mb-1">{tag}</p>
            <p className="text-[11px] text-[#666]">{label}</p>
          </div>
        ))}
      </div>

      <ManualMintInput walletAddr={publicKey.toBase58()} />

    </div>
  );
}
