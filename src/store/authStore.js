// // /**
// //  * The Clouds Academy — Auth Store (Zustand)
// //  *
// //  * Holds the currently logged-in user, their permissions array,
// //  * and school/branch context.
// //  *
// //  * Shape of `user`:
// //  * {
// //  *   id, first_name, last_name, email, role_code,
// //  *   school_id, branch_id,
// //  *   school: { id, name, code, has_branches, ... },
// //  *   role:   { id, name, code },
// //  *   permissions: ['student.create', 'fee.read', ...]   ← flat array of codes
// //  * }
// //  */

// // import { create } from 'zustand';
// // import { persist } from 'zustand/middleware';
// // import { setAccessToken, setSchoolCode, clearAuthData } from '@/lib/auth';

// // export const useAuthStore = create(
// //   persist(
// //     (set, get) => ({
// //       user: null,
// //       isAuthenticated: false,
// //       isLoading: false,

// //       // ── Setters ─────────────────────────────────────────────────────────
// //       setUser: (user, accessToken) => {
// //         if (accessToken) setAccessToken(accessToken);
// //         if (user?.school?.code) setSchoolCode(user.school.code);
// //         set({ user, isAuthenticated: true });
// //       },

// //       setLoading: (val) => set({ isLoading: val }),

// //       // ── Logout ───────────────────────────────────────────────────────────
// //       logout: () => {
// //         clearAuthData();
// //         set({ user: null, isAuthenticated: false });
// //       },

// //       // ── Getters (derived) ────────────────────────────────────────────────
// //       isMasterAdmin: () => get().user?.role_code === 'MASTER_ADMIN',

// //       permissions: () => get().user?.permissions || [],

// //       canDo: (permissionCode) => {
// //         const u = get().user;
// //         if (!u) return false;
// //         if (u.role_code === 'MASTER_ADMIN') return true;
// //         const perms = u.permissions || [];
// //         if (perms.includes('ALL')) return true;
// //         return perms.includes(permissionCode);
// //       },

// //       canDoAny: (codes = []) => {
// //         const u = get().user;
// //         if (!u) return false;
// //         if (u.role_code === 'MASTER_ADMIN') return true;
// //         const perms = u.permissions || [];
// //         if (perms.includes('ALL')) return true;
// //         return codes.some((code) => perms.includes(code));
// //       },

// //       schoolHasBranches: () => {
// //         const u = get().user;
// //         return u?.school?.has_branches === true || u?.institute?.has_branches === true;
// //       },

// //       // Institute type of the logged-in user's institute
// //       // Returns: 'school' | 'coaching' | 'academy' | 'college' | 'university' | null
// //       instituteType: () => {
// //         const u = get().user;
// //         return (
// //           u?.institute_type ||
// //           u?.school?.institute_type ||
// //           u?.institute?.institute_type ||
// //           null
// //         );
// //       },

// //       // Where to redirect after login based on institute type
// //       dashboardPath: () => {
// //         const u = get().user;
// //         if (!u) return '/login';
// //         if (u.role_code === 'MASTER_ADMIN') return '/master-admin';
// //         const type =
// //           u.institute_type ||
// //           u.school?.institute_type ||
// //           u.institute?.institute_type ||
// //           'school';
// //         const PATHS = {
// //           school:     '/school/dashboard',
// //           coaching:   '/coaching/dashboard',
// //           academy:    '/academy/dashboard',
// //           college:    '/college/dashboard',
// //           university: '/university/dashboard',
// //         };
// //         return PATHS[type] ?? '/dashboard';
// //       },
// //     }),
// //     {
// //       name: 'clouds-auth',
// //       // Only persist non-sensitive fields
// //       partialize: (state) => ({
// //         user: state.user,
// //         isAuthenticated: state.isAuthenticated,
// //       }),
// //     }
// //   )
// // );

// // export default useAuthStore;






// authStore.js

