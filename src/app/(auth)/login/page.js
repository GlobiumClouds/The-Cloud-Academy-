// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { toast } from 'sonner';
// import Cookies from 'js-cookie';
// import { Eye, EyeOff, GraduationCap, Zap } from 'lucide-react';

// import { authService } from '@/services';
// import useAuthStore from '@/store/authStore';

// // Single login schema — works for all roles
// const loginSchema = z.object({
//   email:    z.string().email('Invalid email address'),
//   password: z.string().min(6, 'Minimum 6 characters'),
// });

// // Redirect map: institute_type → dashboard path
// const DASHBOARD_PATHS = {
//   school:     '/school/dashboard',
//   coaching:   '/coaching/dashboard',
//   academy:    '/academy/dashboard',
//   college:    '/college/dashboard',
//   university: '/university/dashboard',
// };

// // Quick-login credentials for demo / development
// const QUICK_LOGINS = [
//   {
//     label:    'Master Admin',
//     email:    'admin@thecloudsacademy.com',
//     password: 'Admin@TCA2026!',
//     badge:    'MASTER',
//     color:    'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200',
//   },
//   {
//     label:    'School Admin',
//     email:    'hafizshoaibraza180@gmail.com',
//     password: 'Shoaib0320',
//     badge:    'ADMIN',
//     color:    'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
//   },
//   {
//     label:    'Academy Admin',
//     email:    'hafizshoaibraza190@gmail.com',
//     password: '123456',
//     badge:    'ADMIN',
//     color:    'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
//   },
//   {
//     label:    'University Admin',
//     email:    'shoaibrazamemon170@gmail.com',
//     password: '123456',
//     badge:    'ADMIN',
//     color:    'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
//   },
//   {
//     label:    'Academy Admin',
//     email:    'sajoodali486@gmail.com',
//     password: '123456',
//     badge:    'ADMIN',
//     color:    'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
//   },
// ];

// export default function LoginPage() {
//   const router   = useRouter();
//   const setUser  = useAuthStore((s) => s.setUser);
//   const [loading,  setLoading]  = useState(false);
//   const [showPass, setShowPass] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//   } = useForm({ resolver: zodResolver(loginSchema) });

//   const fillCredentials = (cred) => {
//     setValue('email',    cred.email,    { shouldValidate: true });
//     setValue('password', cred.password, { shouldValidate: true });
//   };

//   const onSubmit = async (data) => {
//     try {
//       setLoading(true);
//       const res = await authService.login(data);
//       const user = res.user;

//       // Clear any stale cookies from a previous session first
//       Cookies.remove('access_token');
//       Cookies.remove('role_code');
//       Cookies.remove('institute_type');

//       // Persist in store (also sets access_token cookie via setAccessToken)
//       setUser(user, res.access_token);

//       // Set cookies for Next.js middleware route-guards
//       Cookies.set('access_token',  res.access_token,                        { expires: 7 });
//       Cookies.set('role_code',     user.role_code ?? user.user_type ?? '',   { expires: 7 });

//       const instType =
//         user.institute_type ||
//         user.institute?.institute_type ||
//         user.school?.institute_type ||
//         null;
//       if (instType) Cookies.set('institute_type', instType, { expires: 7 });

//       toast.success(`Welcome back, ${user.first_name}!`);

//       // Redirect based on role
//       if (user.role_code === 'MASTER_ADMIN' || user.user_type === 'MASTER_ADMIN') {
//         router.replace('/master-admin');
//       } else {
//         router.replace(DASHBOARD_PATHS[instType] ?? '/dashboard');
//       }
//     } catch (err) {
//       const status = err?.response?.status;
//       const msg    = err?.response?.data?.message ?? err?.message ?? 'Login failed';
//       if (!status) {
//         toast.error('Cannot reach server. Make sure the backend is running on port 5000.');
//       } else {
//         toast.error(msg);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-[420px] items-center justify-center">
//       <div className="w-full max-w-sm">

//         {/* Logo / Brand */}
//         <div className="mb-8 flex flex-col items-center gap-2 text-center">
//           <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
//             <GraduationCap size={26} className="text-primary" />
//           </div>
//           <h1 className="text-2xl font-bold tracking-tight">The Clouds Academy</h1>
//           <p className="text-sm text-muted-foreground">Sign in to your account</p>
//         </div>

