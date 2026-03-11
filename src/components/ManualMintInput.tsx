'use client';

import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getTokenByMint } from '@/lib/solana';
import { TokenInfo } from '@/lib/types';
import { TokenCard } from './TokenCard';
import { Loader2, Search } from 'lucide-react';

export function ManualMintInput({ walletPubkey }: { walletPubkey: PublicKey }) {
  const [input, setInput] = useState('');
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch() {
    setError('');
    setToken(null);
    const addr = input.trim();
    if (!addr) return;

    try {
      new PublicKey(addr); // validate
    } catch {
      setError('Invalid Solana address');
      return;
    }

    setLoading(true);
    try {
      const result = await getTokenByMint(addr);
      if (!result) {
        setError('Token not found on-chain');
        return;
      }

      const isAuthority =
        result.mintAuthority === walletPubkey.toBase58();

      if (!isAuthority) {
        setError(
          `Your wallet is not the mint authority for this token.\nMint authority: ${result.mintAuthority || 'revoked'}`
        );
        return;
      }

      setToken({ ...result, isAuthority: true });
    } catch {
      setError('Failed to fetch token info');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Token mint address"
          className="flex-1 bg-[#111111] border border-[#1f1f1f] rounded-lg px-4 py-2.5 text-sm font-mono text-[#f5f5f5] placeholder-[#6b7280] focus:outline-none focus:border-[#7C3AED] transition-colors"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !input.trim()}
          className="bg-[#1f1f1f] hover:bg-[#2a2a2a] disabled:opacity-50 text-[#f5f5f5] rounded-lg px-4 py-2.5 text-sm transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Look up
        </button>
      </div>

      {error && (
        <p className="text-sm text-[#EF4444] whitespace-pre-line">{error}</p>
      )}

      {token && <TokenCard token={token} />}
    </div>
  );
}
