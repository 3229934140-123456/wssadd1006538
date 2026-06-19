import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';
import { mockUsers } from '@/data/mockData';

interface AuthState {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (username: string, role: UserRole) => boolean;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      users: mockUsers,
      isAuthenticated: false,
      login: (username, role) => {
        const user = mockUsers.find(u => u.name === username && u.role === role);
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },
      setCurrentUser: (user) => {
        set({ currentUser: user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'dental-auth-storage',
    }
  )
);