//         <div className="rounded-xl border bg-card p-6 shadow-sm">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

//             {/* Email */}
//             <div className="space-y-1.5">
//               <label className="block text-sm font-medium">Email</label>
//               <input
//                 {...register('email')}
//                 type="email"
//                 placeholder="you@institute.com"
//                 autoComplete="email"
//                 autoFocus
//                 className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring"
//               />
//               {errors.email && (
//                 <p className="text-xs text-destructive">{errors.email.message}</p>
//               )}
//             </div>

//             {/* Password */}
//             <div className="space-y-1.5">
//               <div className="flex items-center justify-between">
//                 <label className="block text-sm font-medium">Password</label>
//                 <a
//                   href="/forgot-password"
//                   className="text-xs text-muted-foreground hover:text-foreground hover:underline"
//                 >
//                   Forgot password?
//                 </a>
//               </div>
//               <div className="relative">
//                 <input
//                   {...register('password')}
//                   type={showPass ? 'text' : 'password'}
//                   placeholder="••••••••"
//                   autoComplete="current-password"
//                   className="w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-ring"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPass((v) => !v)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                   tabIndex={-1}
//                   aria-label={showPass ? 'Hide password' : 'Show password'}
//                 >
//                   {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
//                 </button>
//               </div>
//               {errors.password && (
//                 <p className="text-xs text-destructive">{errors.password.message}</p>
//               )}
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="mt-2 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
//             >
//               {loading ? 'Signing in…' : 'Sign in'}
//             </button>
//           </form>
//         </div>

//         <p className="mt-4 text-center text-xs text-muted-foreground">
//           All users — Master Admin, Institute Admin, Teacher, Student, Parent — use this single login.
//         </p>

//         {/* ── Quick Login ── */}
//         <div className="mt-5 rounded-xl border border-dashed bg-muted/40 p-4">
//           <div className="mb-3 flex items-center gap-1.5">
//             <Zap size={13} className="text-amber-500" />
//             <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
//               Quick Login
//             </span>
//           </div>
//           <div className="flex flex-col gap-2">
//             {QUICK_LOGINS.map((cred) => (
//               <button
//                 key={cred.email}
//                 type="button"
//                 onClick={() => fillCredentials(cred)}
//                 className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${cred.color}`}
//               >
//                 <span>{cred.label}</span>
//                 <span className="ml-2 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider opacity-70">
//                   {cred.badge}
//                 </span>
//               </button>
//             ))}
//           </div>
//           <p className="mt-2 text-[10px] text-muted-foreground/70">
//             Click a role to auto-fill credentials, then press Sign in.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }







// frontend/src/app/login/page.jsx (WORKING FIXED VERSION)

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { Eye, EyeOff, GraduationCap, Zap, User, Building2, Users, BookOpen, Briefcase, UserCircle, Loader2 } from 'lucide-react';
import { authService } from '@/services';
import useAuthStore from '@/store/authStore';
import AccountSelectionModal, { ROLE_ICONS } from '@/components/auth/AccountSelectionModal';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  registration_no: z.string().optional(),
  password: z.string().min(4, 'Password must be at least 4 characters'),
}).refine(data => data.email || data.registration_no, {
  message: 'Either email or registration number is required',
  path: ['email'],
});

