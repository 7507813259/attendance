import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/attendance_app";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const adminExists = await User.findOne({ email: 'admin@example.com' });
  if (adminExists) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
  });

  const userPassword = await bcrypt.hash('user123', 10);
  await User.create({
    name: 'Test User',
    email: 'user@example.com',
    password: userPassword,
    role: 'user',
  });

  console.log('Database seeded with admin and test user');
  process.exit(0);
}

seed();
