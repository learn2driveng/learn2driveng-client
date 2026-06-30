---
type: engineering-principles
status: active
updated: 2026-06-30
tags:
  - engineering
  - simplicity
---

# Engineering principles

## Avoid overengineering at all costs

Build the simplest implementation that correctly handles the current product
requirement.

### In practice

- Prefer framework-provided APIs over custom wrappers.
- Do not introduce abstractions before a real repeated pattern exists.
- Keep route, component, hook, and state responsibilities obvious.
- Avoid defensive branches for conditions the application cannot realistically encounter.
- Do not build future-role infrastructure before the active role needs it.
- Add dependencies only when they solve a present, concrete problem.
- Keep state local until it genuinely needs to be shared.
- Model business rules clearly, but do not build speculative flexibility.
- Refactor after duplication or complexity becomes visible—not in anticipation of it.

### Simplicity test

Before adding a layer, ask:

1. What present problem does this solve?
2. Can the framework already solve it?
3. Does it make the main flow easier to understand?
4. Would removing it change required behaviour?

If those questions do not produce a strong answer, leave the layer out.

### Example

For foreground location, prefer Expo's permission hook and a direct coordinate
request. Do not add dynamic module loading, custom status translation, and
fallback infrastructure unless the product genuinely requires those cases.

Related: [[02 Architecture/Architecture Overview]],
[[04 Delivery/Decision Index]]
