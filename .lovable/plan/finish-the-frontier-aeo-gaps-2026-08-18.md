# Finish the Frontier AEO gaps

Four pieces, in the order that saves money first.

## 1. Question-list checker + cost estimate

Before a panel runs, show whether the list is any good and what it will cost.

Checks on the prompt list:
- More than 20% of questions mention your own brand name — flagged, because a panel stuffed with your own name inflates your score.
- Duplicate or near-duplicate questions.
- Prompt classes badly unbalanced (all discovery, no comparison).
- Fewer questions than the minimum needed for a usable score.

Cost estimate, live as you change the settings:
- questions x runs-per-question x assistants x days x ~$0.012 per call
- Shows monthly cost and calls/month, with a warning band once it crosses a threshold you set.
- Guidance when the number is too high: cut assistants or days before cutting questions.

Runs in the panel setup screen and blocks the "start sampling" button on hard failures, warns on soft ones.

## 2. Add Perplexity and Claude

Today the panel only asks Gemini (and OpenAI models through the gateway). Both extra keys are already stored.

- Perplexity: called directly with its own API (it isn't on the shared gateway), using the `sonar` model, which returns real citation URLs — better source data than parsing links out of text.
- Claude: called through the AI gateway alongside the OpenAI and Gemini models.
- Each assistant stays a separate row in the results, so answer share can be read per assistant or blended.
- A missing key throws a clear error instead of returning an empty answer — an empty answer would be silently recorded as "brand not mentioned" and drag your score down.
- Assistant picker added to the panel setup screen, feeding straight into the cost estimate above.

## 3. Honest timeline calculator

A new "how long until this is provable" panel on the AEO dashboard.

- Corrects for the fact that repeat runs of the same question aren't independent observations (a clustering correction; at 7 repeats it roughly triples the required days).
- Never returns fewer than the 14-day methodology floor.
- Inputs: current answer share, the lift you want to detect, runs per question per day.
- Output in plain words: "To prove a 10-point gain at this sampling rate, run for at least 21 days," plus what to change if that's too long.

## 4. Change log for proving impact

The `interventions` table already exists and nothing writes to it.

- A "Changes" tab on the AEO dashboard: log what you shipped, the date, the type (new listing, page rewrite, review push, PR, schema, other), the URL it touched, and how long you expect it to take effect.
- Changes appear as markers on the answer-share chart so a lift lines up with what caused it.
- Editable and deletable; scoped to your workspace by existing access rules.
- No causal analysis yet — this is the record-keeping that makes it possible later. It cannot be reconstructed after the fact, which is why it goes in now.

## Technical notes

- Panel validator + cost model: new `src/features/aeo/panelValidator.ts` (pure functions, unit tested) wired into `AEOSetupPage.tsx`. Cost constants live in one place so the per-call price can be updated.
- Providers: extend `supabase/functions/_shared/aeo-providers.ts` with a Perplexity adapter (direct `api.perplexity.ai`, reads `PERPLEXITY_API_KEY`, maps the `citations` array into the existing citation shape and handles the 401 `insufficient_quota` case) and an Anthropic adapter via the gateway. `vendorOf()` and the job queue need no changes; `DEFAULT_MODELS` becomes panel-configurable.
- Power calculator: `src/features/aeo/power.ts` implementing the Kish design effect (DEFF = 1 + (m-1) x 0.35) over the existing Wilson helper, floored at `methodology_value('min_window_days')`.
- Interventions: read/write through the existing table via a `useInterventions` hook; markers layered onto the existing dashboard chart. No migration expected — the columns (`type`, `description`, `shipped_at`, `target_url`, `expected_lag_days`) are already there. If the `type` column has a check constraint, the UI options will be matched to it before writing.

## Order and checkpoints

1. Validator + cost estimate (frontend only, testable immediately).
2. Perplexity + Claude adapters, verified with one real call each before wiring the picker.
3. Power calculator.
4. Change log.
