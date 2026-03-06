/**
 * InstituteLayoutWrapper
 * Har institute type ke liye adaptive sidebar + header wrapper
 *
 * Responsive behaviour:
 *   Mobile  (< lg) : sidebar hidden by default; hamburger button opens it as
 *                    a slide-in overlay with a dark backdrop.
 *   Desktop (≥ lg) : sidebar always visible, collapsible to icon-only (w-16).
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import { useInstituteNav } from '@/hooks/useInstituteConfig';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services';
import { Button } from '@/components/ui/button';

export default function InstituteLayoutWrapper({ children }) {
  const [collapsed,   setCollapsed]   = useState(false);   // desktop collapse
  const [mobileOpen,  setMobileOpen]  = useState(false);   // mobile drawer
  const [mounted,     setMounted]     = useState(false);
  const pathname  = usePathname();
  const router    = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const user         = useAuthStore((s) => s.user);
  const logout       = useAuthStore((s) => s.logout);
  const dashboardPath = useAuthStore((s) => s.dashboardPath());
  const { typeDefinition } = useInstituteConfig();
  const allNavItems  = useInstituteNav();
  const navItems     = mounted ? allNavItems : [];

  const grouped = navItems.reduce((acc, item) => {
    acc[item.group] = acc[item.group] ?? [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const handleLogout = async () => {
    try { await authService.logout(); } catch (_) { /* ignore */ }
    finally { logout(); router.replace('/login'); toast.success('Logged out'); }
  };

  // ─── Sidebar inner content (shared between desktop + mobile drawer) ──────
  function SidebarContent({ isCollapsed }) {
    return (
      <>
        {/* Logo / Institute name */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
          {typeDefinition && <span className="text-xl">{typeDefinition.icon}</span>}
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">
                {user?.school?.name || user?.institute?.name || 'The Clouds Academy'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {typeDefinition?.label ?? 'Institute'}
              </p>
            </div>
          )}
          {/* Desktop collapse toggle — hidden on mobile */}
          <Button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden lg:block ml-auto text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Toggle sidebar"
          >
            <Icons.PanelLeft size={16} />
          </Button>
          {/* Mobile close button — hidden on desktop */}
          <Button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Close menu"
          >
            <Icons.X size={16} />
          </Button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-1">
              {!isCollapsed && (
                <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </p>
              )}
              {items.map((item) => {
                const Icon = Icons[item.icon] ?? Icons.Circle;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                      isCollapsed ? 'justify-center' : '',
                      isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground',
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User + logout */}
        <div className="shrink-0 border-t p-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{user?.first_name} {user?.last_name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.role?.name}</p>
              </div>
              <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground" title="Logout">
                <Icons.LogOut size={14} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="flex w-full justify-center text-muted-foreground hover:text-foreground" title="Logout">
              <Icons.LogOut size={16} />
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ══════ MOBILE OVERLAY BACKDROP ══════ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ══════ MOBILE SIDEBAR DRAWER ══════ */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent isCollapsed={false} />
      </aside>

      {/* ══════ DESKTOP SIDEBAR ══════ */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r bg-card transition-all duration-200 shrink-0',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <SidebarContent isCollapsed={collapsed} />
      </aside>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <main className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
            aria-label="Open menu"
          >
            <Icons.Menu size={20} />
          </button>

          {/* Institute code / breadcrumb area */}
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <Link href={dashboardPath} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground lg:hidden">
              {typeDefinition && <span className="text-base">{typeDefinition.icon}</span>}
              <span className="truncate text-sm font-semibold">
                {user?.school?.name || user?.institute?.name || 'The Clouds Academy'}
              </span>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {user?.school?.code || user?.institute?.code}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
