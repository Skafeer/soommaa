export type ReportTargetType = 'ADVERTISEMENT' | 'USER';

export const REPORT_REASONS = [
  'محتوى مخالف أو غير لائق',
  'إعلان وهمي أو احتيالي',
  'سعر غير منطقي أو مضلل',
  'صور لا تعود للمنتج',
  'إعلان مكرر',
  'محاولة نصب أو احتيال',
  'سبب آخر',
] as const;