export interface Ingredient {
  id: string;
  name: string;
  nameTagalog?: string;
  unit: string;            // "kg", "bundle", "piece"
  quantity: number;
  marketPricePerUnit?: number;  // PHP, from API
  priceUpdatedAt?: number;
}

export interface Meal {
  id: string;
  name: string;
  nameTagalog?: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: Ingredient[];
  estimatedCostPhp?: number;   // calculated from ingredients
  calories?: number;
  tags: string[];              // e.g. ["high-protein", "calming", "light"]
  prepMinutes: number;
}

export interface MealLog {
  id: string;
  date: string;            // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealId: string;
  loggedAt: number;
}

export interface MarketPrice {
  ingredientId: string;
  name: string;
  pricePerUnit: number;   // PHP
  unit: string;
  market: string;          // e.g. "Divisoria", "Palengke PH"
  updatedAt: number;
}
