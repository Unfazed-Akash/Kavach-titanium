import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ATM_LOCATIONS } from '@/lib/atmLocations';

// Seed ATMs into Supabase if table is empty
async function seedATMs() {
  const { count } = await supabaseAdmin.from('atms').select('*', { count: 'exact', head: true });
  if (!count || count === 0) {
    const { error } = await supabaseAdmin.from('atms').insert(ATM_LOCATIONS);
    if (error) console.error('[Seed ATMs]', error.message);
  }
}

export async function GET() {
  try {
    await seedATMs();
    const { data, error } = await supabaseAdmin
      .from('atms')
      .select('*')
      .order('city');

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
