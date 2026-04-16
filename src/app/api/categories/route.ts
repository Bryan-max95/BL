import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM categories WHERE is_active = true ORDER BY type, name');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener categorías' }, { status: 500 });
  }
}
