// Database seeder for initial data
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/userModel.js';
import Payment from './src/models/paymentModel.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payment-verification');
    console.log('✅ Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await Payment.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      email: 'admin@university.edu',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      studentId: 'ADMIN001',
      role: 'admin'
    });
    console.log('✅ Created admin user');

    // Create sample students
    const student1Password = await bcrypt.hash('student123', 10);
    const student1 = await User.create({
      email: 'john.doe@university.edu',
      password: student1Password,
      firstName: 'John',
      lastName: 'Doe',
      studentId: 'STU001',
      role: 'student'
    });

    const student2Password = await bcrypt.hash('student123', 10);
    const student2 = await User.create({
      email: 'jane.smith@university.edu',
      password: student2Password,
      firstName: 'Jane',
      lastName: 'Smith',
      studentId: 'STU002',
      role: 'student'
    });
    console.log('✅ Created sample students');

    // Create sample payments
    const payments = [
      {
        studentId: student1._id,
        slipNumber: 'SLP001',
        amount: 50000,
        paymentDate: new Date('2024-01-10'),
        bankName: 'ABC Bank',
        transactionReference: 'TXN001',
        status: 'pending',
        notes: 'Tuition fee payment'
      },
      {
        studentId: student1._id,
        slipNumber: 'SLP002',
        amount: 25000,
        paymentDate: new Date('2024-01-12'),
        bankName: 'XYZ Bank',
        transactionReference: 'TXN002',
        status: 'verified',
        verifiedBy: admin._id,
        verifiedAt: new Date('2024-01-13'),
        notes: 'Library fee payment'
      },
      {
        studentId: student2._id,
        slipNumber: 'SLP003',
        amount: 75000,
        paymentDate: new Date('2024-01-14'),
        bankName: 'DEF Bank',
        transactionReference: 'TXN003',
        status: 'rejected',
        verifiedBy: admin._id,
        verifiedAt: new Date('2024-01-15'),
        rejectionReason: 'Invalid slip number format',
        notes: 'Tuition fee payment'
      },
      {
        studentId: student2._id,
        slipNumber: 'SLP004',
        amount: 30000,
        paymentDate: new Date('2024-01-16'),
        bankName: 'GHI Bank',
        transactionReference: 'TXN004',
        status: 'pending',
        notes: 'Hostel fee payment'
      }
    ];

    await Payment.insertMany(payments);
    console.log('✅ Created sample payments');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log('👨‍💼 Admin: admin@university.edu / admin123');
    console.log('👨‍🎓 Student 1: john.doe@university.edu / student123');
    console.log('👩‍🎓 Student 2: jane.smith@university.edu / student123');
    console.log('\n💳 Sample Payments:');
    console.log('- 2 pending payments');
    console.log('- 1 verified payment');
    console.log('- 1 rejected payment');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

seedDatabase();
