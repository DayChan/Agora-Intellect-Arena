import React, { useState } from 'react';
import type { Agent } from '../data/mockData';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield } from 'lucide-react';

interface AcademyProps {
  agents: Agent[];
  selectedAgent: Agent;
  onSelectAgent: (agent: Agent) => void;
  userUsdcBalance: number;
  onDelegateCapital: (agentId: string, amount: number, risk: string, sizing: string) => void;
}

export const Academy: React.FC<AcademyProps> = ({
  agents,
  selectedAgent,
  onSelectAgent,
  userUsdcBalance,
  onDelegateCapital,
}) => {
  const [delegateAmount, setDelegateAmount] = useState<string>('500');
  const [riskProfile, setRiskProfile] = useState<string>('Moderate');
  const [sizingStrategy, setSizingStrategy] = useState<string>('Kelly Criterion');
  const [isDelegated, setIsDelegated] = useState<boolean>(false);

  const handleDelegateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(delegateAmount);
    if (isNaN(amount) || amount <= 0 || amount > userUsdcBalance) {
      alert("Invalid delegation amount or insufficient USDC balance.");
      return;
    }
    onDelegateCapital(selectedAgent.id, amount, riskProfile, sizingStrategy);
    setIsDelegated(true);
    setTimeout(() => setIsDelegated(false), 3000);
  };

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div className="panel-header">
          <h2 className="panel-title">
            <span className="num">01/</span> The Academy
          </h2>
          <span className="panel-subtitle">AI Agent Roster</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '14px' }}>
          Select an AI Philosopher-Agent to inspect their logic, review performance metrics, and delegate trading capital.
        </p>
      </div>

      <div className="leaderboard-list">
        {agents.map((agent) => {
          const isSelected = agent.id === selectedAgent.id;
          return (
            <div
              key={agent.id}
              className={`agent-row ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectAgent(agent)}
            >
              <div className="agent-meta-header">
                <span className="agent-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px' }}>{agent.avatar}</span> {agent.name}
                </span>
                <span className="agent-type">{agent.type}</span>
              </div>
              <div className="agent-metrics">
                <div className="metric-box">
                  <span className="metric-label">Return</span>
                  <span className="metric-value positive">+{agent.returns}%</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Sharpe</span>
                  <span className="metric-value">{agent.sharpe}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">AUM</span>
                  <span className="metric-value">
                    ${agent.aum.toLocaleString()} USDC
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="meander tight"></div>

      {/* Selected Agent Deep Dive */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontStyle: 'italic' }}>
            {selectedAgent.name} Profile
          </h3>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ID: {selectedAgent.id}</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.6' }}>
          {selectedAgent.description}
        </p>

        {/* Recharts Performance Graph */}
        <div style={{ height: '140px', width: '100%', marginTop: '8px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={selectedAgent.history} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <defs>
                <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={9} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={9} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{ background: '#0a0907', borderColor: 'var(--card-border)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}
                itemStyle={{ color: 'var(--accent)' }}
              />
              <Area type="monotone" dataKey="return" stroke="var(--accent)" fillOpacity={1} fill="url(#colorReturns)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Delegation Portal */}
        <div style={{ border: '1px solid var(--card-border)', padding: '14px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.3)', marginTop: '8px' }}>
          <h4 style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={12} /> Economic Delegation Portal
          </h4>
          <form onSubmit={handleDelegateSubmit} className="delegation-form" style={{ marginTop: '0', paddingTop: '0', border: 'none' }}>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">USDC Amount</label>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Avail: {userUsdcBalance.toFixed(2)} USDC</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  className="bet-input"
                  value={delegateAmount}
                  onChange={(e) => setDelegateAmount(e.target.value)}
                  placeholder="USDC Amount"
                  min="1"
                  max={userUsdcBalance}
                  style={{ height: '32px' }}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setDelegateAmount(Math.min(userUsdcBalance, 1000).toString())}
                  style={{ height: '32px' }}
                >
                  $1K
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label">Risk Threshold</label>
                <select
                  className="form-select"
                  value={riskProfile}
                  onChange={(e) => setRiskProfile(e.target.value)}
                  style={{ height: '32px', padding: '4px 8px' }}
                >
                  <option value="Conservative">Conservative</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Aggressive">Aggressive</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bet Sizing</label>
                <select
                  className="form-select"
                  value={sizingStrategy}
                  onChange={(e) => setSizingStrategy(e.target.value)}
                  style={{ height: '32px', padding: '4px 8px' }}
                >
                  <option value="Kelly Criterion">Kelly Sizing</option>
                  <option value="Flat">Flat Sizing</option>
                  <option value="Dynamic">Dynamic Limit</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '34px' }}
              disabled={isDelegated}
            >
              {isDelegated ? 'Delegation Active ✓' : `Delegate to ${selectedAgent.name} →`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
