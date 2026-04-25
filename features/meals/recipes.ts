import type { Meal } from '@/types/meals';

/** Seed database of common Filipino meals. Expand as needed. */
export const FILIPINO_MEALS: Meal[] = [
  {
    id: 'sinigang-baboy',
    name: 'Sinigang na Baboy',
    nameTagalog: 'Sinigang na Baboy',
    category: 'lunch',
    ingredients: [
      { id: 'pork-belly', name: 'Pork Belly', unit: 'kg', quantity: 0.5 },
      { id: 'kangkong', name: 'Kangkong', unit: 'bundle', quantity: 1 },
      { id: 'sampalok', name: 'Sampalok Mix', unit: 'pack', quantity: 1 },
    ],
    calories: 420,
    tags: ['savory', 'filling'],
    prepMinutes: 40,
  },
  {
    id: 'arroz-caldo',
    name: 'Arroz Caldo',
    category: 'breakfast',
    ingredients: [
      { id: 'rice', name: 'Rice', unit: 'cup', quantity: 1 },
      { id: 'chicken', name: 'Chicken', unit: 'kg', quantity: 0.25 },
      { id: 'ginger', name: 'Ginger', unit: 'piece', quantity: 1 },
    ],
    calories: 280,
    tags: ['light', 'calming', 'warm'],
    prepMinutes: 25,
  },
  {
    id: 'tinolang-manok',
    name: 'Tinolang Manok',
    category: 'dinner',
    ingredients: [
      { id: 'chicken', name: 'Chicken', unit: 'kg', quantity: 0.5 },
      { id: 'sayote', name: 'Sayote', unit: 'piece', quantity: 1 },
      { id: 'malunggay', name: 'Malunggay Leaves', unit: 'cup', quantity: 1 },
      { id: 'ginger', name: 'Ginger', unit: 'piece', quantity: 1 },
    ],
    calories: 310,
    tags: ['calming', 'light', 'high-protein'],
    prepMinutes: 35,
  },
  {
    id: 'lugaw',
    name: 'Lugaw',
    category: 'breakfast',
    ingredients: [
      { id: 'rice', name: 'Rice', unit: 'cup', quantity: 1 },
      { id: 'ginger', name: 'Ginger', unit: 'piece', quantity: 1 },
    ],
    calories: 180,
    tags: ['light', 'calming', 'low-cost'],
    prepMinutes: 20,
  },
];
