import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePortalStore = create(
  persist(
    (set, get) => ({
      portalUser:    null,
      portalType:    null,          // 'PARENT' | 'STUDENT' | 'TEACHER'
      instituteType: null,          // 'school' | 'coaching' | 'academy' | 'college' | 'university'

      setPortalUser: (user, type, instType) =>
        set({
          portalUser:    user,
          portalType:    type,
          // Prefer explicit arg, fallback to data on user object, default 'school'
          instituteType: instType || user?.institute_type || 'school',
        }),

      clearPortal: () => set({ portalUser: null, portalType: null, instituteType: null }),

      /** Convenience getter — always returns a non-null string */
      getInstituteType: () =>
        get().instituteType || get().portalUser?.institute_type || 'school',
    }),
    {
      name: 'portal-session',
    },
  ),
);

export default usePortalStore;
