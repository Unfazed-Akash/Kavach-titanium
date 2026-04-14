import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ATM_LOCATIONS } from '@/lib/atmLocations';

async function seedATMs() {
  try {
    const { count } = await supabaseAdmin.from('atms').select('*', { count: 'exact', head: true });
    if (!count || count === 0) {
      await supabaseAdmin.from('atms').insert(ATM_LOCATIONS);
    }
  } catch {
    // Table may not exist yet — ignore silently
  }
}

export async function GET() {
  try {
    await seedATMs();

    const { data, error } = await supabaseAdmin
      .from('atms')
      .select('*')
      .order('city');

    // If table doesn't exist yet, return local data
    if (error?.code === '42P01' || error) {
      return NextResponse.json(ATM_LOCATIONS);
    }

    return NextResponse.json(data ?? ATM_LOCATIONS);
  } catch {
    // Always return ATM data — fall back to local constants
    return NextResponse.json(ATM_LOCATIONS);
  }
}
