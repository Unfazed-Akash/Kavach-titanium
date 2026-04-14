import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const [txnRes, fraudRes, userRes] = await Promise.all([
      supabaseAdmin.from('transactions').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('transactions').select('*', { count: 'exact', head: true }).eq('is_fraud', true),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    ]);

    // Graceful zero-state if tables don't exist yet
    if (txnRes.error?.code === '42P01' || userRes.error?.code === '42P01') {
      return NextResponse.json({
        active_monitoring: true,
        users_protected: 0,
        total_transactions: 0,
        threats_intercepted: 0,
        fraud_rate: 0,
        _note: 'Run supabase-schema.sql to create tables',
      });
    }

    const total = txnRes.count ?? 0;
    const fraudCount = fraudRes.count ?? 0;
    const users = userRes.count ?? 0;

    return NextResponse.json({
      active_monitoring: true,
      users_protected: users,
      total_transactions: total,
      threats_intercepted: fraudCount,
      fraud_rate: total > 0 ? parseFloat(((fraudCount / total) * 100).toFixed(2)) : 0,
    });
  } catch (err: any) {
    console.error('[stats]', err.message);
    return NextResponse.json({
      active_monitoring: true,
      users_protected: 0,
      total_transactions: 0,
      threats_intercepted: 0,
      fraud_rate: 0,
    });
  }
}
