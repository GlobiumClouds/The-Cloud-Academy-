/**
 * (institute) route group — shared layout for all institute types
 * Handles: /school/*, /coaching/*, /academy/*, /college/*, /university/*
 *
 * This layout:
 *  1. Verifies access_token (redirect to /login if missing)
 *  2. Passes institute config to child pages via context
 */
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import InstituteLayoutWrapper from '@/components/layout/InstituteLayoutWrapper';

export default async function InstituteGroupLayout({ children }) {
  // Server-side auth check (edge-safe)
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) redirect('/login');

  return <InstituteLayoutWrapper>{children}</InstituteLayoutWrapper>;
}
