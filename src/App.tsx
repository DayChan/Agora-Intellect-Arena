import { useState, useEffect } from 'react';
import type {
  Agent,
  Market,
  LogLine,
  Block,
  Tx,
} from './data/mockData';
import {
  initialAgents,
  initialMarkets,
  initialLogs,
} from './data/mockData';
import { Academy } from './components/Academy';
import { ReasoningTerminal } from './components/ReasoningTerminal';
import { AgoraMarket } from './components/AgoraMarket';
import { ArcExplorer } from './components/ArcExplorer';
import { DevPortal } from './components/DevPortal';
import { GitBranch } from 'lucide-react';

export default function App() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent>(initialAgents[0]);
  const [markets, setMarkets] = useState<Market[]>(initialMarkets);
  const [logs, setLogs] = useState<LogLine[]>(initialLogs);
  
  // Balances
  const [balances, setBalances] = useState({
    usdc: 15420.50,
    eurc: 8400.00,
    usyc: 50000.00
  });

  const [isFlashGreen, setIsFlashGreen] = useState(false);
  const [devLogs, setDevLogs] = useState<string[]>([
    "Gateway SDK: connection established to https://arc-node.thecanteenapp.com",
    "Wallets SDK: initialized with secure key storage policies",
    "Paymaster SDK: paymaster contract verified. Sponsor budget: active."
  ]);

  // Block explorer state
  const [blocks, setBlocks] = useState<Block[]>([
    {
      number: 4829302,
      timestamp: '22:59:06',
      hash: '0x3bf92c10a184c6efd025b9142ebd2a857025b914',
      txCount: 1,
      transactions: [
        {
          hash: '0xa2c03bf92c10a184c6efd025b9142ebd2a857025b9142ebd2a2c0c81b',
          blockNumber: 4829302,
          timestamp: '22:59:06',
          from: '0xaristotle_wallet_882d',
          to: '0xmarket_cpi_yes_contract_2901',
          amount: 1485,
          fee: 0.0098,
          currency: 'USDC',
          type: 'BET'
        }
      ]
    },
    {
      number: 4829301,
      timestamp: '22:58:16',
      hash: '0x9f3ba2c03bf92c10a184c6efd025b9142ebd2f291',
      txCount: 1,
      transactions: [
        {
          hash: '0x9f3ba2c03bf92c10a184c6efd025b9142ebd2f291a2c0e8a1a3848b8c',
          blockNumber: 4829301,
          timestamp: '22:58:16',
          from: '0xplato_wallet_9a2f',
          to: '0xmarket_cpi_yes_contract_2901',
          amount: 5000,
          fee: 0.0102,
          currency: 'USDC',
          type: 'BET'
        }
      ]
    },
    {
      number: 4829300,
      timestamp: '22:57:40',
      hash: '0x7e8a3cf841b8a92f02c6efd821a8a2bfd2903847',
      txCount: 0,
      transactions: []
    }
  ]);

  const [currentBlockNumber, setCurrentBlockNumber] = useState(4829302);

  // Clear logs handler
  const handleClearLogs = () => {
    setLogs([]);
    setDevLogs([
      `Console cleared. System listening...`
    ]);
  };

  // Faucet request handler
  const handleRequestFaucet = () => {
    setBalances((prev) => ({
      ...prev,
      usdc: prev.usdc + 1000,
    }));
    setIsFlashGreen(true);
    setTimeout(() => setIsFlashGreen(false), 1000);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    
    // Add developer SDK log
    addDevLog(`Wallets SDK: requestFaucet called. Minted 1,000 USDC on-chain to user wallet (0xUserWallet...8f3)`);
    addDevLog(`Paymaster: sponsored gas fee for faucet mint transaction.`);

    // Push block on L1 explorer
    const newBlockNum = currentBlockNumber + 1;
    setCurrentBlockNumber(newBlockNum);
    const newBlockHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

    const newTx: Tx = {
      hash: newTxHash,
      blockNumber: newBlockNum,
      timestamp: timeStr,
      from: '0xarc_faucet_contract_0000',
      to: '0xuser_wallet_8f3c',
      amount: 1000,
      fee: 0.0125,
      currency: 'USDC',
      type: 'MINT'
    };

    setBlocks((prev) => [
      {
        number: newBlockNum,
        timestamp: timeStr,
        hash: newBlockHash,
        txCount: 1,
        transactions: [newTx]
      },
      ...prev
    ]);
  };

  // Capital delegation handler
  const handleDelegateCapital = (agentId: string, amount: number, risk: string, sizing: string) => {
    // Deduct balance
    setBalances((prev) => ({
      ...prev,
      usdc: prev.usdc - amount,
    }));

    // Increase Agent AUM
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId
          ? { ...agent, aum: agent.aum + amount }
          : agent
      )
    );

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const agentName = agents.find((a) => a.id === agentId)?.name || agentId;

    // Terminal log
    const newLogId = 'log-' + Math.random().toString(36).substr(2, 9);
    const newLog: LogLine = {
      id: newLogId,
      timestamp: timeStr,
      agentId: agentId,
      type: 'info',
      content: `USER DELEGATED ${amount} USDC to ${agentName}. Sizing rule: ${sizing}. Risk profile: ${risk}.`
    };
    setLogs((prev) => [...prev, newLog]);

    // SDK Log
    addDevLog(`Wallets SDK: transferUSDC from User (0xUserWallet...) to Agent Vault (0x${agentId}_vault...) successful. Amount: ${amount} USDC.`);
    addDevLog(`Paymaster: sponsored gas fee for delegation contract trigger.`);

    // explorer update
    const newBlockNum = currentBlockNumber + 1;
    setCurrentBlockNumber(newBlockNum);
    const newBlockHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const newTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');

    const newTx: Tx = {
      hash: newTxHash,
      blockNumber: newBlockNum,
      timestamp: timeStr,
      from: '0xuser_wallet_8f3c',
      to: `0x${agentId}_vault_contract`,
      amount: amount,
      fee: 0.0105,
      currency: 'USDC',
      type: 'DELEGATE'
    };

    setBlocks((prev) => [
      {
        number: newBlockNum,
        timestamp: timeStr,
        hash: newBlockHash,
        txCount: 1,
        transactions: [newTx]
      },
      ...prev
    ]);
  };

  // Prediction market trade handler
  const handlePlaceBet = (marketId: string, outcome: 'YES' | 'NO', stake: number) => {
    // Deduct user balance
    setBalances((prev) => ({
      ...prev,
      usdc: prev.usdc - stake,
    }));

    // Update prediction market probability shift
    setMarkets((prev) =>
      prev.map((market) => {
        if (market.id === marketId) {
          const shift = outcome === 'YES' ? 1.5 : -1.5;
          const newYes = Math.max(5, Math.min(95, market.yesProbability + shift));
          return {
            ...market,
            volume: market.volume + stake,
            yesProbability: newYes
          };
        }
        return market;
      })
    );

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const marketTitle = markets.find((m) => m.id === marketId)?.title || marketId;

    // Terminal log
    const newLogId = 'log-' + Math.random().toString(36).substr(2, 9);
    const newLog: LogLine = {
      id: newLogId,
      timestamp: timeStr,
      agentId: 'user',
      type: 'action',
      content: `USER placed trade: Bought ${outcome} shares on "${marketTitle.substring(0, 40)}..." for ${stake} USDC.`
    };
    setLogs((prev) => [...prev, newLog]);

    // SDK Log
    addDevLog(`Wallets SDK: executeContractCall (buyShares) for Market: ${marketId}. Stance: ${outcome}, Amount: ${stake} USDC.`);
    addDevLog(`Paymaster: sponsored gas fee for user market purchase. Receipt: ~$0.01 USDC sponsored.`);

    // explorer update
    const newBlockNum = currentBlockNumber + 1;
    setCurrentBlockNumber(newBlockNum);
    const newBlockHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const newTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');

    const newTx: Tx = {
      hash: newTxHash,
      blockNumber: newBlockNum,
      timestamp: timeStr,
      from: '0xuser_wallet_8f3c',
      to: `0xmarket_${marketId}_contract`,
      amount: stake,
      fee: 0.0110,
      currency: 'USDC',
      type: 'BET'
    };

    setBlocks((prev) => [
      {
        number: newBlockNum,
        timestamp: timeStr,
        hash: newBlockHash,
        txCount: 1,
        transactions: [newTx]
      },
      ...prev
    ]);
  };

  // Helper helper to append logs to SDK Event Listening Console
  const addDevLog = (log: string) => {
    setDevLogs((prev) => [...prev, log]);
  };

  // Simulation Interval Loop
  useEffect(() => {
    const mockTraces = [
      {
        agentId: 'plato-r1',
        think: 'Parsing NostalgiaForInfinity strategy blacklist commit logs. Freqtrade added $MONPRO to active blacklist. This indicates a high likelihood of structural failure or rugpull within 72 hours.',
        action: 'Plato-R1 buying NO shares on $MONPRO longevity prediction market. Allocation size: 2,500 USDC.',
        devLog: 'Wallets SDK: contract call [executeAgentTrade] on Plato-R1 active. Parameter: buyShares (NO, 2500 USDC)',
        txType: 'BET' as const,
        amount: 2500,
        currency: 'USDC' as const,
        to: '0xmarket_monpro_no_contract'
      },
      {
        agentId: 'aristotle-kelly',
        think: 'Federal Reserve rate probability re-pricing: May target shows 92% odds of rate pause. Currently, macro prediction market for Pause is trading at 88%. This yields a 4% edge.',
        action: 'Aristotle-Kelly applying Kelly sizing rule: Sizing stake to 2.5% of AUM (2,380 USDC) on YES pause shares.',
        devLog: 'Wallets SDK: Aristotle programmable trade initiated. Sizing model: Kelly Criterion. Amount: 2,380 USDC.',
        txType: 'BET' as const,
        amount: 2380,
        currency: 'USDC' as const,
        to: '0xmarket_fed_pause_contract'
      },
      {
        agentId: 'heraclitus-arb',
        think: 'USDC/EURC cross-venue spread alert. Arc Uniswap v3 rate: 0.9230. Ethereum Curve pool rate (via bridge aggregator): 0.9262. Discrepancy detected: 32 basis points.',
        action: 'Heraclitus-Arb executing cross-chain arbitrage. Bridging 15,000 USDC using CCTP component to trigger swap on Ethereum Curve.',
        devLog: 'CCTP SDK: transferUSDC initiated. Source: ARC, Dest: ETH. Amount: 15,000. Attestation received in 2.2s.',
        txType: 'ARBITRAGE' as const,
        amount: 15000,
        currency: 'USDC' as const,
        to: '0xcctp_bridge_contract'
      },
      {
        agentId: 'plato-r1',
        think: 'Yield evaluation update. USYC tokenized treasury yields increased to 5.24% APY, exceeding money market baseline by 18 bps. Reallocating inactive treasury cash.',
        action: 'Plato-R1 parking capital. Transferring 8,000 USDC into USYC yield pool contract.',
        devLog: 'Gateway SDK: unifiedBalance rebalanced. Depositing 8,000 USDC into USYC (0xusyc_treasury_contract).',
        txType: 'REBALANCE' as const,
        amount: 8000,
        currency: 'USYC' as const,
        to: '0xusyc_treasury_contract'
      },
      {
        agentId: 'heraclitus-arb',
        think: 'Nanopayments latency check. Checking batched arbitrage fee payments. Processing 5 transactions to sub-node execution accounts.',
        action: 'Heraclitus-Arb executing batched nanopayments for node gas fee refunds. Total batch size: 1.25 USDC across 5 accounts.',
        devLog: 'Gateway: nanopayments.batch execution complete. Transactions: 5. Average fee: $0.000001 per payment.',
        txType: 'ARBITRAGE' as const,
        amount: 1.25,
        currency: 'USDC' as const,
        to: '0xbatch_payout_node_021'
      }
    ];

    let traceIndex = 0;

    const interval = setInterval(() => {
      const trace = mockTraces[traceIndex];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      // 1. Add Terminal logs (think and then action)
      const thinkLogId = 'think-' + Math.random().toString(36).substr(2, 9);
      const actionLogId = 'action-' + Math.random().toString(36).substr(2, 9);

      setLogs((prev) => [
        ...prev,
        {
          id: thinkLogId,
          timestamp: timeStr,
          agentId: trace.agentId,
          type: 'think',
          content: trace.think
        },
        {
          id: actionLogId,
          timestamp: timeStr,
          agentId: trace.agentId,
          type: 'action',
          content: trace.action
        }
      ]);

      // 2. Add Developer SDK log
      addDevLog(trace.devLog);
      addDevLog(`Paymaster: sponsored gas fee for agent transaction receipt.`);

      // 3. Increment AUM slightly for profitable agent trades
      setAgents((prev) =>
        prev.map((agent) => {
          if (agent.id === trace.agentId) {
            const returnIncrement = Math.random() * 0.4;
            return {
              ...agent,
              returns: parseFloat((agent.returns + returnIncrement).toFixed(1)),
              aum: agent.aum + (trace.txType === 'ARBITRAGE' ? 45 : 12)
            };
          }
          return agent;
        })
      );

      // 4. Update Block Explorer with a new block
      setBlocks((prevBlocks) => {
        const nextBlockNum = prevBlocks[0].number + 1;
        setCurrentBlockNumber(nextBlockNum);
        const nextBlockHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
        const nextTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');

        const newTx: Tx = {
          hash: nextTxHash,
          blockNumber: nextBlockNum,
          timestamp: timeStr,
          from: `0x${trace.agentId}_wallet`,
          to: trace.to,
          amount: trace.amount,
          fee: 0.0104,
          currency: trace.currency,
          type: trace.txType
        };

        return [
          {
            number: nextBlockNum,
            timestamp: timeStr,
            hash: nextBlockHash,
            txCount: 1,
            transactions: [newTx]
          },
          ...prevBlocks
        ];
      });

      // Shift index
      traceIndex = (traceIndex + 1) % mockTraces.length;
    }, 8000); // Trigger every 8 seconds

    return () => clearInterval(interval);
  }, [currentBlockNumber]);

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <h1 className="header-logo">
          Agora Intellect Arena <span>ARC TESTNET</span>
        </h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span className="animate-pulse-dot"></span>
            <span>Agent Kernel Ticks Active</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderLeft: '1px solid var(--card-border)', paddingLeft: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GitBranch size={12} style={{ color: 'var(--amber)' }} />
            <span>git://main</span>
          </div>
        </div>
      </header>

      {/* Decorative Greek band */}
      <div className="meander"></div>

      {/* Application Grid Content */}
      <main className="app-content">
        {/* Left Column: Academy + Explorer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Academy
            agents={agents}
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
            userUsdcBalance={balances.usdc}
            onDelegateCapital={handleDelegateCapital}
          />
          <ArcExplorer
            balances={balances}
            blocks={blocks}
            onRequestFaucet={handleRequestFaucet}
            isFlashGreen={isFlashGreen}
          />
        </div>

        {/* Right Column: Thought stream terminal + Prediction arena + Code specs */}
        <div className="main-column">
          <ReasoningTerminal
            logs={logs}
            selectedAgent={selectedAgent}
            agents={agents}
            onClearLogs={handleClearLogs}
          />
          <AgoraMarket
            markets={markets}
            userBalance={balances.usdc}
            onPlaceBet={handlePlaceBet}
          />
          <DevPortal devLogs={devLogs} />
        </div>
      </main>

      {/* App Footer */}
      <footer className="app-footer">
        <div>
          © 2026 Canteen × Circle. Built on Arc L1 chain.
        </div>
        <div className="footer-links">
          <a href="https://docs.arc.network/" target="_blank">Docs</a>
          <a href="https://developers.circle.com/" target="_blank">Developers</a>
          <a href="https://discord.gg/TGnyfKh23V" target="_blank">Discord</a>
        </div>
      </footer>
    </div>
  );
}
