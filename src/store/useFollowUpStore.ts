import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  FollowUp,
  FollowUpResult,
  FollowUpStatus,
  PatientFeedback,
  FollowUpWithDetails,
  ContactLog,
  ContactMethod,
  ContactLogWithDetails,
  DailyStats,
} from '@/types';
import { mockFollowUps } from '@/data/mockData';
import { generateId, getToday, addDays, isPast, isToday, formatDateCN } from '@/utils';
import { usePatientStore } from './usePatientStore';
import { useAuthStore } from './useAuthStore';

interface FollowUpState {
  followUps: FollowUp[];
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt' | 'attemptCount' | 'status' | 'contactLogs'>) => FollowUp;
  updateFollowUp: (id: string, data: Partial<FollowUp>) => void;
  updateFollowUpResult: (
    id: string,
    result: FollowUpResult,
    contactMethod: ContactMethod,
    operatorId: string,
    operatorName: string,
    feedback?: PatientFeedback,
    notes?: string,
    nextFollowUpDate?: string,
    appointmentId?: string
  ) => void;
  addContactLog: (
    followUpId: string,
    log: Omit<ContactLog, 'id' | 'contactTime'>
  ) => void;
  getContactLogs: (followUpId: string) => ContactLog[];
  getFollowUpById: (id: string) => FollowUp | undefined;
  getFollowUpsByPatient: (patientId: string) => FollowUp[];
  getTodayFollowUps: () => FollowUpWithDetails[];
  getOverdueFollowUps: () => FollowUpWithDetails[];
  getFutureFollowUps: () => FollowUpWithDetails[];
  getCompletedFollowUps: () => FollowUpWithDetails[];
  getAllFollowUpsWithDetails: () => FollowUpWithDetails[];
  getFollowUpsByDoctor: (doctorId: string) => FollowUp[];
  retryNextDay: (id: string, contactMethod: ContactMethod, operatorId: string, operatorName: string) => void;
  getTodayStats: (receptionId?: string) => {
    phoneContacts: ContactLogWithDetails[];
    wechatContacts: ContactLogWithDetails[];
    noAnswerTomorrow: ContactLogWithDetails[];
    bookedConversions: ContactLogWithDetails[];
  };
  getRecent7DaysStats: (receptionId?: string) => DailyStats[];
  getContactLogsWithDetails: (receptionId?: string) => ContactLogWithDetails[];
}

function enrichFollowUp(followUp: FollowUp): FollowUpWithDetails {
  const patientStore = usePatientStore.getState();
  const patient = patientStore.getPatientById(followUp.patientId);
  const cleaningRecord = patientStore
    .getCleaningRecordsByPatient(followUp.patientId)
    .find((r) => r.id === followUp.cleaningRecordId);
  const users = useAuthStore.getState().users;
  const doctor = users.find((u) => u.id === followUp.assignedDoctorId);

  return {
    ...followUp,
    patient: patient!,
    cleaningRecord: cleaningRecord!,
    doctor: doctor!,
  };
}

function enrichContactLog(log: ContactLog, followUp: FollowUpWithDetails): ContactLogWithDetails {
  return {
    ...log,
    patient: followUp.patient,
    cleaningRecord: followUp.cleaningRecord,
    doctor: followUp.doctor,
    followUp,
  };
}

