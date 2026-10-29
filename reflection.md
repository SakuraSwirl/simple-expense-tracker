# Reflection — AI-Assisted Engineering

## The AI tool I used

I used **DeepSeek-V4.1-Flash inside the Trae IDE** as my coding agent. Working on the ExpenseFlow
project, I relied on it to read and map the codebase, investigate a known bug, write a feature
spec and implementation plan, and then build the "Spending Insights" feature in reviewed phases —
all backed by the project's Vitest suite.

## How it helped

The agent was most valuable as an *accelerator that kept me organized*. Instead of jumping
straight into code, it followed a disciplined workflow: it analysed the whole repository, located
the fault in `calculateTotalExpenses`, then produced a `spec.md` and a phased `plan.md` before
writing a single line of feature code. That structure mattered — the bug fix became a deliberate
"Phase 0" gate that had to pass before any new UI was built, which prevented the new insights from
being layered on top of incorrect data. It also wrote focused unit tests for each new helper
(`getCategoryBreakdown`, `getDailySpendingSeries`), so correctness was verified continuously
rather than assumed.

## A mistake and a limitation

The AI was not infallible, and catching it was the most instructive part. When it first drafted
the insights tests, it asserted category percentages rounded to `41.6` and `58.4`, but the helper
actually produces `41.61` and `58.39` — small errors that would have failed the suite. I had to
notice the mismatch and have them corrected. More broadly, the agent had real limits: it could
explain and propose changes, but in chat mode it could not write files directly, and it never
opened a browser to visually confirm the charts rendered. Its confidence ran ahead of its evidence
in places, so every claim had to be checked against a test run or a build.

## What I learned about AI-assisted engineering

The lesson is that AI shifts where the engineer spends effort, not whether they do. The agent
handled the mechanical breadth — scanning files, drafting specs, writing boilerplate tests — but
the human still owned *judgement*: deciding the bug fix must come first, spotting wrong expected
values, and insisting on honest reporting of what was and wasn't verified. AI-assisted engineering
is best treated as a fast, tireless collaborator that must be directed, reviewed, and tested at
every step. Trust the process, verify the output.
