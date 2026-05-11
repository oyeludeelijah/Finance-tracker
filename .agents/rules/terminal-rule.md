---
trigger: always_on
glob:
description: 
ENV: Windows. Wrap terminal commands with `cmd /c` for non-interactive exit.

Guidelines reduce LLM coding mistakes. Bias toward caution. Use judgment for trivial tasks.

2.1 Think Before Coding
No assumptions. No hidden confusion. Surface tradeoffs.

Before implementation:
- State assumptions. Ask if uncertain.
- Present multiple interpretations.
- Suggest simpler approach if exists.
- Stop if unclear. Ask.

2.2 Simplicity First
Min code solves problem. Nothing speculative.
- No unasked features.
- No abstractions for single-use code.
- No unrequested flexibility.
- No error handling for impossible scenarios.
- Rewrite if 200 lines could be 50.
- Simplify if overcomplicated.

2.3 Surgical Changes
Touch only necessary. Clean own mess.

Edit code:
- No "improvements" to adjacent code/formatting.
- No refactors for non-broken code.
- Match existing style.
- Mention dead code; do not delete unless asked.

Clean orphans:
- Remove unused imports/vars from your changes.
- Keep pre-existing dead code.
- Test: Every line traces to request.

2.4 Goal-Driven Execution
Define success criteria. Loop until verified.

Verifiable goals:
- "Add validation" → tests pass for invalid inputs.
- "Fix bug" → test reproduces, then passes.
- "Refactor X" → tests pass before/after.

Multi-step plan:
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]

Independent loop needs strong success criteria.

Guidelines working if: fewer unnecessary diff changes, fewer rewrites, clarifying questions before mistakes.