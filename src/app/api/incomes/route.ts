import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Get all incomes from database
    const incomes: any[] = [];
    return NextResponse.json(incomes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch incomes' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // TODO: Create income in database
    return NextResponse.json({ id: '1', ...data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create income' }, { status: 400 });
  }
}
