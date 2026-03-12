import { Connection, PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import { TokenInfo } from './types';

const RPC =
  process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';

export const connection = new Connection(RPC, 'confirmed');

// ─────────────────────────────────────────────
// Program IDs
// ─────────────────────────────────────────────

const PUMP_FUN_PROGRAM = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
const DBC_PROGRAM     = new PublicKey('dbcij3LWUppXre4TXFCoMb4J8e9MGDVEQuGPZuAfRt4');

// ─────────────────────────────────────────────
// Creator detection methods
// ─────────────────────────────────────────────

export type CreatorMethod =
  | 'mint_authority'
  | 'pump_fun'
  | 'meteora_dbc'
  | 'genesis_tx'
  | 'none';

export interface CreatorResult {
  method: CreatorMethod;
  creator: string | null;
  label: string;
}

/**
 * pump.fun — BondingCurveAccount layout
 *   discriminator       8 bytes
 *   virtual_token_res   8 bytes
 *   virtual_sol_res     8 bytes
 *   real_token_res      8 bytes
 *   real_sol_res        8 bytes
 *   token_total_supply  8 bytes
 *   complete            1 byte
 *   creator             32 bytes  ← offset 49
 */
async function getPumpFunCreator(mint: PublicKey): Promise<string | null> {
  try {
    const [bondingCurvePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('bonding-curve'), mint.toBuffer()],
      PUMP_FUN_PROGRAM
    );
    const info = await connection.getAccountInfo(bondingCurvePDA);
    if (!info || info.data.length < 81) return null;
    const creatorBytes = info.data.slice(49, 81);
    return new PublicKey(creatorBytes).toBase58();
  } catch {
    return null;
  }
}

/**
 * Meteora DBC — PoolState layout (approximate; may shift by version)
 *   discriminator  8 bytes
 *   config         32 bytes
 *   creator        32 bytes  ← offset 40
 *   base_mint      32 bytes  ← offset 72
 *
 * We scan for DBC pool accounts that have the target mint at the base_mint
 * offset (72) using getProgramAccounts with memcmp.
 */
async function getDBCCreator(mint: PublicKey): Promise<string | null> {
  try {
    const accounts = await connection.getProgramAccounts(DBC_PROGRAM, {
      filters: [
        { dataSize: 300 },                                     // rough pool size filter
        { memcmp: { offset: 72, bytes: mint.toBase58() } },    // base_mint at offset 72
      ],
    });
    if (accounts.length === 0) return null;
    const poolData = accounts[0].account.data;
    if (poolData.length < 72) return null;
    const creatorBytes = poolData.slice(40, 72);               // creator at offset 40
    return new PublicKey(creatorBytes).toBase58();
  } catch {
    return null;
  }
}

/**
 * Genesis transaction — the fee payer of the very first tx on a mint address
 * is almost always the person who created the token.
 * Works for: direct SPL creates, pump.fun (user signs), DBC (user signs), etc.
 */
async function getGenesisTxCreator(mint: PublicKey): Promise<string | null> {
  try {
    // Get all sigs and grab the LAST one (oldest)
    const sigs = await connection.getSignaturesForAddress(mint, { limit: 1000 });
    if (sigs.length === 0) return null;
    const oldest = sigs[sigs.length - 1];
    const tx = await connection.getParsedTransaction(oldest.signature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx) return null;
    // Fee payer is always accountKeys[0]
    const keys = tx.transaction.message.accountKeys;
    return keys[0]?.pubkey?.toBase58() ?? null;
  } catch {
    return null;
  }
}

/**
 * Mint authority — the classic check. Works for tokens that haven't revoked it.
 * Weakest signal — many legit launchers revoke authority immediately.
 */
