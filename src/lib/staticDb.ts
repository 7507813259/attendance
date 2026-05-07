export const staticUsers = [
  {
    _id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password', // Stored in plain text for static demo
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password',
    role: 'user',
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password',
    role: 'user',
    createdAt: new Date().toISOString()
  }
];

export const staticAttendances = [
  {
    _id: 'a1',
    user: staticUsers[1],
    date: new Date().toISOString(),
    status: 'present',
    selfie: 'https://randomuser.me/api/portraits/men/32.jpg',
    location: { latitude: 37.7749, longitude: -122.4194, address: 'City Hall, 1 Dr Carlton B Goodlett Pl, San Francisco, CA 94102, USA' }
  },
  {
    _id: 'a2',
    user: staticUsers[2],
    date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    status: 'absent',
    selfie: 'https://randomuser.me/api/portraits/women/44.jpg',
    location: { latitude: 37.7749, longitude: -122.4194, address: 'Civic Center Plaza, San Francisco, CA 94102, USA' }
  }
];

// Helper functions to manage the static DB
export const db = {
  users: staticUsers,
  attendances: staticAttendances
};
