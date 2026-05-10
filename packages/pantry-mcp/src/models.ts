// Single source of truth for model selection. ADR-002 documents the routing
// rationale: cheap-and-fast for vision (high-volume, perception-bound),
// reasoning-grade for recipes (low-volume, quality-bound).
//
// When Anthropic releases a new generation, swap the constants here and the
// rest of the project tracks automatically.
export const MODELS = {
  vision: 'claude-haiku-4-5-20251001',
  recipes: 'claude-sonnet-4-6',
} as const;

export type ModelKey = keyof typeof MODELS;
