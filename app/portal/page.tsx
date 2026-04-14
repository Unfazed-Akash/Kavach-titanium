'use client';
import { useState } from 'react';

const FRAUD_TYPES = [
  { value: 'UPI', label: 'UPI Fraud' },
  { value: 'CC', label: 'Credit / Debit Card Cloning' },
  { value: 'PHISHING', label: 'Phishing / OTP Scam' },
  { value: 'KYC', label: 'Fake KYC / Impersonation' },
  { value: 'SIM_SWAP', label: 'SIM Swap Attack' },
  { value: 'INVESTMENT', label: 'Investment / Ponzi Fraud' },
  { value: 'OTHER', label: 'Other' },
];

export default function PortalPage() {
  const [form, setForm] = useState({
    mobile_no: '', account_no: '', email: '', bank_name: '',
    transaction_id: '', fraud_type: 'UPI', description: '',
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading' | null; msg: string }>({ type: null, msg: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Encrypting and submitting your report...' });
    try {
      const res = await fetch('/api/portal/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setStatus({ type: 'success', msg: `✅ Complaint Registered! Your Ticket ID: #${data.ticket_id}` });
      setForm({ mobile_no: '', account_no: '', email: '', bank_name: '', transaction_id: '', fraud_type: 'UPI', description: '' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: `❌ ${err.message}` });
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(5,8,22,0.9)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10, color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)', fontSize: 14,
    outline: 'none', transition: 'all 0.2s',
  };

  return (
    <div style={{
      minHeight: '100%', overflow: 'auto',
      background: 'radial-gradient(ellipse at top, #0d1327 0%, #020617 60%)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 680 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 70, height: 70,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderRadius: 18,
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
            boxShadow: '0 0 30px rgba(124,58,237,0.4), 0 0 60px rgba(37,99,235,0.2)',
          }}>🛡️</div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: 'white', margin: '0 0 8px', letterSpacing: -0.5 }}>
            Citizen Shield Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
            Secure Cybercrime Reporting Platform · Ministry of Home Affairs
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            {['AES-256 Encrypted', 'End-to-End Secure', '24/7 Processing'].map(tag => (
              <span key={tag} className="badge badge-blue" style={{ fontSize: 9 }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Status Alert */}
        {status.type && (
          <div style={{
            padding: '16px 20px',
            borderRadius: 12,
            marginBottom: 24,
            fontSize: 13,
            fontWeight: 600,
            textAlign: 'center',
            background: status.type === 'success' ? 'rgba(16,185,129,0.1)'
              : status.type === 'error' ? 'rgba(239,68,68,0.1)'
              : 'rgba(59,130,246,0.1)',
            color: status.type === 'success' ? '#34d399'
              : status.type === 'error' ? '#f87171'
              : '#60a5fa',
            border: `1px solid ${status.type === 'success' ? 'rgba(16,185,129,0.3)'
              : status.type === 'error' ? 'rgba(239,68,68,0.3)'
              : 'rgba(59,130,246,0.3)'}`,
          }}>
            {status.msg}
          </div>
        )}

        {/* Form Card */}
        <div style={{
          background: 'rgba(10,15,30,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20,
          padding: 32,
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 24, textTransform: 'uppercase' }}>
            ▸ INCIDENT REPORT FORM
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

              {/* Mobile */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Mobile Number *</label>
                <input className="form-input" name="mobile_no" type="tel" placeholder="9876543210"
                  value={form.mobile_no} onChange={handleChange} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Account No */}
              <div className="form-group">
                <label className="form-label">Account Number *</label>
                <input className="form-input" name="account_no" placeholder="XXXX-XXXX-XXXX"
                  value={form.account_no} onChange={handleChange} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Bank */}
              <div className="form-group">
                <label className="form-label">Bank Name *</label>
                <input className="form-input" name="bank_name" placeholder="SBI / HDFC / ICICI"
                  value={form.bank_name} onChange={handleChange} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Email */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Email Address *</label>
                <input className="form-input" name="email" type="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Transaction ID */}
              <div className="form-group">
                <label className="form-label">Transaction ID (optional)</label>
                <input className="form-input" name="transaction_id" placeholder="Leave blank if unknown"
                  value={form.transaction_id} onChange={handleChange} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Fraud Type */}
              <div className="form-group">
                <label className="form-label">Type of Fraud *</label>
                <select name="fraud_type" value={form.fraud_type} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(59,130,246,0.5)'; }}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
                >
                  {FRAUD_TYPES.map(f => (
                    <option key={f.value} value={f.value} style={{ background: '#0a0f1e' }}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Description of Incident *</label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Describe what happened in detail — when, how, what was lost..."
                  value={form.description}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Submit */}
              <div style={{ gridColumn: 'span 2' }}>
                <button
                  type="submit"
                  disabled={status.type === 'loading'}
                  style={{
                    width: '100%', padding: '15px',
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    border: 'none', borderRadius: 12,
                    color: 'white', fontSize: 14, fontWeight: 800,
                    cursor: status.type === 'loading' ? 'not-allowed' : 'pointer',
                    letterSpacing: 0.5,
                    boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
                    transition: 'all 0.2s',
                    opacity: status.type === 'loading' ? 0.7 : 1,
                  }}
                >
                  {status.type === 'loading' ? '⏳ SUBMITTING SECURE REPORT...' : '🚀 SUBMIT REPORT'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 20, lineHeight: 1.6 }}>
          Your report is encrypted end-to-end and routed to the National Cybercrime Coordination Centre (I4C).<br />
          You will receive a response within 24-48 hours on your registered email.
        </p>
      </div>
    </div>
  );
}
