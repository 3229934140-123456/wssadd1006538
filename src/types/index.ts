export type UserRole = 'doctor' | 'reception' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export type Gender = 'male' | 'female';

export interface Patient {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  phone: string;
  firstVisitDate: string;
  archiveNo: string;
  doctorId: string;
  tags: string[];
  notes?: string;
}

export type ProblemTag =
  | 'gumBleeding'
  | 'tartar'
  | 'periodontalPocket'
  | 'stains'
  | 'sensitive'
  | 'gumInflammation'
  | 'badBreath';

export const PROBLEM_TAGS: { key: ProblemTag; label: string; color: string }[] = [
  { key: 'gumBleeding', label: '牙龈出血', color: 'red' },
  { key: 'tartar', label: '牙石较多', color: 'orange' },
  { key: 'periodontalPocket', label: '牙周袋提示', color: 'purple' },
  { key: 'stains', label: '牙渍明显', color: 'yellow' },
  { key: 'sensitive', label: '牙齿敏感', color: 'blue' },
  { key: 'gumInflammation', label: '牙龈炎症', color: 'pink' },
  { key: 'badBreath', label: '口臭', color: 'gray' },
];

export const CLEANING_ITEMS = [
  '超声波洁治',
  '喷砂抛光',
  '手工刮治',
  '牙周上药',
  '氟化物涂敷',
  '口腔卫生指导',
];

export interface CleaningRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  items: string[];
  problemTags: ProblemTag[];
  doctorNotes: string;
  suggestedFollowUpDate: string;
  suggestions?: string;
}

export type FollowUpStatus = 'pending' | 'overdue' | 'completed' | 'cancelled';

export type FollowUpResult = 'connected' | 'noAnswer' | 'refused' | 'booked';

export const FOLLOW_UP_RESULTS: { key: FollowUpResult; label: string; color: string }[] = [
  { key: 'connected', label: '已接通', color: 'green' },
  { key: 'noAnswer', label: '未接', color: 'gray' },
  { key: 'refused', label: '拒绝', color: 'red' },
  { key: 'booked', label: '已预约复查', color: 'blue' },
];

export interface PatientFeedback {
  bleedingImproved?: boolean;
  flossUsing?: boolean;
  otherComments?: string;
  painLevel?: number;
}

export interface FollowUp {
  id: string;
  patientId: string;
  cleaningRecordId: string;
  assignedDoctorId: string;
  assignedReceptionId?: string;
  plannedDate: string;
  status: FollowUpStatus;
  result?: FollowUpResult;
  patientFeedback?: PatientFeedback;
  nextFollowUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  attemptCount: number;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  patientId: string;
  followUpId?: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  type: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface FollowUpWithDetails extends FollowUp {
  patient: Patient;
  cleaningRecord: CleaningRecord;
  doctor: User;
}

export type BoardColumnType = 'today' | 'overdue' | 'completed';

export interface BoardColumn {
  type: BoardColumnType;
  title: string;
  count: number;
  items: FollowUpWithDetails[];
}
