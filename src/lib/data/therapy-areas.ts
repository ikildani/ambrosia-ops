export type TherapyArea = {
  id: string;
  label: string;
  color: string;
};

export const THERAPY_AREAS: TherapyArea[] = [
  { id: 'oncology', label: 'Oncology', color: 'bg-red-100 text-red-800' },
  { id: 'immunology', label: 'Immunology', color: 'bg-blue-100 text-blue-800' },
  { id: 'neurology', label: 'Neurology', color: 'bg-purple-100 text-purple-800' },
  { id: 'rare_disease', label: 'Rare Disease', color: 'bg-amber-100 text-amber-800' },
  { id: 'cardiovascular', label: 'Cardiovascular', color: 'bg-rose-100 text-rose-800' },
  { id: 'metabolic', label: 'Metabolic', color: 'bg-orange-100 text-orange-800' },
  { id: 'psychiatry', label: 'Psychiatry', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'pain_management', label: 'Pain Management', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'infectious_disease', label: 'Infectious Disease', color: 'bg-green-100 text-green-800' },
  { id: 'hematology', label: 'Hematology', color: 'bg-red-100 text-red-700' },
  { id: 'ophthalmology', label: 'Ophthalmology', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'pulmonology', label: 'Pulmonology', color: 'bg-sky-100 text-sky-800' },
  { id: 'nephrology', label: 'Nephrology', color: 'bg-teal-100 text-teal-800' },
  { id: 'dermatology', label: 'Dermatology', color: 'bg-pink-100 text-pink-800' },
  { id: 'gastroenterology', label: 'Gastroenterology', color: 'bg-lime-100 text-lime-800' },
  { id: 'hepatology', label: 'Hepatology', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'endocrinology', label: 'Endocrinology', color: 'bg-violet-100 text-violet-800' },
  { id: 'musculoskeletal', label: 'Musculoskeletal', color: 'bg-stone-100 text-stone-800' },
] as const;

export const THERAPY_AREA_MAP: Record<string, TherapyArea> = Object.fromEntries(
  THERAPY_AREAS.map((ta) => [ta.id, ta])
);
