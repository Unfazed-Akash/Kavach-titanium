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
      <div className="panel-scroll" style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button className="btn btn-primary" onClick={onDeployUnits}
            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 11 }}>
            🚀 DEPLOY UNITS
          </button>
          <button className="btn btn-danger" onClick={onFreezeAccounts}
            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 11 }}>
            ❄️ FREEZE ACCTS
          </button>
        </div>

        {/* Transaction Details */}
        <div style={{
          background: 'rgba(239,68,68,0.05)',
          border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: 10, padding: 14,
        }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>
            ▸ THREAT ANALYSIS
          </div>
          {[
            { label: 'TRANSACTION ID', value: alert.transaction.txn_id.split('-')[0] + '...', mono: true },
            { label: 'AMOUNT FLAGGED', value: `₹${alert.transaction.amount.toLocaleString('en-IN')}`, bold: true },
            { label: 'INCIDENT CITY', value: alert.transaction.city },
            { label: 'FRAUD TYPE', value: alert.transaction.fraud_type ?? 'ANOMALY' },
          ].map(({ label, value, mono, bold }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>{label}</span>
              <span style={{
                color: bold ? '#fbbf24' : '#e2e8f0',
                fontFamily: mono ? 'var(--font-mono)' : undefined,
                fontWeight: bold ? 700 : 500,
                fontSize: mono ? 11 : 12,
              }}>{value}</span>
            </div>
          ))}

          {/* Risk Gauge */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 0.5 }}>RISK SCORE</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: '#ef4444' }}>{riskPct}%</span>
            </div>
            <div className="risk-bar-track">
              <div className="risk-bar-fill" style={{ width: `${riskPct}%` }} />
            </div>
          </div>
        </div>

        {/* Predicted Withdrawal Points */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>
            ▸ PREDICTED WITHDRAWAL POINTS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alert.predicted_atms.map((pred: PredictedATM, i: number) => (
              <div key={i} style={{
                background: 'rgba(251,191,36,0.04)',
                border: `1px solid rgba(251,191,36,${0.15 - i * 0.04})`,
                borderLeft: '3px solid #fbbf24',
                borderRadius: 8, padding: 12,
                animation: `fadeSlideIn ${0.2 + i * 0.1}s ease both`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: 10, letterSpacing: 0.5 }}>#{i + 1} TARGET</span>
                  <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                    {(pred.probability * 100).toFixed(0)}% PROB
                  </span>
                </div>
                <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{pred.location}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>⏱ ETA: {pred.estimated_time}</span>
                  {pred.distance !== undefined && <span>📍 {pred.distance} km</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timestamp */}
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)', paddingTop: 4 }}>
          Detected at {new Date(alert.timestamp).toLocaleTimeString('en-IN')}
        </div>
      </div>
    </div>
  );
}
