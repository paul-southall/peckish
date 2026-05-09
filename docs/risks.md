# Risk register

A living catalogue of risks to the project. Updated weekly during journal review. Each risk has a probability, impact, mitigation (active or planned), and a trigger condition that says *"this is what would cause the mitigation to be invoked."*

The point isn't exhaustiveness — it's surfacing the risks most likely to derail the project and committing, in writing, to what the response will be. Personal projects almost universally skip this. Doing it in public is itself a credibility move.

---

## Active risks (MVP)

### R-001 — Skill description fails to trigger reliably

| Field           | Value                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Probability     | High                                                                  |
| Impact          | High                                                                  |
| Owner           | Paul                                                                  |

**Why.** Skill triggering is the single highest-probability failure mode in any skill project. If the `description:` field doesn't match real user phrasings, the skill is invisible.

**Mitigation.** A triggering eval over 15+ phrasings (English and French) runs in CI from week one. The `description:` field is iterated until pass rate is at or above 95%. Previous versions are logged in `/docs/prompt-history.md` so the change history is visible.

**Trigger.** Any time a real user phrasing fails to invoke the skill, or the eval pass rate dips below 95%.

---

### R-002 — Photo-based ingredient recognition is too unreliable for the demo

| Field           | Value                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Probability     | Medium                                                                |
| Impact          | High                                                                  |
| Owner           | Paul                                                                  |

**Why.** Vision on real fridges (cluttered, inconsistent lighting, partially-occluded items) is materially harder than vision on test photos. The fridge-photo demo is the most demo-able moment in the entire project; without it, the launch lands softer.

**Mitigation.** Text input stays first-class as the fallback path. The README says explicitly what vision is and isn't ready for. If photo-eval accuracy stays below 80% at MVP, ship without the photo demo and frame the limitation as content (*what vision is and isn't ready for in 2026*).

**Trigger.** Photo-accuracy eval drops below 80% on the fixture set, or real-fridge testing during session 1 reveals systematic failure modes.

---

### R-003 — Motivation collapse in week four

| Field           | Value                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Probability     | Medium-high                                                           |
| Impact          | Critical                                                              |
| Owner           | Paul                                                                  |

**Why.** The most common failure mode for personal AI projects, between weeks four and six, when the novelty has worn off and the production-readiness work compounds. A non-shipped project has no audit trail and no story.

**Mitigation.** Every weekend ends with a published artefact — an ADR, a journal entry, a screenshot of a working component, a teaser tweet. Visible momentum compounds. The increment cadence is structured so each week ships something independently valuable, not foundation work.

**Trigger.** Any weekend ending with no commit and no journal entry. (One occurrence is a flag; two consecutive is the trigger.)

---

### R-004 — Scope creep

| Field           | Value                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Probability     | High                                                                  |
| Impact          | High                                                                  |
| Owner           | Paul                                                                  |

**Why.** Every iteration of the build plan added scope. Scope creep is the natural gravity of the project, and the foundation trap is its most expensive form.

**Mitigation.** This risk register is the gate. Anything not on the critical path (defined in the build plan) goes to `ROADMAP.md` until the critical path is green. New ideas during the build go to `_planning/ideas-parking-lot.md` for review at end-of-increment grooming, not into the active backlog.

**Trigger.** Any work being done that doesn't have an associated open issue with the appropriate `increment:*` label.

---

### R-005 — Cost spike during development

| Field           | Value                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Probability     | Medium                                                                |
| Impact          | Medium                                                                |
| Owner           | Paul                                                                  |

**Why.** Multimodal calls plus eval runs plus debugging plus careless prompts add up faster than expected.

**Mitigation.** Monthly Anthropic API spend cap set in the dashboard from day one. Token telemetry exported to Langfuse from Increment 3. Eval runs use small fixture sets (5 photos, 5 inventories) to keep iteration cheap.

**Trigger.** Daily spend exceeds 10% of the monthly cap.

---

### R-006 — GitHub MCP setup or auth fails

| Field           | Value                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Probability     | Low                                                                   |
| Impact          | High                                                                  |
| Owner           | Paul                                                                  |

**Why.** It's a mature tool, but first-time auth setup is non-zero risk. The entire AI-native PM narrative depends on this working.

**Mitigation.** Section 6 of the GitHub setup spec includes a smoke test before the bootstrap prompt runs. If the smoke test fails, no further work begins until it passes.

**Trigger.** Smoke test fails or any subsequent MCP call returns an auth error.

---

## Risks expected to emerge in later increments

### R-101 — Eval drift (Increment 3 onward)

**Probability:** Medium. **Impact:** Medium-high.

Drift erodes the credibility of the eval suite over time — pass rates stay flat while the underlying behaviour quietly degrades. Mitigation: the eval pass-rate floor ratchets up by 1% per release. Drift surfaces in CI before it surfaces in production.

### R-102 — Allergen-verifier false negatives (Increment 1)

**Probability:** Medium. **Impact:** Critical.

The whole point of the verifier is to catch the unsafe outputs the LLM produces. False negatives are the failure case. Mitigation: the verifier is programmatic, not LLM-based. Test fixtures include adversarial cases (recipes containing the disallowed ingredient under different names — peanuts versus groundnuts, sesame in tahini, dairy in ghee).

### R-103 — Vendor lock-in to Vercel (Increment 4)

**Probability:** Low. **Impact:** Low for a personal project, worth flagging given the FDJ context.

Mitigation: stick to Vercel features that have clean equivalents on Cloudflare or self-hosted. Avoid Vercel KV and Vercel Postgres. Avoid Vercel-specific runtime APIs in favour of standard Web APIs. Document the portability stance in the deployment ADR.

---

## Closed risks

(None yet. Risks move here when the trigger condition has been observed and the mitigation has resolved the situation, or when the risk is no longer relevant. Each closure is dated and includes a one-line note on what was learned.)

---

## Review cadence

This file is reviewed at end-of-weekend journal grooming. Risks are added, updated, or moved to *Closed*. The review itself is logged in `/docs/journal.md` so the evolution of the register is visible alongside the project's evolution.