/**
 * The Clouds Academy — Auth Store (Zustand)
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAccessToken, setSchoolCode, clearAuthData } from "@/lib/auth";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // ─────────────────────────────────────────
      // Set User (Login)
      // ─────────────────────────────────────────
      setUser: (user, accessToken) => {
        console.log("🔐 Setting User:", user);

        if (accessToken) setAccessToken(accessToken);
        if (user?.school?.code) setSchoolCode(user.school.code);

        set({
          user,
          isAuthenticated: true,
        });
      },

      // ─────────────────────────────────────────
      // Loading State
      // ─────────────────────────────────────────
      setLoading: (val) => {
        console.log("⏳ Auth Loading:", val);
        set({ isLoading: val });
      },

      // ─────────────────────────────────────────
      // Logout
      // ─────────────────────────────────────────
      logout: () => {
        console.log("🚪 User Logged Out:", get().user);

        clearAuthData();

        set({
          user: null,
          isAuthenticated: false,
        });
      },

      // ─────────────────────────────────────────
      // Getters
      // ─────────────────────────────────────────

      isMasterAdmin: () => {
        const user = get().user;
        return user?.role_code === "MASTER_ADMIN";
      },

      permissions: () => {
        const user = get().user;
        return user?.permissions || [];
      },

      canDo: (permissionCode) => {
        const u = get().user;

        if (!u) return false;
        if (u.role_code === "MASTER_ADMIN") return true;

        const perms = u.permissions || [];

        if (perms.includes("ALL")) return true;

        return perms.includes(permissionCode);
      },

      canDoAny: (codes = []) => {
        const u = get().user;

        if (!u) return false;
        if (u.role_code === "MASTER_ADMIN") return true;

        const perms = u.permissions || [];

        if (perms.includes("ALL")) return true;

        return codes.some((code) => perms.includes(code));
      },

      // // 🔥 UPDATED: settings.has_branches check karo
      // schoolHasBranches: () => {
      //   const u = get().user;
        
      //   // Institute object mein settings.has_branches check karo
      //   const hasBranchesFromInstitute = u?.institute?.settings?.has_branches === true;
        
      //   // School object mein settings.has_branches check karo (backward compatibility)
      //   const hasBranchesFromSchool = u?.school?.settings?.has_branches === true;
        
      //   // Debug log
      //   if (u) {
      //     console.log("🏢 Checking hasBranches:", {
      //       instituteSettings: u?.institute?.settings,
      //       schoolSettings: u?.school?.settings,
      //       hasBranches: hasBranchesFromInstitute || hasBranchesFromSchool
      //     });
      //   }
        
      //   return hasBranchesFromInstitute || hasBranchesFromSchool;
      // },

      // authStore.js - schoolHasBranches function update karo

schoolHasBranches: () => {
  const u = get().user;
  
  console.log("🔍 Debug - Full user object:", u);
  console.log("🔍 Debug - Institute object:", u?.institute);
  console.log("🔍 Debug - Settings object:", u?.institute?.settings);
  
  // Institute object mein settings.has_branches check karo
  const hasBranchesFromInstitute = u?.institute?.settings?.has_branches === true;
  
  // School object mein settings.has_branches check karo (backward compatibility)
  const hasBranchesFromSchool = u?.school?.settings?.has_branches === true;
  
  console.log("🔍 Debug - hasBranchesFromInstitute:", hasBranchesFromInstitute);
  console.log("🔍 Debug - hasBranchesFromSchool:", hasBranchesFromSchool);
  
  return hasBranchesFromInstitute || hasBranchesFromSchool;
},

      // institute type
      instituteType: () => {
        const u = get().user;

        return (
          u?.institute_type ||
          u?.school?.institute_type ||
          u?.institute?.institute_type ||
          null
        );
      },

      // dashboard redirect path
      dashboardPath: () => {
        const u = get().user;

        if (!u) return "/login";

        if (u.role_code === "MASTER_ADMIN") {
          return "/master-admin";
        }

        const type =
          u.institute_type ||
          u.school?.institute_type ||
          u.institute?.institute_type ||
          "school";

        const PATHS = {
          school: "/school/dashboard",
          coaching: "/coaching/dashboard",
          academy: "/academy/dashboard",
          college: "/college/dashboard",
          university: "/university/dashboard",
        };

        return PATHS[type] ?? "/dashboard";
      },
      
      // Helper: get full institute object
      institute: () => {
        const u = get().user;
        return u?.institute || u?.school || null;
      },
      
      // Helper: get settings object
      settings: () => {
        const u = get().user;
        return u?.institute?.settings || u?.school?.settings || {};
      },
    }),
    {
      name: "clouds-auth",

      // Persist only safe fields
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),

      // 🔥 Runs when store loads from localStorage
      onRehydrateStorage: () => (state) => {
        console.log("♻️ Auth Store Rehydrated");
        console.log("👤 Persisted User:", state?.user);
      },
    }
  )
);

export default useAuthStore;