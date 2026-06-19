export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateCN(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}年${month}月${day}日`;
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}月${day}日`;
}

export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function isPast(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

export function addDays(date: string | Date, days: number): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function getDaysDiff(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getWeekDates(baseDate?: string | Date): string[] {
  const base = baseDate ? (typeof baseDate === 'string' ? new Date(baseDate) : baseDate) : new Date();
  const dates: string[] = [];
  const day = base.getDay();
  const monday = new Date(base);
  monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
}

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

export function getAvailableSlots(date: string, appointments: { date: string; timeSlot: string }[]): string[] {
  const dayAppointments = appointments.filter(a => a.date === date);
  const bookedSlots = dayAppointments.map(a => a.timeSlot);
  return TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
}
