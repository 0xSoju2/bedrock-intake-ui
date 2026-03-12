'use client';

import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getTokenByMint } from '@/lib/solana';
import { TokenInfo } from '@/lib/types';
import { TokenCard } from './TokenCard';
import { Loader2 } from 'lucide-react';

export function ManualMintInput({ walletAddr }: { walletAddr: string }) {
  const [input, setInput] = useState('');
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch() {
    setError('');
    setToken(null);
    const addr = input.trim();
    if (!addr) return;

    try { new PublicKey(addr); }
    catch { setError('INVALID ADDRESS'); return; }

    setLoading(true);
    try {
      const result = await getTokenByMint(addr, walletAddr);
      if (!result) { setError('TOKEN NOT FOUND ON-CHAIN'); return; }

      if (!result.isAuthority) {
        setError(
          `NOT VERIFIED AS CREATOR\n` +
          `METHOD: ${result.creatorLabel.toUpperCase()}\n` +
          `DETECTED CREATOR: ${result.detectedCreator ?? 'NONE'}`
        );
        return;
      }
      setToken(result);
    } catch {
      setError('FAILED TO FETCH TOKEN INFO');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-0 border border-[#1e1e1e]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Token mint address"
          className="flex-1 bg-transparent px-4 py-3 text-sm font-mono text-white placeholder-[#444] focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !input.trim()}
          className="border-l border-[#1e1e1e] px-6 py-3 text-[11px] uppercase tracking-widest font-medium hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : null}
          {loading ? 'Scanning...' : 'Verify'}
        </button>
      </div>

      {error && (
        <div className="border border-[#1e1e1e] p-4">
          <p className="text-[11px] font-mono text-[#666] whitespace-pre-line">{error}</p>
        </div>
      )}

      {token && <TokenCard token={token} />}
    </div>
  );
}
