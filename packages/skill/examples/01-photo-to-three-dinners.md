# Example: photo to three dinners

A complete worked example of the skill, from input through tool calls to user-facing output.

## Input

The user uploads a photo of a fridge containing: tomatoes (~4), eggs (6), feta (small block), spinach (handful), some leftover cooked pasta (~150g), olive oil, garlic, lemons.

User message:

> What should I cook tonight? I've got about 30 minutes.

## Skill execution

### Step 1 — Vision recognition

Skill calls `recognise_ingredients(photo)`. The MCP server returns:

```json
{
  "items": [
    { "name": "tomatoes",      "quantity": 4,             "confidence": 0.90 },
    { "name": "eggs",          "quantity": 6,             "confidence": 0.95 },
    { "name": "feta cheese",   "quantity": "small block", "confidence": 0.70 },
    { "name": "spinach",       "quantity": "handful",     "confidence": 0.80 },
    { "name": "cooked pasta",  "quantity": "~150g",       "confidence": 0.65 },
    { "name": "olive oil",     "quantity": null,          "confidence": 0.85 },
    { "name": "garlic",        "quantity": "2-3 cloves",  "confidence": 0.80 },
    { "name": "lemons",        "quantity": 2,             "confidence": 0.90 }
  ],
  "average_confidence": 0.82
}
```

Average confidence is 0.82 — comfortably above the 0.6 threshold, so proceed without asking the user to confirm.

### Step 2 — Decide whether to ask

The user has given a time budget (30 minutes). No dietary constraints mentioned. No need to ask anything. Proceed straight to generation.

### Step 3 — Generate three meaningfully different options

The skill produces three options that differ in cuisine, prep time, and complexity, all within the 30-minute budget.

## Output (the user-visible response)

```
**Option 1 — Pasta with tomatoes, feta, and spinach**
~20 minutes · Mediterranean
Uses: pasta, tomatoes, feta, spinach, olive oil, garlic
Missing: nothing — you've got it all
Why tonight: fastest, uses the leftover pasta, and feta makes it feel less like leftovers

**Option 2 — Shakshuka**
~25 minutes · North African
Uses: tomatoes, eggs, garlic, olive oil
Missing: paprika, cumin, bread to mop up
Why tonight: if you've got the spices in the cupboard, this is the one with the most personality

**Option 3 — Lemon-spinach omelette**
~12 minutes · French-ish
Uses: eggs, spinach, lemon, garlic, olive oil
Missing: nothing if it's just for you; butter would help
Why tonight: shortest, lightest, easiest if you're not actually that hungry

Want the method for any of these?
```

## Notes for the model

- Headings in sentence-case, not Title Case.
- Each option is meaningfully distinct — different cuisine, different prep time, different complexity.
- *Why tonight* gives the user a real reason to choose, not just description.
- Closing line is light and inviting, not pushy.
- No mention of "AI", no apologies, no padding.
- The output is roughly 130 words. If yours is significantly longer, you're padding.
