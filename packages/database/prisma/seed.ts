import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create super admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@perk.studio' },
    update: {},
    create: {
      email: 'admin@perk.studio',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      passwordHash: adminPassword,
      isActive: true
    }
  });

  console.log('✅ Created admin user:', admin.email);

  // Create a demo program
  const demoProgram = await prisma.program.upsert({
    where: { handle: 'demo' },
    update: {},
    create: {
      handle: 'demo',
      name: 'Demo Program',
      perkProgramId: 'demo-123',
      apiKey: 'demo_api_key_encrypted',
      branding: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        fontFamily: 'Inter, sans-serif',
        logoUrl: '/demo-logo.png'
      },
      isActive: true
    }
  });

  console.log('✅ Created demo program:', demoProgram.name);

  // Create a sample quiz activity
  const quiz = await prisma.activity.create({
    data: {
      programId: demoProgram.id,
      type: 'QUIZ',
      slug: 'welcome-quiz',
      title: 'Welcome Quiz',
      description: 'Test your knowledge and earn 50 points!',
      config: {
        questions: [
          {
            id: 'q1',
            question: 'What is ARC?',
            options: [
              'A database system',
              'Activity Reward Channel',
              'A programming language',
              'A social network'
            ],
            correct: 1
          },
          {
            id: 'q2',
            question: 'What does ARC help create?',
            options: [
              'Websites',
              'Mobile apps',
              'Custom reward experiences',
              'Email campaigns'
            ],
            correct: 2
          }
        ],
        passingScore: 1,
        timeLimit: 300 // 5 minutes
      },
      pointsValue: 50,
      actionTitle: 'Completed Welcome Quiz',
      status: 'PUBLISHED',
      publishedAt: new Date()
    }
  });

  console.log('✅ Created sample quiz:', quiz.title);

  // Add initial usage record
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  await prisma.programUsage.create({
    data: {
      programId: demoProgram.id,
      month: currentMonth,
      views: 0,
      starts: 0,
      completions: 0,
      pointsAwarded: 0
    }
  });

  console.log('✅ Created initial usage record');

  // Create audit log entry
  await prisma.auditLog.create({
    data: {
      adminUserId: admin.id,
      action: 'seed_database',
      entityType: 'system',
      entityId: 'seed',
      changes: {
        programs: 1,
        activities: 1,
        users: 1
      }
    }
  });

  console.log('✅ Created audit log entry');
  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });