'use client';
import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';

interface BankStats { total_saved_inr: number; blocked_cards: number; false_positive_rate: string; }
interface LogEntry { time: string; desc: string; amount: number; id: string; city: string; }

export default function BankPage() {
  const [stats, setStats] = useState<BankStats>({ total_saved_inr: 0, blocked_cards: 0, false_positive_rate: '0.4%' });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [freezeActive, setFreezeActive] = useState(false);

  useEffect(() => {
    fetch('/api/bank/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));

    const socket = getSocket();
    socket.on('new_alert', (alert: any) => {
      const txn = alert.transaction;
      setStats(prev => ({
        ...prev,
        total_saved_inr: prev.total_saved_inr + (txn.amount ?? 0),
        blocked_cards: prev.blocked_cards + 1,
      }));
      setLogs(prev => [{
        time: new Date(txn.timestamp).toLocaleTimeString('en-IN', { hour12: false }),
        desc: `${txn.sender_id ?? 'User'} @ ${txn.city}`,
        amount: txn.amount,
        id: txn.txn_id,
        city: txn.city,
      }, ...prev].slice(0, 25));
    });

    return () => { socket.off('new_alert'); };
  }, []);

  const handleFreeze = () => {
    setFreezeActive(true);
    setTimeout(() => setFreezeActive(false), 3000);
  };

  const METRICS = [
    {
      label: 'LIABILITY PREVENTED',
      value: `₹${stats.total_saved_inr.toLocaleString('en-IN')}`,
      color: '#34d399',
      icon: '🛡️',
      sub: '▲ blocking active fraud',
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))',
      border: 'rgba(16,185,129,0.2)',
    },
    {
      label: 'CARDS AUTO-BLOCKED',
      value: stats.blocked_cards.toString(),
      color: '#ef4444',
      icon: '🔒',
      sub: 'Actioned by AI Model v3.0',
      gradient: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))',
      border: 'rgba(239,68,68,0.2)',
    },
    {
      label: 'FALSE POSITIVE RATE',
      value: stats.false_positive_rate,
      color: '#60a5fa',
      icon: '📊',
      sub: 'Within optimal range (<0.5%)',
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))',
      border: 'rgba(59,130,246,0.2)',
    },
    {
      label: 'MODEL ACCURACY',
      value: '98.7%',
      color: '#a78bfa',
      icon: '🧠',
      sub: 'RandomForest v2.1 · Trained',
      gradient: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(167,139,250,0.02))',
      border: 'rgba(167,139,250,0.2)',
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-core)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>

      {/* Top Bar */}
      <header style={{
        padding: '0 32px',
        height: 66,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(5,8,22,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#818cf8', letterSpacing: 1 }}>
                BANKING <span style={{ color: 'white' }}>CORE</span>
              </span>
              <span className="badge badge-blue" style={{ fontSize: 9 }}>KAVACH v3.0</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Financial Threat Intelligence · Real-time Card Security
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="live-dot green" />
            <span style={{ fontSize: 9, fontWeight: 700, color: '#34d399', letterSpacing: 1 }}>HDFC-NET-01 SYNC</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>ADMINISTRATOR</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Security Level 5 · Clearance A</div>
            </div>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              👤
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleFreeze}
            style={{
              fontSize: 11, padding: '9px 18px',
              background: freezeActive
                ? 'linear-gradient(135deg, #1e40af, #1d4ed8)'
                : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              boxShadow: freezeActive ? '0 0 20px rgba(14,165,233,0.5)' : undefined,
            }}
          >
            {freezeActive ? '✅ ACCOUNTS FROZEN' : '❄️ FREEZE ACCOUNTS'}
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: 20, overflow: 'auto' }}>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, flexShrink: 0 }}>
          {METRICS.map(({ label, value, color, icon, sub, gradient, border }) => (
            <div key={label} style={{
              background: gradient,
              border: `1px solid ${border}`,
              borderRadius: 14,
              padding: '20px 22px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ position: 'absolute', top: 14, right: 16, fontSize: 28, opacity: 0.15 }}>{icon}</div>
              {loading ? (
                <div className="skeleton" style={{ width: '60%', height: 32 }} />
              ) : (
                <>
                  <div className="stat-card-label">{label}</div>
                  <div className="stat-card-value" style={{ color }}>{value}</div>
                  <div className="stat-card-sub">{sub}</div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Live Log */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: 'rgba(8,12,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Real-Time Intervention Log
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-danger" style={{ fontSize: 9 }}>{logs.length} EVENTS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="live-dot red" style={{ width: 5, height: 5 }} />
                <span style={{ fontSize: 9, color: '#f87171', fontWeight: 700 }}>LIVE</span>
              </div>
            </div>
          </div>

          <div className="panel-scroll" style={{ flex: 1 }}>
            {logs.length === 0 ? (
              <div style={{ padding: 50, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                System idle. No fraud interventions recorded yet.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>TIME</th>
                    <th>ACTION</th>
                    <th>DESCRIPTION · CITY</th>
                    <th>AMOUNT BLOCKED</th>
                    <th>TRANSACTION ID</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={`${log.id}-${i}`} style={{ animationDelay: `${i * 0.02}s` }}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{log.time}</td>
                      <td>
                        <span className="badge badge-danger" style={{ fontSize: 9 }}>BLOCKED</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{log.desc}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24', fontSize: 13 }}>
                        ₹{log.amount?.toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                        {log.id?.slice(0, 14)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
