'use client';
import { useEffect, useRef } from 'react';
import type { AlertData, ATMLocation, Transaction } from '@/lib/types';

// Leaflet is loaded lazily to avoid SSR issues
let L: any = null;

interface LiveMapProps {
  atms: ATMLocation[];
  transactions: Transaction[];
  alerts: AlertData[];
  onAlertClick: (alert: AlertData) => void;
}

export default function LiveMap({ atms, transactions, alerts, onAlertClick }: LiveMapProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<{
    atms: any[];
    transactions: any[];
    alerts: any[];
  }>({ atms: [], transactions: [], alerts: [] });

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const init = async () => {
      L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      const map = L.map(containerRef.current, {
        center: [22.5937, 78.9629],
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        maxBounds: [[5.0, 65.0], [38.0, 98.5]],
        maxBoundsViscosity: 0.9,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        noWrap: true,
        subdomains: 'abcd',
      }).addTo(map);

      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);
      mapRef.current = map;
    };

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        if (containerRef.current) {
          (containerRef.current as any)._leaflet_id = null;
        }
      }
    };
  }, []);

  // Update ATMs layer
  useEffect(() => {
    if (!mapRef.current || !L || atms.length === 0) return;
    layersRef.current.atms.forEach((l: any) => l.remove());
    layersRef.current.atms = atms.map((atm) =>
      L.circleMarker([atm.lat, atm.lng], {
        radius: 3,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.6,
        weight: 0,
      })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;padding:4px">
            <div style="font-size:11px;font-weight:700;color:#60a5fa;margin-bottom:4px">ATM ${atm.id}</div>
            <div style="font-size:12px;font-weight:600">${atm.location}</div>
            <div style="font-size:11px;color:#7c8db0">${atm.city}</div>
          </div>
        `)
    );
  }, [atms]);

  // Update Transactions layer (last 50)
  useEffect(() => {
    if (!mapRef.current || !L) return;
    const last = transactions.slice(-50);
    while (layersRef.current.transactions.length > 50) {
      layersRef.current.transactions.shift()?.remove();
    }
    if (last.length > 0) {
      const newest = last[last.length - 1];
      const marker = L.circleMarker([newest.lat, newest.lng], {
        radius: newest.is_fraud ? 7 : 3,
        color: newest.is_fraud ? '#ef4444' : '#10b981',
        fillColor: newest.is_fraud ? '#ef4444' : '#10b981',
        fillOpacity: 0.85,
        weight: newest.is_fraud ? 1.5 : 0,
      })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;padding:4px">
            <div style="font-size:12px;font-weight:800;color:${newest.is_fraud ? '#f87171' : '#34d399'};margin-bottom:4px">
              ${newest.is_fraud ? '🚨 FRAUD DETECTED' : '✅ Valid Transaction'}
            </div>
            <div style="font-size:13px;font-weight:700">₹${newest.amount?.toLocaleString('en-IN')}</div>
            <div style="font-size:11px;color:#7c8db0;margin-top:4px">${newest.city}</div>
          </div>
        `);
      layersRef.current.transactions.push(marker);
    }
  }, [transactions]);

  // Update Alerts layer (prediction markers)
  useEffect(() => {
    if (!mapRef.current || !L || alerts.length === 0) return;
    layersRef.current.alerts.forEach((l: any) => l.remove());
    layersRef.current.alerts = [];

    const TacticalIcon = L.divIcon({ className: 'glow-marker', iconSize: [24, 24], iconAnchor: [12, 12] });

    alerts.slice(-5).forEach((alert) => {
      const txn = alert.transaction;
      alert.predicted_atms.forEach((pred) => {
        const line = L.polyline(
          [[txn.lat, txn.lng], [pred.lat, pred.lng]],
          { color: '#fbbf24', weight: 1, dashArray: '4 6', opacity: 0.5 }
        ).addTo(mapRef.current);
        layersRef.current.alerts.push(line);

        const m = L.marker([pred.lat, pred.lng], { icon: TacticalIcon })
          .addTo(mapRef.current)
          .bindPopup(`
            <div style="font-family:Inter,sans-serif;padding:4px">
              <div style="font-size:12px;font-weight:800;color:#fbbf24;margin-bottom:4px">⚠ PREDICTED TARGET</div>
              <div style="font-size:13px;font-weight:600">${pred.location}</div>
              <div style="font-size:11px;color:#7c8db0;margin-top:4px">Confidence: ${(pred.probability * 100).toFixed(0)}%</div>
            </div>
          `);
        m.on('click', () => onAlertClick(alert));
        layersRef.current.alerts.push(m);
      });
    });
  }, [alerts, onAlertClick]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: 'var(--bg-void)' }}
    />
  );
}