function getCurrentDateTimeStr(): string {
  const now = new Date();
  const date = formatDateCN(now);
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${date} ${hours}:${minutes}`;
}

export const useFollowUpStore = create<FollowUpState>()(
  persist(
    (set, get) => ({
      followUps: mockFollowUps.map(f => ({ ...f, contactLogs: f.contactLogs || [] })),

      addFollowUp: (followUp) => {
        const now = getToday();
        const newFollowUp: FollowUp = {
          ...followUp,
          id: generateId(),
          status: 'pending',
          attemptCount: 0,
          contactLogs: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          followUps: [...state.followUps, newFollowUp],
        }));
        return newFollowUp;
      },

      updateFollowUp: (id, data) => {
        set((state) => ({
          followUps: state.followUps.map((f) =>
            f.id === id ? { ...f, ...data, updatedAt: getToday() } : f
          ),
        }));
      },

      addContactLog: (followUpId, log) => {
        const newLog: ContactLog = {
          ...log,
          id: generateId(),
          contactTime: getCurrentDateTimeStr(),
        };
        set((state) => ({
          followUps: state.followUps.map((f) =>
            f.id === followUpId
              ? {
                  ...f,
                  contactLogs: [...(f.contactLogs || []), newLog],
                }
              : f
          ),
        }));
      },

      getContactLogs: (followUpId) => {
        const followUp = get().followUps.find(f => f.id === followUpId);
        return followUp?.contactLogs || [];
      },

      updateFollowUpResult: (
        id,
        result,
        contactMethod,
        operatorId,
        operatorName,
        feedback,
        notes,
        nextFollowUpDate,
        appointmentId
      ) => {
        const today = getToday();
        let status: FollowUpStatus = 'completed';
        let plannedDate = today;
        let attemptCount = 1;

        const existing = get().followUps.find((f) => f.id === id);
        if (existing) {
          attemptCount = existing.attemptCount + 1;
        }

        if (result === 'noAnswer') {
          status = 'pending';
          plannedDate = addDays(today, 1);
        }

        const newLog: ContactLog = {
          id: generateId(),
          followUpId: id,
          contactMethod,
          result,
          contactTime: getCurrentDateTimeStr(),
          operatorId,
          operatorName,
          notes,
          patientFeedback: feedback,
          appointmentId,
        };

        set((state) => ({
          followUps: state.followUps.map((f) =>
            f.id === id
              ? {
                  ...f,
                  result,
                  status,
                  patientFeedback: feedback,
                  notes,
                  nextFollowUpDate,
                  plannedDate,
                  attemptCount,
                  updatedAt: today,
                  contactLogs: [...(f.contactLogs || []), newLog],
                }
              : f
          ),
        }));
      },

      getFollowUpById: (id) => {
        return get().followUps.find((f) => f.id === id);
      },

      getFollowUpsByPatient: (patientId) => {
        return get()
          .followUps.filter((f) => f.patientId === patientId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getTodayFollowUps: () => {
        const today = getToday();
        return get()
          .followUps.filter(
            (f) =>
              f.status === 'pending' &&
              isToday(f.plannedDate)
          )
          .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())
          .map(enrichFollowUp);
      },

      getOverdueFollowUps: () => {
        return get()
          .followUps.filter(
            (f) =>
              f.status === 'pending' &&
              isPast(f.plannedDate) &&
              !isToday(f.plannedDate)
          )
          .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())
          .map(enrichFollowUp);
      },

      getFutureFollowUps: () => {
        const today = getToday();
        return get()
          .followUps.filter(
            (f) =>
              f.status === 'pending' &&
              f.plannedDate > today
          )
          .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())
          .map(enrichFollowUp);
      },

      getCompletedFollowUps: () => {
        const today = getToday();
        return get()
          .followUps.filter((f) => f.status === 'completed' || f.status === 'cancelled')
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 20)
          .map(enrichFollowUp);
      },

      getAllFollowUpsWithDetails: () => {
        return get().followUps.map(enrichFollowUp);
      },

      getFollowUpsByDoctor: (doctorId) => {
        return get().followUps.filter((f) => f.assignedDoctorId === doctorId);
      },

      retryNextDay: (id, contactMethod, operatorId, operatorName) => {
        const today = getToday();
        const newLog: ContactLog = {
          id: generateId(),
          followUpId: id,
          contactMethod,
          result: 'noAnswer',
          contactTime: getCurrentDateTimeStr(),
          operatorId,
          operatorName,
          notes: '未接通，次日自动提醒',
        };
        set((state) => ({
          followUps: state.followUps.map((f) =>
            f.id === id
              ? {
                  ...f,
                  plannedDate: addDays(today, 1),
                  attemptCount: f.attemptCount + 1,
                  updatedAt: today,
                  contactLogs: [...(f.contactLogs || []), newLog],
                }
              : f
          ),
        }));
      },

      getContactLogsWithDetails: (receptionId) => {
        const result: ContactLogWithDetails[] = [];
        for (const f of get().followUps) {
          if (receptionId && f.assignedReceptionId !== receptionId) continue;
          const enrichedFollowUp = enrichFollowUp(f);
          for (const log of f.contactLogs || []) {
            result.push(enrichContactLog(log, enrichedFollowUp));
          }
        }
        return result.sort((a, b) =>
          new Date(b.contactTime.replace(/年|月/g, '-').replace(/日/g, '')).getTime() -
          new Date(a.contactTime.replace(/年|月/g, '-').replace(/日/g, '')).getTime()
        );
      },

      getTodayStats: (receptionId) => {
        const today = getToday();
        const tomorrow = addDays(today, 1);
        const todayDateStr = formatDateCN(new Date(today));

        const phoneContacts: ContactLogWithDetails[] = [];
        const wechatContacts: ContactLogWithDetails[] = [];
        const noAnswerTomorrow: ContactLogWithDetails[] = [];
        const bookedConversions: ContactLogWithDetails[] = [];

        const allLogs = get().getContactLogsWithDetails(receptionId);
        for (const log of allLogs) {
          if (!log.contactTime.startsWith(todayDateStr)) continue;

          if (log.contactMethod === 'phone') {
            phoneContacts.push(log);
          } else if (log.contactMethod === 'wechat') {
            wechatContacts.push(log);
          }
          if (log.result === 'noAnswer' && log.followUp.plannedDate === tomorrow) {
            noAnswerTomorrow.push(log);
          }
          if (log.result === 'booked') {
            bookedConversions.push(log);
          }
        }

        return { phoneContacts, wechatContacts, noAnswerTomorrow, bookedConversions };
      },

      getRecent7DaysStats: (receptionId) => {
        const today = getToday();
        const stats: DailyStats[] = [];
        const allLogs = get().getContactLogsWithDetails(receptionId);

        for (let i = 6; i >= 0; i--) {
          const date = addDays(today, -i);
          const dateStr = formatDateCN(new Date(date));
          const dayLogs = allLogs.filter(log => log.contactTime.startsWith(dateStr));

          stats.push({
            date,
            totalContacts: dayLogs.length,
            phoneContacts: dayLogs.filter(l => l.contactMethod === 'phone').length,
            wechatContacts: dayLogs.filter(l => l.contactMethod === 'wechat').length,
            noAnswer: dayLogs.filter(l => l.result === 'noAnswer').length,
            booked: dayLogs.filter(l => l.result === 'booked').length,
          });
        }

        return stats;
      },
    }),
    {
      name: 'dental-followup-storage',
    }
  )
);
