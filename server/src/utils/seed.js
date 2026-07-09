require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');
const Subject = require('../models/Subject');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Subject.deleteMany({});
    console.log('Cleared existing Users, Tutors, and Subjects.');

    // 1. Seed Subjects
    const subjectsToCreate = [
      { name: 'Mathematics', slug: 'mathematics', depth: 0 },
      { name: 'Programming', slug: 'programming', depth: 0 },
      { name: 'Science', slug: 'science', depth: 0 },
      { name: 'Languages', slug: 'languages', depth: 0 },
      { name: 'Music', slug: 'music', depth: 0 },
      { name: 'Test Prep', slug: 'test-prep', depth: 0 },
    ];

    const seededSubjects = await Subject.insertMany(subjectsToCreate);
    console.log(`Seeded ${seededSubjects.length} subjects.`);

    // Map subjects by slug for easy lookups
    const subMap = {};
    seededSubjects.forEach(s => {
      subMap[s.slug] = s._id;
    });

    // 2. Seed Tutors
    const tutorsToCreate = [
      {
        fullName: 'Ayesha Khan',
        email: 'ayesha.tutor@educonnect.com',
        password: 'password123',
        role: 'tutor',
        isEmailVerified: true,
        headline: 'IIT Grad | 8 Years Mathematics Experience',
        bio: 'Specialist in Calculus and Algebra. High score generator with a structured and conceptual teaching style.',
        hourlyRate: 25,
        experienceYears: 8,
        ratingAverage: 4.9,
        ratingCount: 340,
        tutorType: 'school_teacher',
        teachingMode: 'online',
        languages: ['English', 'Hindi'],
        subjects: [{ subject: subMap['mathematics'], proficiencyLevel: 'expert' }],
        verification: {
          idVerified: true,
          degreeVerified: true,
          backgroundCheckStatus: 'passed',
          overallStatus: 'verified',
        },
      },
      {
        fullName: 'Ravi Sharma',
        email: 'ravi.tutor@educonnect.com',
        password: 'password123',
        role: 'tutor',
        isEmailVerified: true,
        headline: 'Basic Mathematics & Geometry coach',
        bio: 'Friendly, patient, and beginner-focused tutoring style for middle school students.',
        hourlyRate: 18,
        experienceYears: 5,
        ratingAverage: 4.8,
        ratingCount: 210,
        tutorType: 'student_tutor',
        teachingMode: 'online',
        languages: ['English', 'Hindi', 'Punjabi'],
        subjects: [{ subject: subMap['mathematics'], proficiencyLevel: 'intermediate' }],
        verification: {
          idVerified: true,
          degreeVerified: true,
          backgroundCheckStatus: 'passed',
          overallStatus: 'verified',
        },
      },
      {
        fullName: 'Daniel Osei',
        email: 'daniel.tutor@educonnect.com',
        password: 'password123',
        role: 'tutor',
        isEmailVerified: true,
        headline: 'Senior Python Developer | 6 Years Experience',
        bio: 'Hands-on practical programmer. Project-based learning is the best way to master coding and automation!',
        hourlyRate: 30,
        experienceYears: 6,
        ratingAverage: 4.8,
        ratingCount: 290,
        tutorType: 'industry_expert',
        teachingMode: 'online',
        languages: ['English'],
        subjects: [{ subject: subMap['programming'], proficiencyLevel: 'expert' }],
        verification: {
          idVerified: true,
          degreeVerified: true,
          backgroundCheckStatus: 'passed',
          overallStatus: 'verified',
        },
      },
      {
        fullName: 'Dr. Hamid',
        email: 'hamid.tutor@educonnect.com',
        password: 'password123',
        role: 'tutor',
        isEmailVerified: true,
        headline: 'Physics Professor | 15 Years Teaching',
        bio: 'A-level, O-level exam prep expert. High success rate in competitive engineering/medical entry tests.',
        hourlyRate: 50,
        experienceYears: 15,
        ratingAverage: 5.0,
        ratingCount: 650,
        tutorType: 'college_professor',
        teachingMode: 'online',
        languages: ['English', 'Urdu'],
        subjects: [{ subject: subMap['science'], proficiencyLevel: 'expert' }],
        verification: {
          idVerified: true,
          degreeVerified: true,
          backgroundCheckStatus: 'passed',
          overallStatus: 'verified',
        },
      },
      {
        fullName: 'Sofia M.',
        email: 'sofia.tutor@educonnect.com',
        password: 'password123',
        role: 'tutor',
        isEmailVerified: true,
        headline: 'Certified IELTS Coach | Band 8+ Master',
        bio: 'Specialist in English writing and speaking. Conversational sessions and exam mock test strategies.',
        hourlyRate: 28,
        experienceYears: 7,
        ratingAverage: 4.9,
        ratingCount: 410,
        tutorType: 'language_expert',
        teachingMode: 'online',
        languages: ['English', 'Spanish'],
        subjects: [{ subject: subMap['languages'], proficiencyLevel: 'expert' }],
        verification: {
          idVerified: true,
          degreeVerified: true,
          backgroundCheckStatus: 'passed',
          overallStatus: 'verified',
        },
      },
    ];

    // Seed tutors through User.create (since it hashes password and uses discriminators)
    for (const t of tutorsToCreate) {
      await User.create(t);
    }
    console.log(`Seeded ${tutorsToCreate.length} verified tutors.`);

    // 3. Seed student for testing
    await User.create({
      fullName: 'Student Test',
      email: 'student@educonnect.com',
      password: 'password123',
      role: 'student',
      isEmailVerified: true,
      status: 'active',
    });
    console.log('Seeded a default student account: student@educonnect.com / password123');

    console.log('Database seeded successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
};

seedDB();
