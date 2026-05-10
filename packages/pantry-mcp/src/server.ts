import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { getAnthropic } from './anthropic.js';
import type { Db } from './db.js';
import {
  AddItemInputSchema,
  AddItemOutputSchema,
  ListPantryInputSchema,
  ListPantryOutputSchema,
  RecogniseIngredientsInputSchema,
  RecogniseIngredientsOutputSchema,
  RemoveItemInputSchema,
  RemoveItemOutputSchema,
} from './schemas.js';
import { addItemHandler } from './tools/add-item.js';
import { listPantryHandler } from './tools/list-pantry.js';
import { recogniseIngredientsHandler } from './tools/recognise-ingredients.js';
import { removeItemHandler } from './tools/remove-item.js';

export const SERVER_NAME = 'pantry-mcp';
export const SERVER_VERSION = '0.1.0';

export function buildServer(db: Db): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

  server.registerTool(
    'list_pantry',
    {
      description: 'List every item currently in the pantry, sorted alphabetically by name.',
      inputSchema: ListPantryInputSchema.shape,
      outputSchema: ListPantryOutputSchema.shape,
    },
    () => {
      const result = listPantryHandler(db);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    },
  );

  server.registerTool(
    'add_item',
    {
      description:
        'Add an ingredient to the pantry. Two adds of the same name produce two rows; consolidation is intentional for v1.',
      inputSchema: AddItemInputSchema.shape,
      outputSchema: AddItemOutputSchema.shape,
    },
    (input) => {
      const result = addItemHandler(db, input);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    },
  );

  server.registerTool(
    'remove_item',
    {
      description:
        'Remove some or all of an ingredient from the pantry. When multiple rows match, removes from the oldest first.',
      inputSchema: RemoveItemInputSchema.shape,
      outputSchema: RemoveItemOutputSchema.shape,
    },
    (input) => {
      const result = removeItemHandler(db, input);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    },
  );

  server.registerTool(
    'recognise_ingredients',
    {
      description:
        'Identify ingredients in a fridge or pantry photo. Returns raw recognition results with confidence scores; no filtering applied.',
      inputSchema: RecogniseIngredientsInputSchema.shape,
      outputSchema: RecogniseIngredientsOutputSchema.shape,
    },
    async (input) => {
      const client = getAnthropic();
      const result = await recogniseIngredientsHandler(client, input);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    },
  );

  return server;
}
