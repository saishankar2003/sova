import mongoose from 'mongoose';
import 'dotenv/config';
import { User } from '../src/models/User';
import { hashPassword } from '../src/utils/crypto';
import { UserRole } from '@nextx/shared';

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not set in the environment');
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nextx.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123!';

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);

    console.log(`Checking for existing admin user (${adminEmail})...`);
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (existingAdmin) {
      console.log('Admin user already exists. Checking role...');
      if (existingAdmin.role !== UserRole.ADMIN) {
        existingAdmin.role = UserRole.ADMIN;
        await existingAdmin.save();
        console.log('User role updated to ADMIN.');
      } else {
        console.log('User is already an ADMIN.');
      }
    } else {
      console.log('Creating new admin user...');
      const passwordHash = await hashPassword(adminPassword);
      
      await User.create({
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: UserRole.ADMIN,
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          avatarUrl: null,
          phone: null,
        },
        emailVerified: true,
      });
      console.log(`Admin user created successfully!`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log('Please change the default password in a production environment.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    console.log('Disconnecting from database...');
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
