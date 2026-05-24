export interface Agent {
  id: string;
  name: string;
  type: string;
  avatar: string;
  description: string;
  returns: number;
  sharpe: number;
  winRate: number;
  aum: number;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  sizingStrategy: 'Flat' | 'Kelly Criterion' | 'Dynamic';
  history: { date: string; return: number }[];
}

export interface Market {
  id: string;
  title: string;
  category: 'finance' | 'geopolitics' | 'ai';
  volume: number;
  yesProbability: number; // 0 to 100
  resolved: boolean;
  resolution?: 'YES' | 'NO';
  endDate: string;
}

export interface LogLine {
  id: string;
  timestamp: string;
  agentId: string;
  type: 'think' | 'action' | 'settlement' | 'info';
  content: string;
}

export interface Tx {
  hash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  currency: 'USDC' | 'EURC' | 'USYC';
  type: 'DELEGATE' | 'BET' | 'REBALANCE' | 'MINT' | 'ARBITRAGE';
}

export interface Block {
  number: number;
  timestamp: string;
  hash: string;
  txCount: number;
  transactions: Tx[];
}

export const initialAgents: Agent[] = [
  {
    id: 'plato-r1',
    name: 'Plato-R1',
    type: 'Deep Reasoning Agent',
    avatar: '🏛️',
    description: 'Uses reinforcement learning reasoning traces to analyze complex news, macroeconomic reports, and geopolitical events. Optimizes for high-conviction medium-term holds.',
    returns: 34.2,
    sharpe: 2.1,
    winRate: 68,
    aum: 125430,
    riskProfile: 'Moderate',
    sizingStrategy: 'Dynamic',
    history: [
      { date: 'Day 1', return: 0 },
      { date: 'Day 3', return: 4.2 },
      { date: 'Day 6', return: 8.5 },
      { date: 'Day 9', return: 12.1 },
      { date: 'Day 12', return: 18.4 },
      { date: 'Day 15', return: 24.2 },
      { date: 'Day 18', return: 28.9 },
      { date: 'Day 21', return: 34.2 },
    ]
  },
  {
    id: 'aristotle-kelly',
    name: 'Aristotle-Kelly',
    type: 'Mathematical Kelly Agent',
    avatar: '📐',
    description: 'Focuses on probabilistic estimation and mathematical risk sizing. Implements the Kelly Criterion to size bets dynamically based on calculated edge and odds, maximizing log-wealth.',
    returns: 28.5,
    sharpe: 2.4,
    winRate: 59,
    aum: 95200,
    riskProfile: 'Conservative',
    sizingStrategy: 'Kelly Criterion',
    history: [
      { date: 'Day 1', return: 0 },
      { date: 'Day 3', return: 2.1 },
      { date: 'Day 6', return: 5.4 },
      { date: 'Day 9', return: 9.8 },
      { date: 'Day 12', return: 14.2 },
      { date: 'Day 15', return: 19.5 },
      { date: 'Day 18', return: 22.1 },
      { date: 'Day 21', return: 28.5 },
    ]
  },
  {
    id: 'heraclitus-arb',
    name: 'Heraclitus-Arb',
    type: 'High-Frequency Arbitrage',
    avatar: '⚡',
    description: 'Monitors cross-platform price discrepancies between CEX and DEX protocols. Capitalizes on brief slippage windows, executing rapid cross-chain bridge and swap swaps via Gateway Nanopayments.',
    returns: 18.9,
    sharpe: 3.2,
    winRate: 84,
    aum: 72150,
    riskProfile: 'Aggressive',
    sizingStrategy: 'Flat',
    history: [
      { date: 'Day 1', return: 0 },
      { date: 'Day 3', return: 3.5 },
      { date: 'Day 6', return: 6.2 },
      { date: 'Day 9', return: 8.9 },
      { date: 'Day 12', return: 11.2 },
      { date: 'Day 15', return: 13.8 },
      { date: 'Day 18', return: 16.4 },
      { date: 'Day 21', return: 18.9 },
    ]
  }
];

export const initialMarkets: Market[] = [
  {
    id: 'm-1',
    title: 'US Core CPI year-over-year change for June 2026 above 3.1%',
    category: 'geopolitics',
    volume: 450230,
    yesProbability: 64,
    resolved: false,
    endDate: '2026-06-15'
  },
  {
    id: 'm-2',
    title: 'Plato-R1 agent cumulative returns outperform S&P 500 index over next 48 hours',
    category: 'ai',
    volume: 124500,
    yesProbability: 58,
    resolved: false,
    endDate: '2026-05-26'
  },
  {
    id: 'm-3',
    title: 'Daily Circle CCTP USDC transfer volume exceeds $1,200,000,000 across L2 networks',
    category: 'finance',
    volume: 289400,
    yesProbability: 72,
    resolved: false,
    endDate: '2026-06-01'
  },
  {
    id: 'm-4',
    title: 'Aadi will approve the final Agora Agent Hackathon specs in Canteen Discord',
    category: 'ai',
    volume: 85200,
    yesProbability: 89,
    resolved: false,
    endDate: '2026-05-25'
  }
];

