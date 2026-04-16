import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // TODO: Get wedding expense by ID from database
    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wedding expense' }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    // TODO: Update wedding expense in database
    return NextResponse.json({ id, ...data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update wedding expense' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    // TODO: Delete wedding expense from database
    return NextResponse.json({ message: 'Wedding expense deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete wedding expense' }, { status: 400 });
  }
}
