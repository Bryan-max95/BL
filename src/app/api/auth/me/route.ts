import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    const user = await getUserById(payload.id);

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 401 });
    }

    return NextResponse.json({
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
