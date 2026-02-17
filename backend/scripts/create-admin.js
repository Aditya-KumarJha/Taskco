import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/user.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const createAdminUser = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI is not set in .env file');
      console.log('💡 Please set MONGODB_URI in backend/.env file');
      console.log('Example: MONGODB_URI=mongodb://localhost:27017/taskco');
      console.log('Or use MongoDB Atlas: MONGODB_URI=mongodb+srv://...');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@taskco.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:', adminEmail);
      
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.isVerified = true;
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      } else {
        console.log('✅ User already has admin role');
      }
      
      await mongoose.disconnect();
      console.log('👋 Done!');
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      fullName: {
        firstName: 'Admin',
        lastName: 'User',
      },
      username: 'admin',
      role: 'admin',
      isVerified: true,
      provider: 'email',
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');
    console.log('💡 Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to customize');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();
