'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'GOD EYE', color: '#60a5fa', desc: 'Command Center' },
  { href: '/lea', label: 'LEA OPS', color: '#34d399', desc: 'Cyber Police' },
  { href: '/bank', label: 'BANKING CORE', color: '#818cf8', desc: 'Financial Shield' },
  { href: '/portal', label: 'CITIZEN SHIELD', color: '#fbbf24', desc: 'Report Fraud' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [time, setTime] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    }, 1000);
    // Check connectivity after mount
    setTimeout(() => setIsConnected(true), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 'var(--nav-height)',
        background: 'rgba(5, 8, 20, 0.97)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 'var(--z-nav)',
        gap: 0,
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 32, flexShrink: 0 }}>
        <div
          style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
            boxShadow: '0 0 12px rgba(124,58,237,0.4)',
          }}
        >
          🛡️
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>
          KAVACH <span style={{ color: '#60a5fa' }}>TITANIUM</span>
        </span>
        <span style={{
          padding: '2px 7px',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 4,
          fontSize: 9,
          fontWeight: 700,
          color: '#34d399',
          letterSpacing: 1,
          marginLeft: 4,
        }}>
          v3.0 LIVE
        </span>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: 4, flex: 1 }}>
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '6px 14px',
                borderRadius: 7,
                textDecoration: 'none',
                background: active ? `rgba(${link.color === '#60a5fa' ? '59,130,246' : link.color === '#34d399' ? '52,211,153' : link.color === '#818cf8' ? '129,140,248' : '251,191,36'},0.1)` : 'transparent',
                border: active ? `1px solid ${link.color}30` : '1px solid transparent',
                transition: 'all 0.2s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.5,
                color: active ? link.color : 'rgba(255,255,255,0.5)',
                transition: 'color 0.2s',
              }}>
                {link.label}
              </span>
              {active && (
                <div style={{
                  position: 'absolute',
                  bottom: -1,
                  left: '20%',
                  right: '20%',
                  height: 2,
                  background: link.color,
                  borderRadius: 99,
                  boxShadow: `0 0 6px ${link.color}`,
                }} />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        {/* System Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={`live-dot ${isConnected ? 'green' : 'amber'}`} />
          <span style={{ fontSize: 10, fontWeight: 700, color: isConnected ? '#34d399' : '#fbbf24', letterSpacing: 0.5 }}>
            {isConnected ? 'SYSTEM ONLINE' : 'INITIALIZING'}
          </span>
        </div>

        {/* Clock */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'rgba(255,255,255,0.3)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          paddingLeft: 16,
        }}>
          {time}
        </div>

        {/* MHA Badge */}
        <div style={{
          padding: '4px 10px',
          background: 'rgba(37,99,235,0.08)',
          border: '1px solid rgba(37,99,235,0.2)',
          borderRadius: 6,
          fontSize: 9,
          fontWeight: 700,
          color: '#3b82f6',
          letterSpacing: 1,
        }}>
          MHA CLEARANCE L-5
        </div>
      </div>
    </nav>
  );
}
