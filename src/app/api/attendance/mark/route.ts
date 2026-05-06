import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/staticDb';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { status, location } = await req.json();

    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    const user = db.users.find(u => u._id === decoded.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if attendance already marked for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = db.attendances.find(a => {
      const d = new Date(a.date);
      return a.user._id === decoded.id && d >= startOfDay && d <= endOfDay;
    });

    if (existingAttendance) {
      return NextResponse.json({ message: 'Attendance already marked for today' }, { status: 400 });
    }

    let addressText = 'Unknown Location';
    if (location && location.latitude && location.longitude) {
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}`, {
          headers: { 'User-Agent': 'AttendanceApp/1.0' }
        });
        const geoData = await geoRes.json();
        if (geoData && geoData.display_name) {
          addressText = geoData.display_name;
        }
      } catch (e) {
        console.error('Geocoding failed', e);
      }
    }

    const attendance = {
      _id: 'a' + Date.now(),
      user: user,
      status,
      location: {
        ...location,
        address: addressText
      },
      date: new Date().toISOString()
    };

    db.attendances.push(attendance);

    return NextResponse.json({ attendance, message: 'Attendance marked successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
