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
  const [selfie, setSelfie] = useState<string | null>(null);
  const [usersCount, setUsersCount] = useState<number>(0);

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
      
      const resUsers = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await resUsers.json();
      if (resUsers.ok) {
        setUsersCount(usersData.users?.length || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfieCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfie(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const markAttendance = async (status: 'present' | 'absent') => {
    setMarking(true);
    setMsg('');
    const token = localStorage.getItem('token');
    
    try {
      const payload = { status, location, selfie };
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
              Your location and a selfie are required to mark attendance.
            </p>
            
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {selfie ? (
                <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)', marginBottom: '12px' }}>
                  <img src={selfie} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => setSelfie(null)} 
                    style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '12px 24px', borderRadius: '99px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  Capture Selfie
                  <input type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={handleSelfieCapture} />
                </label>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <button 
                className="btn btn-success" 
                style={{ flex: 1 }}
                onClick={() => markAttendance('present')}
                disabled={marking || !location || !selfie}
              >
                Present
              </button>
              <button 
                className="btn btn-danger" 
                style={{ flex: 1 }}
                onClick={() => markAttendance('absent')}
                disabled={marking || !location || !selfie}
              >
                Absent
              </button>
            </div>
            {msg && <p style={{ marginTop: '12px', fontSize: '0.875rem', fontWeight: 500 }}>{msg}</p>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{usersCount}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Employees</div>
              </div>
              <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>
                  {attendances.filter(a => a.status === 'present').length}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Present Today</div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Today's Attendance List</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {attendances.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No attendances marked today yet.</p>
                ) : (
                  attendances.map((att: any) => (
                    <div key={att._id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '16px', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'white', fontSize: '1.1rem', marginBottom: '4px' }}>{att.user.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {new Date(att.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                        <span className={`badge ${att.status === 'present' ? 'badge-success' : 'badge-danger'}`}>
                          {att.status}
                        </span>
                      </div>

                      {att.selfie && (
                        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                          <img src={att.selfie} alt="Proof of Location" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }} />
                          <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', color: 'white', fontWeight: 500, letterSpacing: '0.5px' }}>
                            📸 LOCATION PROOF
                          </div>
                        </div>
                      )}

                      {att.location && att.location.address && (
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ marginTop: '2px', fontSize: '1rem' }}>📍</span>
                          <span style={{ lineHeight: '1.4' }}>{att.location.address}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav role={user?.role} />
    </>
  );
}
