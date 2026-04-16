import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Get joint expenses from database
    const expenses: any[] = [];
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch joint expenses' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // TODO: Create joint expense in database
    return NextResponse.json({ id: '1', ...data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create joint expense' }, { status: 400 });
  }
}
