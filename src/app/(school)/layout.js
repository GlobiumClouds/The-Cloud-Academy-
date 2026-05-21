/**
 * (school) group layout
 * Applies: all /dashboard, /students, /teachers, /classes etc.
 */
import Sidebar            from '@/components/layout/Sidebar';
import Navbar             from '@/components/layout/Navbar';
import BranchInitializer  from '@/components/common/BranchInitializer';

export default function SchoolLayout({ children }) {
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background">
      <BranchInitializer />
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64 min-w-0 min-h-0">
        <Navbar />
        <main className="h-[calc(100dvh-4rem)] overflow-y-auto p-4 pt-16 sm:p-6 sm:pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}