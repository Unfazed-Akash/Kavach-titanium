'use client';
import type { AlertData, PredictedATM } from '@/lib/types';

interface AstraPanelProps {
  alert: AlertData;
  onClose: () => void;
  onDeployUnits: () => void;
  onFreezeAccounts: () => void;
}

export default function AstraPanel({ alert, onClose, onDeployUnits, onFreezeAccounts }: AstraPanelProps) {
  const riskPct = ((alert.transaction.fraud_probability ?? 0.95) * 100).toFixed(1);

  return (
    <div className="astra-panel">
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'blink 1s infinite' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: 2 }}>
              ASTRA INTELLIGENCE
            </span>
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, letterSpacing: 0.5 }}>
            Threat Analysis Engine v3.0
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-secondary)',
            width: 28, height: 28,
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="panel-scroll" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Threat Level */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase' }}>THREAT LEVEL</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#ef4444' }}>CRITICAL</span>
          </div>
          <div className="risk-bar-track" style={{ height: 6 }}>
            <div className="risk-bar-fill" style={{ width: `${riskPct}%`, background: '#ef4444' }} />
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Suspect ID:', value: alert.transaction.sender_id || `User_${alert.transaction.txn_id.substring(0,4)}`, mono: true },
            { label: 'Amount:', value: `₹${alert.transaction.amount?.toLocaleString('en-IN')}`, mono: true },
            { label: 'Origin:', value: alert.transaction.city },
            { label: 'Velocity:', value: 'HIGH (5.2 tx/hr)', highlight: true },
          ].map(({ label, value, mono, highlight }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>{label}</span>
              <span style={{
                color: highlight ? '#fbbf24' : '#e2e8f0',
                fontFamily: mono ? 'var(--font-mono)' : undefined,
                fontWeight: highlight ? 700 : 500,
                fontSize: 12,
              }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Predicted Withdrawal Points */}
        <div style={{ marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 13 }}>🔮</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#a5b4fc', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              PREDICTED WITHDRAWAL POINTS
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alert.predicted_atms.map((pred: PredictedATM, i: number) => (
              <div key={i} style={{
                background: 'rgba(30,41,59,0.5)',
                border: `1px solid rgba(255,255,255,0.05)`,
                borderLeft: '4px solid #fbbf24',
                borderRadius: 4, padding: 14,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: 12 }}>#{i + 1}</span>
                  <span style={{ color: '#e2e8f0', fontSize: 11, fontWeight: 700 }}>
                    {(pred.probability * 100).toFixed(0)}% Match
                  </span>
                </div>
                <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{pred.location}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span>Lat: {pred.lat.toFixed(4)}</span>
                  <span>ETA: {pred.estimated_time || '15 mins'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Buttons */}
      <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gap: 8 }}>
        <button className="btn btn-primary" onClick={onDeployUnits} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
          🚀 DEPLOY LEA TEAMS
        </button>
        <button className="btn" onClick={onFreezeAccounts} style={{ width: '100%', justifyContent: 'center', padding: '12px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
          ❄️ FREEZE ACCOUNTS
        </button>
      </div>
    </div>
  );
}
