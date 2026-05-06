"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) return <div className="content-area" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

  return (
    <>
      <div className="header">
        Profile
      </div>
      
      <div className="content-area">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: 'var(--primary)', filter: 'blur(60px)', opacity: 0.3 }}></div>

          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary-gradient)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem', fontWeight: 'bold', marginBottom: '24px', boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)', border: '2px solid rgba(255,255,255,0.2)', zIndex: 1 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '6px', color: 'white', zIndex: 1 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1.1rem', zIndex: 1 }}>{user?.email}</p>
          
          <span className={`badge ${user?.role === 'admin' ? 'badge-danger' : 'badge-success'}`} style={{ marginBottom: '32px', padding: '8px 16px', fontSize: '0.85rem', zIndex: 1 }}>
            {user?.role.toUpperCase()}
          </span>

          <button className="btn btn-outline" onClick={handleLogout} style={{ zIndex: 1, borderColor: 'rgba(239, 68, 68, 0.5)', color: '#f87171' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            Logout
          </button>
        </div>
      </div>

      <BottomNav role={user?.role} />
    </>
  );
}