async function getMintAuthority(mint: PublicKey): Promise<string | null> {
  try {
    const info = await getMint(connection, mint);
    return info.mintAuthority?.toBase58() ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Main: detect creator from any of the 4 methods
// ─────────────────────────────────────────────

export async function detectCreator(mintAddr: string): Promise<CreatorResult> {
  const mint = new PublicKey(mintAddr);

  // 1. pump.fun (most reliable for pump tokens, works post-graduation)
  const pumpCreator = await getPumpFunCreator(mint);
  if (pumpCreator) {
    return { method: 'pump_fun', creator: pumpCreator, label: 'pump.fun creator' };
  }

  // 2. Meteora DBC
  const dbcCreator = await getDBCCreator(mint);
  if (dbcCreator) {
    return { method: 'meteora_dbc', creator: dbcCreator, label: 'Meteora DBC creator' };
  }

  // 3. Mint authority (fast, works for direct launches)
  const mintAuth = await getMintAuthority(mint);
  if (mintAuth) {
    return { method: 'mint_authority', creator: mintAuth, label: 'Mint authority' };
  }

  // 4. Genesis transaction (universal fallback)
  const genCreator = await getGenesisTxCreator(mint);
  if (genCreator) {
    return { method: 'genesis_tx', creator: genCreator, label: 'Token deployer (genesis tx)' };
  }

  return { method: 'none', creator: null, label: 'Unknown' };
}

// ─────────────────────────────────────────────
// Token metadata
// ─────────────────────────────────────────────

async function fetchTokenMeta(
  mint: string
): Promise<{ name: string; symbol: string; logo?: string }> {
  try {
    const res = await fetch(`https://tokens.jup.ag/token/${mint}`);
    if (res.ok) {
      const data = await res.json();
      return {
        name: data.name || 'Unknown Token',
        symbol: data.symbol || mint.slice(0, 6),
        logo: data.logoURI,
      };
    }
  } catch {}
  return { name: 'Unknown Token', symbol: mint.slice(0, 6) + '...' };
}

// ─────────────────────────────────────────────
// Look up a single token + verify creator
// ─────────────────────────────────────────────

export async function getTokenByMint(
  mintAddr: string,
  walletAddr?: string
): Promise<TokenInfo | null> {
  try {
    const mintPubkey = new PublicKey(mintAddr);
    let supply = '';
    let decimals = 6;
    let mintAuthority: string | null = null;
    let freezeAuthority: string | null = null;

    try {
      const mintInfo = await getMint(connection, mintPubkey);
      decimals = mintInfo.decimals;
      mintAuthority = mintInfo.mintAuthority?.toBase58() ?? null;
      freezeAuthority = mintInfo.freezeAuthority?.toBase58() ?? null;
      const totalSupply = Number(mintInfo.supply) / Math.pow(10, decimals);
      supply = formatSupply(totalSupply);
    } catch {}

    const meta = await fetchTokenMeta(mintAddr);
    const creatorResult = await detectCreator(mintAddr);

    const isAuthority = walletAddr
      ? creatorResult.creator === walletAddr
      : false;

    return {
      mint: mintAddr,
      name: meta.name,
      symbol: meta.symbol,
      logo: meta.logo,
      decimals,
      supply,
      mintAuthority,
      freezeAuthority,
      isAuthority,
      creatorMethod: creatorResult.method,
      creatorLabel: creatorResult.label,
      detectedCreator: creatorResult.creator,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Build the ownership proof message
// ─────────────────────────────────────────────

export function buildOwnershipMessage(mint: string, wallet: string): string {
  return [
    'Bedrock Foundation — Token Incorporation Request',
    '',
    `Token Mint: ${mint}`,
    `Wallet: ${wallet}`,
    `Timestamp: ${new Date().toISOString()}`,
    '',
    'By signing this message, I confirm I am the creator/deployer',
    'of the above token and wish to incorporate it via Bedrock Foundation.',
    'This signature does not authorize any on-chain transaction.',
  ].join('\n');
}

// ─────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────

function formatSupply(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K';
  return n.toFixed(2);
}
