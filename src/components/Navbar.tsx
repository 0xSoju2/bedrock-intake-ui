'use client';

import Link from 'next/link';
import { UnifiedWalletButton } from '@jup-ag/wallet-adapter';

export function Navbar() {
  return (
    <nav className="border-b border-[#1e1e1e] px-6 py-4 bg-black">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white">
            <path d="M10 2L3 7V13L10 18L17 13V7L10 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
            <path d="M10 2L10 18M3 7L17 13M17 7L3 13" stroke="white" strokeWidth="1" opacity="0.4"/>
          </svg>
          <span className="font-bold text-white tracking-tight text-lg">Bedrock</span>
        </Link>
        <UnifiedWalletButton />
      </div>
    </nav>
  );
}