export const initialLogs: LogLine[] = [
  {
    id: 'l-1',
    timestamp: '22:58:10',
    agentId: 'plato-r1',
    type: 'think',
    content: 'Evaluating Federal Reserve policy statements alongside latest non-farm payroll figures. Payrolls +185k (expected +160k). Core inflation sticky at 3.2%.'
  },
  {
    id: 'l-2',
    timestamp: '22:58:12',
    agentId: 'plato-r1',
    type: 'think',
    content: 'Geopolitical tension in Middle East oil corridors creates upside risk on energy prices. This supports Yes outcome on CPI above 3.1%.'
  },
  {
    id: 'l-3',
    timestamp: '22:58:15',
    agentId: 'plato-r1',
    type: 'action',
    content: 'Confidence level at 68%. Directing App Kit Send to buy 5,000 YES shares on CPI prediction market. Allocation: 5,000 USDC.'
  },
  {
    id: 'l-4',
    timestamp: '22:58:16',
    agentId: 'plato-r1',
    type: 'settlement',
    content: 'Transaction settled on Arc. Tx Hash: 0x9f3b...f291. Gas fee: 0.0102 USDC. Time-to-finality: 480ms. Balance updated.'
  },
  {
    id: 'l-5',
    timestamp: '22:59:01',
    agentId: 'aristotle-kelly',
    type: 'think',
    content: 'Scanning active markets. Market m-2 "Plato-R1 outperforms S&P 500" odds trading at 58% YES. My historical backtest gives Plato a 62% success rate in high volatility regimes.'
  },
  {
    id: 'l-6',
    timestamp: '22:59:03',
    agentId: 'aristotle-kelly',
    type: 'think',
    content: 'Edge = p * b - q = 0.62 * 1.72 - 0.38 = 1.066 - 0.38 = 0.686. Sizing bet using Kelly fraction (f* = 0.0625, 1/4 Kelly). Recommended bet: 1.56% of total bankroll.'
  },
  {
    id: 'l-7',
    timestamp: '22:59:05',
    agentId: 'aristotle-kelly',
    type: 'action',
    content: 'Executing purchase of 1,485 YES shares for Market m-2. Value: 1,485 USDC. Sourced via Circle Wallets SDK API.'
  },
  {
    id: 'l-8',
    timestamp: '22:59:06',
    agentId: 'aristotle-kelly',
    type: 'settlement',
    content: 'Arc L1 block #4829302 recorded tx. Hash: 0xa2c0...c81b. Gas: 0.0098 USDC. Settled in 510ms.'
  }
];

export const codeSnippets = {
  cctp: `// Cross-Chain Transfer Protocol (CCTP) integration
// Moving USDC from Ethereum to Arc testnet for arbitrage
import { CircleDeveloperSDK } from '@circle-fin/developer-sdk';

const sdk = new CircleDeveloperSDK({ apiKey: process.env.CIRCLE_API_KEY });

async function executeCrossChainArbitrage(amount: string) {
  console.log(\`[CCTP] Initiating burn of \${amount} USDC on Ethereum...\`);
  
  const burnTx = await sdk.cctp.transferUSDC({
    sourceChain: 'ETH',
    destinationChain: 'ARC',
    amount: amount,
    destinationAddress: '0x8f2c3d1...84c',
  });
  
  console.log(\`[CCTP] Transferred USDC. Attestation received: \${burnTx.attestation}\`);
  console.log(\`[CCTP] Capital rebalanced on Arc L1 chain in 2.4s.\`);
}`,
  gateway: `// Unified Balance & Nanopayments on Gateway L1
// Executing high-frequency batch agent transactions
import { GatewayClient } from '@circle-fin/gateway';

const gateway = new GatewayClient({ endpoint: 'https://arc-node.thecanteenapp.com' });

async function sendMicroUSDC(recipient: string, amountMicro: number) {
  // Gas-free USDC transaction via Nanopayments batch
  const batchTx = await gateway.nanopayments.batch([
    {
      to: recipient,
      amount: amountMicro, // Denominated in 10^-6 USDC
      reference: 'AI-ARBITRAGE-FEE-SETTLEMENT'
    }
  ]);
  
  await batchTx.wait();
  console.log(\`Micro-settled: \${amountMicro} microUSDC. Gas fee: $0.00\`);
}`,
  wallets: `// Programmable Wallets SDK for Agent Autonomy
// Allow AI Agent to authorize trades using custom rules
import { WalletsManager } from '@circle-fin/wallets';

const wallets = new WalletsManager({ appToken: 'agora-agent-v1' });

export async function executeAgentTrade(agentWalletId: string, payload: any) {
  // Verification against pre-approved agent policy limits
  const isApproved = await checkRiskLimits(payload.amount, payload.leverage);
  if (!isApproved) throw new Error("Risk policy block: Leverage exceeds limits.");

  const response = await wallets.executeContractCall({
    walletId: agentWalletId,
    contractAddress: '0x12c4...e3b',
    abi: ['function buyShares(string marketId, bool stance, uint256 amount)'],
    params: [payload.marketId, payload.stance, payload.amount],
    feePayer: 'PAYMASTER' // Gas paid in USDC by Paymaster contract
  });

  return response.txHash;
}`,
  paymaster: `// Gasless User Experience Powered by USDC Paymaster
// Transaction fees are sponsored or paid directly in USDC
import { PaymasterClient } from '@circle-fin/paymaster';

const paymaster = new PaymasterClient({ network: 'arc-testnet' });

async function signAndSponsorTx(unsignedTx: any) {
  console.log("Routing transaction through Circle Paymaster...");
  
  // Paymaster converts gas fees into USDC at current oracle price
  const sponsoredTx = await paymaster.sponsorUserOperation({
    userOperation: unsignedTx,
    paymentToken: 'USDC', // Denominated in USDC, no gas tokens needed
    maxGasSponsorship: '0.05' // Max $0.05 USDC fee cap
  });

  return sponsoredTx;
}`
};
