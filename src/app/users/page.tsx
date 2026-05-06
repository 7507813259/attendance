"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [adding, setAdding] = useState(false);

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
    if (parsedUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchUsers(token);
  }, [router]);

  const fetchUsers = async (token: string) => {
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setMsg('');
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('User added successfully!');
        setName('');
        setEmail('');
        setPassword('');
        fetchUsers(token!);
      } else {
        setMsg(data.message || 'Failed to add user');
      }
    } catch (err) {
      setMsg('Network error');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="content-area" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

  return (
    <>
      <div className="header">
        Manage Users
      </div>
      
      <div className="content-area" style={{ overflowY: 'auto' }}>
        <div className="card">
          <h3 className="card-title">Add New User</h3>
          <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="john@example.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password" />
            </div>
            {msg && <div style={{ fontSize: '0.875rem', color: msg.includes('success') ? 'var(--success)' : 'var(--danger)' }}>{msg}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn" disabled={adding} style={{ flex: 1 }}>
                {adding ? 'Adding...' : 'Add User'}
              </button>
              <label className="btn btn-outline" style={{ flex: 1, cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                Upload CSV
                <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    alert('CSV Upload functionality is to be implemented on the backend. File selected: ' + e.target.files[0].name);
                  }
                }} />
              </label>
            </div>
          </form>
        </div>

        <div className="card">
          <h3 className="card-title">All Users</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {users.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No users found.</p>
            ) : (
              users.map((u: any) => (
                <div key={u._id} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 600, color: 'white', fontSize: '1.1rem', marginBottom: '4px' }}>{u.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNav role={user?.role} />
    </>
  );
}
