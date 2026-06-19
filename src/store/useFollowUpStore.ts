import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  FollowUp,
  FollowUpResult,
  FollowUpStatus,
  PatientFeedback,
  FollowUpWithDetails,
} from '@/types';
import { mockFollowUps } from '@/data/mockData';
import { generateId, getToday, addDays, isPast, isToday } from '@/utils';
import { usePatientStore } from './usePatientStore';
import { useAuthStore } from './useAuthStore';

interface FollowUpState {
  followUps: FollowUp[];
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt' | 'attemptCount' | 'status'>) => FollowUp;
  updateFollowUp: (id: string, data: Partial<FollowUp>) => void;
  updateFollowUpResult: (
    id: string,
    result: FollowUpResult,
    feedback?: PatientFeedback,
    notes?: string,
    nextFollowUpDate?: string
  ) => void;
  getFollowUpById: (id: string) => FollowUp | undefined;
  getFollowUpsByPatient: (patientId: string) => FollowUp[];
  getTodayFollowUps: () => FollowUpWithDetails[];
  getOverdueFollowUps: () => FollowUpWithDetails[];
  getCompletedFollowUps: () => FollowUpWithDetails[];
  getAllFollowUpsWithDetails: () => FollowUpWithDetails[];
  getFollowUpsByDoctor: (doctorId: string) => FollowUp[];
  retryNextDay: (id: string) => void;
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

export const useFollowUpStore = create<FollowUpState>()(
  persist(
    (set, get) => ({
      followUps: mockFollowUps,

      addFollowUp: (followUp) => {
        const now = getToday();
        const newFollowUp: FollowUp = {
          ...followUp,
          id: generateId(),
          status: 'pending',
          attemptCount: 0,
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

      updateFollowUpResult: (id, result, feedback, notes, nextFollowUpDate) => {
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

      retryNextDay: (id) => {
        const today = getToday();
        set((state) => ({
          followUps: state.followUps.map((f) =>
            f.id === id
              ? {
                  ...f,
                  plannedDate: addDays(today, 1),
                  attemptCount: f.attemptCount + 1,
                  updatedAt: today,
                }
              : f
          ),
        }));
      },
    }),
    {
      name: 'dental-followup-storage',
    }
  )
);
