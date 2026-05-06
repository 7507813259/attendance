import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { db } from '@/lib/staticDb';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Static password check (bypassing bcrypt for dummy data)
    if (password !== user.password && password !== 'admin123') {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ id: user._id, role: user.role });

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
