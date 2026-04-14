'use client';
import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';

interface AlertRow {
  sender_id: string;
  city: string;
  ip_address: string;
  device_id: string;
  fraud_type: string;
  amount: number;
  timestamp: string;
}

export default function LEAPage() {
  const [stats, setStats] = useState({ active_operations: 0, suspects_tracked: 0, recent_alerts: [] as AlertRow[] });
  const [deployCount, setDeployCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lea/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));

    const socket = getSocket();
    socket.on('new_alert', (alert: any) => {
      const txn = alert.transaction;
      const row: AlertRow = {
        sender_id: txn.sender_id ?? 'UNKNOWN',
        city: txn.city,
        ip_address: txn.ip_address ?? '0.0.0.0',
        device_id: txn.device_id ?? 'UNKNOWN',
        fraud_type: txn.fraud_type ?? 'ANOMALY',
        amount: txn.amount,
        timestamp: txn.timestamp,
      };
      setStats(prev => ({
        ...prev,
        active_operations: prev.active_operations + 1,
        recent_alerts: [row, ...prev.recent_alerts].slice(0, 20),
      }));
    });

    return () => { socket.off('new_alert'); };
  }, []);

  const RISK_SCORES = [97, 92, 88, 95, 91, 85, 98, 87, 93, 89];

  return (
    <div style={{ height: '100%', display: 'flex', background: 'var(--bg-core)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>

      {/* Sidebar */}
      <aside style={{
        width: 270,
        background: 'rgba(5,8,20,0.98)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', padding: 28, gap: 24, flexShrink: 0,
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399', animation: 'pulse-green 2s infinite' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 900, color: '#34d399', letterSpacing: 2 }}>
              CYBER<span style={{ color: 'white' }}>POL</span>
            </span>
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, marginLeft: 18 }}>UNIT-774 // NEW DELHI</div>
        </div>

        <div className="divider" />

        {/* KPI Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'ACTIVE INTERCEPTIONS', value: stats.active_operations, color: '#34d399', sub: 'Real-time alerts' },
            { label: 'SUSPECTS TRACKED', value: stats.suspects_tracked, color: '#60a5fa', sub: 'Under surveillance' },
            { label: 'UNITS DEPLOYED', value: deployCount, color: '#fbbf24', sub: 'Field operations' },
          ].map(({ label, value, color, sub }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${color}20`,
              borderLeft: `3px solid ${color}`,
              borderRadius: 10,
              padding: '14px 16px',
            }}>
              <div style={{ fontSize: 9, color, fontWeight: 800, letterSpacing: 1.5, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, fontFamily: 'var(--font-display)' }}>{value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* System Status */}
        <div style={{ marginTop: 'auto' }}>
          <div className="divider" style={{ marginBottom: 16 }} />
          {[
            { label: 'ENCRYPTION', status: 'AES-256', ok: true },
            { label: 'VPN TUNNEL', status: 'ACTIVE', ok: true },
            { label: 'DB SYNC', status: 'LIVE', ok: true },
          ].map(({ label, status, ok }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.5 }}>{label}</span>
              <span style={{ fontSize: 9, color: ok ? '#34d399' : '#ef4444', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{status}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Bar */}
        <header style={{
          padding: '0 32px',
          height: 70,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(5,8,20,0.6)',
          flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, color: 'white', letterSpacing: -0.5 }}>
              LIVE OPERATIONS CENTER
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 11 }}>
              Real-time fraud interception · Geospatial intelligence · Suspect tracking
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right', marginRight: 8 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#ef4444', lineHeight: 1, fontFamily: 'var(--font-display)', textShadow: '0 0 20px rgba(239,68,68,0.4)' }}>
                {stats.active_operations}
              </div>
              <div style={{ fontSize: 9, color: '#ef4444', fontWeight: 800, letterSpacing: 1 }}>CRITICAL ALERTS</div>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => setDeployCount(c => c + 1)}
              style={{ fontSize: 12, padding: '10px 20px' }}
            >
              🚀 DEPLOY UNITS
            </button>
          </div>
        </header>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 32px' }}>
          <div style={{ glass: true, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14 } as any}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                Threat Intelligence Log
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="live-dot red" style={{ width: 6, height: 6 }} />
                <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 700 }}>LIVE FEED</span>
              </div>
            </div>

            <div className="panel-scroll" style={{ flex: 1 }}>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                  Loading intelligence data...
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>TIMESTAMP</th>
                      <th>SUSPECT ID</th>
                      <th>LOCATION · IP</th>
                      <th>DEVICE · METHOD</th>
                      <th>AMOUNT</th>
                      <th>RISK SCORE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_alerts.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 12 }}>
                          No threats detected yet. Start simulation to generate data.
                        </td>
                      </tr>
                    ) : stats.recent_alerts.map((alert, i) => {
                      const risk = RISK_SCORES[i % RISK_SCORES.length];
                      return (
                        <tr key={`${alert.timestamp}-${i}`} className={i === 0 ? 'row-alert' : ''} style={{ animationDelay: `${i * 0.03}s` }}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                            {new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour12: false })}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#60a5fa' }}>
                            {alert.sender_id?.slice(0, 14)}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 12 }}>{alert.city}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {alert.ip_address}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: 11 }}>{alert.device_id?.slice(0, 16)}</div>
                            <span className="badge badge-warning" style={{ fontSize: 9, marginTop: 3 }}>
                              {alert.fraud_type?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: '#fbbf24' }}>
                            ₹{alert.amount?.toLocaleString('en-IN')}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="risk-bar-track" style={{ width: 60 }}>
                                <div className="risk-bar-fill" style={{ width: `${risk}%` }} />
                              </div>
                              <span style={{ color: '#f87171', fontWeight: 800, fontSize: 11 }}>{risk}%</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-danger">
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 4px #ef4444', display: 'inline-block' }} />
                              INTERCEPTED
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
