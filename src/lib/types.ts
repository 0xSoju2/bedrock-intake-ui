export interface TokenInfo {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  logo?: string;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  isAuthority: boolean; // wallet is mint authority
}

export interface IncorporationPayload {
  mint: string;
  symbol: string;
  name: string;
  wallet: string;
  signature: string; // signed ownership proof
  message: string;  // the message that was signed
  projectName: string;
  founderName: string;
  founderEmail: string;
  founderTelegram: string;
  description: string;
  website?: string;
  twitter?: string;
  timestamp: number;
  // Declarations
  declaredNoExistingTeam: boolean;
  declaredNoExistingAgreement: boolean;
  declaredOwnsIP: boolean;
}
