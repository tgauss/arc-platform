export * from '@prisma/client';
export { PrismaClient } from '@prisma/client';

// Re-export types for easier imports
export type {
  Program,
  Activity,
  Session,
  Completion,
  Analytics,
  ProgramUsage,
  AdminUser,
  AuditLog,
  ActivityType,
  ActivityStatus,
  AdminRole
} from '@prisma/client';