// Quick logins
const QUICK_LOGINS = [
  { label: 'Student', email: 'sajood483@gmail.com', password: 'The123456', type: 'STUDENT' },
  { label: 'Teacher', email: 'shoaibrazamemon160@gmail.com', password: '123456', type: 'TEACHER' },
  { label: 'Parent', email: 'father.ali@parent.tca', password: 'parent123', type: 'PARENT' },
  { label: 'School Admin', email: 'hafizshoaibraza180@gmail.com', password: 'Shoaib0320', type: 'INSTITUTE_ADMIN' },
  { label: 'Master Admin', email: 'admin@thecloudsacademy.com', password: 'Admin@TCA2026!', type: 'MASTER_ADMIN' },
];

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', registration_no: '', password: '' }
  });

  const fillCredentials = (cred) => {
    setValue('email', cred.email, { shouldValidate: true });
    setValue('registration_no', '', { shouldValidate: true });
    setValue('password', cred.password, { shouldValidate: true });
    toast.info(`Filled ${cred.label} credentials. Click Continue to login.`);
  };

  // //
  // const onSubmit = async (data) => {
  //   try {
  //     setLoading(true);
      
  //     console.log('🔐 Form submitted:', { email: data.email, hasPassword: !!data.password });
      
  //     // If registration_no, direct login
  //     if (data.registration_no) {
  //       const response = await authService.login({
  //         registration_no: data.registration_no,
  //         password: data.password
  //       });
        
  //       console.log('📦 Registration login response:', response);
        
  //       if (response?.user) {
  //         await completeLogin(response.user, response.accessToken);
  //       } else {
  //         toast.error('Invalid credentials');
  //       }
  //       setLoading(false);
  //       return;
  //     }
      
  //     // For email
  //     if (data.email) {
  //       setTempEmail(data.email);
  //       setTempPassword(data.password);
        
  //       // First, check accounts
  //       const accountsResponse = await authService.getAccountsByEmail(data.email);
  //       console.log('📧 Accounts response:', accountsResponse);
        
  //       const accountsList = accountsResponse?.accounts || [];
        
  //       if (accountsList.length > 1) {
  //         // Multiple accounts - show selector
  //         console.log('🎯 Multiple accounts:', accountsList.length);
  //         setAccounts(accountsList);
  //         setShowAccountSelector(true);
  //         setLoading(false);
  //         return;
  //       }
        
  //       if (accountsList.length === 1) {
  //         // Single account - try login with password
  //         if (!data.password) {
  //           toast.error('Password is required');
  //           setLoading(false);
  //           return;
  //         }
          
  //         const loginResponse = await authService.login({
  //           email: data.email,
  //           password: data.password
  //         });
          
  //         console.log('📦 Single account login response:', loginResponse);
          
  //         // Handle different response structures
  //         const user = loginResponse?.user || loginResponse?.data?.user;
  //         const token = loginResponse?.accessToken || loginResponse?.data?.accessToken;
          
  //         if (user && token) {
  //           await completeLogin(user, token);
  //         } else {
  //           toast.error('Invalid email or password');
  //         }
  //         setLoading(false);
  //         return;
  //       }
        
  //       toast.error('No account found with this email');
  //       setLoading(false);
  //       return;
  //     }
      
  //   } catch (err) {
  //     console.error('❌ Login error:', err);
  //     const msg = err?.response?.data?.message || err?.message || 'Login failed';
  //     toast.error(msg);
  //     setLoading(false);
  //   }
  // };

  // frontend/src/app/login/page.jsx (FIXED - Handle singleAccount response)

