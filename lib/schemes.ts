import type { Scheme } from '@/types';
import schemesData from '@/data/schemes.json';

export function getAllSchemes(): Scheme[] {
  return schemesData as Scheme[];
}

export function getSchemeById(id: string): Scheme | undefined {
  return (schemesData as Scheme[]).find((s) => s.id === id);
}

export function getSchemesByCategory(category: string): Scheme[] {
  return (schemesData as Scheme[]).filter((s) => s.category === category || s.eligibility.projectTypes.includes(category));
}
