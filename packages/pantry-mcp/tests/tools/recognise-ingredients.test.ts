import { describe, expect, it, vi } from 'vitest';

import { MODELS } from '../../src/models.js';
import {
  recogniseIngredientsHandler,
  type VisionClient,
} from '../../src/tools/recognise-ingredients.js';

interface FakeImageBlock {
  type: 'image';
  source: { type: 'base64'; media_type: string; data: string };
}

interface FakeTextBlock {
  type: 'text';
  text: string;
}

type FakeContent = readonly (FakeImageBlock | FakeTextBlock | { type: string })[];

function makeClient(textResponse: string): {
  client: VisionClient;
  create: ReturnType<typeof vi.fn>;
} {
  const create = vi.fn().mockResolvedValue({
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model: MODELS.vision,
    content: [{ type: 'text', text: textResponse, citations: null }],
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: { input_tokens: 100, output_tokens: 50 },
  });
  const client = {
    messages: { create: create as unknown as VisionClient['messages']['create'] },
  };
  return { client, create };
}

function getFirstUserContent(create: ReturnType<typeof vi.fn>): FakeContent {
  const arg = create.mock.calls[0]?.[0] as
    | { messages: readonly { role: string; content: FakeContent }[] }
    | undefined;
  const content = arg?.messages[0]?.content;
  if (!Array.isArray(content)) {
    throw new Error('expected user message to have an array content');
  }
  return content as FakeContent;
}

describe('recognise_ingredients', () => {
  it('calls the vision model and parses ingredients from a JSON text block', async () => {
    const { client, create } = makeClient(
      JSON.stringify({
        ingredients: [
          { name: 'tomatoes', confidence: 0.9, quantity: 3, unit: '' },
          { name: 'milk', confidence: 0.7, quantity: 1, unit: 'L' },
        ],
      }),
    );

    const result = await recogniseIngredientsHandler(client, { photo: 'BASE64_DATA' });

    expect(result.ingredients).toHaveLength(2);
    expect(result.ingredients[0]?.name).toBe('tomatoes');
    expect(result.ingredients[1]?.confidence).toBe(0.7);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('uses the vision model from MODELS.vision and a non-zero max_tokens', async () => {
    const { client, create } = makeClient(JSON.stringify({ ingredients: [] }));
    await recogniseIngredientsHandler(client, { photo: 'x' });

    const arg = create.mock.calls[0]?.[0] as
      | { model: string; max_tokens: number; system: string }
      | undefined;
    expect(arg?.model).toBe(MODELS.vision);
    expect(arg?.max_tokens).toBeGreaterThan(0);
    expect(arg?.system).toMatch(/JSON/);
  });

  it('passes raw base64 through with default media type image/jpeg', async () => {
    const { client, create } = makeClient(JSON.stringify({ ingredients: [] }));
    await recogniseIngredientsHandler(client, { photo: 'rawbase64data' });

    const content = getFirstUserContent(create);
    const imageBlock = content.find((b): b is FakeImageBlock => b.type === 'image');
    expect(imageBlock?.source.media_type).toBe('image/jpeg');
    expect(imageBlock?.source.data).toBe('rawbase64data');
  });

  it('parses data URLs to extract media type and strip the prefix', async () => {
    const { client, create } = makeClient(JSON.stringify({ ingredients: [] }));
    await recogniseIngredientsHandler(client, {
      photo: 'data:image/png;base64,iVBORw0KGgoAAAANS',
    });

    const content = getFirstUserContent(create);
    const imageBlock = content.find((b): b is FakeImageBlock => b.type === 'image');
    expect(imageBlock?.source.media_type).toBe('image/png');
    expect(imageBlock?.source.data).toBe('iVBORw0KGgoAAAANS');
  });

  it('returns ingredients verbatim with no confidence filtering at the boundary', async () => {
    const { client } = makeClient(
      JSON.stringify({
        ingredients: [
          { name: 'high-confidence', confidence: 0.95 },
          { name: 'low-confidence', confidence: 0.1 },
          { name: 'medium', confidence: 0.5 },
        ],
      }),
    );

    const result = await recogniseIngredientsHandler(client, { photo: 'x' });
    expect(result.ingredients.map((i) => i.confidence)).toEqual([0.95, 0.1, 0.5]);
  });

  it('throws when the response contains no text block', async () => {
    const create = vi.fn().mockResolvedValue({
      content: [{ type: 'tool_use', id: 'x', name: 'y', input: {} }],
    });
    const client: VisionClient = {
      messages: { create: create },
    };

    await expect(recogniseIngredientsHandler(client, { photo: 'x' })).rejects.toThrow(/text block/);
  });

  it('throws when the response text is not valid JSON', async () => {
    const { client } = makeClient('not valid json {');
    await expect(recogniseIngredientsHandler(client, { photo: 'x' })).rejects.toThrow();
  });

  it('throws when the response JSON does not match the ingredient shape', async () => {
    const { client } = makeClient(JSON.stringify({ wrong: 'shape' }));
    await expect(recogniseIngredientsHandler(client, { photo: 'x' })).rejects.toThrow();
  });
});
