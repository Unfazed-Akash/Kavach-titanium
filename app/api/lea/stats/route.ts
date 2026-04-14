import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const [fraudRes, userRes] = await Promise.all([
      supabaseAdmin
        .from('transactions')
        .select('user_id, city, ip_address, device_fingerprint, fraud_type, amount, timestamp')
        .eq('is_fraud', true)
        .order('timestamp', { ascending: false })
        .limit(20),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    ]);

    const frauds = fraudRes.data ?? [];
    const recentAlerts = frauds.map((t: any) => ({
      sender_id: t.user_id ?? 'UNKNOWN',
      city: t.city,
      ip_address: t.ip_address,
      device_id: t.device_fingerprint,
      fraud_type: t.fraud_type,
      amount: t.amount,
      timestamp: t.timestamp,
    }));

    return NextResponse.json({
      active_operations: frauds.length,
      suspects_tracked: userRes.count ?? 0,
      recent_alerts: recentAlerts,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
