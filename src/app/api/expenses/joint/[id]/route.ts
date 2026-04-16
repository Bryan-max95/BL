import { NextRequest, NextResponse } from 'next/server';

/**
 * ✅ Next.js 15+
 * params ahora es Promise
 */
type Params = Promise<{ id: string }>;

/* =====================================================
   GET - Obtener gasto conjunto por ID
===================================================== */
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    // TODO: Obtener gasto desde base de datos
    return NextResponse.json({
      id,
      message: 'Joint expense fetched successfully'
    });

  } catch (error) {
    console.error('GET joint expense error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch joint expense' },
      { status: 400 }
    );
  }
}

/* =====================================================
   PUT - Actualizar gasto conjunto
===================================================== */
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // TODO: Actualizar gasto en base de datos
    return NextResponse.json({
      id,
      ...data,
      message: 'Joint expense updated successfully'
    });

  } catch (error) {
    console.error('PUT joint expense error:', error);

    return NextResponse.json(
      { error: 'Failed to update joint expense' },
      { status: 400 }
    );
  }
}

/* =====================================================
   DELETE - Eliminar gasto conjunto
===================================================== */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    // TODO: Eliminar gasto en base de datos
    return NextResponse.json({
      id,
      message: 'Joint expense deleted successfully'
    });

  } catch (error) {
    console.error('DELETE joint expense error:', error);

    return NextResponse.json(
      { error: 'Failed to delete joint expense' },
      { status: 400 }
    );
  }
}