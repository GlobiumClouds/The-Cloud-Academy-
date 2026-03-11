import { notFound } from 'next/navigation';
import AcademicYearsPage from '@/components/pages/AcademicYearsPage';
<<<<<<< HEAD
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
=======

const VALID_TYPES = ['school','coaching','academy','college','university','tuition_center'];

export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }

>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
export default async function AcademicYears({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <AcademicYearsPage type={type} />;
}
export async function generateMetadata({ params }) {
  const { type } = await params;
<<<<<<< HEAD
  const l = { school:'Academic Years', coaching:'Sessions', academy:'Batch Cycles', college:'Academic Years', university:'Academic Years' };
=======
  const l = { school:'Academic Years', coaching:'Sessions', academy:'Batch Cycles', college:'Academic Years', university:'Academic Years', tuition_center: 'Sessions',
 };
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
  return { title: l[type] ?? 'Academic Years' };
}
