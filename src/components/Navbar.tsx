'use client';

import Link from 'next/link';
import { UnifiedWalletButton } from '@jup-ag/wallet-adapter';

export function Navbar() {
  return (
    <nav className="border-b border-[#1f1f1f] px-4 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🪨</span>
          <span className="font-semibold text-[#f5f5f5] tracking-tight">
            Bedrock
            <span className="text-[#7C3AED] ml-1">Intake</span>
          </span>
        </Link>
        <UnifiedWalletButton />
      </div>
    </nav>
  );
}
