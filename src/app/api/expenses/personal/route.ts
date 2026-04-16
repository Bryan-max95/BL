import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Get personal expenses from database
    const expenses: any[] = [];
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch personal expenses' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // TODO: Create personal expense in database
    return NextResponse.json({ id: '1', ...data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create personal expense' }, { status: 400 });
  }
}
