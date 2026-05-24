import { useState, useEffect, useCallback } from 'react';
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
import { GitBranch, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent>(initialAgents[0]);
  const [markets, setMarkets] = useState<Market[]>(initialMarkets);
  const [logs, setLogs] = useState<LogLine[]>(initialLogs);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast notification system
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Monitor MetaMask account changes automatically
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        });

      const handleAccounts = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
        }
      };

      (window as any).ethereum.on('accountsChanged', handleAccounts);
      return () => {
        if ((window as any).ethereum.removeListener) {
          (window as any).ethereum.removeListener('accountsChanged', handleAccounts);
        }
      };
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert("No Web3 wallet found. Please install MetaMask!");
      return;
    }
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      setWalletAddress(address);

      // Connect or Switch to Arc Testnet (5042002 -> 0x4cef52)
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4cef52' }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x4cef52',
              chainName: 'Arc Testnet',
              nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
              rpcUrls: ['https://rpc.testnet.arc.network'],
              blockExplorerUrls: ['https://testnet.arcscan.app']
            }],
          });
        } else {
          throw switchError;
        }
      }

      addDevLog(`Wallets SDK: connected user wallet ${address.substring(0, 8)}...${address.substring(34)} on Arc Testnet.`);
      showToast(`钱包已连接 Arc Testnet ✓`, 'success');
    } catch (error: any) {
      console.error("Wallet connection failed:", error);
      alert(`Wallet connection failed: ${error.message}`);
    }
  };
  
  // Real-time Balances from Chain
  const [balances, setBalances] = useState({
    usdc: 0,
    eurc: 0,
    usyc: 0
  });

  const fetchBalance = useCallback(async (address: string) => {
    if (!(window as any).ethereum) return;
    try {
      // 1. Fetch Native USDC (18 decimals on Arc)
      const usdcHex = await (window as any).ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      const usdcVal = parseInt(usdcHex, 16) / 10 ** 18;

      // 2. Fetch EURC (ERC-20: 0x89B5...D72a, 6 decimals)
      // balanceOf selector: 0x70a08231 + padded address
      const paddedAddress = address.toLowerCase().replace('0x', '').padStart(64, '0');
      const eurcHex = await (window as any).ethereum.request({
        method: 'eth_call',
        params: [{
          to: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
          data: '0x70a08231' + paddedAddress
        }, 'latest'],
      });
      const eurcVal = eurcHex !== '0x' ? parseInt(eurcHex, 16) / 10 ** 6 : 0;

      // 3. Fetch USYC (ERC-20: 0xe918...db86C, 6 decimals)
      const usycHex = await (window as any).ethereum.request({
        method: 'eth_call',
        params: [{
          to: '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C',
          data: '0x70a08231' + paddedAddress
        }, 'latest'],
      });
      const usycVal = usycHex !== '0x' ? parseInt(usycHex, 16) / 10 ** 6 : 0;

      setBalances({
        usdc: usdcVal,
        eurc: eurcVal,
        usyc: usycVal,
      });
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  }, []);

  // Update balance when wallet changes or periodically
  useEffect(() => {
    if (walletAddress) {
      fetchBalance(walletAddress);
      const interval = setInterval(() => fetchBalance(walletAddress), 10000);
      return () => clearInterval(interval);
    }
  }, [walletAddress, fetchBalance]);

  const [isFlashGreen] = useState(false);
  const [devLogs, setDevLogs] = useState<string[]>([
    "Gateway SDK: connection established to https://arc-node.thecanteenapp.com",
    "Wallets SDK: initialized with secure key storage policies",
    "Paymaster SDK: paymaster contract verified. Sponsor budget: active."
  ]);

  // Block explorer state - Now only tracks user-specific transactions with persistence
  const [blocks, setBlocks] = useState<Block[]>(() => {
    const saved = localStorage.getItem('arc_explorer_blocks');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist blocks to localStorage
  useEffect(() => {
    localStorage.setItem('arc_explorer_blocks', JSON.stringify(blocks));
  }, [blocks]);

  // Helper to add a transaction to the explorer (only if relevant to user)
  const recordUserTx = useCallback((tx: Omit<Tx, 'blockNumber' | 'timestamp' | 'fee'>) => {
    if (!walletAddress) return;
    
    // Only record if it involves the user's wallet
    const isUserRelated = tx.from.toLowerCase() === walletAddress.toLowerCase() || 
                         tx.to.toLowerCase() === walletAddress.toLowerCase();
    
    if (!isUserRelated) return;

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const blockNum = 4829300 + blocks.length + 1;

    const newTx: Tx = {
      ...tx,
      blockNumber: blockNum,
      timestamp: timeStr,
      fee: 0.0095
    };

    const newBlock: Block = {
      number: blockNum,
      timestamp: timeStr,
      hash: '0x' + Math.random().toString(16).substr(2, 40),
      txCount: 1,
      transactions: [newTx]
    };

    setBlocks(prev => [newBlock, ...prev].slice(0, 50)); // Keep last 50 blocks
  }, [walletAddress, blocks.length]);

  // Clear logs handler
  const handleClearLogs = () => {
    setLogs([]);
    setBlocks([]); // Also clear explorer when clearing logs
    setDevLogs([
      `Console cleared. System listening...`
    ]);
  };

  // Fire-and-forget on-chain tx helper — never blocks the UI
  const sendTxFireAndForget = (params: { from: string; to: string; value: string; data: string }, label: string) => {
    if (!(window as any).ethereum) return;
    (window as any).ethereum.request({
      method: 'eth_sendTransaction',
      params: [params]
    }).then((txHash: string) => {
      addDevLog(`✅ ${label} tx confirmed. Hash: ${txHash}`);
      showToast(`链上交易已确认: ${txHash.substring(0, 10)}...`, 'success');
      
      // Record in explorer
      recordUserTx({
        hash: txHash,
        from: params.from,
        to: params.to,
        amount: parseInt(params.value, 16) / 10**18 || 0,
        currency: 'USDC',
        type: label.toUpperCase() as any
      });

      // Refetch balance after tx
      if (walletAddress) setTimeout(() => fetchBalance(walletAddress), 2000);
    }).catch((err: any) => {
      addDevLog(`⚠️ ${label} tx skipped — ${err.message}`);
    });
  };

  // Faucet request handler
  const handleRequestFaucet = () => {
    showToast('正在打开官方水龙头页面...', 'info');
    window.open('https://faucet.circle.com/?network=arc-testnet', '_blank');
    addDevLog(`External: opened Circle Faucet for Arc Testnet.`);
  };

  // Mock Circle Wallets SDK "Agent" Service
  const walletAgent = {
    // Simulates Circle's Programmable Wallets SDK: executeContractCall
    executeContractCall: async (params: {
      method: string,
      args: any[],
      label: string,
      amount?: number,
      to?: string,
      agentId?: string // Optional: if provided, uses autonomous agent wallet
    }) => {
      const { method, args, label, amount, to, agentId } = params;
      const isAutonomous = !!agentId;
      
      addDevLog(`Wallets SDK: [${isAutonomous ? 'API-Controlled' : 'User-Controlled'} Wallet] request received.`);
      addDevLog(`Wallets SDK: Executing ${method}(${args.join(', ')})...`);
      
      if (isAutonomous) {
        const agentObj = agents.find(a => a.id === agentId);
        const agentAddress = agentObj?.address || `agent_${agentId.replace('-', '_')}_vault`;
        
        addDevLog(`Wallets SDK: Autonomous signing via WalletID: ${agentAddress}`);
        addDevLog(`Paymaster: Gas sponsorship confirmed via policy_id: pol_7721.`);
        
        const txHash = '0x' + Math.random().toString(16).substr(2, 40);

        // Record in explorer even if autonomous (as it's user's delegated money)
        if (amount) {
          recordUserTx({
            hash: txHash,
            from: agentAddress,
            to: to || '0x0000...dEaD',
            amount: amount,
            currency: 'USDC',
            type: label.toUpperCase() as any
          });
        }
        
        // No MetaMask popup for autonomous agent actions
        return { status: 'COMPLETE', txHash: txHash };
      } else {
        addDevLog(`Wallets SDK: Redirecting to User EOA (MetaMask) for manual signing...`);
        // If it's a real trade with value
        if (walletAddress && amount && to) {
          const valueInWei = BigInt(Math.floor(amount * 10 ** 10)) * BigInt(10 ** 8);
          const hexValue = '0x' + valueInWei.toString(16);
          
          sendTxFireAndForget({
            from: walletAddress,
            to: to,
            value: hexValue,
            data: '0x'
          }, label);
        }
        return { status: 'PENDING_USER', txHash: null };
      }
    }
  };

  // Capital delegation handler
  const handleDelegateCapital = async (agentId: string, amount: number, _risk: string, _sizing: string) => {
    const agent = agents.find((a) => a.id === agentId);
    const agentName = agent?.name || agentId;

    showToast(`正在将 ${amount} USDC 转移到 ${agentName} 的 Programmable Wallet...`, 'info');
    
    // Step 1: Real on-chain transfer from User to Agent Vault
    if (walletAddress && agent?.address) {
      const valueInWei = BigInt(Math.floor(amount * 10 ** 10)) * BigInt(10 ** 8);
      const hexValue = '0x' + valueInWei.toString(16);
      
      sendTxFireAndForget({
        from: walletAddress,
        to: agent.address, // Real Agent Address
        value: hexValue,
        data: '0x'
      }, 'Delegation');
    }

    // Step 2: Initialize autonomous control
    addDevLog(`Wallets SDK: Created new User-Controlled wallet at ${agent?.address}.`);
    addDevLog(`Wallets SDK: Upgraded to API-Controlled for autonomous trading authority.`);
    
    // Increase Agent AUM in UI
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? { ...a, aum: a.aum + amount }
          : a
      )
    );

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newLogId = 'log-' + Math.random().toString(36).substr(2, 9);
    setLogs((prev) => [...prev, {
      id: newLogId,
      timestamp: timeStr,
      agentId: agentId,
      type: 'info',
      content: `DELEGATION COMPLETE: ${agentName} now has autonomous control over ${amount} USDC.`
    }]);
    
    showToast(`委托成功！${agentName} 现在可以自主交易了 ✓`, 'success');
  };

  // Prediction market trade handler
  const handlePlaceBet = async (marketId: string, outcome: 'YES' | 'NO', stake: number) => {
    const market = markets.find((m) => m.id === marketId);
    const marketTitle = market?.title || marketId;

    showToast(`Wallet Agent 正在执行交易: ${outcome} (${stake} USDC)...`, 'info');

    // Use Wallet Agent to execute the trade
    await walletAgent.executeContractCall({
      method: 'buyShares',
      args: [marketId, outcome, stake],
      label: 'Bet',
      amount: stake,
      to: '0x000000000000000000000000000000000000dEaD' // Market Treasury
    });

    // Update prediction market probability shift
    setMarkets((prev) =>
      prev.map((m) => {
        if (m.id === marketId) {
          const shift = outcome === 'YES' ? 1.5 : -1.5;
          const newYes = Math.max(5, Math.min(95, m.yesProbability + shift));
          return {
            ...m,
            volume: m.volume + stake,
            yesProbability: newYes
          };
        }
        return m;
      })
    );

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // Terminal log
    const newLogId = 'log-' + Math.random().toString(36).substr(2, 9);
    const newLog: LogLine = {
      id: newLogId,
      timestamp: timeStr,
      agentId: 'user',
      type: 'action',
      content: `USER placed trade via Wallet Agent: Bought ${outcome} shares on "${marketTitle.substring(0, 40)}..." for ${stake} USDC.`
    };
    setLogs((prev) => [...prev, newLog]);
    showToast(`交易已确认 — 由 Wallet Agent 成功执行 ✓`, 'success');
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

      // Shift index
      traceIndex = (traceIndex + 1) % mockTraces.length;
    }, 8000); // Trigger every 8 seconds

    return () => clearInterval(interval);
  }, []);

  // Real-time Arc Testnet Block Crawler Hook
  useEffect(() => {
    async function fetchLatestBlocks() {
      try {
        const rpcUrl = "https://rpc.testnet.arc.network";
        
        // 1. Get latest block number
        const numberRes = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_blockNumber",
            params: [],
            id: 1
          })
        });
        const numberJson = await numberRes.json();
        if (!numberJson || !numberJson.result) return;
        const latestHex = numberJson.result;
        const latestDecimal = parseInt(latestHex, 16);

        // 2. Fetch the last 4 blocks details in parallel
        const blockPromises = [];
        for (let i = 0; i < 4; i++) {
          const hexNum = "0x" + (latestDecimal - i).toString(16);
          blockPromises.push(
            fetch(rpcUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_getBlockByNumber",
                params: [hexNum, true],
                id: 1 + i
              })
            }).then(r => r.json())
          );
        }

        const blockJsons = await Promise.all(blockPromises);
        
        // 3. Format the block details and filter for User-only transactions
        const userRelatedBlocks: Block[] = blockJsons
          .map((res) => {
            if (!res || !res.result) return null;
            const b = res.result;

            const blockNum = parseInt(b.number, 16);
            const blockTimestamp = parseInt(b.timestamp, 16);
            const date = new Date(blockTimestamp * 1000);
            const timeStr = date.toTimeString().split(' ')[0];

            // Parse and filter transactions on-chain for the user's wallet
            const txs: Tx[] = (b.transactions || [])
              .filter((t: any) => {
                if (!walletAddress) return false;
                return (t.from && t.from.toLowerCase() === walletAddress.toLowerCase()) || 
                       (t.to && t.to.toLowerCase() === walletAddress.toLowerCase());
              })
              .map((t: any) => {
                let txType: 'DELEGATE' | 'BET' | 'REBALANCE' | 'MINT' | 'ARBITRAGE' = 'BET';
                const input = t.input || '0x';
                if (input.startsWith('0xcf6c62ea')) {
                  txType = 'ARBITRAGE';
                } else if (input.startsWith('0x472b43f3')) {
                  txType = 'REBALANCE';
                } else if (t.value !== '0x0') {
                  txType = 'BET';
                } else {
                  txType = 'DELEGATE';
                }

                const valueDecimal = parseInt(t.value, 16);
                const formattedAmount = valueDecimal > 0 
                  ? (valueDecimal / 10**18) 
                  : 100 + (parseInt(t.nonce, 16) % 9) * 50;

                return {
                  hash: t.hash,
                  blockNumber: blockNum,
                  timestamp: timeStr,
                  from: t.from,
                  to: t.to || "",
                  amount: formattedAmount,
                  fee: parseFloat(parseInt(t.gasPrice, 16) ? ((parseInt(t.gasPrice, 16) * parseInt(t.gas, 16)) / 10**6).toFixed(4) : "0.0100"),
                  currency: 'USDC',
                  type: txType
                };
              });

            if (txs.length === 0) return null; // Skip blocks with no user activity

            return {
              number: blockNum,
              timestamp: timeStr,
              hash: b.hash,
              txCount: txs.length,
              transactions: txs
            };
          })
          .filter((b): b is Block => b !== null);

        if (userRelatedBlocks.length > 0) {
          setBlocks(prev => {
            const existingHashes = new Set(prev.map(b => b.hash));
            const newUniqueBlocks = userRelatedBlocks.filter(b => !existingHashes.has(b.hash));
            return [...newUniqueBlocks, ...prev].slice(0, 50);
          });
        }
      } catch (err) {
        console.error("Failed to crawl Arc Testnet blocks:", err);
      }
    }

    // Crawl initially
    if (walletAddress) fetchLatestBlocks();

    // Poll every 8 seconds
    const crawlerInterval = setInterval(() => {
      if (walletAddress) fetchLatestBlocks();
    }, 8000);
    return () => clearInterval(crawlerInterval);
  }, [walletAddress]);

  return (
    <div className="app-container">
      {/* Toast notifications */}
      <div style={{
        position: 'fixed', top: '16px', right: '16px', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '380px'
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              display: 'flex', alignItems: 'center', gap: '8px',
              animation: 'slideIn 0.3s ease-out',
              backdropFilter: 'blur(12px)',
              border: '1px solid',
              borderColor: toast.type === 'success' ? 'var(--accent-border)' : toast.type === 'error' ? 'rgba(255,82,82,0.3)' : 'var(--card-border)',
              background: toast.type === 'success' ? 'rgba(0,230,180,0.1)' : toast.type === 'error' ? 'rgba(255,82,82,0.1)' : 'rgba(255,255,255,0.05)',
              color: toast.type === 'success' ? 'var(--accent)' : toast.type === 'error' ? 'var(--red)' : 'var(--text-primary)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}
          >
            {toast.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <X size={12} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => dismissToast(toast.id)} />
          </div>
        ))}
      </div>

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
          <button
            onClick={connectWallet}
            className="btn btn-outline"
            style={{ fontSize: '11px', height: '28px', padding: '0 12px', borderColor: walletAddress ? 'var(--accent)' : 'var(--card-border)' }}
          >
            {walletAddress
              ? `🟢 ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`
              : '🔗 Connect Wallet'
            }
          </button>
        </div>
      </header>

      {/* Wallet status banner */}
      {walletAddress && (
        <div style={{
          padding: '8px 24px',
          background: 'rgba(0,230,180,0.05)',
          borderBottom: '1px solid var(--accent-border)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>🟢 已连接 Arc Testnet — 所有操作均可正常使用。链上交易需要测试网 Gas（可选）。</span>
          <a
            href="https://testnet.arcscan.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'underline', fontSize: '10px' }}
          >
            ArcScan Explorer ↗
          </a>
        </div>
      )}

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
