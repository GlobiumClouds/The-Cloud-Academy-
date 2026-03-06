/**
 * DashboardPage — Adaptive for all institute types
 *
 * Uses useInstituteConfig() to show correct terminology per type.
 * Uses shared StatsCard component for stat cards.
 * Falls back to DUMMY_STATS_BY_TYPE if API not available.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import { dashboardService } from '@/services';
import StatsCard from '@/components/common/StatsCard';
import {
  Users, GraduationCap, BookOpen, DollarSign,
  Calendar, TrendingUp, BrainCircuit, Building2,
  BarChart3, ClipboardCheck,
} from 'lucide-react';

// ─── Icon map ───────────────────────────────────────────────────────────────
const ICON_MAP = {
  Users:         <Users size={20} />,
  GraduationCap: <GraduationCap size={20} />,
  BookOpen:      <BookOpen size={20} />,
  DollarSign:    <DollarSign size={20} />,
  Calendar:      <Calendar size={20} />,
  TrendingUp:    <TrendingUp size={20} />,
  BrainCircuit:  <BrainCircuit size={20} />,
  Building2:     <Building2 size={20} />,
  BarChart3:     <BarChart3 size={20} />,
  ClipboardCheck:<ClipboardCheck size={20} />,
};

// ─── Dummy fallback data ────────────────────────────────────────────────────
// trend: null = no percentage arrow shown; description = sub-text
const DUMMY_STATS_BY_TYPE = {
  school: [
    { label: 'Total Students',     value: '1,240',  icon: 'Users',          trend: 5,    description: 'vs last month' },
    { label: 'Teachers',           value: '68',     icon: 'GraduationCap',  trend: null, description: '+2 new this term' },
    { label: 'Classes',            value: '42',     icon: 'BookOpen',       trend: null, description: '14 sections active' },
    { label: 'Fee Collected',      value: '₹4.2L',  icon: 'DollarSign',     trend: null, description: '82% of target' },
    { label: 'Attendance Today',   value: '94%',    icon: 'ClipboardCheck', trend: 1,    description: 'vs last week' },
    { label: 'Exams This Month',   value: '6',      icon: 'Calendar',       trend: null, description: '2 completed' },
  ],
  coaching: [
    { label: 'Total Candidates',   value: '380',    icon: 'Users',          trend: 6,    description: 'vs last batch' },
    { label: 'Trainers',           value: '18',     icon: 'GraduationCap',  trend: null, description: '5 part-time' },
    { label: 'Active Courses',     value: '12',     icon: 'BookOpen',       trend: null, description: '3 new batches' },
    { label: 'Fee Collected',      value: '₹8.6L',  icon: 'DollarSign',     trend: null, description: '91% of target' },
    { label: 'Attendance Today',   value: '88%',    icon: 'ClipboardCheck', trend: -2,   description: 'vs last week' },
    { label: 'Mock Tests Pending', value: '3',      icon: 'BrainCircuit',   trend: null, description: 'this week' },
  ],
  academy: [
    { label: 'Total Trainees',     value: '210',    icon: 'Users',          trend: 7,    description: 'vs last intake' },
    { label: 'Trainers',           value: '24',     icon: 'GraduationCap',  trend: null, description: 'Full-time + Guest' },
    { label: 'Active Programs',    value: '9',      icon: 'BookOpen',       trend: null, description: '4 professional' },
    { label: 'Fee Collected',      value: '₹3.1L',  icon: 'DollarSign',     trend: null, description: '88% of target' },
    { label: 'Attendance Today',   value: '91%',    icon: 'ClipboardCheck', trend: -2,   description: 'vs last week' },
    { label: 'Certifications Due', value: '7',      icon: 'TrendingUp',     trend: null, description: 'this quarter' },
  ],
  college: [
    { label: 'Total Students',     value: '2,840',  icon: 'Users',          trend: 5,    description: 'vs last semester' },
    { label: 'Faculty',            value: '142',    icon: 'GraduationCap',  trend: null, description: '12 departments' },
    { label: 'Departments',        value: '12',     icon: 'Building2',      trend: null, description: '48 programs' },
    { label: 'Fee Collected',      value: '₹18.4L', icon: 'DollarSign',     trend: null, description: '79% of target' },
    { label: 'Attendance Today',   value: '86%',    icon: 'ClipboardCheck', trend: null, description: '4th Sem high 96%' },
    { label: 'Exams This Sem',     value: '22',     icon: 'Calendar',       trend: null, description: '8 completed' },
  ],
  university: [
    { label: 'Total Students',     value: '12,400', icon: 'Users',          trend: 5,    description: 'vs last year' },
    { label: 'Faculty Members',    value: '680',    icon: 'GraduationCap',  trend: null, description: '7 faculties' },
    { label: 'Departments',        value: '38',     icon: 'Building2',      trend: null, description: '120+ programs' },
    { label: 'Fee Collected',      value: '₹96L',   icon: 'DollarSign',     trend: null, description: '74% of target' },
    { label: 'Research Projects',  value: '84',     icon: 'BarChart3',      trend: null, description: '12 govt-funded' },
    { label: 'Passing Rate',       value: '91%',    icon: 'TrendingUp',     trend: 3,    description: 'vs last year' },
  ],
};

export default function DashboardPage({ type }) {
  const { terms, typeDefinition } = useInstituteConfig();

  const { data: apiStats, isError, isLoading } = useQuery({
    queryKey: ['dashboard-stats', type],
    queryFn: () => dashboardService.getStats({ type }),
    retry: 1,
  });

  const fallback = DUMMY_STATS_BY_TYPE[type] ?? DUMMY_STATS_BY_TYPE.school;
  const stats = Array.isArray(apiStats?.data)
    ? apiStats.data
    : fallback;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold">
          {typeDefinition?.icon} Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome to {typeDefinition?.label ?? 'your institute'} management dashboard
        </p>
      </div>

      {/* Stats grid — using shared StatsCard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={ICON_MAP[stat.icon]}
            trend={stat.trend ?? undefined}
            description={stat.description}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Quick links */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <QuickLink href={`/${type}/students/add`}    label={`Add ${terms.student}`} />
          <QuickLink href={`/${type}/attendance`}      label="Mark Attendance" />
          <QuickLink href={`/${type}/fees`}            label="Fee Management" />
          {type === 'school' && (
            <QuickLink href={`/${type}/timetable`}     label="Timetable" />
          )}
          {(type === 'coaching' || type === 'academy') && (
            <QuickLink href={`/${type}/batches`}       label="Manage Batches" />
          )}
          {(type === 'college' || type === 'university') && (
            <QuickLink href={`/${type}/admissions`}    label="Admissions" />
          )}
          <QuickLink href={`/${type}/notices`}         label="Post Notice" />
        </div>
      </div>

      {/* Placeholder charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartPlaceholder title={`${terms.students} Enrollment Trend`} />
        <ChartPlaceholder title="Fee Collection vs Target" />
      </div>
    </div>
  );
}

function QuickLink({ href, label }) {
  return (
    <a
      href={href}
      className="rounded-md border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {label}
    </a>
  );
}

function ChartPlaceholder({ title }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="flex h-36 items-center justify-center rounded-lg border-2 border-dashed border-muted text-sm text-muted-foreground">
        Chart coming soon
      </div>
    </div>
  );
}
