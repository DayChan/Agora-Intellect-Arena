import React, { useEffect, useRef, useState } from 'react';
import type { LogLine, Agent } from '../data/mockData';
import { Terminal, Filter, RefreshCw, Cpu } from 'lucide-react';

interface ReasoningTerminalProps {
  logs: LogLine[];
  selectedAgent: Agent;
  agents: Agent[];
  onClearLogs: () => void;
}

export const ReasoningTerminal: React.FC<ReasoningTerminalProps> = ({
  logs,
  selectedAgent,
  agents,
  onClearLogs,
}) => {
  const [filterBySelected, setFilterBySelected] = useState<boolean>(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const filteredLogs = filterBySelected
    ? logs.filter((log) => log.agentId === selectedAgent.id)
    : logs;

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="panel-header">
        <h2 className="panel-title">
          <span className="num">02/</span> Reasoning Terminal
        </h2>
        <span className="panel-subtitle">Streaming traces</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
          Inspect the live reasoning traces (<span style={{ color: 'var(--amber)' }}>&lt;think&gt;</span> tags) emitted by the agents during market evaluation.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          className={`btn btn-sm ${filterBySelected ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterBySelected(!filterBySelected)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Filter size={12} />
          {filterBySelected ? `Filtered to ${selectedAgent.name}` : 'Filter by Selected Agent'}
        </button>
        <button
          className="btn btn-outline btn-sm"
          onClick={onClearLogs}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}
        >
          <RefreshCw size={12} />
          Clear Console
        </button>
      </div>

      <div className="terminal-container">
        <div className="terminal-header">
          <div className="terminal-badge">
            <Terminal size={14} style={{ color: 'var(--accent)' }} />
            <span>agora-agents-kernel v0.4.2 [arc-testnet]</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#27c93f' }}></span>
          </div>
        </div>

        <div className="terminal-body">
          {filteredLogs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
              No streaming logs. Waiting for agent kernel tick...
            </div>
          ) : (
            filteredLogs.map((log) => {
              const agent = agents.find((a) => a.id === log.agentId);
              const avatar = agent ? agent.avatar : '🤖';
              const name = agent ? agent.name : log.agentId;

              return (
                <div key={log.id} className="terminal-line">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '10px', marginBottom: '2px' }}>
                    <span>[{log.timestamp}]</span>
                    <span style={{ color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Cpu size={10} /> {avatar} {name}
                    </span>
                  </div>

                  {log.type === 'think' && (
                    <div className="terminal-think">
                      &lt;think&gt;
                      <br />
                      {log.content}
                      <br />
                      &lt;/think&gt;
                    </div>
                  )}

                  {log.type === 'action' && (
                    <div className="terminal-action">
                      ⚡ ACTION: {log.content}
                    </div>
                  )}

                  {log.type === 'settlement' && (
                    <div className="terminal-settlement">
                      ✓ SETTLEMENT: {log.content}
                    </div>
                  )}

                  {log.type === 'info' && (
                    <div style={{ color: 'var(--text-primary)' }}>
                      ℹ️ INFO: {log.content}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};