const onSubmit = async (data) => {
  try {
    setLoading(true);
    
    console.log('🔐 Form submitted:', { email: data.email, hasPassword: !!data.password });
    
    // If registration_no, direct login
    if (data.registration_no) {
      const response = await authService.login({
        registration_no: data.registration_no,
        password: data.password
      });
      
      console.log('📦 Registration login response:', response);
      
      if (response?.user) {
        await completeLogin(response.user, response.accessToken);
      } else {
        toast.error('Invalid credentials');
      }
      setLoading(false);
      return;
    }
    
    // For email
    if (data.email) {
      // If password is provided, try direct login
      if (data.password) {
        const response = await authService.login({
          email: data.email,
          password: data.password
        });
        
        console.log('📦 Login response with password:', response);
        
        // Check if we got a direct user
        if (response?.user) {
          await completeLogin(response.user, response.accessToken);
          setLoading(false);
          return;
        }
        
        // Check if we got singleAccount response (needs password)
        if (response?.singleAccount) {
          setTempEmail(data.email);
          setAccounts([response.singleAccount]);
          setShowAccountSelector(true);
          setLoading(false);
          return;
        }
        
        toast.error('Invalid credentials');
        setLoading(false);
        return;
      }
      
      // No password - check accounts first
      setTempEmail(data.email);
      
      const accountsResponse = await authService.getAccountsByEmail(data.email);
      console.log('📧 Accounts response:', accountsResponse);
      
      const accountsList = accountsResponse?.accounts || [];
      
      if (accountsList.length > 1) {
        // Multiple accounts - show selector
        console.log('🎯 Multiple accounts:', accountsList.length);
        setAccounts(accountsList);
        setShowAccountSelector(true);
        setLoading(false);
        return;
      }
      
      if (accountsList.length === 1) {
        // Single account - show password prompt
        console.log('📌 Single account, show password prompt');
        setAccounts(accountsList);
        setShowAccountSelector(true);
        setLoading(false);
        return;
      }
      
      toast.error('No account found with this email');
      setLoading(false);
      return;
    }
    
  } catch (err) {
    console.error('❌ Login error:', err);
    const msg = err?.response?.data?.message || err?.message || 'Login failed';
    toast.error(msg);
    setLoading(false);
  }
};
  
  const completeLogin = async (user, accessToken) => {
    console.log('✅ Completing login:', { userId: user?.id, userType: user?.user_type });
    
    if (!user || !user.id) {
      console.error('❌ Invalid user:', user);
      toast.error('Invalid user data');
      return;
    }
    
    // Clear cookies
    Cookies.remove('access_token');
    Cookies.remove('role_code');
    Cookies.remove('institute_type');
    
    // Set auth store
    setUser(user, accessToken);
    
    // Set cookies
    Cookies.set('access_token', accessToken, { expires: 7 });
    Cookies.set('role_code', user.user_type || user.role_code, { expires: 7 });
    
    const instType = user.institute?.institute_type || user.institute_type || 'school';
    Cookies.set('institute_type', instType, { expires: 7 });
    
    toast.success(`Welcome, ${user.first_name}!`);
    
    // Redirect based on role
    const role = user.user_type || user.role_code;
    
    if (role === 'MASTER_ADMIN') {
      router.replace('/master-admin');
    } else if (role === 'INSTITUTE_ADMIN') {
      router.replace(`/${instType}/dashboard`);
    } else if (role === 'TEACHER') {
      router.replace('/teacher/dashboard');
    } else if (role === 'STUDENT') {
      router.replace('/student/dashboard');
    } else if (role === 'PARENT') {
      router.replace('/parent/dashboard');
    } else {
      router.replace('/dashboard');
    }
  };
  
  const handleAccountSelectWithPassword = async (account, password) => {
    try {
      console.log('🔐 Login with selected account:', account.user_type);
      
      const response = await authService.loginWithAccount({
        accountId: account.id,
        password: password
      });
      
      console.log('📦 Account login response:', response);
      
      const user = response?.user;
      const token = response?.accessToken;
      
      if (user && token) {
        await completeLogin(user, token);
        return true;
      }
      
      toast.error('Invalid password');
      return false;
      
    } catch (err) {
      console.error('❌ Account login error:', err);
      toast.error(err?.response?.data?.message || 'Invalid password');
      return false;
    }
  };
  
  return (
    <>
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <GraduationCap size={26} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">The Clouds Academy</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account</p>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Email Address
                  </label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    className="w-full"
                    disabled={loading}
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">OR</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Registration Number
                  </label>
                  <Input
                    {...register('registration_no')}
                    type="text"
                    placeholder="REG-2024-001"
                    className="w-full"
                    disabled={loading}
                  />
                </div>
                
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">Password</label>
                  <a href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                    disabled={loading}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
          
          {/* Quick Login */}
          <div className="mt-5 rounded-xl border border-dashed bg-muted/40 p-4">
            <div className="mb-3 flex items-center gap-1.5">
              <Zap size={13} className="text-amber-500" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Quick Login
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_LOGINS.map((cred) => {
                const roleInfo = ROLE_ICONS[cred.type];
                const IconComp = roleInfo?.icon || User;
                return (
                  <button
                    key={cred.email}
                    type="button"
                    onClick={() => fillCredentials(cred)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${roleInfo?.color || 'bg-slate-100 text-slate-700'} border-current/20 hover:shadow-sm`}
                    disabled={loading}
                  >
                    <IconComp size={14} />
                    <span>{cred.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <AccountSelectionModal
        open={showAccountSelector}
        onOpenChange={setShowAccountSelector}
        accounts={accounts}
        email={tempEmail}
        onLogin={handleAccountSelectWithPassword}
      />
    </>
  );
}