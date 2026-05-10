import type Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

import { MODELS } from '../models.js';
import {
  IngredientSchema,
  type RecogniseIngredientsInput,
  RecogniseIngredientsInputSchema,
  type RecogniseIngredientsOutput,
  RecogniseIngredientsOutputSchema,
} from '../schemas.js';

// Subset of the Anthropic client this tool actually uses. Lets tests stub
// without bringing in the whole class surface.
export interface VisionClient {
  messages: {
    create: Anthropic['messages']['create'];
  };
}

const SYSTEM_PROMPT = `You are looking at a single fridge or pantry photo to help someone decide what to cook.

Identify each distinct ingredient you can see. For each one return:
- name: a short common name in lowercase (e.g. "tomatoes", "milk", "olive oil")
- confidence: how sure you are this is what you think it is, between 0 and 1
- quantity: a numeric estimate if visually obvious. Omit if unclear.
- unit: the unit for quantity (e.g. "g", "ml", "tin"). Omit when quantity is omitted.

Be honest about uncertainty. Lower the confidence when:
- the item is partially occluded
- you can't tell what brand or contents are inside an opaque container
- the lighting or angle is poor
- you're guessing rather than seeing

Return ONLY a single JSON object of the form:
{ "ingredients": [ { "name": "...", "confidence": 0.0, "quantity": 0, "unit": "..." }, ... ] }

No prose, no markdown, no preamble. JSON only.`;

const USER_PROMPT = 'Identify the ingredients in this photo.';
const MAX_TOKENS = 1024;

const ResponseSchema = z.object({
  ingredients: z.array(IngredientSchema),
});

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

const DATA_URL_REGEX = /^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/;

function parsePhoto(photo: string): { data: string; mediaType: ImageMediaType } {
  const match = DATA_URL_REGEX.exec(photo);
  if (match?.[1] !== undefined && match[2] !== undefined) {
    return { mediaType: match[1] as ImageMediaType, data: match[2] };
  }
  // Phone photos are overwhelmingly JPEG; keep this default and let the
  // caller pass a data URL when they need PNG/WEBP.
  return { mediaType: 'image/jpeg', data: photo };
}

export async function recogniseIngredientsHandler(
  client: VisionClient,
  input: RecogniseIngredientsInput,
): Promise<RecogniseIngredientsOutput> {
  const parsed = RecogniseIngredientsInputSchema.parse(input);
  const photo = parsePhoto(parsed.photo);

  const response = await client.messages.create({
    model: MODELS.vision,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: photo.mediaType,
              data: photo.data,
            },
          },
          { type: 'text', text: USER_PROMPT },
        ],
      },
    ],
  });

  let text: string | undefined;
  for (const block of response.content) {
    if (block.type === 'text') {
      text = block.text;
      break;
    }
  }
  if (text === undefined) {
    throw new Error('Anthropic response did not contain a text block');
  }

  const json: unknown = JSON.parse(text);
  const validated = ResponseSchema.parse(json);
  return RecogniseIngredientsOutputSchema.parse(validated);
}
