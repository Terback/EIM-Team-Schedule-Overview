export type Category = 'Class' | 'Client Meeting' | 'Deep Work' | 'Other';

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
  category: Category;
  person: string;
  student?: string;
  description?: string;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  'Class': 'bg-blue-100 text-blue-800 border-blue-200',
  'Client Meeting': 'bg-purple-100 text-purple-800 border-purple-200',
  'Deep Work': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Other': 'bg-gray-100 text-gray-800 border-gray-200',
};
