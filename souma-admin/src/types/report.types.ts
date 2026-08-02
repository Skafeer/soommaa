export type ReportTargetType = 'ADVERTISEMENT' | 'USER';

export interface PendingReport {
  id: string;
  targetType: ReportTargetType;
  reason: string;
  description: string | null;
  createdAt: string;
  reporter: { id: string; fullName: string; phoneNumber: string };
  advertisement: { id: string; title: string } | null;
  reportedUser: { id: string; fullName: string; phoneNumber: string } | null;
}