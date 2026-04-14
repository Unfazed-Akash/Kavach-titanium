'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import AstraPanel from '@/components/AstraPanel';
import { getSocket } from '@/lib/socket';
import type { AlertData, ATMLocation, Transaction } from '@/lib/types';

const LiveMap = dynamic(() => import('@/components/LiveMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-void)', color: 'var(--text-muted)',
      flexDirection: 'column', gap: 12,
    }}>
      <div style={{ fontSize: 24 }}>🛰️</div>
      <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>LOADING SATELLITE FEED...</div>
    </div>
  ),
});

export default function GodEyeDashboard() {
  const [atms, setAtms] = useState<ATMLocation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState({ threats: 0, blocked: 0 });

  // Fetch ATMs
  useEffect(() => {
    fetch('/api/atms')
      .then(r => r.json())
      .then(data => setAtms(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Socket setup
  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('sim_status', (s: { running: boolean }) => setSimulating(s.running));

    socket.on('new_transaction', (txn: Transaction) => {
      setTransactions(prev => [...prev.slice(-49), txn]);
    });

    socket.on('new_alert', (alert: AlertData) => {
      setAlerts(prev => [...prev.slice(-9), alert]);
      setStats(prev => ({
        threats: prev.threats + 1,
        blocked: alert.transaction.status === 'BLOCKED' ? prev.blocked + 1 : prev.blocked,
      }));
    });

    socket.on('system_status', (s: { simulation: boolean }) => setSimulating(s.simulation));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('sim_status');
      socket.off('new_transaction');
      socket.off('new_alert');
      socket.off('system_status');
    };
  }, []);

  const toggleSimulation = () => {
    const socket = getSocket();
    if (simulating) socket.emit('stop_simulation');
    else socket.emit('start_simulation');
  };

  const handleAlertClick = useCallback((alert: AlertData) => {
    setSelectedAlert(alert);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>

      {/* Command Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 52,
        background: 'rgba(5,8,22,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0, zIndex: 200,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#60a5fa', letterSpacing: 2 }}>
              GOD EYE
            </span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)', padding: '2px 6px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4 }}>
              NATIONAL COMMAND CENTER
            </span>
          </div>

          {[
            { label: 'PROTECTED ATMs', value: atms.length, color: '#60a5fa', rgb: '59,130,246' },
            { label: 'THREATS', value: stats.threats, color: '#ef4444', rgb: '239,68,68' },
            { label: 'BLOCKED', value: stats.blocked, color: '#34d399', rgb: '16,185,129' },
          ].map(({ label, value, color, rgb }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 14px',
              background: `rgba(${rgb},0.1)`,
              border: `1px solid ${color}25`, borderRadius: 6,
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1 }}>{label}</span>
              <span style={{ fontSize: 16, fontWeight: 900, color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
            <span className={`live-dot ${connected ? 'green' : 'amber'}`} />
            <span style={{ fontSize: 9, fontWeight: 700, color: connected ? '#34d399' : '#fbbf24', letterSpacing: 1 }}>
              {connected ? 'FEED LIVE' : 'RECONNECTING...'}
            </span>
          </div>
          <button
            onClick={toggleSimulation}
            className={`btn ${simulating ? 'btn-danger sim-active' : 'btn-primary'}`}
            style={{ fontSize: 11, padding: '8px 18px' }}
          >
            {simulating ? '⏹ STOP SIMULATION' : '🎮 START SIMULATION'}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <LiveMap atms={atms} transactions={transactions} alerts={alerts} onAlertClick={handleAlertClick} />

          {/* Map Overlay */}
          <div style={{
            position: 'absolute', top: 12, left: 12, zIndex: 500,
            pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(5,8,22,0.9)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8, padding: '8px 14px',
              display: 'flex', gap: 16,
            }}>
              {[
                { label: 'TXN FEED', value: `${transactions.length}/50`, color: '#34d399' },
                { label: 'ALERTS', value: alerts.length, color: '#ef4444' },
                { label: 'CITIES', value: 7, color: '#60a5fa' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{
          width: 380,
          background: 'rgba(5,8,20,0.98)',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {selectedAlert ? (
            <AstraPanel
              alert={selectedAlert}
              onClose={() => setSelectedAlert(null)}
              onDeployUnits={() => window.open('/lea', '_blank')}
              onFreezeAccounts={() => window.open('/bank', '_blank')}
            />
          ) : (
            <AlertFeed alerts={alerts} onSelect={setSelectedAlert} />
          )}
        </div>
      </div>
    </div>
  );
}

function AlertFeed({ alerts, onSelect }: { alerts: AlertData[]; onSelect: (a: AlertData) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="live-dot red" style={{ opacity: alerts.length > 0 ? 1 : 0.3 }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Intelligence Feed
          </span>
        </div>
        <span style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#f87171', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
        }}>
          {alerts.length} ACTIVE
        </span>
      </div>

      <div className="panel-scroll" style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {alerts.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 10 }}>
            <div style={{ fontSize: 28 }}>🛡️</div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>SYSTEMS SECURE</div>
            <div style={{ fontSize: 10, textAlign: 'center', maxWidth: 200 }}>
              Monitoring network traffic... No threats detected.
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: '#3b82f6', fontFamily: 'var(--font-mono)', animation: 'blink 2s infinite' }}>
              ► Start simulation to activate
            </div>
          </div>
        ) : (
          [...alerts].reverse().map((alert, i) => (
            <div key={alert.id} className="feed-item" onClick={() => onSelect(alert)}
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="badge badge-danger">
                  <span className="live-dot red" style={{ width: 5, height: 5 }} />
                  CRITICAL
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                  {new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour12: false })}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                Fraud in <strong style={{ color: '#f87171' }}>{alert.transaction.city}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                  ₹{alert.transaction.amount?.toLocaleString('en-IN')}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  ► {alert.predicted_atms.length} targets identified
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
