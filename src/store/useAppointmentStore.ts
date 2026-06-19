import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Appointment, AppointmentStatus } from '@/types';
import { mockAppointments } from '@/data/mockData';
import { generateId, getToday, TIME_SLOTS } from '@/utils';

interface AppointmentState {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Appointment;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;
  getAppointmentsByPatient: (patientId: string) => Appointment[];
  getAppointmentsByDoctor: (doctorId: string) => Appointment[];
  getAppointmentsByDate: (date: string) => Appointment[];
  getAvailableSlots: (date: string, doctorId?: string) => string[];
  getAppointmentById: (id: string) => Appointment | undefined;
}

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      appointments: mockAppointments,

      addAppointment: (appointment) => {
        const newAppointment: Appointment = {
          ...appointment,
          id: generateId(),
          status: 'confirmed',
          createdAt: getToday(),
        };
        set((state) => ({
          appointments: [...state.appointments, newAppointment],
        }));
        return newAppointment;
      },

      updateAppointment: (id, data) => {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, ...data } : a
          ),
        }));
      },

      cancelAppointment: (id) => {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, status: 'cancelled' as AppointmentStatus } : a
          ),
        }));
      },

      getAppointmentsByPatient: (patientId) => {
        return get()
          .appointments.filter((a) => a.patientId === patientId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getAppointmentsByDoctor: (doctorId) => {
        return get()
          .appointments.filter((a) => a.doctorId === doctorId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getAppointmentsByDate: (date) => {
        return get()
          .appointments.filter((a) => a.date === date)
          .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
      },

      getAvailableSlots: (date, doctorId) => {
        const dayAppointments = get().appointments.filter(
          (a) => a.date === date && a.status !== 'cancelled' && (doctorId ? a.doctorId === doctorId : true)
        );
        const bookedSlots = dayAppointments.map((a) => a.timeSlot);
        return TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot));
      },

      getAppointmentById: (id) => {
        return get().appointments.find((a) => a.id === id);
      },
    }),
    {
      name: 'dental-appointment-storage',
    }
  )
);
