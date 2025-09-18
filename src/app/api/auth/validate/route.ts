import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { User } from '@/contexts/auth-context';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('prinsur_user');

    if (!userCookie?.value) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 401 }
      );
    }

    // Parse and validate user data
    const user = JSON.parse(userCookie.value) as User;

    // Basic validation
    if (!user.id || !user.email || !user.type) {
      // Invalid session data, clear cookie
      cookieStore.delete('prinsur_user');
      return NextResponse.json(
        { success: false, error: 'Invalid session data' },
        { status: 401 }
      );
    }

    // In a production app, you would validate against your database here
    // For now, we trust the cookie data since it's demo mode

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        role: user.role || user.type, // Backward compatibility
      },
    });
  } catch (error) {
    console.error('Session validation error:', error);

    // Clear potentially corrupted cookie
    const cookieStore = await cookies();
    cookieStore.delete('prinsur_user');

    return NextResponse.json(
      { success: false, error: 'Session validation failed' },
      { status: 500 }
    );
  }
}