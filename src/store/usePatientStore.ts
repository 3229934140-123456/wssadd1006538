import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Patient, CleaningRecord, ProblemTag } from '@/types';
import { mockPatients, mockCleaningRecords } from '@/data/mockData';
import { generateId, getToday } from '@/utils';

interface PatientState {
  patients: Patient[];
  cleaningRecords: CleaningRecord[];
  addPatient: (patient: Omit<Patient, 'id'>) => Patient;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  getPatientById: (id: string) => Patient | undefined;
  getCleaningRecordsByPatient: (patientId: string) => CleaningRecord[];
  addCleaningRecord: (record: Omit<CleaningRecord, 'id'>) => CleaningRecord;
  searchPatients: (keyword: string) => Patient[];
  getPatientsByDoctor: (doctorId: string) => Patient[];
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      patients: mockPatients,
      cleaningRecords: mockCleaningRecords,

      addPatient: (patient) => {
        const newPatient: Patient = {
          ...patient,
          id: generateId(),
        };
        set((state) => ({
          patients: [...state.patients, newPatient],
        }));
        return newPatient;
      },

      updatePatient: (id, data) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }));
      },

      getPatientById: (id) => {
        return get().patients.find((p) => p.id === id);
      },

      getCleaningRecordsByPatient: (patientId) => {
        return get()
          .cleaningRecords.filter((r) => r.patientId === patientId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      addCleaningRecord: (record) => {
        const newRecord: CleaningRecord = {
          ...record,
          id: generateId(),
        };
        set((state) => ({
          cleaningRecords: [...state.cleaningRecords, newRecord],
        }));
        return newRecord;
      },

      searchPatients: (keyword) => {
        if (!keyword.trim()) return get().patients;
        const lowerKeyword = keyword.toLowerCase();
        return get().patients.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerKeyword) ||
            p.phone.includes(keyword) ||
            p.archiveNo.toLowerCase().includes(lowerKeyword)
        );
      },

      getPatientsByDoctor: (doctorId) => {
        return get().patients.filter((p) => p.doctorId === doctorId);
      },
    }),
    {
      name: 'dental-patient-storage',
    }
  )
);
