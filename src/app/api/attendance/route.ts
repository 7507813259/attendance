import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/staticDb';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized or forbidden' }, { status: 403 });
    }

    // Get date from query params or use today
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    
    let startOfDay, endOfDay;
    
    if (dateParam) {
      startOfDay = new Date(dateParam);
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date(dateParam);
      endOfDay.setHours(23, 59, 59, 999);
    } else {
      startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
    }

    const attendances = db.attendances.filter(a => {
      const d = new Date(a.date);
      return d >= startOfDay && d <= endOfDay;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ attendances });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
