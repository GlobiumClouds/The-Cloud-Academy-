import { notFound } from 'next/navigation';
import BranchesPage from '@/components/pages/BranchesPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Branches({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <BranchesPage type={type} />;
}
export async function generateMetadata({ params }) {
  const { type } = await params;
  return { title: type === 'university' ? 'Campuses' : 'Branches' };
}
