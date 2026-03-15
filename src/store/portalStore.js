// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// const usePortalStore = create(
//   persist(
//     (set, get) => ({
//       portalUser:    null,
//       portalType:    null,          // 'PARENT' | 'STUDENT' | 'TEACHER'
//       instituteType: null,          // 'school' | 'coaching' | 'academy' | 'college' | 'university'

//       setPortalUser: (user, type, instType) =>
//         set({
//           portalUser:    user,
//           portalType:    type,
//           // Prefer explicit arg, fallback to data on user object, default 'school'
//           instituteType: instType || user?.institute_type || 'school',
//         }),

//       clearPortal: () => set({ portalUser: null, portalType: null, instituteType: null }),

//       /** Convenience getter — always returns a non-null string */
//       getInstituteType: () =>
//         get().instituteType || get().portalUser?.institute_type || 'school',
//     }),
//     {
//       name: 'portal-session',
//     },
//   ),
// );

// export default usePortalStore;









import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePortalStore = create(
  persist(
    (set, get) => ({
      portalUser:    null,
      portalType:    null,          // 'PARENT' | 'STUDENT' | 'TEACHER'
      instituteType: null,          // 'school' | 'coaching' | 'academy' | 'college' | 'university'
      permissions:   [],             // User permissions
      isLoading:     false,

      setPortalUser: (user, type, instType) =>
        set({
          portalUser:    user,
          portalType:    type,
          instituteType: instType || user?.institute?.institute_type || user?.school?.institute_type || 'school',
          permissions:   user?.permissions || [],
        }),

      clearPortal: () => set({ 
        portalUser: null, 
        portalType: null, 
        instituteType: null,
        permissions: []
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      /** Convenience getter — always returns a non-null string */
      getInstituteType: () =>
        get().instituteType || get().portalUser?.institute?.institute_type || get().portalUser?.school?.institute_type || 'school',

      /** Check if user has specific permission */
      canDo: (permission) => {
        const { permissions, portalType } = get();
        
        // Teachers have specific permissions
        if (portalType === 'TEACHER') {
          const teacherPermissions = [
            'classes.read',
            'students.read',
            'attendance.mark',
            'assignments.create',
            'notes.create',
          ];
          return teacherPermissions.includes(permission);
        }
        
        // Parents have view permissions
        if (portalType === 'PARENT') {
          const parentPermissions = [
            'attendance.view',
            'fees.view',
            'results.view',
            'announcements.view'
          ];
          return parentPermissions.includes(permission);
        }
        
        // Students have self permissions
        if (portalType === 'STUDENT') {
          const studentPermissions = [
            'attendance.view.self',
            'fees.view.self',
            'results.view.self',
            'timetable.view.self'
          ];
          return studentPermissions.includes(permission);
        }

        return permissions?.includes(permission) || false;
      },

      /** Get user display name */
      displayName: () => {
        const user = get().portalUser;
        if (!user) return '';
        return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || '';
      },

      /** Get user role display */
      roleDisplay: () => {
        const { portalType } = get();
        const display = {
          STUDENT: 'Student',
          PARENT: 'Parent',
          TEACHER: 'Teacher'
        };
        return display[portalType] || portalType;
      },
    }),
    {
      name: 'portal-session',
      partialize: (state) => ({
        portalUser: state.portalUser,
        portalType: state.portalType,
        instituteType: state.instituteType,
      }),
    },
  ),
);

export default usePortalStore;