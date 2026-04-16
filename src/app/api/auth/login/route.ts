import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, verifyPassword, generateToken, updateLastLogin } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Usuario y contraseña requeridos' },
        { status: 400 }
      );
    }

    const user = await getUserByUsername(username);

    if (!user) {
      return NextResponse.json(
        { message: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { message: 'Usuario desactivado' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Update last login
    await updateLastLogin(user.id);

    // Generate token
    const token = generateToken({ id: user.id, username: user.username });

    // Log audit
    await logAudit({
      user_id: user.id,
      action: 'LOGIN',
      entity: 'User',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
