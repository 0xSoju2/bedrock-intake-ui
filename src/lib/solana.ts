import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getMint } from '@solana/spl-token';
import { TokenInfo } from './types';

const RPC =
  process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';

export const connection = new Connection(RPC, 'confirmed');

// Fetch metadata from Jupiter token list / on-chain metadata
async function fetchTokenMeta(
  mint: string
): Promise<{ name: string; symbol: string; logo?: string }> {
  try {
    const res = await fetch(
      `https://tokens.jup.ag/token/${mint}`
    );
    if (res.ok) {
      const data = await res.json();
      return {
        name: data.name || 'Unknown Token',
        symbol: data.symbol || mint.slice(0, 6),
        logo: data.logoURI,
      };
    }
  } catch {}

  return {
    name: 'Unknown Token',
    symbol: mint.slice(0, 6) + '...',
  };
}

// Get all token mints where the wallet is the mint authority
export async function getWalletMintAuthority(
  walletPubkey: PublicKey
): Promise<TokenInfo[]> {
  try {
    // Get all token accounts owned by the wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { programId: TOKEN_PROGRAM_ID }
    );

    const mints = new Set<string>();
    for (const { account } of tokenAccounts.value) {
      const parsed = account.data.parsed?.info;
      if (parsed?.mint) mints.add(parsed.mint);
    }

    const results: TokenInfo[] = [];

    // For each mint, check if this wallet is the mint authority
    const mintChecks = Array.from(mints).map(async (mintAddr) => {
      try {
        const mintPubkey = new PublicKey(mintAddr);
        const mintInfo = await getMint(connection, mintPubkey);

        const isAuthority =
          mintInfo.mintAuthority?.toBase58() === walletPubkey.toBase58();

        if (!isAuthority) return null; // skip if not mint authority

        const meta = await fetchTokenMeta(mintAddr);
        const totalSupply =
          Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals);

        return {
          mint: mintAddr,
          name: meta.name,
          symbol: meta.symbol,
          logo: meta.logo,
          decimals: mintInfo.decimals,
          supply: formatSupply(totalSupply),
          mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
          freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
          isAuthority: true,
        } as TokenInfo;
      } catch {
        return null;
      }
    });

    const resolved = await Promise.allSettled(mintChecks);
    for (const r of resolved) {
      if (r.status === 'fulfilled' && r.value) results.push(r.value);
    }

    return results;
  } catch (err) {
    console.error('Error fetching tokens:', err);
    return [];
  }
}

// Lookup a single mint by address
export async function getTokenByMint(mintAddr: string): Promise<TokenInfo | null> {
  try {
    const mintPubkey = new PublicKey(mintAddr);
    const mintInfo = await getMint(connection, mintPubkey);
    const meta = await fetchTokenMeta(mintAddr);
    const totalSupply =
      Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals);

    return {
      mint: mintAddr,
      name: meta.name,
      symbol: meta.symbol,
      logo: meta.logo,
      decimals: mintInfo.decimals,
      supply: formatSupply(totalSupply),
      mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
      freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
      isAuthority: false, // caller must verify
    };
  } catch {
    return null;
  }
}

// Build the ownership proof message
export function buildOwnershipMessage(mint: string, wallet: string): string {
  return [
    'Bedrock Foundation — Token Incorporation Request',
    '',
    `Token Mint: ${mint}`,
    `Wallet: ${wallet}`,
    `Timestamp: ${new Date().toISOString()}`,
    '',
    'By signing this message, I confirm I am the mint authority',
    'for the above token and wish to incorporate it via Bedrock Foundation.',
    'This signature does not authorize any on-chain transaction.',
  ].join('\n');
}

function formatSupply(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K';
  return n.toFixed(2);
}
