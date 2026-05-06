"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [marking, setMarking] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    if (parsedUser.role === 'admin') {
      fetchAttendances(token);
    } else {
      setLoading(false);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting location", error);
            setMsg('Location access is required to mark attendance');
          }
        );
      }
    }
  }, [router]);

  const fetchAttendances = async (token: string) => {
    try {
      const res = await fetch('/api/attendance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAttendances(data.attendances || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (status: 'present' | 'absent') => {
    setMarking(true);
    setMsg('');
    const token = localStorage.getItem('token');
    
    try {
      const payload = { status, location };
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Attendance marked successfully!');
      } else {
        setMsg(data.message || 'Failed to mark attendance');
      }
    } catch (err) {
      setMsg('Network error');
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <div className="content-area" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

  return (
    <>
      <div className="header">
        Dashboard
      </div>
      
      <div className="content-area">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Welcome back, <br/><span style={{ color: 'var(--primary)' }}>{user?.name}</span></h2>

        {user?.role === 'user' ? (
          <div className="card">
            <h3 className="card-title">Mark Today's Attendance</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.875rem' }}>
              Your location will be recorded.
            </p>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <button 
                className="btn btn-success" 
                style={{ flex: 1 }}
                onClick={() => markAttendance('present')}
                disabled={marking || !location}
              >
                Present
              </button>
              <button 
                className="btn btn-danger" 
                style={{ flex: 1 }}
                onClick={() => markAttendance('absent')}
                disabled={marking || !location}
              >
                Absent
              </button>
            </div>
            {msg && <p style={{ marginTop: '12px', fontSize: '0.875rem', fontWeight: 500 }}>{msg}</p>}
          </div>
        ) : (
          <div className="card">
            <h3 className="card-title">Today's Attendance Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {attendances.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No attendances marked today yet.</p>
              ) : (
                attendances.map((att: any) => (
                  <div key={att._id} className="list-item">
                    <div>
                      <div style={{ fontWeight: 600, color: 'white', fontSize: '1.05rem', marginBottom: '2px' }}>{att.user.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(att.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {att.location && att.location.address && (
                          <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                            <span style={{ marginTop: '1px' }}>📍</span>
                            <span>{att.location.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`badge ${att.status === 'present' ? 'badge-success' : 'badge-danger'}`}>
                      {att.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav role={user?.role} />
    </>
  );
}
