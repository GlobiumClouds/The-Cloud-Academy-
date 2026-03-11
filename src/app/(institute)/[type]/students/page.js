/**
 * /[type]/students
 * Handles: /school/students, /coaching/students (Candidates), /academy/students (Trainees), etc.
 */
import { notFound } from 'next/navigation';
import StudentsPage from '@/components/pages/StudentsPage';

<<<<<<< HEAD
const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university'];
=======
const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university','tuition_center'];
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c

export default async function Students({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <StudentsPage type={type} />;
}

export async function generateMetadata({ params }) {
  const { type } = await params;
  const labels = {
    school:     'Students',
    coaching:   'Candidates',
    academy:    'Trainees',
    college:    'Students',
    university: 'Students',
<<<<<<< HEAD
=======
    tuition_center: 'Students',
>>>>>>> 9bec5616ab4ff5e499e6d95ede92136574206c2c
  };
  return { title: labels[type] ?? 'Students' };
}
