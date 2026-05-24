import React, { useState } from 'react';
import type { Block } from '../data/mockData';
import { Coins, RefreshCcw } from 'lucide-react';

interface ArcExplorerProps {
  balances: {
    usdc: number;
    eurc: number;
    usyc: number;
  };
  blocks: Block[];
  onRequestFaucet: () => void;
  isFlashGreen: boolean;
}

export const ArcExplorer: React.FC<ArcExplorerProps> = ({
  balances,
  blocks,
  onRequestFaucet,
  isFlashGreen,
}) => {
  const [selectedBlockNumber, setSelectedBlockNumber] = useState<number | null>(null);

  const toggleBlockDetails = (blockNum: number) => {
    if (selectedBlockNumber === blockNum) {
      setSelectedBlockNumber(null);
    } else {
      setSelectedBlockNumber(blockNum);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Unified Wallet */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">
            <span className="num">04/</span> Unified Balance
          </h2>
          <span className="panel-subtitle">Circle Wallet</span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '14px' }}>
          Your multi-asset USDC balance on Arc. Sponsored gas via Circle Paymaster allows transactions to clear instantly without native tokens.
        </p>

        <div className="wallet-box">
          <div className={`wallet-balance-row ${isFlashGreen ? 'flash-up' : ''}`}>
            <div className="wallet-label">
              <Coins size={14} style={{ color: 'var(--accent)' }} />
              <span>USDC (Digital Dollar)</span>
            </div>
            <span className="wallet-val accent">${balances.usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="wallet-balance-row">
            <div className="wallet-label">
              <Coins size={14} style={{ color: 'var(--amber)' }} />
              <span>EURC (Digital Euro)</span>
            </div>
            <span className="wallet-val" style={{ color: 'var(--amber)' }}>€{balances.eurc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="wallet-balance-row">
            <div className="wallet-label">
              <Coins size={14} style={{ color: 'var(--text-secondary)' }} />
              <span>USYC (Yield Fund)</span>
            </div>
            <span className="wallet-val">${balances.usyc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <button
          className="btn btn-outline"
          onClick={onRequestFaucet}
          style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCcw size={12} /> Request Testnet USDC (+1,000)
        </button>
      </div>

      {/* Arc L1 Block Ticker */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">
            <span className="num">05/</span> Arc L1 Explorer
          </h2>
          <span className="panel-subtitle">Block Ticker</span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '14px' }}>
          Sub-second finality. Live block settlements on the purpose-built Circle chain. Click any block to view transaction receipts.
        </p>

        <div className="explorer-list">
          {blocks.map((block) => {
            const isOpen = selectedBlockNumber === block.number;
            return (
              <div key={block.number} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div
                  className="block-row"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleBlockDetails(block.number)}
                >
                  <div>
                    <span className="block-num">#{block.number}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '9px', marginLeft: '8px' }}>
                      ({block.txCount} txs)
                    </span>
                  </div>
                  <span className="block-time">{block.timestamp}</span>
                </div>

                {/* Expanded block transactions */}
                {isOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0 8px 10px' }}>
                    {block.transactions.length === 0 ? (
                      <div className="tx-row" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                        Empty block (System tick)
                      </div>
                    ) : (
                      block.transactions.map((tx) => (
                        <div key={tx.hash} className="tx-row">
                          <div className="tx-header">
                            <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{tx.type}</span>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>
                              Hash: {tx.hash.substring(0, 8)}...{tx.hash.substring(34)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              From: {tx.from.substring(0, 6)}... ➔ To: {tx.to.substring(0, 6)}...
                            </span>
                            <span className="tx-amount">
                              {tx.type === 'DELEGATE' || tx.type === 'ARBITRAGE' || tx.type === 'BET' ? '-' : '+'}
                              {tx.amount.toLocaleString()} {tx.currency}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            <span>Gas Fee (USDC Paymaster): sponsored</span>
                            <span>Fee: ${tx.fee.toFixed(4)} USDC</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
