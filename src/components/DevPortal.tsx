import React, { useState, useEffect, useRef } from 'react';
import { codeSnippets } from '../data/mockData';
import { TerminalSquare } from 'lucide-react';

interface DevPortalProps {
  devLogs: string[];
}

export const DevPortal: React.FC<DevPortalProps> = ({ devLogs }) => {
  const [activeTab, setActiveTab] = useState<'cctp' | 'gateway' | 'wallets' | 'paymaster'>('cctp');
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [devLogs]);

  // Syntax highlighting logic for mock display
  const highlightCode = (code: string) => {
    return code.split('\n').map((line, idx) => {
      // Very simple syntax highlighter for display
      let highlightedLine = line
        .replace(/(\/\/.*)/g, '<span class="code-comment">$1</span>')
        .replace(/(import|from|const|let|async|function|await|return|new|throw)/g, '<span class="code-keyword">$1</span>')
        .replace(/('[^']*'|`[^`]*`)/g, '<span class="code-string">$1</span>')
        .replace(/(\w+)(?=\()/g, '<span class="code-function">$1</span>');

      return (
        <div key={idx} style={{ display: 'flex' }}>
          <span style={{ width: '24px', color: 'var(--text-muted)', userSelect: 'none', textAlign: 'right', paddingRight: '8px' }}>
            {idx + 1}
          </span>
          <code dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }} />
        </div>
      );
    });
  };

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="panel-header">
        <h2 className="panel-title">
          <span className="num">06/</span> Developer Integrations
        </h2>
        <span className="panel-subtitle">Circle SDK Integration</span>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
        View the underlying Circle integration logic. These SDK routines handle programmable wallets, gas sponsorship, cross-chain balances, and nanopayments.
      </p>

      {/* Code window */}
      <div className="code-window">
        <div className="code-tabs">
          {(['cctp', 'gateway', 'wallets', 'paymaster'] as const).map((tab) => (
            <div
              key={tab}
              className={`code-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{ textTransform: 'uppercase' }}
            >
              {tab === 'cctp' && 'CCTP API'}
              {tab === 'gateway' && 'Gateway API'}
              {tab === 'wallets' && 'Wallets SDK'}
              {tab === 'paymaster' && 'Paymaster API'}
            </div>
          ))}
        </div>
        <div className="code-body">
          <pre style={{ margin: 0, fontStyle: 'normal' }}>
            {highlightCode(codeSnippets[activeTab])}
          </pre>
        </div>
      </div>

      {/* Mock Dev execution console */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <TerminalSquare size={14} style={{ color: 'var(--accent)' }} />
          <span>Integration Event Listener Console</span>
        </div>
        <div style={{
          backgroundColor: '#030303',
          border: '1px solid var(--card-border)',
          borderRadius: '2px',
          padding: '10px 14px',
          height: '100px',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: '#82aaff'
        }}>
          {devLogs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Listening for SDK event triggers from UI interactions...
            </div>
          ) : (
            devLogs.map((log, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>&gt; </span>
                {log}
              </div>
            ))
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
};
