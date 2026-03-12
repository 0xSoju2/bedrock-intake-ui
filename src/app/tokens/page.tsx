'use client';

import { useEffect } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useRouter } from 'next/navigation';
import { ManualMintInput } from '@/components/ManualMintInput';
import { Info } from 'lucide-react';

export default function TokensPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!connected) router.push('/');
  }, [connected, router]);

  if (!connected || !publicKey) return null;

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold mb-1">Find your token</h1>
        <p className="text-[#6b7280] text-sm">
          Enter your token's mint address. We'll detect if you're the creator using
          multiple on-chain methods — mint authority, pump.fun, Meteora DBC, or genesis transaction.
        </p>
        <p className="text-[#6b7280] text-xs mt-2 font-mono truncate">
          Connected: {publicKey.toBase58()}
        </p>
      </div>

      {/* Info box — detection methods */}
      <div className="border border-[#1f1f1f] rounded-xl p-4 bg-[#111111] flex gap-3">
        <Info size={16} className="text-[#7C3AED] shrink-0 mt-0.5" />
        <div className="text-sm text-[#6b7280] space-y-1">
          <p className="text-[#f5f5f5] font-medium text-xs uppercase tracking-wide mb-2">How we verify you're the creator</p>
          <p><span className="text-green-400">🎯 pump.fun</span> — reads creator from the bonding curve account on-chain</p>
          <p><span className="text-blue-400">🌊 Meteora DBC</span> — reads creator from the DBC pool state on-chain</p>
          <p><span className="text-purple-400">🔑 Mint authority</span> — checks if your wallet is still the mint authority</p>
          <p><span className="text-yellow-400">🧬 Genesis tx</span> — checks if your wallet signed the original token creation tx</p>
        </div>
      </div>

      {/* Main input */}
      <ManualMintInput walletAddr={publicKey.toBase58()} />
    </div>
  );
}
