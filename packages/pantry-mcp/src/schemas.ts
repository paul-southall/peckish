import { z } from 'zod';

// ---------- Domain types ----------

export const PantryItemSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  expiry: z.string().nullable(),
  created_at: z.string(),
});
export type PantryItem = z.infer<typeof PantryItemSchema>;

export const IngredientSchema = z.object({
  name: z.string(),
  confidence: z.number().min(0).max(1),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

// ---------- list_pantry ----------

export const ListPantryInputSchema = z.object({});
export type ListPantryInput = z.infer<typeof ListPantryInputSchema>;

export const ListPantryOutputSchema = z.object({
  items: z.array(PantryItemSchema),
});
export type ListPantryOutput = z.infer<typeof ListPantryOutputSchema>;

// ---------- add_item ----------

export const AddItemInputSchema = z.object({
  name: z.string().min(1).describe('Ingredient name, e.g. "tomatoes" or "olive oil"'),
  quantity: z.number().positive().optional().describe('Defaults to 1 when omitted'),
  unit: z.string().optional().describe('e.g. "g", "ml", "tin", or empty for countable items'),
  expiry: z.string().optional().describe('ISO date (YYYY-MM-DD) of expiry, if known'),
});
export type AddItemInput = z.infer<typeof AddItemInputSchema>;

export const AddItemOutputSchema = PantryItemSchema;
export type AddItemOutput = z.infer<typeof AddItemOutputSchema>;

// ---------- remove_item ----------

export const RemoveItemInputSchema = z.object({
  name: z.string().min(1).describe('Ingredient name to remove'),
  quantity: z
    .number()
    .positive()
    .optional()
    .describe('Amount to remove. Omit to remove all rows matching name.'),
});
export type RemoveItemInput = z.infer<typeof RemoveItemInputSchema>;

export const RemoveItemOutputSchema = z.object({
  removed: z.boolean().describe('Whether any matching rows were modified'),
  remaining_quantity: z
    .number()
    .describe('Total quantity left across all rows matching name after removal'),
});
export type RemoveItemOutput = z.infer<typeof RemoveItemOutputSchema>;

// ---------- recognise_ingredients ----------

export const RecogniseIngredientsInputSchema = z.object({
  photo: z
    .string()
    .min(1)
    .describe(
      'Base64-encoded image. Accepts raw base64 or a data URL (data:image/jpeg;base64,...)',
    ),
});
export type RecogniseIngredientsInput = z.infer<typeof RecogniseIngredientsInputSchema>;

export const RecogniseIngredientsOutputSchema = z.object({
  ingredients: z
    .array(IngredientSchema)
    .describe('Raw recognition results with per-item confidence. No filtering applied.'),
});
export type RecogniseIngredientsOutput = z.infer<typeof RecogniseIngredientsOutputSchema>;
