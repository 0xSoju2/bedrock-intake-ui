'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { PublicKey } from '@solana/web3.js';
import { getWalletMintAuthority } from '@/lib/solana';
import { TokenInfo } from '@/lib/types';
import { TokenCard } from '@/components/TokenCard';
import { ManualMintInput } from '@/components/ManualMintInput';
import { Loader2, Search } from 'lucide-react';

export default function TokensPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!connected) {
      router.push('/');
    }
  }, [connected, router]);

  useEffect(() => {
    if (publicKey) {
      loadTokens(publicKey);
    }
  }, [publicKey]);

  async function loadTokens(pk: PublicKey) {
    setLoading(true);
    setSearched(false);
    try {
      const found = await getWalletMintAuthority(pk);
      setTokens(found);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  if (!connected || !publicKey) return null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Your Tokens</h1>
        <p className="text-[#6b7280] text-sm">
          Showing tokens where your wallet is the mint authority.
        </p>
        <p className="text-[#6b7280] text-xs mt-1 font-mono truncate">
          {publicKey.toBase58()}
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-[#6b7280]">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Scanning on-chain for your tokens...</span>
        </div>
      )}

      {!loading && searched && tokens.length === 0 && (
        <div className="border border-[#1f1f1f] rounded-xl p-8 text-center bg-[#111111]">
          <Search size={32} className="text-[#6b7280] mx-auto mb-3" />
          <p className="text-[#6b7280] text-sm">
            No tokens found where this wallet is the mint authority.
          </p>
          <p className="text-[#6b7280] text-xs mt-1">
            If you launched via a different wallet, switch wallets and reconnect.
          </p>
        </div>
      )}

      {tokens.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tokens.map((token) => (
            <TokenCard key={token.mint} token={token} />
          ))}
        </div>
      )}

      {/* Manual entry for tokens deployed via multisig/program */}
      {searched && (
        <div className="mt-2">
          <p className="text-xs text-[#6b7280] mb-3">
            Don't see your token? You may have deployed via a program or multisig.
            Enter the mint address manually:
          </p>
          <ManualMintInput walletPubkey={publicKey} />
        </div>
      )}
    </div>
  );
}
