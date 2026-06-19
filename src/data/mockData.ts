import type { User, Patient, CleaningRecord, FollowUp, Appointment } from '@/types';
import { getToday, addDays, formatDate, generateId } from '@/utils';

export const mockUsers: User[] = [
  { id: 'doctor1', name: '张明医生', role: 'doctor', phone: '13800000001' },
  { id: 'doctor2', name: '李华医生', role: 'doctor', phone: '13800000002' },
  { id: 'doctor3', name: '王芳医生', role: 'doctor', phone: '13800000003' },
  { id: 'reception1', name: '前台小林', role: 'reception', phone: '13800000004' },
  { id: 'reception2', name: '前台小王', role: 'reception', phone: '13800000005' },
  { id: 'admin1', name: '管理员', role: 'admin', phone: '13800000000' },
];

const patientNames = [
  { name: '陈伟', gender: 'male' as const, age: 35 },
  { name: '刘芳', gender: 'female' as const, age: 28 },
  { name: '王建国', gender: 'male' as const, age: 45 },
  { name: '赵丽', gender: 'female' as const, age: 32 },
  { name: '孙明', gender: 'male' as const, age: 50 },
  { name: '周婷', gender: 'female' as const, age: 26 },
  { name: '吴强', gender: 'male' as const, age: 38 },
  { name: '郑雪', gender: 'female' as const, age: 42 },
  { name: '钱浩', gender: 'male' as const, age: 29 },
  { name: '冯丽', gender: 'female' as const, age: 36 },
  { name: '陈刚', gender: 'male' as const, age: 55 },
  { name: '许敏', gender: 'female' as const, age: 31 },
  { name: '黄磊', gender: 'male' as const, age: 40 },
  { name: '林娜', gender: 'female' as const, age: 27 },
  { name: '杨涛', gender: 'male' as const, age: 33 },
  { name: '徐娟', gender: 'female' as const, age: 48 },
  { name: '朱军', gender: 'male' as const, age: 43 },
  { name: '马静', gender: 'female' as const, age: 30 },
  { name: '胡斌', gender: 'male' as const, age: 37 },
  { name: '郭燕', gender: 'female' as const, age: 25 },
  { name: '何志远', gender: 'male' as const, age: 52 },
  { name: '高雯', gender: 'female' as const, age: 34 },
  { name: '梁宇', gender: 'male' as const, age: 39 },
  { name: '宋佳', gender: 'female' as const, age: 41 },
  { name: '唐亮', gender: 'male' as const, age: 46 },
  { name: '韩梅', gender: 'female' as const, age: 29 },
  { name: '曹阳', gender: 'male' as const, age: 51 },
  { name: '彭颖', gender: 'female' as const, age: 33 },
  { name: '田野', gender: 'male' as const, age: 28 },
  { name: '董琳', gender: 'female' as const, age: 44 },
];

