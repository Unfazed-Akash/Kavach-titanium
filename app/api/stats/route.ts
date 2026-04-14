import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const [txnRes, fraudRes, userRes] = await Promise.all([
      supabaseAdmin.from('transactions').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('transactions').select('*', { count: 'exact', head: true }).eq('is_fraud', true),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    ]);

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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
