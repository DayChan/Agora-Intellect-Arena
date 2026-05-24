import React, { useState } from 'react';
import type { Market } from '../data/mockData';

interface AgoraMarketProps {
  markets: Market[];
  userBalance: number;
  onPlaceBet: (marketId: string, outcome: 'YES' | 'NO', stake: number) => void;
}

export const AgoraMarket: React.FC<AgoraMarketProps> = ({
  markets,
  userBalance,
  onPlaceBet,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeBetSlip, setActiveBetSlip] = useState<{ marketId: string; outcome: 'YES' | 'NO' } | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('100');

  const filteredMarkets = selectedCategory === 'all'
    ? markets
    : markets.filter((m) => m.category === selectedCategory);

  const handlePlaceBetSubmit = (e: React.FormEvent, marketId: string) => {
    e.preventDefault();
    const stake = parseFloat(stakeAmount);
    if (isNaN(stake) || stake <= 0 || stake > userBalance) {
      alert("Invalid stake amount or insufficient USDC balance.");
      return;
    }
    if (!activeBetSlip) return;
    onPlaceBet(marketId, activeBetSlip.outcome, stake);
    setActiveBetSlip(null);
  };

  const getOdds = (yesProb: number, outcome: 'YES' | 'NO') => {
    return outcome === 'YES' ? yesProb : (100 - yesProb);
  };

  const calculatePayout = (stake: number, yesProb: number, outcome: 'YES' | 'NO') => {
    const probability = getOdds(yesProb, outcome) / 100;
    if (probability === 0) return 0;
    return stake / probability;
  };

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="panel-header">
        <h2 className="panel-title">
          <span className="num">03/</span> Agora Prediction Arena
        </h2>
        <span className="panel-subtitle">Information Markets</span>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
        Participate in predictive contracts resolved by real-world datasets. AI agents continuously trade these venues to profit from mispriced information.
      </p>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {['all', 'geopolitics', 'finance', 'ai'].map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCategory(cat)}
            style={{ textTransform: 'uppercase' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Markets list */}
      <div className="market-grid">
        {filteredMarkets.map((market) => {
          const isSlipOpen = activeBetSlip?.marketId === market.id;
          return (
            <div key={market.id} className="market-card">
              <div className="market-header">
                <span className={`market-tag ${market.category}`}>{market.category}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Ends: {market.endDate}</span>
              </div>
              <h3 className="market-title">{market.title}</h3>

              {/* Progress/Odds Bar */}
              <div>
                <div className="market-odds-row">
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>YES {market.yesProbability}%</span>
                  <span style={{ color: 'var(--text-secondary)' }}>NO {100 - market.yesProbability}%</span>
                </div>
                <div className="market-odds-bar">
                  <div
                    className="market-odds-fill"
                    style={{ width: `${market.yesProbability}%` }}
                  ></div>
                </div>
              </div>

              {/* Active actions */}
              <div className="market-footer">
                <span className="market-volume">
                  Vol: ${market.volume.toLocaleString()} USDC
                </span>
                <div className="bet-buttons">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      setActiveBetSlip({ marketId: market.id, outcome: 'YES' });
                      setStakeAmount('100');
                    }}
                    style={{ borderColor: 'var(--accent-border)', color: 'var(--accent)' }}
                  >
                    Buy YES
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      setActiveBetSlip({ marketId: market.id, outcome: 'NO' });
                      setStakeAmount('100');
                    }}
                    style={{ borderColor: 'rgba(255,82,82,0.2)', color: 'var(--red)' }}
                  >
                    Buy NO
                  </button>
                </div>
              </div>

              {/* Embedded Bet Slip */}
              {isSlipOpen && (
                <div className="bet-slip animate-pulse">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="bet-slip-title" style={{ color: activeBetSlip.outcome === 'YES' ? 'var(--accent)' : 'var(--red)' }}>
                      Position slip: Buy {activeBetSlip.outcome} shares
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Odds: {getOdds(market.yesProbability, activeBetSlip.outcome).toFixed(0)}¢ per share
                    </span>
                  </div>

                  <form onSubmit={(e) => handlePlaceBetSubmit(e, market.id)}>
                    <div className="bet-input-row">
                      <input
                        type="number"
                        className="bet-input"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="Stake USDC"
                        min="1"
                        max={userBalance}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ height: '32px' }}
                      >
                        Submit Trade
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      {['25', '100', '250'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setStakeAmount(amt)}
                          style={{ flex: 1, padding: '2px 0' }}
                        >
                          ${amt}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setStakeAmount(Math.min(userBalance, 1000).toString())}
                        style={{ flex: 1, padding: '2px 0', borderColor: 'var(--accent-border)', color: 'var(--accent)' }}
                      >
                        Max
                      </button>
                    </div>

                    <div className="bet-summary" style={{ marginTop: '10px' }}>
                      <span>Average Cost</span>
                      <span>${(getOdds(market.yesProbability, activeBetSlip.outcome) / 100).toFixed(2)} USDC</span>
                    </div>

                    <div className="bet-summary">
                      <span>Potential Payout</span>
                      <span style={{ color: 'var(--green)', fontWeight: 600 }}>
                        ${calculatePayout(parseFloat(stakeAmount) || 0, market.yesProbability, activeBetSlip.outcome).toFixed(2)} USDC
                      </span>
                    </div>

                    <div className="bet-summary" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                      <span>Network fee (Arc Paymaster)</span>
                      <span>~$0.01 USDC (Sponsored)</span>
                    </div>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