function generatePhone(): string {
  const prefix = ['138', '139', '158', '159', '186', '187', '188'];
  const p = prefix[Math.floor(Math.random() * prefix.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return p + suffix;
}

export const mockPatients: Patient[] = patientNames.map((p, i) => ({
  id: `patient${i + 1}`,
  name: p.name,
  gender: p.gender,
  age: p.age,
  phone: generatePhone(),
  firstVisitDate: formatDate(new Date(2023 + Math.floor(i / 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)),
  archiveNo: `A${String(i + 1).padStart(4, '0')}`,
  doctorId: `doctor${(i % 3) + 1}`,
  tags: [],
  notes: '',
}));

const problemTagsOptions = [
  ['gumBleeding', 'tartar'],
  ['tartar', 'stains'],
  ['gumBleeding', 'periodontalPocket'],
  ['sensitive', 'gumInflammation'],
  ['tartar', 'badBreath'],
  ['gumBleeding', 'tartar', 'stains'],
  ['periodontalPocket', 'gumInflammation'],
  ['gumBleeding'],
  ['tartar'],
  ['stains', 'sensitive'],
];

const itemsOptions = [
  ['超声波洁治', '喷砂抛光', '口腔卫生指导'],
  ['超声波洁治', '手工刮治', '牙周上药'],
  ['超声波洁治', '喷砂抛光', '氟化物涂敷'],
  ['手工刮治', '牙周上药', '口腔卫生指导'],
  ['超声波洁治', '喷砂抛光'],
  ['超声波洁治', '手工刮治', '氟化物涂敷', '口腔卫生指导'],
];

const doctorNotes = [
  '患者牙龈红肿明显，下前牙区结石较多，建议加强口腔卫生，使用牙线。',
  '患者牙齿敏感，建议使用脱敏牙膏，避免过冷过热食物。',
  '牙周袋较深，建议进行深度洁治，定期复查。',
  '牙结石较重，有口臭症状，建议每半年洁治一次。',
  '患者有牙龈炎症状，刷牙出血，建议正确刷牙方式，使用牙间刷。',
  '患者烟渍茶渍明显，建议喷砂抛光，注意饮食后漱口。',
  '患者口腔卫生状况一般，建议加强日常护理，定期复查。',
  '轻度牙龈炎，结石不多，建议每年洁治1-2次。',
];

const suggestions = [
  '您好，我是XX口腔诊所的前台。您上周在我们诊所做了洁治，想做个简单的随访。请问您最近刷牙还有出血的情况吗？',
  '您好，我是XX口腔的小X。您之前在我们这里做过洁治，医生让我提醒您注意日常口腔护理。请问您现在感觉怎么样？',
  '您好，我是XX口腔诊所的。您的洁治已经过去一周了，想了解一下您牙齿的恢复情况。有没有按时使用牙线呢？',
];

const today = getToday();

export const mockCleaningRecords: CleaningRecord[] = [];
export const mockFollowUps: FollowUp[] = [];
export const mockAppointments: Appointment[] = [];

for (let i = 0; i < 35; i++) {
  const patient = mockPatients[i % mockPatients.length];
  const daysAgo = Math.floor(Math.random() * 30) - 5;
  const cleaningDate = addDays(today, -daysAgo - 7);
  const followUpDays = [3, 7, 10, 14][Math.floor(Math.random() * 4)];
  const suggestedDate = addDays(cleaningDate, followUpDays);

  const recordId = `cleaning${i + 1}`;
  const problemTags = problemTagsOptions[Math.floor(Math.random() * problemTagsOptions.length)] as any[];

  mockCleaningRecords.push({
    id: recordId,
    patientId: patient.id,
    doctorId: patient.doctorId,
    date: cleaningDate,
    items: itemsOptions[Math.floor(Math.random() * itemsOptions.length)],
    problemTags,
    doctorNotes: doctorNotes[Math.floor(Math.random() * doctorNotes.length)],
    suggestedFollowUpDate: suggestedDate,
    suggestions: suggestions[Math.floor(Math.random() * suggestions.length)],
  });

  const statusOptions = ['pending', 'pending', 'pending', 'completed', 'completed', 'overdue'];
  const rawStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
  let status = rawStatus as FollowUp['status'];

  const daysDiff = Math.floor((new Date(suggestedDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));

  let actualStatus: FollowUp['status'];
  let result: FollowUp['result'] | undefined;
  let attemptCount = 1;

  if (daysDiff < 0) {
    const rand = Math.random();
    if (rand < 0.6) {
      actualStatus = 'completed';
      const results: FollowUp['result'][] = ['connected', 'booked', 'refused', 'connected'];
      result = results[Math.floor(Math.random() * results.length)];
    } else {
      actualStatus = 'overdue';
      attemptCount = Math.floor(Math.random() * 3) + 1;
    }
  } else if (daysDiff === 0) {
    actualStatus = 'pending';
    attemptCount = 1;
  } else if (daysDiff > 0 && daysDiff <= 3) {
    actualStatus = 'pending';
  } else {
    if (Math.random() < 0.3) {
      actualStatus = 'completed';
      result = 'booked';
    } else {
      actualStatus = 'pending';
    }
  }

  const followUp: FollowUp = {
    id: `followup${i + 1}`,
    patientId: patient.id,
    cleaningRecordId: recordId,
    assignedDoctorId: patient.doctorId,
    assignedReceptionId: i % 2 === 0 ? 'reception1' : 'reception2',
    plannedDate: suggestedDate,
    status: actualStatus,
    result,
    createdAt: cleaningDate,
    updatedAt: actualStatus === 'completed' ? suggestedDate : cleaningDate,
    attemptCount,
    patientFeedback: actualStatus === 'completed' && result === 'connected' ? {
      bleedingImproved: Math.random() > 0.3,
      flossUsing: Math.random() > 0.5,
      otherComments: Math.random() > 0.5 ? '患者反馈良好，无不适症状。' : '',
    } : undefined,
    notes: actualStatus === 'overdue' ? '已多次拨打未接通，建议继续跟进。' : undefined,
  };

  if (actualStatus === 'completed' && result === 'booked') {
    const aptDate = addDays(today, Math.floor(Math.random() * 7) + 1);
    const timeSlots = ['09:30', '10:00', '14:30', '15:00', '16:00'];
    mockAppointments.push({
      id: `appointment${i + 1}`,
      patientId: patient.id,
      followUpId: followUp.id,
      doctorId: patient.doctorId,
      date: aptDate,
      timeSlot: timeSlots[Math.floor(Math.random() * timeSlots.length)],
      type: '复查',
      status: 'confirmed',
      notes: '洁治后复查',
      createdAt: suggestedDate,
    });
  }

  mockFollowUps.push(followUp);
}
