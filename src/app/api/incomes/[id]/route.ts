import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // TODO: Get income by ID from database
    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch income' }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    // TODO: Update income in database
    return NextResponse.json({ id, ...data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update income' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    // TODO: Delete income from database
    return NextResponse.json({ message: 'Income deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete income' }, { status: 400 });
  }
}
